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
  EventType
} from './types'
import { getCurrentWeek } from '../lib/date-utils'

// Teams configuration
export const TEAMS: Team[] = [
  { id: 'frontend', name: 'Frontend', color: '#3B82F6' },
  { id: 'backend', name: 'Backend', color: '#10B981' },
  { id: 'design', name: 'Design', color: '#8B5CF6' },
  { id: 'devops', name: 'DevOps', color: '#F59E0B' }
]

// Standard work hours per week
const HOURS_PER_WEEK = 40

interface PlannerState {
  // Data
  employees: Employee[]
  projects: Project[]
  assignments: Assignment[]

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

  // Stats
  getTeamUtilization: (teamId: TeamId, week: number, year: number) => number
  getProjectCost: (projectId: string) => number

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
      currentView: 'projects',
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
        assignments: state.assignments.filter((a) => a.projectId !== id)
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

        return assignments.reduce((total, assignment) => {
          const employee = state.employees.find((e) => e.id === assignment.employeeId)
          if (!employee) return total
          return total + (assignment.hoursPlanned * employee.hourlyRate)
        }, 0)
      },

      // Data management
      initializeWithMockData: () => {
        // Import mock data dynamically to avoid circular deps
        import('../data/mockData').then(({ mockEmployees, mockProjects, mockAssignments }) => {
          set({
            employees: mockEmployees,
            projects: mockProjects,
            assignments: mockAssignments
          })
        })
      },

      clearAllData: () => set({
        employees: [],
        projects: [],
        assignments: []
      })
    }),
    {
      name: 'planner-storage',
      partialize: (state) => ({
        employees: state.employees,
        projects: state.projects,
        assignments: state.assignments,
        timelineSettings: state.timelineSettings
      })
    }
  )
)
