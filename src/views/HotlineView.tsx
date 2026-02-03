import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { Phone, ChevronLeft, ChevronRight, X, GripVertical, Users, Plus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore, TEAMS } from '../store/useStore'
import { generateWeeksArray } from '../lib/date-utils'
import { ScrollArea } from '../components/ui/scroll-area'
import { DraggableEmployee } from '../components/DraggableEmployee'
import type { WeekData, Employee } from '../store/types'
import { cn } from '../lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'

export function HotlineView() {
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
  const [selectedCell, setSelectedCell] = useState<{ team: string; week: number; year: number } | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  // AS and CMS employees for 24/7
  const asEmployees = employees.filter(e => e.teamId === 'as')
  const cmsEmployees = employees.filter(e => e.teamId === 'cms')

  const weeks = useMemo(() =>
    generateWeeksArray(
      timelineSettings.startFromWeek,
      timelineSettings.startFromYear,
      timelineSettings.weeksToShow,
      timelineSettings.showPastWeeks
    ),
    [timelineSettings]
  )

  // Get 24/7 (hotline) assignments
  const hotlineAssignments = assignments.filter(a => a.eventType === 'hotline')

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

  // Get employee hotline for week
  const getEmployeeHotline = (employeeId: string, week: number, year: number) => {
    return hotlineAssignments.find(
      a => a.employeeId === employeeId && a.week === week && a.year === year
    )
  }

  // Get all hotline assignments for a team in a specific week
  const getTeamHotlineForWeek = (teamId: string, week: number, year: number) => {
    const teamEmployeeIds = employees.filter(e => e.teamId === teamId).map(e => e.id)
    return hotlineAssignments.filter(
      a => teamEmployeeIds.includes(a.employeeId) && a.week === week && a.year === year
    )
  }

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

    if (active.data.current?.type === 'employee' && over.data.current?.type === 'hotline-cell') {
      const employee = active.data.current.employee as Employee
      const { week, year } = over.data.current

      // Check if already assigned
      const exists = hotlineAssignments.some(
        a => a.employeeId === employee.id && a.week === week && a.year === year
      )

      if (!exists) {
        addAssignment({
          employeeId: employee.id,
          eventType: 'hotline',
          title: '24/7 Bereitschaft',
          week,
          year,
          hoursPlanned: 40,
          notes: 'Hotline'
        })
      }
    }
  }

  // Open dialog for manual assignment
  const handleCellClick = (team: string, week: number, year: number) => {
    setSelectedCell({ team, week, year })
    setSelectedEmployees([])
    setIsAddDialogOpen(true)
  }

  // Add assignments from dialog
  const handleAddAssignments = () => {
    if (!selectedCell || selectedEmployees.length === 0) return

    selectedEmployees.forEach(empId => {
      const exists = hotlineAssignments.some(
        a => a.employeeId === empId && a.week === selectedCell.week && a.year === selectedCell.year
      )
      if (!exists) {
        addAssignment({
          employeeId: empId,
          eventType: 'hotline',
          title: '24/7 Bereitschaft',
          week: selectedCell.week,
          year: selectedCell.year,
          hoursPlanned: 40
        })
      }
    })

    setIsAddDialogOpen(false)
    setSelectedCell(null)
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

  const teamConfigs = [
    { id: 'as', name: 'Team AS', employees: asEmployees, color: TEAMS.find(t => t.id === 'as')?.color || '#3B82F6' },
    { id: 'cms', name: 'Team CMS', employees: cmsEmployees, color: TEAMS.find(t => t.id === 'cms')?.color || '#10B981' }
  ]

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
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Hotline / 24/7 Bereitschaft</h2>
                <p className="text-sm text-muted-foreground">
                  Mitarbeiter per Drag & Drop zuweisen - Team AS & CMS
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
                <div className="p-2 space-y-3">
                  {teamConfigs.map(team => (
                    <div key={team.id}>
                      <div className="flex items-center gap-2 px-2 py-1 mb-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {team.name}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {team.employees.map(employee => (
                          <DraggableEmployee
                            key={employee.id}
                            employee={employee}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Timeline */}
          <ScrollArea orientation="both" className="flex-1">
            <div className="min-w-max">
              {/* Week Headers */}
              <div className="flex border-b bg-muted/50 sticky top-0 z-10">
                <div className="w-56 flex-shrink-0 p-3 font-medium border-r">Mitarbeiter</div>
                {weeks.map((weekData: WeekData) => (
                  <div
                    key={`${weekData.week}-${weekData.year}`}
                    className={cn(
                      "w-24 flex-shrink-0 p-2 text-center text-xs border-r",
                      weekData.isCurrentWeek && "bg-primary/10 font-bold"
                    )}
                  >
                    <div className="font-medium">{weekData.label}</div>
                    <div className="text-muted-foreground">{weekData.year}</div>
                  </div>
                ))}
              </div>

              {/* Team Sections */}
              {teamConfigs.map((team) => (
                <div key={team.id}>
                  {/* Team Header */}
                  <div className="flex border-b bg-muted/30">
                    <div className="w-56 flex-shrink-0 p-2 font-semibold text-sm border-r flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      {team.name} ({team.employees.length} Mitarbeiter)
                    </div>
                    {weeks.map((weekData: WeekData) => {
                      const teamAssignments = getTeamHotlineForWeek(team.id, weekData.week, weekData.year)
                      return (
                        <div
                          key={`${team.id}-header-${weekData.week}-${weekData.year}`}
                          className={cn(
                            "w-24 flex-shrink-0 p-1 text-center text-xs border-r",
                            weekData.isCurrentWeek && "bg-primary/5"
                          )}
                        >
                          {teamAssignments.length > 0 && (
                            <span className="text-orange-600 font-medium">
                              {teamAssignments.length}x 24/7
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Employee Rows */}
                  {team.employees.map((employee, index) => (
                    <div key={employee.id} className="flex border-b hover:bg-accent/50">
                      <div className="w-56 flex-shrink-0 p-2 border-r flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium truncate">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">Position #{index + 1}</div>
                        </div>
                      </div>
                      {weeks.map((weekData: WeekData) => {
                        const hasHotlineThisWeek = getEmployeeHotline(employee.id, weekData.week, weekData.year)

                        return (
                          <DroppableHotlineCell
                            key={`${employee.id}-${weekData.week}-${weekData.year}`}
                            week={weekData.week}
                            year={weekData.year}
                            isCurrentWeek={weekData.isCurrentWeek}
                            onClick={() => handleCellClick(team.id, weekData.week, weekData.year)}
                          >
                            {hasHotlineThisWeek ? (
                              <div className="group flex items-center justify-center">
                                <div className="bg-orange-500 text-white rounded p-1 text-xs flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>24/7</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteAssignment(hasHotlineThisWeek.id)
                                    }}
                                    className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 ml-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center opacity-0 hover:opacity-50">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </DroppableHotlineCell>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
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
              24/7 Bereitschaft zuweisen (KW {selectedCell?.week})
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {teamConfigs.map(team => (
              <div key={team.id} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-medium text-sm">{team.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {team.employees.map(emp => (
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
            ))}
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

// Droppable cell component for hotline
interface DroppableHotlineCellProps {
  week: number
  year: number
  isCurrentWeek: boolean
  children: React.ReactNode
  onClick: () => void
}

function DroppableHotlineCell({
  week,
  year,
  isCurrentWeek,
  children,
  onClick
}: DroppableHotlineCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `hotline-${week}-${year}`,
    data: {
      type: 'hotline-cell',
      week,
      year
    }
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={cn(
        "w-24 flex-shrink-0 p-1 border-r min-h-[48px] cursor-pointer transition-colors",
        isCurrentWeek && "bg-primary/5",
        isOver && "bg-orange-100 ring-2 ring-orange-500 ring-inset"
      )}
    >
      {children}
    </div>
  )
}
