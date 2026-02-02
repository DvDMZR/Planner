import { useState, useMemo } from 'react'
import { UserPlus, Check, AlertTriangle, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { useStore, TEAMS } from '../store/useStore'
import { cn } from '../lib/utils'
import type { Employee } from '../store/types'

interface StaffingPopoverProps {
  projectId: string
  week: number
  year: number
  trigger?: React.ReactNode
  onStaffAdded?: () => void
}

export function StaffingPopover({
  projectId,
  week,
  year,
  trigger,
  onStaffAdded
}: StaffingPopoverProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const {
    getEmployeeAvailability,
    assignEmployeeToProject,
    assignments
  } = useStore()

  // Get availability for this week
  const availability = useMemo(() => {
    return getEmployeeAvailability(week, year)
  }, [getEmployeeAvailability, week, year])

  // Get already assigned employees for this project/week
  const alreadyAssigned = useMemo(() => {
    return new Set(
      assignments
        .filter(a => a.projectId === projectId && a.week === week && a.year === year)
        .map(a => a.employeeId)
    )
  }, [assignments, projectId, week, year])

  // Filter and sort employees
  const filteredEmployees = useMemo(() => {
    let filtered = availability

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (ea) =>
          ea.employee.name.toLowerCase().includes(searchLower) ||
          ea.employee.role.toLowerCase().includes(searchLower)
      )
    }

    // Filter by team
    if (selectedTeam) {
      filtered = filtered.filter((ea) => ea.employee.teamId === selectedTeam)
    }

    // Sort: available first, then by name
    return filtered.sort((a, b) => {
      // Already assigned at the end
      const aAssigned = alreadyAssigned.has(a.employee.id)
      const bAssigned = alreadyAssigned.has(b.employee.id)
      if (aAssigned !== bAssigned) return aAssigned ? 1 : -1

      // Available first
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1

      // Then by name
      return a.employee.name.localeCompare(b.employee.name)
    })
  }, [availability, search, selectedTeam, alreadyAssigned])

  const handleAssign = (employee: Employee) => {
    assignEmployeeToProject(employee.id, projectId, week, year, 40)
    onStaffAdded?.()
  }

  const getTeamColor = (teamId: string) => {
    return TEAMS.find(t => t.id === teamId)?.color || '#888'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-7 gap-1">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="text-xs">Zuweisen</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm mb-2">
            Mitarbeiter zuweisen - KW {week}
          </h4>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Team filter */}
          <div className="flex gap-1 mt-2 flex-wrap">
            <Button
              variant={selectedTeam === null ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedTeam(null)}
            >
              Alle
            </Button>
            {TEAMS.map((team) => (
              <Button
                key={team.id}
                variant={selectedTeam === team.id ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedTeam(team.id)}
              >
                {team.name}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="max-h-64">
          <div className="p-2">
            {filteredEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Mitarbeiter gefunden
              </p>
            ) : (
              <div className="space-y-1">
                {filteredEmployees.map((ea) => {
                  const isAssigned = alreadyAssigned.has(ea.employee.id)

                  return (
                    <button
                      key={ea.employee.id}
                      onClick={() => !isAssigned && handleAssign(ea.employee)}
                      disabled={isAssigned}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors",
                        isAssigned
                          ? "opacity-50 cursor-not-allowed bg-muted"
                          : "hover:bg-accent cursor-pointer"
                      )}
                    >
                      {/* Availability indicator */}
                      <div
                        className={cn(
                          "h-2.5 w-2.5 rounded-full flex-shrink-0",
                          isAssigned
                            ? "bg-blue-500"
                            : ea.isAvailable
                            ? "bg-green-500"
                            : "bg-red-500"
                        )}
                      />

                      {/* Employee info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {ea.employee.name}
                          </span>
                          {isAssigned && (
                            <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${getTeamColor(ea.employee.teamId)}20`,
                              color: getTeamColor(ea.employee.teamId)
                            }}
                          >
                            {ea.employee.teamId}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {ea.employee.role}
                          </span>
                        </div>
                      </div>

                      {/* Hours info */}
                      <div className="text-right flex-shrink-0">
                        {!isAssigned && !ea.isAvailable && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">{ea.totalHoursBooked}h</span>
                          </div>
                        )}
                        {!isAssigned && ea.isAvailable && (
                          <span className="text-xs text-green-600">Frei</span>
                        )}
                        {isAssigned && (
                          <span className="text-xs text-blue-600">Zugewiesen</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-2 border-t bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Verfügbar
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Gebucht
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Zugewiesen
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
