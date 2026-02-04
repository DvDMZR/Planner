import { getWeek, getYear, startOfWeek, addWeeks, format, isBefore, startOfDay } from 'date-fns'
import { de } from 'date-fns/locale'
import type { WeekData } from '../store/types'

// Get ISO week number (Monday as first day of week)
export function getCalendarWeek(date: Date): number {
  return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 })
}

export function getWeekYear(date: Date): number {
  return getYear(date)
}

export function getCurrentWeek(): { week: number; year: number } {
  const now = new Date()
  return {
    week: getCalendarWeek(now),
    year: getWeekYear(now)
  }
}

export function getWeekStart(week: number, year: number): Date {
  // Get January 4th of the year (always in week 1 by ISO standard)
  const jan4 = new Date(year, 0, 4)
  const startOfFirstWeek = startOfWeek(jan4, { weekStartsOn: 1 })
  return addWeeks(startOfFirstWeek, week - 1)
}

export function formatWeekLabel(week: number, _year: number): string {
  return `KW ${week.toString().padStart(2, '0')}`
}

export function formatWeekRange(week: number, year: number): string {
  const weekStart = getWeekStart(week, year)
  return `${format(weekStart, 'dd.MM.')} - ${format(addWeeks(weekStart, 0), 'dd.MM.yyyy', { locale: de })}`
}

export function generateWeeksArray(
  startWeek: number,
  startYear: number,
  count: number,
  includePast: boolean = false
): WeekData[] {
  const weeks: WeekData[] = []
  const current = getCurrentWeek()
  const today = startOfDay(new Date())

  let week = startWeek
  let year = startYear

  for (let i = 0; i < count; i++) {
    const weekStart = getWeekStart(week, year)
    const isPast = isBefore(weekStart, today) && !isCurrentWeek(week, year, current)
    const isCurrentWeekFlag = isCurrentWeek(week, year, current)

    if (includePast || !isPast || isCurrentWeekFlag) {
      weeks.push({
        week,
        year,
        label: formatWeekLabel(week, year),
        isCurrentWeek: isCurrentWeekFlag,
        isPast
      })
    }

    // Move to next week
    week++
    if (week > 52) {
      // Simplified - some years have 53 weeks
      week = 1
      year++
    }
  }

  return weeks
}

function isCurrentWeek(week: number, year: number, current: { week: number; year: number }): boolean {
  return week === current.week && year === current.year
}

export function weekToIndex(week: number, year: number, startWeek: number, startYear: number): number {
  const weeksInYear = 52
  const yearDiff = year - startYear
  const weekDiff = week - startWeek
  return yearDiff * weeksInYear + weekDiff
}

export function isWeekInRange(
  week: number,
  year: number,
  startWeek: number,
  startYear: number,
  endWeek: number,
  endYear: number
): boolean {
  const weekIndex = weekToIndex(week, year, startWeek, startYear)
  const endIndex = weekToIndex(endWeek, endYear, startWeek, startYear)
  return weekIndex >= 0 && weekIndex <= endIndex
}

export function getWeeksBetween(
  startWeek: number,
  startYear: number,
  endWeek: number,
  endYear: number
): number {
  return weekToIndex(endWeek, endYear, startWeek, startYear) + 1
}
