import { useMemo } from 'react'
import { GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore, TEAMS } from '../store/useStore'
import { generateWeeksArray } from '../lib/date-utils'
import type { WeekData } from '../store/types'
import { cn } from '../lib/utils'
import type { TrainingCategory } from '../store/types'

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
  const { assignments, employees, timelineSettings, updateTimelineSettings } = useStore()

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Trainings</h2>
              <p className="text-sm text-muted-foreground">
                Übersicht aller Trainings nach Typ
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

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Week Headers */}
          <div className="flex border-b bg-muted/50 sticky top-0 z-10">
            <div className="w-48 flex-shrink-0 p-3 font-medium border-r">Training</div>
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

          {/* Training Groups */}
          {TRAINING_GROUPS.map((group) => (
            <div key={group.team}>
              {/* Group Header */}
              <div className="flex border-b bg-muted/30">
                <div className="w-48 flex-shrink-0 p-2 font-semibold text-sm border-r flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: TEAMS.find(t => t.id === group.team)?.color }}
                  />
                  {group.label}
                </div>
                {weeks.map((weekData: WeekData) => (
                  <div
                    key={`${group.team}-${weekData.week}-${weekData.year}`}
                    className="w-24 flex-shrink-0 border-r"
                  />
                ))}
              </div>

              {/* Training Rows */}
              {group.trainings.map((trainingName) => (
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
                    const participants = weekTrainings.map(t => {
                      const emp = employees.find(e => e.id === t.employeeId)
                      return emp?.name.split(',')[0] || ''
                    })

                    return (
                      <div
                        key={`${trainingName}-${weekData.week}-${weekData.year}`}
                        className={cn(
                          "w-24 flex-shrink-0 p-1 border-r min-h-[40px]",
                          weekData.isCurrentWeek && "bg-primary/5"
                        )}
                      >
                        {weekTrainings.length > 0 && (
                          <div
                            className="rounded p-1 text-xs text-white"
                            style={{ backgroundColor: TRAINING_COLORS[trainingName] }}
                            title={participants.join(', ')}
                          >
                            <div className="font-medium">{weekTrainings.length}x</div>
                            <div className="truncate text-[10px] opacity-90">
                              {participants.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t bg-card p-3">
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="font-medium">Legende:</span>
          {Object.entries(TRAINING_COLORS).slice(0, 5).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span>{name}</span>
            </div>
          ))}
          <span className="text-muted-foreground">... und weitere</span>
        </div>
      </div>
    </div>
  )
}
