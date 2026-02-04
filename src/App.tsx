import { useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { ProjectTimeline } from './views/ProjectTimeline'
import { PeopleTimeline } from './views/PeopleTimeline'
import { TrainingsView } from './views/TrainingsView'
import { HotlineView } from './views/HotlineView'
import { SonstigesView } from './views/SonstigesView'
import { StatsView } from './views/StatsView'
import { SettingsView } from './views/SettingsView'
import { ProjectDetailView } from './views/ProjectDetailView'
import { useStore } from './store/useStore'
import { TooltipProvider } from './components/ui/tooltip'

function App() {
  const { currentView, employees, initializeWithMockData } = useStore()

  // Load mock data on first load if no data exists
  useEffect(() => {
    if (employees.length === 0) {
      initializeWithMockData()
    }
  }, [employees.length, initializeWithMockData])

  const renderView = () => {
    switch (currentView) {
      case 'projects':
        return <ProjectTimeline />
      case 'people':
        return <PeopleTimeline />
      case 'trainings':
        return <TrainingsView />
      case 'hotline':
        return <HotlineView />
      case 'sonstiges':
        return <SonstigesView />
      case 'stats':
        return <StatsView />
      case 'settings':
        return <SettingsView />
      case 'project-detail':
        return <ProjectDetailView />
      default:
        return <ProjectTimeline />
    }
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderView()}
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
