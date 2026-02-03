import { useMemo } from 'react'
import { Phone, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore, TEAMS } from '../store/useStore'
import { generateWeeksArray } from '../lib/date-utils'
import type { WeekData } from '../store/types'
import { cn } from '../lib/utils'

export function HotlineView() {
  const { assignments, employees, timelineSettings, updateTimelineSettings } = useStore()

  // Only AS employees do 24/7
  const asEmployees = employees.filter(e => e.teamId === 'as')

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

  // Get hotline assignment for week
  const getHotlineForWeek = (week: number, year: number) => {
    return hotlineAssignments.find(a => a.week === week && a.year === year)
  }

  // Get employee hotline for week
  const getEmployeeHotline = (employeeId: string, week: number, year: number) => {
    return hotlineAssignments.find(
      a => a.employeeId === employeeId && a.week === week && a.year === year
    )
  }

  // Check for conflicts (employee has other assignments same week as 24/7)
  const hasConflict = (employeeId: string, week: number, year: number) => {
    const hasHotline = getEmployeeHotline(employeeId, week, year)
    if (!hasHotline) return false

    const otherAssignments = assignments.filter(
      a => a.employeeId === employeeId &&
           a.week === week &&
           a.year === year &&
           a.eventType !== 'hotline'
    )
    return otherAssignments.length > 0
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Hotline / 24/7 Bereitschaft</h2>
              <p className="text-sm text-muted-foreground">
                Wöchentliche Rotation im Team AS - {asEmployees.length} Mitarbeiter
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

      {/* Rotation Overview */}
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold mb-3">Aktuelle Wochen-Übersicht</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weeks.slice(0, 12).map((weekData: WeekData) => {
            const hotline = getHotlineForWeek(weekData.week, weekData.year)
            const employee = hotline ? employees.find(e => e.id === hotline.employeeId) : null

            return (
              <div
                key={`overview-${weekData.week}-${weekData.year}`}
                className={cn(
                  "flex-shrink-0 p-3 rounded-lg border bg-card min-w-[120px]",
                  weekData.isCurrentWeek && "ring-2 ring-primary"
                )}
              >
                <div className="text-xs text-muted-foreground mb-1">{weekData.label}</div>
                <div className="font-medium text-sm truncate">
                  {employee?.name.split(',')[0] || 'Nicht besetzt'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Employee Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Week Headers */}
          <div className="flex border-b bg-muted/50 sticky top-0 z-10">
            <div className="w-56 flex-shrink-0 p-3 font-medium border-r">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: TEAMS.find(t => t.id === 'as')?.color }}
                />
                Team AS Mitarbeiter
              </div>
            </div>
            {weeks.map((weekData: WeekData) => (
              <div
                key={`${weekData.week}-${weekData.year}`}
                className={cn(
                  "w-20 flex-shrink-0 p-2 text-center text-xs border-r",
                  weekData.isCurrentWeek && "bg-primary/10 font-bold"
                )}
              >
                <div className="font-medium">{weekData.label}</div>
                <div className="text-muted-foreground">{weekData.year}</div>
              </div>
            ))}
          </div>

          {/* Employee Rows */}
          {asEmployees.map((employee, index) => (
            <div key={employee.id} className="flex border-b hover:bg-accent/50">
              <div className="w-56 flex-shrink-0 p-2 border-r flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium truncate">{employee.name}</div>
                  <div className="text-xs text-muted-foreground">Rotation #{index + 1}</div>
                </div>
              </div>
              {weeks.map((weekData: WeekData) => {
                const hasHotlineThisWeek = getEmployeeHotline(employee.id, weekData.week, weekData.year)
                const conflict = hasConflict(employee.id, weekData.week, weekData.year)

                return (
                  <div
                    key={`${employee.id}-${weekData.week}-${weekData.year}`}
                    className={cn(
                      "w-20 flex-shrink-0 p-1 border-r min-h-[48px] flex items-center justify-center",
                      weekData.isCurrentWeek && "bg-primary/5"
                    )}
                  >
                    {hasHotlineThisWeek && (
                      <div
                        className={cn(
                          "w-full rounded p-1 text-xs text-white text-center",
                          conflict ? "bg-red-500" : "bg-orange-500"
                        )}
                        title={conflict ? 'Konflikt: Andere Aufgaben in dieser Woche!' : '24/7 Bereitschaft'}
                      >
                        <Phone className="h-3 w-3 mx-auto mb-0.5" />
                        <div className="text-[10px]">24/7</div>
                        {conflict && (
                          <AlertCircle className="h-3 w-3 mx-auto mt-0.5" />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="border-t bg-card p-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>24/7 Bereitschaft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>Konflikt (andere Aufgaben)</span>
          </div>
          <div className="text-muted-foreground ml-4">
            Rotation: Jede Woche ein anderer Mitarbeiter in fester Reihenfolge
          </div>
        </div>
      </div>
    </div>
  )
}
