import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '../lib/utils'
import { TEAMS } from '../store/useStore'
import type { Employee } from '../store/types'

interface DraggableEmployeeProps {
  employee: Employee
  isAvailable?: boolean
  compact?: boolean
}

export function DraggableEmployee({ employee, isAvailable = true, compact = false }: DraggableEmployeeProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `employee-${employee.id}`,
    data: {
      type: 'employee',
      employee
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const teamColor = TEAMS.find(t => t.id === employee.teamId)?.color || '#888'

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-card border cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50 shadow-lg z-50",
          !isAvailable && "opacity-60"
        )}
      >
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: teamColor }}
        />
        <span className="truncate">{employee.name.split(',')[0]}</span>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-card border cursor-grab active:cursor-grabbing transition-shadow",
        isDragging && "opacity-50 shadow-lg z-50",
        !isAvailable && "opacity-60 bg-muted"
      )}
    >
      <span
        className="h-3 w-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: teamColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate">{employee.name}</div>
        <div className="text-xs text-muted-foreground truncate">{employee.role}</div>
      </div>
      {!isAvailable && (
        <span className="text-[10px] text-red-500 font-medium">Gebucht</span>
      )}
    </div>
  )
}
