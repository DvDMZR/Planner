import { useState, useMemo } from 'react'
import { FileQuestion, Plus, ChevronLeft, ChevronRight, X, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore, TEAMS } from '../store/useStore'
import { generateWeeksArray } from '../lib/date-utils'
import { cn } from '../lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import type { EventType, WeekData } from '../store/types'

interface SonstigesTask {
  id: string
  title: string
  assignments: Array<{
    employeeId: string
    week: number
    year: number
    hoursPlanned: number
  }>
}

export function SonstigesView() {
  const {
    assignments,
    employees,
    timelineSettings,
    updateTimelineSettings,
    addAssignment,
    deleteAssignment
  } = useStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<{ week: number; year: number } | null>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  const weeks = useMemo(() =>
    generateWeeksArray(
      timelineSettings.startFromWeek,
      timelineSettings.startFromYear,
      timelineSettings.weeksToShow,
      timelineSettings.showPastWeeks
    ),
    [timelineSettings]
  )

  // Get all sonstiges assignments and group by title
  const sonstigesAssignments = assignments.filter(
    a => a.eventType === 'sonstiges' || a.eventType === 'spontaneous'
  )

  // Group by unique task titles
  const tasks = useMemo(() => {
    const taskMap = new Map<string, SonstigesTask>()

    sonstigesAssignments.forEach(a => {
      if (!taskMap.has(a.title)) {
        taskMap.set(a.title, {
          id: a.title,
          title: a.title,
          assignments: []
        })
      }
      taskMap.get(a.title)!.assignments.push({
        employeeId: a.employeeId,
        week: a.week,
        year: a.year,
        hoursPlanned: a.hoursPlanned
      })
    })

    return Array.from(taskMap.values())
  }, [sonstigesAssignments])

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

  // Get task assignments for week
  const getTaskForWeek = (taskTitle: string, week: number, year: number) => {
    return sonstigesAssignments.filter(
      a => a.title === taskTitle && a.week === week && a.year === year
    )
  }

  // Create new task
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return
    setNewTaskTitle('')
    setIsCreateOpen(false)
    // Task will be created when first assignment is added
    setSelectedTask(newTaskTitle.trim())
    setIsAssignOpen(true)
  }

  // Open assignment dialog for existing task
  const handleAssignToTask = (taskTitle: string, week: number, year: number) => {
    setSelectedTask(taskTitle)
    setSelectedWeek({ week, year })
    setSelectedEmployees([])
    setIsAssignOpen(true)
  }

  // Add assignments
  const handleAddAssignments = () => {
    if (!selectedTask || !selectedWeek || selectedEmployees.length === 0) return

    selectedEmployees.forEach(empId => {
      addAssignment({
        employeeId: empId,
        eventType: 'sonstiges' as EventType,
        title: selectedTask,
        week: selectedWeek.week,
        year: selectedWeek.year,
        hoursPlanned: 40
      })
    })

    setIsAssignOpen(false)
    setSelectedTask(null)
    setSelectedWeek(null)
    setSelectedEmployees([])
  }

  // Delete assignment
  const handleDeleteAssignment = (assignmentId: string) => {
    deleteAssignment(assignmentId)
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileQuestion className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Sonstiges</h2>
              <p className="text-sm text-muted-foreground">
                Spontane Aufgaben und sonstige Einträge
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Neue Aufgabe
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

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine sonstigen Aufgaben</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie eine neue Aufgabe oder tragen Sie etwas in der Mitarbeiterplanung ein.
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Neue Aufgabe erstellen
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-w-max">
            {/* Week Headers */}
            <div className="flex border-b bg-muted/50 sticky top-0 z-10">
              <div className="w-56 flex-shrink-0 p-3 font-medium border-r">Aufgabe</div>
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

            {/* Task Rows */}
            {tasks.map((task) => (
              <div key={task.id} className="flex border-b hover:bg-accent/50">
                <div className="w-56 flex-shrink-0 p-3 border-r">
                  <div className="font-medium truncate">{task.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {task.assignments.length} Zuweisungen
                  </div>
                </div>
                {weeks.map((weekData) => {
                  const weekAssignments = getTaskForWeek(task.title, weekData.week, weekData.year)

                  return (
                    <div
                      key={`${task.id}-${weekData.week}-${weekData.year}`}
                      className={cn(
                        "w-28 flex-shrink-0 p-1 border-r min-h-[60px] cursor-pointer hover:bg-accent/30",
                        weekData.isCurrentWeek && "bg-primary/5"
                      )}
                      onClick={() => handleAssignToTask(task.title, weekData.week, weekData.year)}
                    >
                      {weekAssignments.map(a => {
                        const emp = employees.find(e => e.id === a.employeeId)
                        return (
                          <div
                            key={a.id}
                            className="bg-slate-500 text-white rounded p-1 mb-1 text-xs group relative"
                          >
                            <div className="truncate">{emp?.name.split(',')[0]}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAssignment(a.id)
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full hidden group-hover:flex items-center justify-center"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        )
                      })}
                      {weekAssignments.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-50">
                          <Plus className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Aufgabenname</label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="z.B. Büroarbeiten, Inventur, ..."
              className="w-full mt-2 p-2 border rounded-md"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
              Erstellen & Zuweisen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employees Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Mitarbeiter zuweisen: {selectedTask}
              {selectedWeek && ` (KW ${selectedWeek.week})`}
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
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddAssignments} disabled={selectedEmployees.length === 0}>
              Zuweisen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
