import { useMemo, useState } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { Plus, Users, X, MoreHorizontal, Trash2, GripVertical, ExternalLink, ChevronDown, ChevronRight, Edit2 } from 'lucide-react'
import { useStore, TEAMS } from '../store/useStore'
import { TimelineHeader } from '../components/TimelineHeader'
import { StaffingPopover } from '../components/StaffingPopover'
import { DraggableEmployee } from '../components/DraggableEmployee'
import { DroppableWeekCell } from '../components/DroppableWeekCell'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { cn } from '../lib/utils'
import { generateWeeksArray } from '../lib/date-utils'
import type { Project, Employee, ProjectCategory } from '../store/types'

// Project colors for new projects
const PROJECT_COLORS = [
  '#0069B4', '#00A0B0', '#5C6F7B', '#E65100', '#8B5CF6', '#06B6D4', '#EC4899'
]

// Project categories for grouping
const PROJECT_CATEGORIES: { id: ProjectCategory; name: string; color: string }[] = [
  { id: 'R95/R96', name: 'R95/R96', color: '#0069B4' },
  { id: 'DPQ', name: 'DPQ', color: '#E65100' },
  { id: 'T89/T86', name: 'T89/T86', color: '#00A0B0' },
  { id: 'Sonstiges', name: 'Sonstiges', color: '#5C6F7B' },
]

export function ProjectTimeline() {
  const {
    projects,
    assignments,
    employees,
    timelineSettings,
    addProject,
    updateProject,
    deleteProject,
    removeEmployeeFromProjectWeek,
    assignEmployeeToProject,
    setCurrentView,
    setSelectedProject
  } = useStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const [showEmployeePanel, setShowEmployeePanel] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set())
  const [newProject, setNewProject] = useState({
    name: '',
    projectNumber: '',
    description: '',
    category: 'Sonstiges' as ProjectCategory,
    startWeek: timelineSettings.startFromWeek,
    startYear: timelineSettings.startFromYear,
    endWeek: timelineSettings.startFromWeek + 4,
    endYear: timelineSettings.startFromYear,
    color: PROJECT_COLORS[0]
  })

  // Generate weeks array for header
  const weeks = useMemo(() => {
    return generateWeeksArray(
      timelineSettings.startFromWeek,
      timelineSettings.startFromYear,
      timelineSettings.weeksToShow,
      timelineSettings.showPastWeeks
    )
  }, [timelineSettings])

  // Group projects by category
  const projectsByCategory = useMemo(() => {
    const grouped: Record<ProjectCategory, Project[]> = {
      'R95/R96': [],
      'DPQ': [],
      'T89/T86': [],
      'Sonstiges': []
    }

    projects.forEach(project => {
      const category = project.category || 'Sonstiges'
      grouped[category].push(project)
    })

    return grouped
  }, [projects])

  // Get assigned employees for a project week
  const getAssignedForWeek = (projectId: string, week: number, year: number) => {
    return assignments
      .filter(a => a.projectId === projectId && a.week === week && a.year === year)
      .map(a => {
        const employee = employees.find(e => e.id === a.employeeId)
        return employee ? { assignment: a, employee } : null
      })
      .filter(Boolean) as { assignment: typeof assignments[0], employee: typeof employees[0] }[]
  }

  // Calculate bar position for a project
  const getBarStyle = (project: Project) => {
    const startIdx = weeks.findIndex(
      w => w.week === project.startWeek && w.year === project.startYear
    )
    const endIdx = weeks.findIndex(
      w => w.week === project.endWeek && w.year === project.endYear
    )

    if (startIdx === -1 && endIdx === -1) return null

    const effectiveStart = Math.max(0, startIdx === -1 ? 0 : startIdx)
    const effectiveEnd = endIdx === -1 ? weeks.length - 1 : endIdx
    const span = effectiveEnd - effectiveStart + 1

    if (span <= 0) return null

    return {
      gridColumnStart: effectiveStart + 2,
      gridColumnEnd: effectiveStart + 2 + span,
      backgroundColor: project.color
    }
  }

  const handleCreateProject = () => {
    const projectNumber = newProject.projectNumber || `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`
    addProject({
      name: newProject.name,
      projectNumber,
      description: newProject.description,
      color: newProject.color,
      category: newProject.category,
      startWeek: newProject.startWeek,
      startYear: newProject.startYear,
      endWeek: newProject.endWeek,
      endYear: newProject.endYear,
      status: 'planned'
    })
    setIsAddDialogOpen(false)
    setNewProject({
      name: '',
      projectNumber: '',
      description: '',
      category: 'Sonstiges',
      startWeek: timelineSettings.startFromWeek,
      startYear: timelineSettings.startFromYear,
      endWeek: timelineSettings.startFromWeek + 4,
      endYear: timelineSettings.startFromYear,
      color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]
    })
  }

  const handleEditProject = (project: Project) => {
    setEditingProject({ ...project })
    setIsEditDialogOpen(true)
  }

  const handleSaveProject = () => {
    if (!editingProject) return
    updateProject(editingProject.id, {
      name: editingProject.name,
      projectNumber: editingProject.projectNumber,
      description: editingProject.description,
      color: editingProject.color,
      category: editingProject.category,
      startWeek: editingProject.startWeek,
      startYear: editingProject.startYear,
      endWeek: editingProject.endWeek,
      endYear: editingProject.endYear,
      status: editingProject.status
    })
    setIsEditDialogOpen(false)
    setEditingProject(null)
  }

  // Navigate to project detail
  const handleOpenProject = (projectId: string) => {
    setSelectedProject(projectId)
    setCurrentView('project-detail')
  }

  // Toggle group collapse
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  // Toggle team collapse
  const toggleTeam = (teamId: string) => {
    setCollapsedTeams(prev => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'employee') {
      setActiveEmployee(active.data.current.employee)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveEmployee(null)

    if (!over) return

    if (active.data.current?.type === 'employee' && over.data.current?.type === 'week-cell') {
      const employee = active.data.current.employee as Employee
      const { projectId, week, year } = over.data.current

      assignEmployeeToProject(employee.id, projectId, week, year, 40)
    }
  }

  // Group employees by team for the sidebar
  const employeesByTeam = useMemo(() => {
    const grouped: Record<string, Employee[]> = {}
    TEAMS.forEach(team => {
      grouped[team.id] = employees.filter(e => e.teamId === team.id)
    })
    return grouped
  }, [employees])

  // Render a single project row
  const renderProjectRow = (project: Project) => {
    const barStyle = getBarStyle(project)

    return (
      <div key={project.id} className="border-b border-border">
        {/* Project Bar Row */}
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `280px repeat(${weeks.length}, minmax(100px, 1fr))`,
            minHeight: '60px'
          }}
        >
          {/* Project Name Cell */}
          <div className="p-3 border-r border-border bg-card flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="min-w-0 flex-1">
              <button
                onClick={() => handleOpenProject(project.id)}
                className="font-medium text-sm truncate hover:text-primary hover:underline text-left block w-full"
              >
                {project.name}
              </button>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{project.projectNumber}</span>
                <Badge
                  variant={
                    project.status === 'active' ? 'success' :
                    project.status === 'completed' ? 'secondary' :
                    project.status === 'on-hold' ? 'warning' : 'outline'
                  }
                  className="text-xs"
                >
                  {project.status}
                </Badge>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleEditProject(project)}
                >
                  <Edit2 className="h-4 w-4" />
                  Bearbeiten
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Details & Kosten
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Löschen
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Week Cells (background) */}
          {weeks.map((week) => (
            <div
              key={`${project.id}-${week.year}-${week.week}`}
              className={cn(
                "border-r border-border",
                week.isCurrentWeek && "bg-primary/5",
                week.isPast && "bg-muted/20"
              )}
            />
          ))}

          {/* Project Bar (overlay) */}
          {barStyle && (
            <div
              className="absolute top-2 bottom-2 rounded-md flex items-center px-3 cursor-pointer hover:ring-2 hover:ring-ring transition-all"
              style={barStyle}
            >
              <span className="text-white text-sm font-medium truncate">
                {project.name}
              </span>
            </div>
          )}
        </div>

        {/* Staffing Row - NOW allows ANY week, not just project range */}
        <div
          className="grid bg-muted/20"
          style={{
            gridTemplateColumns: `280px repeat(${weeks.length}, minmax(100px, 1fr))`
          }}
        >
          <div className="p-2 border-r border-border text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Besetzung
          </div>
          {weeks.map((week) => {
            const assigned = getAssignedForWeek(project.id, week.week, week.year)

            return (
              <DroppableWeekCell
                key={`staff-${project.id}-${week.year}-${week.week}`}
                id={`drop-${project.id}-${week.year}-${week.week}`}
                projectId={project.id}
                week={week.week}
                year={week.year}
                isInRange={true}
                isCurrentWeek={week.isCurrentWeek}
              >
                <div className="flex flex-wrap gap-1">
                  {/* Assigned employees */}
                  {assigned.map(({ assignment, employee }) => (
                    <div
                      key={assignment.id}
                      className="group relative flex items-center gap-1 bg-card rounded px-1.5 py-0.5 text-xs border"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: TEAMS.find(t => t.id === employee.teamId)?.color
                        }}
                      />
                      <span className="truncate max-w-[60px]">
                        {employee.name.split(',')[0]}
                      </span>
                      <button
                        onClick={() => removeEmployeeFromProjectWeek(
                          employee.id,
                          project.id,
                          week.week,
                          week.year
                        )}
                        className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  <StaffingPopover
                    projectId={project.id}
                    week={week.week}
                    year={week.year}
                    trigger={
                      <button className="h-6 w-6 rounded border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    }
                  />
                </div>
              </DroppableWeekCell>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <TimelineHeader title="Projekt-Timeline" />

        {/* Toolbar */}
        <div className="p-4 border-b bg-card flex items-center gap-4">
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Neues Projekt
          </Button>
          <Button
            variant={showEmployeePanel ? "secondary" : "outline"}
            onClick={() => setShowEmployeePanel(!showEmployeePanel)}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Mitarbeiter {showEmployeePanel ? 'ausblenden' : 'einblenden'}
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Employee Panel for Drag & Drop - Collapsible by Team */}
          {showEmployeePanel && (
            <div className="w-56 border-r bg-card flex flex-col overflow-hidden">
              <div className="p-3 border-b bg-muted/50">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  Drag & Drop
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Mitarbeiter auf Wochen ziehen
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {TEAMS.map(team => {
                    const isCollapsed = collapsedTeams.has(team.id)
                    const teamEmployees = employeesByTeam[team.id] || []

                    return (
                      <div key={team.id}>
                        <button
                          onClick={() => toggleTeam(team.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="text-xs font-medium">
                            {team.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            ({teamEmployees.length})
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="ml-4 space-y-1 mt-1">
                            {teamEmployees.map(employee => (
                              <DraggableEmployee
                                key={employee.id}
                                employee={employee}
                                compact
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Timeline Grid */}
          <ScrollArea orientation="both" className="flex-1">
            <div className="min-w-max">
              {/* Header Row */}
              <div
                className="grid sticky top-0 z-10 bg-card border-b border-border"
                style={{
                  gridTemplateColumns: `280px repeat(${weeks.length}, minmax(100px, 1fr))`
                }}
              >
                <div className="p-3 font-medium text-sm border-r border-border bg-muted/50">
                  Projekt
                </div>
                {weeks.map((week) => (
                  <div
                    key={`${week.year}-${week.week}`}
                    className={cn(
                      "p-2 text-center text-sm border-r border-border",
                      week.isCurrentWeek && "bg-primary/10 font-semibold",
                      week.isPast && "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="font-medium">{week.label}</div>
                    <div className="text-xs text-muted-foreground">{week.year}</div>
                  </div>
                ))}
              </div>

              {/* Project Groups */}
              {PROJECT_CATEGORIES.map((category) => {
                const categoryProjects = projectsByCategory[category.id]
                if (categoryProjects.length === 0) return null

                const isCollapsed = collapsedGroups.has(category.id)

                return (
                  <div key={category.id}>
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(category.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border hover:bg-muted/70 transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <div
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {categoryProjects.length}
                      </Badge>
                    </button>

                    {/* Projects in Group */}
                    {!isCollapsed && categoryProjects.map(renderProjectRow)}
                  </div>
                )
              })}

              {/* Empty state */}
              {projects.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <p>Keine Projekte vorhanden.</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="mt-4">
                    Erstes Projekt erstellen
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeEmployee && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border shadow-lg">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: TEAMS.find(t => t.id === activeEmployee.teamId)?.color }}
            />
            <span className="font-medium text-sm">{activeEmployee.name}</span>
          </div>
        )}
      </DragOverlay>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Projekt erstellen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Projektname</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="z.B. UK Heath T89"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Auftragsnummer</label>
                <input
                  type="text"
                  value={newProject.projectNumber}
                  onChange={(e) => setNewProject({ ...newProject, projectNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="z.B. PRJ-2026-007"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kategorie</label>
              <select
                value={newProject.category}
                onChange={(e) => setNewProject({ ...newProject, category: e.target.value as ProjectCategory })}
                className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full h-20 px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Kurze Beschreibung..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start (KW)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={newProject.startWeek}
                    onChange={(e) => setNewProject({ ...newProject, startWeek: parseInt(e.target.value) })}
                    className="flex-1 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={newProject.startYear}
                    onChange={(e) => setNewProject({ ...newProject, startYear: parseInt(e.target.value) })}
                    className="w-20 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ende (KW)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={newProject.endWeek}
                    onChange={(e) => setNewProject({ ...newProject, endWeek: parseInt(e.target.value) })}
                    className="flex-1 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={newProject.endYear}
                    onChange={(e) => setNewProject({ ...newProject, endYear: parseInt(e.target.value) })}
                    className="w-20 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Farbe</label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProject({ ...newProject, color })}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform",
                      newProject.color === color && "ring-2 ring-ring ring-offset-2 scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProject.name}>
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projekt bearbeiten</DialogTitle>
          </DialogHeader>

          {editingProject && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Projektname</label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auftragsnummer</label>
                  <input
                    type="text"
                    value={editingProject.projectNumber}
                    onChange={(e) => setEditingProject({ ...editingProject, projectNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategorie</label>
                  <select
                    value={editingProject.category || 'Sonstiges'}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as ProjectCategory })}
                    className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {PROJECT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as Project['status'] })}
                    className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="planned">Geplant</option>
                    <option value="active">Aktiv</option>
                    <option value="on-hold">Pausiert</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Beschreibung</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start (KW)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={editingProject.startWeek}
                      onChange={(e) => setEditingProject({ ...editingProject, startWeek: parseInt(e.target.value) })}
                      className="flex-1 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="number"
                      min="2020"
                      max="2030"
                      value={editingProject.startYear}
                      onChange={(e) => setEditingProject({ ...editingProject, startYear: parseInt(e.target.value) })}
                      className="w-20 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ende (KW)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={editingProject.endWeek}
                      onChange={(e) => setEditingProject({ ...editingProject, endWeek: parseInt(e.target.value) })}
                      className="flex-1 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      type="number"
                      min="2020"
                      max="2030"
                      value={editingProject.endYear}
                      onChange={(e) => setEditingProject({ ...editingProject, endYear: parseInt(e.target.value) })}
                      className="w-20 h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Farbe</label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingProject({ ...editingProject, color })}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform",
                        editingProject.color === color && "ring-2 ring-ring ring-offset-2 scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveProject}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}
