// Core Types for Team Resource Planning Application

export type TeamId = 'frontend' | 'backend' | 'design' | 'devops'

export interface Team {
  id: TeamId
  name: string
  color: string
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  teamId: TeamId
  avatarUrl?: string
  hourlyRate: number // For cost calculations
}

export type EventType = 'project' | 'recurring' | 'spontaneous' | 'training'

export interface Project {
  id: string
  name: string
  description: string
  color: string
  startWeek: number // Calendar week (KW)
  startYear: number
  endWeek: number
  endYear: number
  status: 'planned' | 'active' | 'completed' | 'on-hold'
  budget?: number
}

export interface Assignment {
  id: string
  employeeId: string
  projectId?: string // Optional - for non-project events
  eventType: EventType
  title: string // For non-project events
  week: number // Calendar week
  year: number
  hoursPlanned: number // Hours planned for this week
  notes?: string
}

// Computed types for views
export interface WeekData {
  week: number
  year: number
  label: string // e.g., "KW 05"
  isCurrentWeek: boolean
  isPast: boolean
}

export interface EmployeeAvailability {
  employee: Employee
  isAvailable: boolean
  currentAssignments: Assignment[]
  totalHoursBooked: number
}

// View state
export type ViewType = 'people' | 'projects' | 'stats' | 'settings'

export interface TimelineSettings {
  showPastWeeks: boolean
  weeksToShow: number
  startFromWeek: number
  startFromYear: number
}
