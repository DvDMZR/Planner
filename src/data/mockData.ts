import type { Employee, Project, Assignment } from '../store/types'
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

// Project colors
const projectColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
]

// Projekte
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Al Rawabi 80 T89',
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
    description: 'Dokumentation und Schulungsmaterial erstellen',
    color: projectColors[5],
    startWeek: currentWeek,
    startYear: currentYear,
    endWeek: currentWeek + 8,
    endYear: currentYear,
    status: 'active',
  },
]

// Zuweisungen generieren
function generateAssignments(): Assignment[] {
  const assignments: Assignment[] = []
  let assignmentId = 1

  // Mitarbeiter die NUR 24/7 machen (keine Projekte)
  // Wir nehmen die letzten 6 AS Mitarbeiter für 24/7 (Index 5-10)
  const onlyDutyEmployees = asEmployeeIds.slice(5) // Krampe, Kristensen, Lubbers, Mechlinski, Oostdam, Valk

  // Mitarbeiter die Projekte machen (keine 24/7)
  // Die ersten 5 AS Mitarbeiter (Index 0-4)
  const projectEmployeesAS = asEmployeeIds.slice(0, 5) // Cetinkilic, Dutka, Madsen, Antolik, Kleinheinrich

  // 24/7 Rotation - NUR für onlyDutyEmployees
  for (let weekOffset = 0; weekOffset < 24; weekOffset++) {
    const employeeIndex = weekOffset % onlyDutyEmployees.length
    const employeeId = onlyDutyEmployees[employeeIndex]

    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) {
      week = week - 52
      year++
    }

    assignments.push({
      id: `assign-${assignmentId++}`,
      employeeId,
      eventType: 'recurring',
      title: '24/7 Bereitschaft',
      week,
      year,
      hoursPlanned: 40,
      notes: 'Wöchentliche Rotation'
    })
  }

  // Training R9500 - alle 6 Wochen für einen AS Mitarbeiter (rotierend durch projectEmployeesAS)
  for (let i = 0; i < 4; i++) { // 4 Trainings über 24 Wochen
    const weekOffset = i * 6
    const employeeIndex = i % projectEmployeesAS.length
    const employeeId = projectEmployeesAS[employeeIndex]

    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) {
      week = week - 52
      year++
    }

    assignments.push({
      id: `assign-${assignmentId++}`,
      employeeId,
      eventType: 'training',
      title: 'Training R9500',
      week,
      year,
      hoursPlanned: 40,
      notes: 'Wiederkehrendes Training alle 6 Wochen'
    })
  }

  // Projekt 1: Al Rawabi - 2 Personen aus AS (die ohne 24/7)
  const proj1Team = [projectEmployeesAS[0], projectEmployeesAS[1]] // Cetinkilic, Dutka
  for (let weekOffset = 0; weekOffset <= 6; weekOffset++) {
    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) { week -= 52; year++ }

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

  // Projekt 2: UK Heath - 3 Personen aus CMS
  const proj2Team = [cmsEmployeeIds[0], cmsEmployeeIds[1], cmsEmployeeIds[2]] // Meulenbeek, Pauly, Penning
  for (let weekOffset = 2; weekOffset <= 8; weekOffset++) {
    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) { week -= 52; year++ }

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
  const proj3Team = [icEmployeeIds[0], icEmployeeIds[1]] // Bachand, Carrie
  for (let weekOffset = 1; weekOffset <= 5; weekOffset++) {
    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) { week -= 52; year++ }

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
  const proj4Team = [hmEmployeeIds[0], cmsEmployeeIds[5]] // Weymann, Venne
  for (let weekOffset = 0; weekOffset <= 4; weekOffset++) {
    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) { week -= 52; year++ }

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
  const proj5Team = [icEmployeeIds[2], icEmployeeIds[3]] // Ricken, Mecking
  for (let weekOffset = 3; weekOffset <= 7; weekOffset++) {
    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) { week -= 52; year++ }

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

  // Projekt 6: Erstellung Trainingsunterlagen - 3 Personen (1 AS, 1 CMS, 1 HM)
  const proj6Team = [projectEmployeesAS[2], cmsEmployeeIds[6], hmEmployeeIds[1]] // Madsen, Berkensträter, Eismann
  for (let weekOffset = 0; weekOffset <= 8; weekOffset++) {
    let week = currentWeek + weekOffset
    let year = currentYear
    if (week > 52) { week -= 52; year++ }

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
