// Core Types for Team Resource Planning Application

export type TeamId = 'as' | 'cms' | 'hm' | 'ic'

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

export type EventType = 'project' | 'recurring' | 'spontaneous' | 'training' | 'sonstiges' | 'hotline' | 'backup'

// Training categories
export type TrainingCategory =
  // AS Team Trainings
  | 'R9500 I&C' | 'R9500 S&T' | 'F4500 I&C' | 'F4500 S&T' | 'DPQ'
  // CMS Team Trainings
  | 'T8900' | 'T8600' | 'DPX' | 'CowScout'
  // HM Team Trainings
  | 'DairyNet' | 'DairyPlan' | 'Good Cow Feeding' | 'Good Cow Milking'

export interface Training {
  id: string
  name: TrainingCategory
  description?: string
  targetTeams: TeamId[] // Which teams can attend this training
  requiredParticipants: number // How many people per training
  color: string
}

// Project categories for grouping
export type ProjectCategory = 'R95/R96' | 'DPQ' | 'T89/T86' | 'Sonstiges'

export interface Project {
  id: string
  name: string
  projectNumber: string // Auftragsnummer
  description: string
  color: string
  category?: ProjectCategory // For grouping in timeline
  startWeek: number // Calendar week (KW)
  startYear: number
  endWeek: number
  endYear: number
  status: 'planned' | 'active' | 'completed' | 'on-hold'
  budget?: number
}

export interface TravelExpense {
  id: string
  assignmentId: string
  employeeId: string
  projectId: string
  week: number
  year: number
  amount: number
  description?: string
  importedFromConcur?: boolean
  createdAt: string
}

export interface Assignment {
  id: string
  employeeId: string
  projectId?: string // Optional - for non-project events
  trainingId?: string // For training assignments
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
export type ViewType = 'people' | 'projects' | 'trainings' | 'hotline' | 'sonstiges' | 'stats' | 'settings' | 'project-detail'

export interface TimelineSettings {
  showPastWeeks: boolean
  weeksToShow: number
  startFromWeek: number
  startFromYear: number
}

export interface AppSettings {
  defaultHourlyRate: number
}

// Invoice related
export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ProjectInvoice {
  projectId: string
  projectNumber: string
  projectName: string
  generatedAt: string
  laborItems: InvoiceLineItem[]
  travelExpenses: TravelExpense[]
  totalLabor: number
  totalTravel: number
  grandTotal: number
}
