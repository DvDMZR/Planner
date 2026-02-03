import { useState } from 'react'
import { RefreshCw, Trash2, Download, Upload, Database, Euro } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore } from '../store/useStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog'

export function SettingsView() {
  const {
    employees,
    projects,
    assignments,
    timelineSettings,
    appSettings,
    updateTimelineSettings,
    updateAppSettings,
    initializeWithMockData,
    clearAllData
  } = useStore()

  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showMockDialog, setShowMockDialog] = useState(false)

  const handleExportData = () => {
    const data = {
      employees,
      projects,
      assignments,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planner-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Would need to implement import logic in store
        console.log('Import data:', data)
        alert('Import-Funktion ist noch nicht implementiert.')
      } catch (err) {
        alert('Fehler beim Lesen der Datei.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Einstellungen</h2>

        {/* Timeline Settings */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h3 className="font-semibold mb-4">Timeline-Einstellungen</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Anzuzeigende Wochen</p>
                <p className="text-sm text-muted-foreground">
                  Wie viele Kalenderwochen sollen angezeigt werden?
                </p>
              </div>
              <select
                value={timelineSettings.weeksToShow}
                onChange={(e) =>
                  updateTimelineSettings({ weeksToShow: parseInt(e.target.value) })
                }
                className="h-10 px-3 rounded-md border bg-background"
              >
                <option value={8}>8 Wochen</option>
                <option value={12}>12 Wochen</option>
                <option value={16}>16 Wochen</option>
                <option value={24}>24 Wochen</option>
                <option value={52}>52 Wochen</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Vergangene Wochen anzeigen</p>
                <p className="text-sm text-muted-foreground">
                  Standardmäßig vergangene Wochen einblenden
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={timelineSettings.showPastWeeks}
                  onChange={(e) =>
                    updateTimelineSettings({ showPastWeeks: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Cost Settings */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Kosteneinstellungen
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Standard-Stundensatz</p>
                <p className="text-sm text-muted-foreground">
                  Wird für neue Mitarbeiter verwendet
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={appSettings.defaultHourlyRate}
                  onChange={(e) =>
                    updateAppSettings({ defaultHourlyRate: parseInt(e.target.value) || 0 })
                  }
                  className="w-24 h-10 px-3 rounded-md border bg-background text-right"
                  min={0}
                  max={500}
                />
                <span className="text-muted-foreground">€/h</span>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-card rounded-lg border p-6 mb-6">
          <h3 className="font-semibold mb-4">Datenverwaltung</h3>

          <div className="space-y-4">
            {/* Current data stats */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Aktuelle Daten</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Mitarbeiter:</span>{' '}
                  <span className="font-medium">{employees.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Projekte:</span>{' '}
                  <span className="font-medium">{projects.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Zuweisungen:</span>{' '}
                  <span className="font-medium">{assignments.length}</span>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daten exportieren</p>
                <p className="text-sm text-muted-foreground">
                  Alle Daten als JSON-Datei herunterladen
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daten importieren</p>
                <p className="text-sm text-muted-foreground">
                  Daten aus einer JSON-Datei laden
                </p>
              </div>
              <label>
                <Button variant="outline" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </span>
                </Button>
              </label>
            </div>

            <hr />

            {/* Load Mock Data */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Demo-Daten laden</p>
                <p className="text-sm text-muted-foreground">
                  30 Mitarbeiter, 4 Teams, 6 Projekte
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowMockDialog(true)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Demo laden
              </Button>
            </div>

            {/* Clear Data */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Alle Daten löschen</p>
                <p className="text-sm text-muted-foreground">
                  Unwiderruflich alle Daten entfernen
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowClearDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Über TeamPlanner</h3>
          <p className="text-sm text-muted-foreground">
            TeamPlanner ist eine Ressourcenplanungs-Anwendung für Teams.
            Verwalten Sie Mitarbeiter, Projekte und Zuweisungen auf Wochenbasis.
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Version 1.0.0</p>
            <p>React + Vite + Tailwind CSS + Zustand</p>
          </div>

          {/* Impressum */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-2">Impressum</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">David Mazur</p>
              <p>Entwicklung und Konzeption</p>
              <p className="mt-2 text-xs">
                © {new Date().getFullYear()} Alle Rechte vorbehalten.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Clear Data Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alle Daten löschen?</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Mitarbeiter,
              Projekte und Zuweisungen werden unwiderruflich gelöscht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllData()
                setShowClearDialog(false)
              }}
            >
              Ja, alle Daten löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Mock Data Dialog */}
      <Dialog open={showMockDialog} onOpenChange={setShowMockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demo-Daten laden?</DialogTitle>
            <DialogDescription>
              Dies wird die aktuellen Daten mit den Demo-Daten ersetzen. Die
              Demo-Daten enthalten 30 Mitarbeiter, 4 Teams und 6 Projekte mit
              Beispiel-Zuweisungen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMockDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                initializeWithMockData()
                setShowMockDialog(false)
              }}
            >
              Demo-Daten laden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
