import { useDroppable } from '@dnd-kit/core'
import { cn } from '../lib/utils'

interface DroppableWeekCellProps {
  id: string
  projectId: string
  week: number
  year: number
  isInRange: boolean
  isCurrentWeek: boolean
  children: React.ReactNode
}

export function DroppableWeekCell({
  id,
  projectId,
  week,
  year,
  isInRange,
  isCurrentWeek,
  children
}: DroppableWeekCellProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: {
      type: 'week-cell',
      projectId,
      week,
      year
    },
    disabled: !isInRange
  })

  const isEmployeeDrag = active?.data?.current?.type === 'employee'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-1 border-r min-h-[40px] transition-colors",
        isCurrentWeek && "bg-primary/5",
        !isInRange && "bg-muted/50",
        isOver && isInRange && isEmployeeDrag && "bg-primary/20 ring-2 ring-primary ring-inset"
      )}
    >
      {children}
    </div>
  )
}
