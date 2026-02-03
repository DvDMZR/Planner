import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { GraduationCap, ChevronLeft, ChevronRight, ChevronDown, Plus, X, GripVertical, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore, TEAMS } from '../store/useStore'
import { generateWeeksArray } from '../lib/date-utils'
import { ScrollArea } from '../components/ui/scroll-area'
import { DraggableEmployee } from '../components/DraggableEmployee'
import type { WeekData, Employee, TrainingCategory } from '../store/types'
import { cn } from '../lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'

const TRAINING_COLORS: Record<string, string> = {
  // AS Trainings
  'R9500 I&C': '#3B82F6',
  'R9500 S&T': '#60A5FA',
  'F4500 I&C': '#2563EB',
  'F4500 S&T': '#1D4ED8',
  'DPQ': '#1E40AF',
  // CMS Trainings
  'T8900': '#10B981',
  'T8600': '#34D399',
  'DPX': '#059669',
  'CowScout': '#047857',
  // HM Trainings
  'DairyNet': '#8B5CF6',
  'DairyPlan': '#A78BFA',
  'Good Cow Feeding': '#7C3AED',
  'Good Cow Milking': '#6D28D9',
}

// Group trainings by team
const TRAINING_GROUPS = [
  {
    label: 'AS Team Trainings',
    team: 'as',
    trainings: ['R9500 I&C', 'R9500 S&T', 'F4500 I&C', 'F4500 S&T', 'DPQ'] as TrainingCategory[]
  },
  {
    label: 'CMS Team Trainings',
    team: 'cms',
    trainings: ['T8900', 'T8600', 'DPX', 'CowScout'] as TrainingCategory[]
  },
  {
    label: 'HM Team Trainings',
    team: 'hm',
    trainings: ['DairyNet', 'DairyPlan', 'Good Cow Feeding', 'Good Cow Milking'] as TrainingCategory[]
  }
]

export function TrainingsView() {
  const {
    assignments,
    employees,
    timelineSettings,
    updateTimelineSettings,
    addAssignment,
    deleteAssignment
  } = useStore()

  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [showEmployeePanel, setShowEmployeePanel] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<{ name: string; week: number; year: number } | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set())

  // Toggle group collapse
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  // Toggle team collapse in sidebar
  const toggleTeam = (teamId: string) => {
    setCollapsedTeams(prev => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  const weeks = useMemo(() =>
    generateWeeksArray(
      timelineSettings.startFromWeek,
      timelineSettings.startFromYear,
      timelineSettings.weeksToShow,
      timelineSettings.showPastWeeks
    ),
    [timelineSettings]
  )

  // Get all training assignments
  const trainingAssignments = assignments.filter(a => a.eventType === 'training')

  // Navigate weeks
  const navigateWeeks = (direction: 'prev' | 'next') => {
    const offset = direction === 'prev' ? -4 : 4
    let newWeek = timelineSettings.startFromWeek + offset
    let newYear = timelineSettings.startFromYear

    if (newWeek > 52) {
      newWeek -= 52
      newYear++
    } else if (newWeek < 1) {
      newWeek += 52
      newYear--
    }

    updateTimelineSettings({
      startFromWeek: newWeek,
      startFromYear: newYear
    })
  }

  // Get training assignments for a specific training and week
  const getTrainingForWeek = (trainingName: string, week: number, year: number) => {
    return trainingAssignments.filter(
      a => a.title === trainingName && a.week === week && a.year === year
    )
  }

  // Group employees by team for the sidebar
  const employeesByTeam = useMemo(() => {
    const grouped: Record<string, Employee[]> = {}
    TEAMS.forEach(team => {
      grouped[team.id] = employees.filter(e => e.teamId === team.id)
    })
    return grouped
  }, [employees])

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'employee') {
      setActiveEmployee(active.data.current.employee)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveEmployee(null)

    if (!over) return

    if (active.data.current?.type === 'employee' && over.data.current?.type === 'training-cell') {
      const employee = active.data.current.employee as Employee
      const { trainingName, week, year } = over.data.current

      // Check if already assigned
      const exists = trainingAssignments.some(
        a => a.employeeId === employee.id && a.title === trainingName && a.week === week && a.year === year
      )

      if (!exists) {
        addAssignment({
          employeeId: employee.id,
          eventType: 'training',
          title: trainingName,
          week,
          year,
          hoursPlanned: 40,
          notes: 'Training'
        })
      }
    }
  }

  // Open dialog for manual assignment
  const handleCellClick = (trainingName: string, week: number, year: number) => {
    setSelectedTraining({ name: trainingName, week, year })
    setSelectedEmployees([])
    setIsAddDialogOpen(true)
  }

  // Add assignments from dialog
  const handleAddAssignments = () => {
    if (!selectedTraining || selectedEmployees.length === 0) return

    selectedEmployees.forEach(empId => {
      const exists = trainingAssignments.some(
        a => a.employeeId === empId && a.title === selectedTraining.name &&
             a.week === selectedTraining.week && a.year === selectedTraining.year
      )
      if (!exists) {
        addAssignment({
          employeeId: empId,
          eventType: 'training',
          title: selectedTraining.name,
          week: selectedTraining.week,
          year: selectedTraining.year,
          hoursPlanned: 40
        })
      }
    })

    setIsAddDialogOpen(false)
    setSelectedTraining(null)
    setSelectedEmployees([])
  }

  // Toggle employee selection
  const toggleEmployee = (empId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    )
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Trainings</h2>
                <p className="text-sm text-muted-foreground">
                  Mitarbeiter per Drag & Drop zuweisen
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showEmployeePanel ? "secondary" : "outline"}
                onClick={() => setShowEmployeePanel(!showEmployeePanel)}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Mitarbeiter
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeeks('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                KW {weeks[0]?.week} - KW {weeks[weeks.length - 1]?.week}
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateWeeks('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Employee Panel for Drag & Drop */}
          {showEmployeePanel && (
            <div className="w-56 border-r bg-card flex flex-col overflow-hidden">
              <div className="p-3 border-b bg-muted/50">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  Drag & Drop
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {TEAMS.map(team => {
                    const isCollapsed = collapsedTeams.has(team.id)
                    const teamEmployees = employeesByTeam[team.id] || []

                    return (
                      <div key={team.id}>
                        <button
                          onClick={() => toggleTeam(team.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-xs font-medium">
                            {team.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            ({teamEmployees.length})
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="ml-4 space-y-1 mt-1">
                            {teamEmployees.map(employee => (
                              <DraggableEmployee
                                key={employee.id}
                                employee={employee}
                                compact
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Timeline */}
          <ScrollArea orientation="both" className="flex-1">
            <div className="min-w-max">
              {/* Week Headers */}
              <div className="flex border-b bg-muted/50 sticky top-0 z-10">
                <div className="w-48 flex-shrink-0 p-3 font-medium border-r">Training</div>
                {weeks.map((weekData: WeekData) => (
                  <div
                    key={`${weekData.week}-${weekData.year}`}
                    className={cn(
                      "w-28 flex-shrink-0 p-2 text-center text-xs border-r",
                      weekData.isCurrentWeek && "bg-primary/10 font-bold"
                    )}
                  >
                    <div className="font-medium">{weekData.label}</div>
                    <div className="text-muted-foreground">{weekData.year}</div>
                  </div>
                ))}
              </div>

              {/* Training Groups */}
              {TRAINING_GROUPS.map((group) => {
                const isCollapsed = collapsedGroups.has(group.team)

                return (
                <div key={group.team}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.team)}
                    className="flex w-full border-b bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-48 flex-shrink-0 p-2 font-semibold text-sm border-r flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TEAMS.find(t => t.id === group.team)?.color }}
                      />
                      {group.label}
                    </div>
                    {weeks.map((weekData: WeekData) => (
                      <div
                        key={`${group.team}-${weekData.week}-${weekData.year}`}
                        className="w-28 flex-shrink-0 border-r"
                      />
                    ))}
                  </button>

                  {/* Training Rows */}
                  {!isCollapsed && group.trainings.map((trainingName) => (
                    <div key={trainingName} className="flex border-b hover:bg-accent/50">
                      <div className="w-48 flex-shrink-0 p-2 border-r flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: TRAINING_COLORS[trainingName] }}
                        />
                        <span className="text-sm truncate">{trainingName}</span>
                      </div>
                      {weeks.map((weekData: WeekData) => {
                        const weekTrainings = getTrainingForWeek(trainingName, weekData.week, weekData.year)

                        return (
                          <DroppableTrainingCell
                            key={`${trainingName}-${weekData.week}-${weekData.year}`}
                            trainingName={trainingName}
                            week={weekData.week}
                            year={weekData.year}
                            isCurrentWeek={weekData.isCurrentWeek}
                            onClick={() => handleCellClick(trainingName, weekData.week, weekData.year)}
                          >
                            {weekTrainings.map(a => {
                              const emp = employees.find(e => e.id === a.employeeId)
                              return (
                                <div
                                  key={a.id}
                                  className="group flex items-center gap-1 rounded px-1 py-0.5 text-xs text-white mb-1"
                                  style={{ backgroundColor: TRAINING_COLORS[trainingName] }}
                                >
                                  <span className="truncate flex-1">{emp?.name.split(',')[0]}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteAssignment(a.id)
                                    }}
                                    className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/40"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )
                            })}
                            {weekTrainings.length === 0 && (
                              <div className="h-full flex items-center justify-center opacity-0 hover:opacity-50">
                                <Plus className="h-4 w-4" />
                              </div>
                            )}
                          </DroppableTrainingCell>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )})}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeEmployee && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border shadow-lg">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: TEAMS.find(t => t.id === activeEmployee.teamId)?.color }}
            />
            <span className="font-medium text-sm">{activeEmployee.name}</span>
          </div>
        )}
      </DragOverlay>

      {/* Add Assignment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Mitarbeiter zuweisen: {selectedTraining?.name}
              {selectedTraining && ` (KW ${selectedTraining.week})`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {TEAMS.map(team => {
              const teamEmployees = employees.filter(e => e.teamId === team.id)
              if (teamEmployees.length === 0) return null

              return (
                <div key={team.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-medium text-sm">{team.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {teamEmployees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => toggleEmployee(emp.id)}
                        className={cn(
                          "p-2 rounded border text-left text-sm transition-colors",
                          selectedEmployees.includes(emp.id)
                            ? "border-primary bg-primary/10"
                            : "hover:bg-accent"
                        )}
                      >
                        {emp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {selectedEmployees.length} ausgewählt
            </div>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddAssignments} disabled={selectedEmployees.length === 0}>
              Zuweisen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}

// Droppable cell component for trainings
import { useDroppable } from '@dnd-kit/core'

interface DroppableTrainingCellProps {
  trainingName: string
  week: number
  year: number
  isCurrentWeek: boolean
  children: React.ReactNode
  onClick: () => void
}

function DroppableTrainingCell({
  trainingName,
  week,
  year,
  isCurrentWeek,
  children,
  onClick
}: DroppableTrainingCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `training-${trainingName}-${week}-${year}`,
    data: {
      type: 'training-cell',
      trainingName,
      week,
      year
    }
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "w-28 flex-shrink-0 p-1 border-r min-h-[50px] cursor-pointer transition-colors",
        isCurrentWeek && "bg-primary/5",
        isOver && "bg-primary/20 ring-2 ring-primary ring-inset"
      )}
    >
      {children}
    </div>
  )
}
