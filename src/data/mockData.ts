import type { Employee, Project, Assignment, TeamId } from '../store/types'
import { getCurrentWeek } from '../lib/date-utils'

// German first names and last names for realistic data
const firstNames = [
  'Max', 'Anna', 'Paul', 'Laura', 'Felix', 'Sophie', 'Leon', 'Emma', 'Lukas', 'Mia',
  'Jonas', 'Hannah', 'Tim', 'Lea', 'David', 'Julia', 'Niklas', 'Lena', 'Jan', 'Sarah',
  'Tobias', 'Lisa', 'Simon', 'Nina', 'Moritz', 'Marie', 'Florian', 'Katharina', 'Sebastian', 'Christina'
]

const lastNames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
  'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier'
]

const roles: Record<TeamId, string[]> = {
  frontend: ['Frontend Developer', 'Senior Frontend Developer', 'UI Developer', 'React Developer'],
  backend: ['Backend Developer', 'Senior Backend Developer', 'API Developer', 'Node.js Developer'],
  design: ['UI/UX Designer', 'Senior Designer', 'Product Designer', 'Visual Designer'],
  devops: ['DevOps Engineer', 'Senior DevOps Engineer', 'Cloud Engineer', 'SRE']
}

const teamDistribution: TeamId[] = [
  // 10 Frontend
  'frontend', 'frontend', 'frontend', 'frontend', 'frontend',
  'frontend', 'frontend', 'frontend', 'frontend', 'frontend',
  // 10 Backend
  'backend', 'backend', 'backend', 'backend', 'backend',
  'backend', 'backend', 'backend', 'backend', 'backend',
  // 5 Design
  'design', 'design', 'design', 'design', 'design',
  // 5 DevOps
  'devops', 'devops', 'devops', 'devops', 'devops'
]

// Generate 30 employees
export const mockEmployees: Employee[] = firstNames.map((firstName, index) => {
  const lastName = lastNames[index]
  const teamId = teamDistribution[index]
  const teamRoles = roles[teamId]
  const role = teamRoles[index % teamRoles.length]

  return {
    id: `emp-${index + 1}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.de`,
    role,
    teamId,
    hourlyRate: 75 + Math.floor(Math.random() * 50) // 75-125€/h
  }
})

// Project colors
const projectColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#EC4899'  // Pink
]

const { week: currentWeek, year: currentYear } = getCurrentWeek()

// Generate 5+ projects with varying timelines
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-Commerce Relaunch',
    description: 'Complete redesign and rebuild of the main e-commerce platform',
    color: projectColors[0],
    startWeek: currentWeek,
    startYear: currentYear,
    endWeek: currentWeek + 8,
    endYear: currentYear,
    status: 'active',
    budget: 150000
  },
  {
    id: 'proj-2',
    name: 'Mobile App v2',
    description: 'New version of the mobile app with enhanced features',
    color: projectColors[1],
    startWeek: currentWeek + 2,
    startYear: currentYear,
    endWeek: currentWeek + 12,
    endYear: currentYear,
    status: 'planned',
    budget: 200000
  },
  {
    id: 'proj-3',
    name: 'API Modernization',
    description: 'Migrate legacy APIs to new microservices architecture',
    color: projectColors[2],
    startWeek: Math.max(1, currentWeek - 2),
    startYear: currentYear,
    endWeek: currentWeek + 6,
    endYear: currentYear,
    status: 'active',
    budget: 100000
  },
  {
    id: 'proj-4',
    name: 'Design System 2.0',
    description: 'Update and expand the company design system',
    color: projectColors[3],
    startWeek: currentWeek + 1,
    startYear: currentYear,
    endWeek: currentWeek + 4,
    endYear: currentYear,
    status: 'planned',
    budget: 50000
  },
  {
    id: 'proj-5',
    name: 'Infrastructure Migration',
    description: 'Migrate to Kubernetes and improve CI/CD pipelines',
    color: projectColors[4],
    startWeek: currentWeek,
    startYear: currentYear,
    endWeek: currentWeek + 10,
    endYear: currentYear,
    status: 'active',
    budget: 80000
  },
  {
    id: 'proj-6',
    name: 'Customer Portal',
    description: 'Self-service portal for B2B customers',
    color: projectColors[5],
    startWeek: currentWeek + 4,
    startYear: currentYear,
    endWeek: currentWeek + 14,
    endYear: currentYear,
    status: 'planned',
    budget: 120000
  }
]

// Generate realistic assignments
function generateAssignments(): Assignment[] {
  const assignments: Assignment[] = []
  let assignmentId = 1

  // E-Commerce Relaunch - needs frontend, backend, design
  const ecommerceTeam = {
    frontend: ['emp-1', 'emp-2', 'emp-3', 'emp-4'],
    backend: ['emp-11', 'emp-12', 'emp-13'],
    design: ['emp-21', 'emp-22']
  }

  for (let week = currentWeek; week <= currentWeek + 8; week++) {
    [...ecommerceTeam.frontend, ...ecommerceTeam.backend, ...ecommerceTeam.design].forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-1',
        eventType: 'project',
        title: 'E-Commerce Relaunch',
        week,
        year: currentYear,
        hoursPlanned: 40
      })
    })
  }

  // Mobile App v2 - frontend focused
  const mobileTeam = ['emp-5', 'emp-6', 'emp-7', 'emp-14', 'emp-23']
  for (let week = currentWeek + 2; week <= currentWeek + 12; week++) {
    mobileTeam.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-2',
        eventType: 'project',
        title: 'Mobile App v2',
        week,
        year: currentYear,
        hoursPlanned: 40
      })
    })
  }

  // API Modernization - backend heavy
  const apiTeam = ['emp-15', 'emp-16', 'emp-17', 'emp-18', 'emp-26']
  for (let week = Math.max(1, currentWeek - 2); week <= currentWeek + 6; week++) {
    apiTeam.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-3',
        eventType: 'project',
        title: 'API Modernization',
        week,
        year: currentYear,
        hoursPlanned: 40
      })
    })
  }

  // Design System 2.0 - design team
  const designTeam = ['emp-24', 'emp-25', 'emp-8']
  for (let week = currentWeek + 1; week <= currentWeek + 4; week++) {
    designTeam.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-4',
        eventType: 'project',
        title: 'Design System 2.0',
        week,
        year: currentYear,
        hoursPlanned: 40
      })
    })
  }

  // Infrastructure Migration - devops
  const infraTeam = ['emp-27', 'emp-28', 'emp-29', 'emp-30']
  for (let week = currentWeek; week <= currentWeek + 10; week++) {
    infraTeam.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-5',
        eventType: 'project',
        title: 'Infrastructure Migration',
        week,
        year: currentYear,
        hoursPlanned: 40
      })
    })
  }

  // Add some recurring events (Support rotation)
  const supportRotation = ['emp-9', 'emp-10', 'emp-19', 'emp-20']
  supportRotation.forEach((empId, index) => {
    const supportWeek = currentWeek + index
    assignments.push({
      id: `assign-${assignmentId++}`,
      employeeId: empId,
      eventType: 'recurring',
      title: 'Support Rotation',
      week: supportWeek,
      year: currentYear,
      hoursPlanned: 20
    })
  })

  // Add some training events
  assignments.push({
    id: `assign-${assignmentId++}`,
    employeeId: 'emp-9',
    eventType: 'training',
    title: 'React Advanced Workshop',
    week: currentWeek + 3,
    year: currentYear,
    hoursPlanned: 16
  })

  assignments.push({
    id: `assign-${assignmentId++}`,
    employeeId: 'emp-19',
    eventType: 'training',
    title: 'AWS Certification',
    week: currentWeek + 2,
    year: currentYear,
    hoursPlanned: 24
  })

  // Add some spontaneous events
  assignments.push({
    id: `assign-${assignmentId++}`,
    employeeId: 'emp-1',
    eventType: 'spontaneous',
    title: 'Client Visit - Hamburg',
    week: currentWeek + 1,
    year: currentYear,
    hoursPlanned: 8,
    notes: 'Meeting with key stakeholders'
  })

  return assignments
}

export const mockAssignments: Assignment[] = generateAssignments()
