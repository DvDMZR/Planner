import { Users, FolderKanban, BarChart3, Settings, Calendar } from 'lucide-react'
import { cn } from '../lib/utils'
import { useStore } from '../store/useStore'
import type { ViewType } from '../store/types'

interface NavItem {
  id: ViewType
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'projects', label: 'Projekte', icon: <FolderKanban className="h-5 w-5" /> },
  { id: 'people', label: 'Mitarbeiter', icon: <Users className="h-5 w-5" /> },
  { id: 'stats', label: 'Statistiken', icon: <BarChart3 className="h-5 w-5" /> },
  { id: 'settings', label: 'Einstellungen', icon: <Settings className="h-5 w-5" /> },
]

export function Sidebar() {
  const { currentView, setCurrentView } = useStore()

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">TeamPlanner</h1>
            <p className="text-xs text-muted-foreground">Ressourcenplanung</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  currentView === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p>30 Mitarbeiter</p>
          <p>4 Teams</p>
        </div>
      </div>
    </aside>
  )
}
