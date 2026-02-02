import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/button'
import { useStore } from '../store/useStore'
import { getCurrentWeek } from '../lib/date-utils'

interface TimelineHeaderProps {
  title: string
}

export function TimelineHeader({ title }: TimelineHeaderProps) {
  const { timelineSettings, updateTimelineSettings } = useStore()

  const goToPreviousWeeks = () => {
    let newWeek = timelineSettings.startFromWeek - 4
    let newYear = timelineSettings.startFromYear

    if (newWeek < 1) {
      newWeek = 52 + newWeek
      newYear--
    }

    updateTimelineSettings({ startFromWeek: newWeek, startFromYear: newYear })
  }

  const goToNextWeeks = () => {
    let newWeek = timelineSettings.startFromWeek + 4
    let newYear = timelineSettings.startFromYear

    if (newWeek > 52) {
      newWeek = newWeek - 52
      newYear++
    }

    updateTimelineSettings({ startFromWeek: newWeek, startFromYear: newYear })
  }

  const goToCurrentWeek = () => {
    const current = getCurrentWeek()
    updateTimelineSettings({
      startFromWeek: current.week,
      startFromYear: current.year
    })
  }

  const togglePastWeeks = () => {
    updateTimelineSettings({ showPastWeeks: !timelineSettings.showPastWeeks })
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePastWeeks}
          className="gap-2"
        >
          {timelineSettings.showPastWeeks ? (
            <>
              <EyeOff className="h-4 w-4" />
              Vergangene ausblenden
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Vergangene anzeigen
            </>
          )}
        </Button>

        <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
          Heute
        </Button>

        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={goToPreviousWeeks}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm font-medium min-w-[100px] text-center">
            KW {timelineSettings.startFromWeek} / {timelineSettings.startFromYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={goToNextWeeks}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
