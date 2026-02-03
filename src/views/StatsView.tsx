import { useMemo } from 'react'
import { Users, FolderKanban, Euro, TrendingUp } from 'lucide-react'
import { useStore, TEAMS } from '../store/useStore'
import { cn } from '../lib/utils'
import { getCurrentWeek } from '../lib/date-utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}

export function StatsView() {
  const { employees, projects, assignments, getProjectCost, getTeamUtilization, setCurrentView, setSelectedProject } = useStore()

  // Navigate to project detail
  const handleOpenProject = (projectId: string) => {
    setSelectedProject(projectId)
    setCurrentView('project-detail')
  }
  const { week: currentWeek, year: currentYear } = getCurrentWeek()

  // Calculate stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active').length
    const plannedProjects = projects.filter((p) => p.status === 'planned').length

    // Total hours this week
    const thisWeekAssignments = assignments.filter(
      (a) => a.week === currentWeek && a.year === currentYear
    )
    const totalHoursThisWeek = thisWeekAssignments.reduce(
      (sum, a) => sum + a.hoursPlanned,
      0
    )

    // Utilization rate
    const maxHoursThisWeek = employees.length * 40
    const utilizationRate =
      maxHoursThisWeek > 0
        ? Math.round((totalHoursThisWeek / maxHoursThisWeek) * 100)
        : 0

    // Total project costs
    const totalProjectCosts = projects.reduce(
      (sum, p) => sum + getProjectCost(p.id).total,
      0
    )

    return {
      totalEmployees: employees.length,
      activeProjects,
      plannedProjects,
      totalHoursThisWeek,
      utilizationRate,
      totalProjectCosts
    }
  }, [employees, projects, assignments, currentWeek, currentYear, getProjectCost])

  // Team utilization for current week
  const teamUtilization = useMemo(() => {
    return TEAMS.map((team) => ({
      ...team,
      utilization: getTeamUtilization(team.id, currentWeek, currentYear),
      employeeCount: employees.filter((e) => e.teamId === team.id).length
    }))
  }, [employees, currentWeek, currentYear, getTeamUtilization])

  // Project costs breakdown
  const projectCosts = useMemo(() => {
    return projects
      .map((project) => ({
        ...project,
        cost: getProjectCost(project.id),
        hoursTotal: assignments
          .filter((a) => a.projectId === project.id)
          .reduce((sum, a) => sum + a.hoursPlanned, 0)
      }))
      .sort((a, b) => b.cost.total - a.cost.total)
  }, [projects, assignments, getProjectCost])

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Statistiken & Auswertungen</h2>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Mitarbeiter"
            value={stats.totalEmployees}
            subtitle="In 4 Teams"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Aktive Projekte"
            value={stats.activeProjects}
            subtitle={`${stats.plannedProjects} geplant`}
            icon={<FolderKanban className="h-6 w-6" />}
          />
          <StatCard
            title="Auslastung KW {currentWeek}"
            value={`${stats.utilizationRate}%`}
            subtitle={`${stats.totalHoursThisWeek}h geplant`}
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <StatCard
            title="Projektkosten (gesamt)"
            value={`${(stats.totalProjectCosts / 1000).toFixed(0)}k €`}
            subtitle="Kumulierte Personalkosten"
            icon={<Euro className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Utilization */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Team-Auslastung (KW {currentWeek})</h3>
            <div className="space-y-4">
              {teamUtilization.map((team) => (
                <div key={team.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-sm font-medium">{team.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({team.employeeCount} MA)
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        team.utilization >= 100 && "text-red-600",
                        team.utilization >= 80 &&
                          team.utilization < 100 &&
                          "text-amber-600",
                        team.utilization < 80 && "text-green-600"
                      )}
                    >
                      {team.utilization}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        team.utilization >= 100 && "bg-red-500",
                        team.utilization >= 80 &&
                          team.utilization < 100 &&
                          "bg-amber-500",
                        team.utilization < 80 && "bg-green-500"
                      )}
                      style={{ width: `${Math.min(100, team.utilization)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Costs */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Projektkosten (Personalaufwand)</h3>
            <div className="space-y-3">
              {projectCosts.slice(0, 6).map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="w-full flex items-center justify-between py-2 border-b last:border-0 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium truncate max-w-[200px] hover:underline">
                      {project.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {project.cost.total.toLocaleString('de-DE')} €
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.hoursTotal}h
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Utilization Heatmap placeholder */}
        <div className="mt-6 bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Auslastung pro Woche</h3>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }).map((_, weekOffset) => {
              const week = ((currentWeek - 1 + weekOffset) % 52) + 1
              const totalCapacity = employees.length * 40
              const weekAssignments = assignments.filter(
                (a) => a.week === week && a.year === currentYear
              )
              const totalHours = weekAssignments.reduce(
                (sum, a) => sum + a.hoursPlanned,
                0
              )
              const utilization =
                totalCapacity > 0
                  ? Math.round((totalHours / totalCapacity) * 100)
                  : 0

              return (
                <div
                  key={week}
                  className={cn(
                    "aspect-square rounded-md flex flex-col items-center justify-center text-xs",
                    utilization >= 100 && "bg-red-500 text-white",
                    utilization >= 80 &&
                      utilization < 100 &&
                      "bg-amber-500 text-white",
                    utilization >= 50 && utilization < 80 && "bg-green-500 text-white",
                    utilization > 0 && utilization < 50 && "bg-green-300",
                    utilization === 0 && "bg-muted"
                  )}
                  title={`KW ${week}: ${utilization}%`}
                >
                  <span className="font-medium">{week}</span>
                  <span className="text-[10px] opacity-80">{utilization}%</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-muted" /> 0%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-green-300" /> &lt;50%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-green-500" /> 50-79%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-500" /> 80-99%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-red-500" /> 100%+
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
