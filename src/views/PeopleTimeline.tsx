import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { useStore, TEAMS } from '../store/useStore'
import { TimelineHeader } from '../components/TimelineHeader'
import { ScrollArea } from '../components/ui/scroll-area'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { cn } from '../lib/utils'
import { generateWeeksArray } from '../lib/date-utils'
import type { TeamId, Employee, Assignment, EventType } from '../store/types'

// Event type colors
const EVENT_COLORS: Record<string, string> = {
  project: '', // Will use project color
  recurring: '#F59E0B',
  spontaneous: '#EC4899',
  training: '#06B6D4',
  sonstiges: '#64748B',
  hotline: '#F97316',
  backup: '#8B5CF6'
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  project: 'Projekt',
  recurring: 'Wiederkehrend',
  spontaneous: 'Spontan',
  training: 'Training',
  sonstiges: 'Sonstiges',
  hotline: 'Hotline/24/7',
  backup: 'Backup'
}

export function PeopleTimeline() {
  const {
    employees,
    projects,
    assignments,
    timelineSettings,
    addAssignment,
    deleteAssignment
  } = useStore()

  const [expandedTeams, setExpandedTeams] = useState<Set<TeamId>>(
    new Set(['as', 'cms', 'hm', 'ic'])
  )

  // Dialog state for adding tasks
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string
    employeeName: string
    week: number
    year: number
  } | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    eventType: 'sonstiges' as EventType,
    hoursPlanned: 40,
    notes: ''
  })

  // Generate weeks array for header
  const weeks = useMemo(() => {
    return generateWeeksArray(
      timelineSettings.startFromWeek,
      timelineSettings.startFromYear,
      timelineSettings.weeksToShow,
      timelineSettings.showPastWeeks
    )
  }, [timelineSettings])

  // Group employees by team
  const employeesByTeam = useMemo(() => {
    const grouped: Record<TeamId, Employee[]> = {
      as: [],
      cms: [],
      hm: [],
      ic: []
    }

    employees.forEach((emp) => {
      if (grouped[emp.teamId]) {
        grouped[emp.teamId].push(emp)
      }
    })

    return grouped
  }, [employees])

  // Get assignments for an employee in a specific week
  const getEmployeeWeekAssignments = (employeeId: string, week: number, year: number) => {
    return assignments.filter(
      (a) => a.employeeId === employeeId && a.week === week && a.year === year
    )
  }

  // Get total hours for an employee in a week
  const getEmployeeWeekHours = (employeeId: string, week: number, year: number) => {
    return getEmployeeWeekAssignments(employeeId, week, year)
      .reduce((sum, a) => sum + a.hoursPlanned, 0)
  }

  const toggleTeam = (teamId: TeamId) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  const getAssignmentColor = (assignment: Assignment) => {
    if (assignment.eventType === 'project' && assignment.projectId) {
      const project = projects.find((p) => p.id === assignment.projectId)
      return project?.color || '#888'
    }
    return EVENT_COLORS[assignment.eventType] || '#888'
  }

  const getAssignmentLabel = (assignment: Assignment) => {
    if (assignment.eventType === 'project' && assignment.projectId) {
      const project = projects.find((p) => p.id === assignment.projectId)
      return project?.name || assignment.title
    }
    return assignment.title
  }

  const handleCellClick = (employee: Employee, week: number, year: number) => {
    setSelectedCell({
      employeeId: employee.id,
      employeeName: employee.name,
      week,
      year
    })
    setNewTask({
      title: '',
      eventType: 'sonstiges',
      hoursPlanned: 40,
      notes: ''
    })
    setIsAddTaskOpen(true)
  }

  const handleCreateTask = () => {
    if (!selectedCell || !newTask.title) return

    addAssignment({
      employeeId: selectedCell.employeeId,
      eventType: newTask.eventType,
      title: newTask.title,
      week: selectedCell.week,
      year: selectedCell.year,
      hoursPlanned: newTask.hoursPlanned,
      notes: newTask.notes || undefined
    })

    setIsAddTaskOpen(false)
    setSelectedCell(null)
  }

  const handleDeleteAssignment = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteAssignment(assignmentId)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TimelineHeader title="Mitarbeiterplanung" />

      {/* Timeline Grid */}
      <ScrollArea orientation="both" className="flex-1">
        <div className="min-w-max">
          {/* Header Row */}
          <div
            className="grid sticky top-0 z-10 bg-card border-b"
            style={{
              gridTemplateColumns: `200px repeat(${weeks.length}, minmax(80px, 1fr))`
            }}
          >
            <div className="p-3 font-medium text-sm border-r bg-muted/50">
              Mitarbeiter
            </div>
            {weeks.map((week) => (
              <div
                key={`${week.year}-${week.week}`}
                className={cn(
                  "p-2 text-center text-sm border-r",
                  week.isCurrentWeek && "bg-primary/10 font-semibold",
                  week.isPast && "bg-muted/30 text-muted-foreground"
                )}
              >
                <div className="font-medium">{week.label}</div>
                <div className="text-xs text-muted-foreground">{week.year}</div>
              </div>
            ))}
          </div>

          {/* Team Groups */}
          {TEAMS.map((team) => {
            const teamEmployees = employeesByTeam[team.id] || []
            const isExpanded = expandedTeams.has(team.id)

            return (
              <div key={team.id}>
                {/* Team Header */}
                <div
                  className="grid sticky top-[52px] z-[5] bg-muted border-b cursor-pointer"
                  style={{
                    gridTemplateColumns: `200px repeat(${weeks.length}, minmax(80px, 1fr))`
                  }}
                  onClick={() => toggleTeam(team.id)}
                >
                  <div className="p-2 border-r flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-medium text-sm">{team.name}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {teamEmployees.length}
                    </Badge>
                  </div>
                  {weeks.map((week) => {
                    // Calculate team utilization for this week
                    const totalHours = teamEmployees.reduce(
                      (sum, emp) => sum + getEmployeeWeekHours(emp.id, week.week, week.year),
                      0
                    )
                    const maxHours = teamEmployees.length * 40
                    const utilization = maxHours > 0 ? Math.round((totalHours / maxHours) * 100) : 0

                    return (
                      <div
                        key={`${team.id}-${week.year}-${week.week}`}
                        className={cn(
                          "p-2 text-center text-xs border-r",
                          week.isCurrentWeek && "bg-primary/5"
                        )}
                      >
                        <span
                          className={cn(
                            utilization >= 100 && "text-red-600 font-medium",
                            utilization >= 80 && utilization < 100 && "text-amber-600",
                            utilization < 80 && "text-muted-foreground"
                          )}
                        >
                          {utilization}%
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Employee Rows */}
                {isExpanded &&
                  teamEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="grid border-b hover:bg-accent/30 transition-colors"
                      style={{
                        gridTemplateColumns: `200px repeat(${weeks.length}, minmax(80px, 1fr))`
                      }}
                    >
                      {/* Employee Name Cell */}
                      <div className="p-2 border-r bg-card">
                        <div className="font-medium text-sm truncate">
                          {employee.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {employee.role}
                        </div>
                      </div>

                      {/* Week Cells */}
                      {weeks.map((week) => {
                        const weekAssignments = getEmployeeWeekAssignments(
                          employee.id,
                          week.week,
                          week.year
                        )
                        const totalHours = weekAssignments.reduce(
                          (sum, a) => sum + a.hoursPlanned,
                          0
                        )
                        const isOverbooked = totalHours > 40

                        return (
                          <div
                            key={`${employee.id}-${week.year}-${week.week}`}
                            onClick={() => handleCellClick(employee, week.week, week.year)}
                            className={cn(
                              "p-1 border-r min-h-[52px] cursor-pointer hover:bg-accent/50 transition-colors group",
                              week.isCurrentWeek && "bg-primary/5",
                              week.isPast && "bg-muted/20",
                              isOverbooked && "bg-red-50 dark:bg-red-950/20"
                            )}
                          >
                            <div className="space-y-1">
                              {weekAssignments.map((assignment) => (
                                <div
                                  key={assignment.id}
                                  className="rounded px-1.5 py-0.5 text-xs text-white truncate flex items-center gap-1 group/item"
                                  style={{
                                    backgroundColor: getAssignmentColor(assignment)
                                  }}
                                  title={`${getAssignmentLabel(assignment)} (${assignment.hoursPlanned}h)`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="truncate flex-1">
                                    {getAssignmentLabel(assignment)}
                                  </span>
                                  {assignment.eventType !== 'project' && assignment.eventType !== 'hotline' && (
                                    <button
                                      onClick={(e) => handleDeleteAssignment(assignment.id, e)}
                                      className="hidden group-hover/item:flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/40"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Add button on hover when empty or partially filled */}
                            {totalHours < 40 && (
                              <div className="hidden group-hover:flex items-center justify-center mt-1">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}

                            {/* Hours indicator */}
                            {totalHours > 0 && (
                              <div
                                className={cn(
                                  "text-[10px] mt-1 text-right",
                                  isOverbooked
                                    ? "text-red-600 font-medium"
                                    : "text-muted-foreground"
                                )}
                              >
                                {totalHours}h
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eintrag erstellen - KW {selectedCell?.week}
            </DialogTitle>
          </DialogHeader>

          {selectedCell && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                Mitarbeiter: <span className="font-medium text-foreground">{selectedCell.employeeName}</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Titel</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="z.B. Kundenbesuch, Training, Urlaub..."
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Typ</label>
                <div className="flex gap-2 flex-wrap">
                  {(['sonstiges', 'recurring', 'training'] as EventType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewTask({ ...newTask, eventType: type })}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        newTask.eventType === type
                          ? "text-white"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                      style={{
                        backgroundColor: newTask.eventType === type ? EVENT_COLORS[type] : undefined
                      }}
                    >
                      {EVENT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stunden</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newTask.hoursPlanned}
                  onChange={(e) => setNewTask({ ...newTask, hoursPlanned: parseInt(e.target.value) || 0 })}
                  className="w-24 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notizen (optional)</label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full h-20 px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Zusätzliche Informationen..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.title}>
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
