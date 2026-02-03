import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useStore, TEAMS } from '../store/useStore'
import { TimelineHeader } from '../components/TimelineHeader'
import { ScrollArea } from '../components/ui/scroll-area'
import { Badge } from '../components/ui/badge'
import { cn } from '../lib/utils'
import { generateWeeksArray } from '../lib/date-utils'
import type { TeamId, Employee, Assignment } from '../store/types'

// Event type colors
const EVENT_COLORS: Record<string, string> = {
  project: '', // Will use project color
  recurring: '#F59E0B',
  spontaneous: '#EC4899',
  training: '#06B6D4'
}

export function PeopleTimeline() {
  const {
    employees,
    projects,
    assignments,
    timelineSettings
  } = useStore()

  const [expandedTeams, setExpandedTeams] = useState<Set<TeamId>>(
    new Set(['as', 'cms', 'hm', 'ic'])
  )

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TimelineHeader title="Mitarbeiter-Timeline" />

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
                            className={cn(
                              "p-1 border-r min-h-[52px]",
                              week.isCurrentWeek && "bg-primary/5",
                              week.isPast && "bg-muted/20",
                              isOverbooked && "bg-red-50 dark:bg-red-950/20"
                            )}
                          >
                            <div className="space-y-1">
                              {weekAssignments.map((assignment) => (
                                <div
                                  key={assignment.id}
                                  className="rounded px-1.5 py-0.5 text-xs text-white truncate"
                                  style={{
                                    backgroundColor: getAssignmentColor(assignment)
                                  }}
                                  title={`${getAssignmentLabel(assignment)} (${assignment.hoursPlanned}h)`}
                                >
                                  {getAssignmentLabel(assignment)}
                                </div>
                              ))}
                            </div>

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
    </div>
  )
}
