import type { Employee, Project, Assignment, Training, TrainingCategory } from '../store/types'
import { getCurrentWeek } from '../lib/date-utils'

const { week: currentWeek, year: currentYear } = getCurrentWeek()

// Team AS - Technical Service Spezialist (11 Personen)
const teamAS: Omit<Employee, 'id'>[] = [
  { name: 'Cetinkilic, Salih', email: 'salih.cetinkilic@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Dutka, Stephan', email: 'stephan.dutka@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Madsen, Charles', email: 'charles.madsen@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Antolik, Adam', email: 'adam.antolik@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Kleinheinrich, Marc', email: 'marc.kleinheinrich@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Krampe, Markus', email: 'markus.krampe@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Kristensen, Carsten', email: 'carsten.kristensen@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Lubbers, Herman', email: 'herman.lubbers@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Mechlinski, Jakub', email: 'jakub.mechlinski@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Oostdam, Ron', email: 'ron.oostdam@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
  { name: 'Valk, Dick', email: 'dick.valk@company.de', role: 'Technical Service Spezialist', teamId: 'as', hourlyRate: 85 },
]

// Team CMS - Technical Service Spezialist (14 Personen)
const teamCMS: Omit<Employee, 'id'>[] = [
  { name: 'Meulenbeek, Barry', email: 'barry.meulenbeek@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Pauly, Gerd', email: 'gerd.pauly@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Penning, Carsten', email: 'carsten.penning@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Schulze Wartenhorst, Bernd', email: 'bernd.schulzewartenhorst@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Stremlow, Christopher', email: 'christopher.stremlow@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Venne, Daniel', email: 'daniel.venne@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Berkensträter, Martin', email: 'martin.berkenstraeter@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Demirelli, Serkan', email: 'serkan.demirelli@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Gehrke, Robin', email: 'robin.gehrke@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Kassner, Detlef', email: 'detlef.kassner@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Nahues, Michael', email: 'michael.nahues@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Oezenc, Gürhan', email: 'guerhan.oezenc@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'Sievers, Peter', email: 'peter.sievers@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
  { name: 'del Rincon, Victor', email: 'victor.delrincon@company.de', role: 'Technical Service Spezialist', teamId: 'cms', hourlyRate: 85 },
]

// Team HM - Herd Manager (5 Personen)
const teamHM: Omit<Employee, 'id'>[] = [
  { name: 'Weymann, Walter', email: 'walter.weymann@company.de', role: 'Herd Manager', teamId: 'hm', hourlyRate: 90 },
  { name: 'Eismann, Laurenz', email: 'laurenz.eismann@company.de', role: 'Herd Manager', teamId: 'hm', hourlyRate: 90 },
  { name: 'N.N.', email: 'nn.hm@company.de', role: 'Herd Manager', teamId: 'hm', hourlyRate: 90 },
  { name: 'Christen, Keith', email: 'keith.christen@company.de', role: 'Herd Manager', teamId: 'hm', hourlyRate: 90 },
  { name: 'Marten, Stefan', email: 'stefan.marten@company.de', role: 'Herd Manager', teamId: 'hm', hourlyRate: 90 },
]

// Team I&C - Build up (6 Personen)
const teamIC: Omit<Employee, 'id'>[] = [
  { name: 'Bachand, Serge', email: 'serge.bachand@company.de', role: 'Build up', teamId: 'ic', hourlyRate: 85 },
  { name: 'Carrie, Timon', email: 'timon.carrie@company.de', role: 'Build up', teamId: 'ic', hourlyRate: 85 },
  { name: 'Ricken, Timo', email: 'timo.ricken@company.de', role: 'Build up', teamId: 'ic', hourlyRate: 85 },
  { name: 'Mecking, Michael', email: 'michael.mecking@company.de', role: 'Build up', teamId: 'ic', hourlyRate: 85 },
  { name: 'Gerling, Thorsten', email: 'thorsten.gerling@company.de', role: 'Build up', teamId: 'ic', hourlyRate: 85 },
  { name: 'N.N.', email: 'nn.ic@company.de', role: 'Build up', teamId: 'ic', hourlyRate: 85 },
]

// Alle Mitarbeiter zusammenführen mit IDs
const allTeamMembers = [...teamAS, ...teamCMS, ...teamHM, ...teamIC]
export const mockEmployees: Employee[] = allTeamMembers.map((emp, index) => ({
  ...emp,
  id: `emp-${index + 1}`
}))

// Helper: Employee IDs nach Team
const asEmployeeIds = mockEmployees.filter(e => e.teamId === 'as').map(e => e.id)
const cmsEmployeeIds = mockEmployees.filter(e => e.teamId === 'cms').map(e => e.id)
const hmEmployeeIds = mockEmployees.filter(e => e.teamId === 'hm').map(e => e.id)
const icEmployeeIds = mockEmployees.filter(e => e.teamId === 'ic').map(e => e.id)

// Training definitions
export const mockTrainings: Training[] = [
  // AS Team Trainings (also for I&C on I&C trainings)
  { id: 'training-1', name: 'R9500 I&C', targetTeams: ['as', 'ic'], requiredParticipants: 2, color: '#3B82F6' },
  { id: 'training-2', name: 'R9500 S&T', targetTeams: ['as'], requiredParticipants: 2, color: '#60A5FA' },
  { id: 'training-3', name: 'F4500 I&C', targetTeams: ['as', 'ic'], requiredParticipants: 2, color: '#2563EB' },
  { id: 'training-4', name: 'F4500 S&T', targetTeams: ['as'], requiredParticipants: 2, color: '#1D4ED8' },
  { id: 'training-5', name: 'DPQ', targetTeams: ['as'], requiredParticipants: 2, color: '#1E40AF' },
  // CMS Team Trainings
  { id: 'training-6', name: 'T8900', targetTeams: ['cms'], requiredParticipants: 2, color: '#10B981' },
  { id: 'training-7', name: 'T8600', targetTeams: ['cms'], requiredParticipants: 2, color: '#34D399' },
  { id: 'training-8', name: 'DPX', targetTeams: ['cms'], requiredParticipants: 2, color: '#059669' },
  { id: 'training-9', name: 'CowScout', targetTeams: ['cms'], requiredParticipants: 2, color: '#047857' },
  // HM Team Trainings
  { id: 'training-10', name: 'DairyNet', targetTeams: ['hm'], requiredParticipants: 1, color: '#8B5CF6' },
  { id: 'training-11', name: 'DairyPlan', targetTeams: ['hm'], requiredParticipants: 1, color: '#A78BFA' },
  { id: 'training-12', name: 'Good Cow Feeding', targetTeams: ['hm'], requiredParticipants: 1, color: '#7C3AED' },
  { id: 'training-13', name: 'Good Cow Milking', targetTeams: ['hm'], requiredParticipants: 1, color: '#6D28D9' },
]

// Project colors
const projectColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
]

// Projekte - jetzt mit Projektnummer
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Al Rawabi 80 T89',
    projectNumber: 'PRJ-2026-001',
    description: 'Install T86 / Peripherie',
    color: projectColors[0],
    startWeek: currentWeek,
    startYear: currentYear,
    endWeek: currentWeek + 6,
    endYear: currentYear,
    status: 'active',
  },
  {
    id: 'proj-2',
    name: 'UK Heath T89',
    projectNumber: 'PRJ-2026-002',
    description: 'Install T86 / Peripherie',
    color: projectColors[1],
    startWeek: currentWeek + 2,
    startYear: currentYear,
    endWeek: currentWeek + 8,
    endYear: currentYear,
    status: 'planned',
  },
  {
    id: 'proj-3',
    name: 'UK Allwood T89 72',
    projectNumber: 'PRJ-2026-003',
    description: 'Install T86 / Peripherie',
    color: projectColors[2],
    startWeek: currentWeek + 1,
    startYear: currentYear,
    endWeek: currentWeek + 5,
    endYear: currentYear,
    status: 'planned',
  },
  {
    id: 'proj-4',
    name: 'BE Cools Dairy DPQ80',
    projectNumber: 'PRJ-2026-004',
    description: 'Install Rotary / Peripherie',
    color: projectColors[3],
    startWeek: currentWeek,
    startYear: currentYear,
    endWeek: currentWeek + 4,
    endYear: currentYear,
    status: 'active',
  },
  {
    id: 'proj-5',
    name: 'NL Schep DPQ',
    projectNumber: 'PRJ-2026-005',
    description: 'Install Rotary / Peripherie',
    color: projectColors[4],
    startWeek: currentWeek + 3,
    startYear: currentYear,
    endWeek: currentWeek + 7,
    endYear: currentYear,
    status: 'planned',
  },
  {
    id: 'proj-6',
    name: 'Erstellung Trainingsunterlagen',
    projectNumber: 'PRJ-2026-006',
    description: 'Dokumentation und Schulungsmaterial erstellen',
    color: projectColors[5],
    startWeek: currentWeek,
    startYear: currentYear,
    endWeek: currentWeek + 8,
    endYear: currentYear,
    status: 'active',
  },
]

// Helper function to calculate week/year with overflow
function getWeekYear(baseWeek: number, baseYear: number, offsetWeeks: number): { week: number; year: number } {
  let week = baseWeek + offsetWeeks
  let year = baseYear
  while (week > 52) {
    week -= 52
    year++
  }
  while (week < 1) {
    week += 52
    year--
  }
  return { week, year }
}

// Zuweisungen generieren
function generateAssignments(): Assignment[] {
  const assignments: Assignment[] = []
  let assignmentId = 1

  // ========== 24/7 ROTATION für ALLE AS Mitarbeiter ==========
  // Fixe Reihenfolge, ein Mitarbeiter pro Woche, nichts anderes wenn 24/7
  const hotlineWeeks = new Set<string>() // Track which employee has 24/7 which week

  for (let weekOffset = 0; weekOffset < 52; weekOffset++) { // Ein Jahr voraus planen
    const employeeIndex = weekOffset % asEmployeeIds.length
    const employeeId = asEmployeeIds[employeeIndex]
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    // Track this week for this employee
    hotlineWeeks.add(`${employeeId}-${week}-${year}`)

    assignments.push({
      id: `assign-${assignmentId++}`,
      employeeId,
      eventType: 'hotline',
      title: '24/7 Bereitschaft',
      week,
      year,
      hoursPlanned: 40,
      notes: `Rotation Position ${employeeIndex + 1}`
    })
  }

  // ========== TRAININGS ==========
  // Helper to check if employee has 24/7 that week
  const hasHotline = (empId: string, week: number, year: number) =>
    hotlineWeeks.has(`${empId}-${week}-${year}`)

  // Helper to find available employees for training
  const findAvailableEmployees = (
    teamIds: string[],
    week: number,
    year: number,
    count: number,
    usedThisWeek: Set<string>
  ): string[] => {
    const available = teamIds.filter(id =>
      !hasHotline(id, week, year) && !usedThisWeek.has(id)
    )
    return available.slice(0, count)
  }

  // Training schedule: 3-4 trainings per year, spread across ~13 weeks each
  // We'll schedule them at weeks: currentWeek+2, +15, +28, +41

  const trainingOffsets = [2, 15, 28, 41] // Spread across the year

  // AS Team Trainings (R9500 I&C, R9500 S&T, F4500 I&C, F4500 S&T, DPQ) - 2 persons each
  const asTrainingNames: TrainingCategory[] = ['R9500 I&C', 'R9500 S&T', 'F4500 I&C', 'F4500 S&T', 'DPQ']

  asTrainingNames.forEach((trainingName, trainingIndex) => {
    const isICTraining = trainingName.includes('I&C')
    const eligibleEmployees = isICTraining
      ? [...asEmployeeIds, ...icEmployeeIds]
      : asEmployeeIds

    trainingOffsets.forEach((offset, scheduleIndex) => {
      // Stagger each training type by a few weeks
      const actualOffset = offset + trainingIndex
      const { week, year } = getWeekYear(currentWeek, currentYear, actualOffset)
      const usedThisWeek = new Set<string>()

      // Find 2 available employees
      const participants = findAvailableEmployees(eligibleEmployees, week, year, 2, usedThisWeek)

      participants.forEach(empId => {
        usedThisWeek.add(empId)
        assignments.push({
          id: `assign-${assignmentId++}`,
          employeeId: empId,
          eventType: 'training',
          title: trainingName,
          week,
          year,
          hoursPlanned: 40,
          notes: `Training ${scheduleIndex + 1}/4 im Jahr`
        })
      })
    })
  })

  // CMS Team Trainings (T8900, T8600, DPX, CowScout) - 2 persons each
  const cmsTrainingNames: TrainingCategory[] = ['T8900', 'T8600', 'DPX', 'CowScout']

  cmsTrainingNames.forEach((trainingName, trainingIndex) => {
    trainingOffsets.forEach((offset, scheduleIndex) => {
      const actualOffset = offset + trainingIndex + 1 // Slight offset from AS trainings
      const { week, year } = getWeekYear(currentWeek, currentYear, actualOffset)
      const usedThisWeek = new Set<string>()

      // CMS doesn't have 24/7, so all are available
      const participants = cmsEmployeeIds.slice(
        (scheduleIndex * 2) % cmsEmployeeIds.length,
        (scheduleIndex * 2) % cmsEmployeeIds.length + 2
      )

      participants.forEach(empId => {
        usedThisWeek.add(empId)
        assignments.push({
          id: `assign-${assignmentId++}`,
          employeeId: empId,
          eventType: 'training',
          title: trainingName,
          week,
          year,
          hoursPlanned: 40,
          notes: `Training ${scheduleIndex + 1}/4 im Jahr`
        })
      })
    })
  })

  // HM Team Trainings (DairyNet, DairyPlan, Good Cow Feeding, Good Cow Milking) - 1 person each
  const hmTrainingNames: TrainingCategory[] = ['DairyNet', 'DairyPlan', 'Good Cow Feeding', 'Good Cow Milking']

  hmTrainingNames.forEach((trainingName, trainingIndex) => {
    trainingOffsets.forEach((offset, scheduleIndex) => {
      const actualOffset = offset + trainingIndex + 2 // Offset from other trainings
      const { week, year } = getWeekYear(currentWeek, currentYear, actualOffset)

      // Pick one HM employee
      const empIndex = (trainingIndex + scheduleIndex) % hmEmployeeIds.length
      const empId = hmEmployeeIds[empIndex]

      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        eventType: 'training',
        title: trainingName,
        week,
        year,
        hoursPlanned: 40,
        notes: `Training ${scheduleIndex + 1}/4 im Jahr`
      })
    })
  })

  // ========== PROJEKTE ==========
  // Only assign employees to projects if they don't have 24/7 that week

  // Projekt 1: Al Rawabi - 2 Personen aus AS (check for 24/7 conflicts)
  for (let weekOffset = 0; weekOffset <= 6; weekOffset++) {
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    // Find 2 AS employees without 24/7 this week
    const availableAS = asEmployeeIds.filter(id => !hasHotline(id, week, year))
    const proj1Team = availableAS.slice(0, 2)

    proj1Team.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-1',
        eventType: 'project',
        title: 'Al Rawabi 80 T89',
        week,
        year,
        hoursPlanned: 40
      })
    })
  }

  // Projekt 2: UK Heath - 3 Personen aus CMS (no 24/7 conflict for CMS)
  const proj2Team = [cmsEmployeeIds[0], cmsEmployeeIds[1], cmsEmployeeIds[2]]
  for (let weekOffset = 2; weekOffset <= 8; weekOffset++) {
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    proj2Team.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-2',
        eventType: 'project',
        title: 'UK Heath T89',
        week,
        year,
        hoursPlanned: 40
      })
    })
  }

  // Projekt 3: UK Allwood - 2 Personen aus I&C
  const proj3Team = [icEmployeeIds[0], icEmployeeIds[1]]
  for (let weekOffset = 1; weekOffset <= 5; weekOffset++) {
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    proj3Team.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-3',
        eventType: 'project',
        title: 'UK Allwood T89 72',
        week,
        year,
        hoursPlanned: 40
      })
    })
  }

  // Projekt 4: BE Cools Dairy - 1 Person aus HM, 1 aus CMS
  const proj4Team = [hmEmployeeIds[0], cmsEmployeeIds[5]]
  for (let weekOffset = 0; weekOffset <= 4; weekOffset++) {
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    proj4Team.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-4',
        eventType: 'project',
        title: 'BE Cools Dairy DPQ80',
        week,
        year,
        hoursPlanned: 40
      })
    })
  }

  // Projekt 5: NL Schep - 2 Personen aus I&C
  const proj5Team = [icEmployeeIds[2], icEmployeeIds[3]]
  for (let weekOffset = 3; weekOffset <= 7; weekOffset++) {
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    proj5Team.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-5',
        eventType: 'project',
        title: 'NL Schep DPQ',
        week,
        year,
        hoursPlanned: 40
      })
    })
  }

  // Projekt 6: Erstellung Trainingsunterlagen - 3 Personen (1 AS ohne 24/7, 1 CMS, 1 HM)
  for (let weekOffset = 0; weekOffset <= 8; weekOffset++) {
    const { week, year } = getWeekYear(currentWeek, currentYear, weekOffset)

    // Find an AS employee without 24/7 this week
    const availableAS = asEmployeeIds.filter(id => !hasHotline(id, week, year))
    const asEmp = availableAS[2] || availableAS[0] // Prefer index 2 if available

    const proj6Team = [asEmp, cmsEmployeeIds[6], hmEmployeeIds[1]]

    proj6Team.forEach(empId => {
      assignments.push({
        id: `assign-${assignmentId++}`,
        employeeId: empId,
        projectId: 'proj-6',
        eventType: 'project',
        title: 'Erstellung Trainingsunterlagen',
        week,
        year,
        hoursPlanned: 40
      })
    })
  }

  return assignments
}

export const mockAssignments: Assignment[] = generateAssignments()
