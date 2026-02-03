import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Employee,
  Project,
  Assignment,
  Team,
  TeamId,
  ViewType,
  TimelineSettings,
  EmployeeAvailability,
  EventType,
  Training,
  TravelExpense,
  AppSettings,
  ProjectInvoice
} from './types'
import { getCurrentWeek } from '../lib/date-utils'

// Teams configuration
export const TEAMS: Team[] = [
  { id: 'as', name: 'Team AS', color: '#3B82F6' },
  { id: 'cms', name: 'Team CMS', color: '#10B981' },
  { id: 'hm', name: 'Team HM', color: '#8B5CF6' },
  { id: 'ic', name: 'Team I&C', color: '#F59E0B' }
]

// Standard work hours per week
const HOURS_PER_WEEK = 40

interface PlannerState {
  // Data
  employees: Employee[]
  projects: Project[]
  assignments: Assignment[]
  trainings: Training[]
  travelExpenses: TravelExpense[]
  appSettings: AppSettings

  // UI State
  currentView: ViewType
  selectedProjectId: string | null
  selectedEmployeeId: string | null
  timelineSettings: TimelineSettings

  // Actions - Employees
  addEmployee: (employee: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // Actions - Projects
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Actions - Assignments
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void
  deleteAssignment: (id: string) => void
  assignEmployeeToProject: (employeeId: string, projectId: string, week: number, year: number, hours?: number) => void
  removeEmployeeFromProjectWeek: (employeeId: string, projectId: string, week: number, year: number) => void

  // Actions - Travel Expenses
  addTravelExpense: (expense: Omit<TravelExpense, 'id' | 'createdAt'>) => void
  updateTravelExpense: (id: string, updates: Partial<TravelExpense>) => void
  deleteTravelExpense: (id: string) => void
  importFromConcur: (projectId: string) => void // Fake import

  // Actions - Settings
  updateAppSettings: (settings: Partial<AppSettings>) => void

  // Actions - UI
  setCurrentView: (view: ViewType) => void
  setSelectedProject: (projectId: string | null) => void
  setSelectedEmployee: (employeeId: string | null) => void
  updateTimelineSettings: (settings: Partial<TimelineSettings>) => void

  // Computed / Queries
  getEmployeesByTeam: (teamId: TeamId) => Employee[]
  getProjectAssignments: (projectId: string) => Assignment[]
  getEmployeeAssignments: (employeeId: string) => Assignment[]
  getAssignmentsForWeek: (week: number, year: number) => Assignment[]
  getEmployeeAvailability: (week: number, year: number) => EmployeeAvailability[]
  isEmployeeAvailable: (employeeId: string, week: number, year: number) => boolean
  getEmployeeHoursForWeek: (employeeId: string, week: number, year: number) => number
  getProjectTravelExpenses: (projectId: string) => TravelExpense[]
  generateProjectInvoice: (projectId: string) => ProjectInvoice | null

  // Stats
  getTeamUtilization: (teamId: TeamId, week: number, year: number) => number
  getProjectCost: (projectId: string) => { labor: number; travel: number; total: number }

  // Data management
  initializeWithMockData: () => void
  clearAllData: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      // Initial state
      employees: [],
      projects: [],
      assignments: [],
      trainings: [],
      travelExpenses: [],
      appSettings: {
        defaultHourlyRate: 85
      },
      currentView: 'people',
      selectedProjectId: null,
      selectedEmployeeId: null,
      timelineSettings: {
        showPastWeeks: false,
        weeksToShow: 16,
        startFromWeek: getCurrentWeek().week,
        startFromYear: getCurrentWeek().year
      },

      // Employee actions
      addEmployee: (employee) => set((state) => ({
        employees: [...state.employees, { ...employee, id: generateId() }]
      })),

      updateEmployee: (id, updates) => set((state) => ({
        employees: state.employees.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        )
      })),

      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
        assignments: state.assignments.filter((a) => a.employeeId !== id)
      })),

      // Project actions
      addProject: (project) => set((state) => ({
        projects: [...state.projects, { ...project, id: generateId() }]
      })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        assignments: state.assignments.filter((a) => a.projectId !== id),
        travelExpenses: state.travelExpenses.filter((t) => t.projectId !== id)
      })),

      // Assignment actions
      addAssignment: (assignment) => set((state) => ({
        assignments: [...state.assignments, { ...assignment, id: generateId() }]
      })),

      updateAssignment: (id, updates) => set((state) => ({
        assignments: state.assignments.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        )
      })),

      deleteAssignment: (id) => set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id)
      })),

      assignEmployeeToProject: (employeeId, projectId, week, year, hours = HOURS_PER_WEEK) => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)

        // Check if assignment already exists
        const existing = state.assignments.find(
          a => a.employeeId === employeeId &&
               a.projectId === projectId &&
               a.week === week &&
               a.year === year
        )

        if (existing) {
          // Update hours instead
          set((state) => ({
            assignments: state.assignments.map((a) =>
              a.id === existing.id ? { ...a, hoursPlanned: hours } : a
            )
          }))
        } else {
          set((state) => ({
            assignments: [...state.assignments, {
              id: generateId(),
              employeeId,
              projectId,
              eventType: 'project' as EventType,
              title: project?.name || 'Project Assignment',
              week,
              year,
              hoursPlanned: hours
            }]
          }))
        }
      },

      removeEmployeeFromProjectWeek: (employeeId, projectId, week, year) => set((state) => ({
        assignments: state.assignments.filter((a) =>
          !(a.employeeId === employeeId &&
            a.projectId === projectId &&
            a.week === week &&
            a.year === year)
        )
      })),

      // Travel Expense actions
      addTravelExpense: (expense) => set((state) => ({
        travelExpenses: [...state.travelExpenses, {
          ...expense,
          id: generateId(),
          createdAt: new Date().toISOString()
        }]
      })),

      updateTravelExpense: (id, updates) => set((state) => ({
        travelExpenses: state.travelExpenses.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      deleteTravelExpense: (id) => set((state) => ({
        travelExpenses: state.travelExpenses.filter((t) => t.id !== id)
      })),

      importFromConcur: (projectId) => {
        // Fake import - generates random travel expenses for project assignments
        const state = get()
        const projectAssignments = state.assignments.filter(a => a.projectId === projectId)

        // Group by employee and week to create unique entries
        const uniqueVisits = new Map<string, Assignment>()
        projectAssignments.forEach(a => {
          const key = `${a.employeeId}-${a.week}-${a.year}`
          if (!uniqueVisits.has(key)) {
            uniqueVisits.set(key, a)
          }
        })

        const newExpenses: TravelExpense[] = []
        uniqueVisits.forEach((assignment) => {
          // Check if expense already exists
          const exists = state.travelExpenses.some(
            t => t.employeeId === assignment.employeeId &&
                 t.projectId === projectId &&
                 t.week === assignment.week &&
                 t.year === assignment.year
          )
          if (!exists) {
            newExpenses.push({
              id: generateId(),
              assignmentId: assignment.id,
              employeeId: assignment.employeeId,
              projectId: projectId,
              week: assignment.week,
              year: assignment.year,
              amount: Math.round((Math.random() * 500 + 200) * 100) / 100, // Random 200-700€
              description: 'Importiert aus Concur',
              importedFromConcur: true,
              createdAt: new Date().toISOString()
            })
          }
        })

        if (newExpenses.length > 0) {
          set((state) => ({
            travelExpenses: [...state.travelExpenses, ...newExpenses]
          }))
        }
      },

      // Settings actions
      updateAppSettings: (settings) => set((state) => ({
        appSettings: { ...state.appSettings, ...settings }
      })),

      // UI actions
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
      setSelectedEmployee: (employeeId) => set({ selectedEmployeeId: employeeId }),
      updateTimelineSettings: (settings) => set((state) => ({
        timelineSettings: { ...state.timelineSettings, ...settings }
      })),

      // Queries
      getEmployeesByTeam: (teamId) => {
        return get().employees.filter((e) => e.teamId === teamId)
      },

      getProjectAssignments: (projectId) => {
        return get().assignments.filter((a) => a.projectId === projectId)
      },

      getEmployeeAssignments: (employeeId) => {
        return get().assignments.filter((a) => a.employeeId === employeeId)
      },

      getAssignmentsForWeek: (week, year) => {
        return get().assignments.filter((a) => a.week === week && a.year === year)
      },

      getEmployeeAvailability: (week, year) => {
        const state = get()
        return state.employees.map((employee) => {
          const assignments = state.assignments.filter(
            (a) => a.employeeId === employee.id && a.week === week && a.year === year
          )
          const totalHours = assignments.reduce((sum, a) => sum + a.hoursPlanned, 0)

          return {
            employee,
            isAvailable: totalHours < HOURS_PER_WEEK,
            currentAssignments: assignments,
            totalHoursBooked: totalHours
          }
        })
      },

      isEmployeeAvailable: (employeeId, week, year) => {
        const hours = get().getEmployeeHoursForWeek(employeeId, week, year)
        return hours < HOURS_PER_WEEK
      },

      getEmployeeHoursForWeek: (employeeId, week, year) => {
        return get().assignments
          .filter((a) => a.employeeId === employeeId && a.week === week && a.year === year)
          .reduce((sum, a) => sum + a.hoursPlanned, 0)
      },

      getProjectTravelExpenses: (projectId) => {
        return get().travelExpenses.filter((t) => t.projectId === projectId)
      },

      generateProjectInvoice: (projectId) => {
        const state = get()
        const project = state.projects.find(p => p.id === projectId)
        if (!project) return null

        const assignments = state.assignments.filter(a => a.projectId === projectId)
        const expenses = state.travelExpenses.filter(t => t.projectId === projectId)

        // Group labor by employee
        const laborByEmployee = new Map<string, { hours: number; rate: number; name: string }>()
        assignments.forEach(a => {
          const employee = state.employees.find(e => e.id === a.employeeId)
          if (!employee) return

          const existing = laborByEmployee.get(a.employeeId)
          if (existing) {
            existing.hours += a.hoursPlanned
          } else {
            laborByEmployee.set(a.employeeId, {
              hours: a.hoursPlanned,
              rate: employee.hourlyRate,
              name: employee.name
            })
          }
        })

        const laborItems = Array.from(laborByEmployee.values()).map(item => ({
          description: `Arbeitsleistung ${item.name}`,
          quantity: item.hours,
          unitPrice: item.rate,
          total: item.hours * item.rate
        }))

        const totalLabor = laborItems.reduce((sum, item) => sum + item.total, 0)
        const totalTravel = expenses.reduce((sum, e) => sum + e.amount, 0)

        return {
          projectId,
          projectNumber: project.projectNumber,
          projectName: project.name,
          generatedAt: new Date().toISOString(),
          laborItems,
          travelExpenses: expenses,
          totalLabor,
          totalTravel,
          grandTotal: totalLabor + totalTravel
        }
      },

      // Stats
      getTeamUtilization: (teamId, week, year) => {
        const state = get()
        const teamEmployees = state.employees.filter((e) => e.teamId === teamId)
        if (teamEmployees.length === 0) return 0

        const totalCapacity = teamEmployees.length * HOURS_PER_WEEK
        const totalBooked = teamEmployees.reduce((sum, emp) => {
          return sum + state.getEmployeeHoursForWeek(emp.id, week, year)
        }, 0)

        return Math.round((totalBooked / totalCapacity) * 100)
      },

      getProjectCost: (projectId) => {
        const state = get()
        const assignments = state.assignments.filter((a) => a.projectId === projectId)
        const expenses = state.travelExpenses.filter((t) => t.projectId === projectId)

        const labor = assignments.reduce((total, assignment) => {
          const employee = state.employees.find((e) => e.id === assignment.employeeId)
          if (!employee) return total
          return total + (assignment.hoursPlanned * employee.hourlyRate)
        }, 0)

        const travel = expenses.reduce((sum, e) => sum + e.amount, 0)

        return { labor, travel, total: labor + travel }
      },

      // Data management
      initializeWithMockData: () => {
        // Import mock data dynamically to avoid circular deps
        import('../data/mockData').then(({ mockEmployees, mockProjects, mockAssignments, mockTrainings }) => {
          set({
            employees: mockEmployees,
            projects: mockProjects,
            assignments: mockAssignments,
            trainings: mockTrainings || [],
            travelExpenses: []
          })
        })
      },

      clearAllData: () => set({
        employees: [],
        projects: [],
        assignments: [],
        trainings: [],
        travelExpenses: []
      })
    }),
    {
      name: 'planner-storage',
      partialize: (state) => ({
        employees: state.employees,
        projects: state.projects,
        assignments: state.assignments,
        trainings: state.trainings,
        travelExpenses: state.travelExpenses,
        appSettings: state.appSettings,
        timelineSettings: state.timelineSettings
      })
    }
  )
)
