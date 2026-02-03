import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  FileText,
  Euro,
  Plane,
  Upload,
  Edit2,
  Save,
  X,
  Users
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { useStore } from '../store/useStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import type { TravelExpense } from '../store/types'

export function ProjectDetailView() {
  const {
    selectedProjectId,
    setCurrentView,
    setSelectedProject,
    projects,
    employees,
    assignments,
    travelExpenses,
    getProjectCost,
    generateProjectInvoice,
    updateAssignment,
    addTravelExpense,
    updateTravelExpense,
    deleteTravelExpense,
    importFromConcur
  } = useStore()

  const [editingAssignment, setEditingAssignment] = useState<string | null>(null)
  const [editHours, setEditHours] = useState(40)
  const [editingExpense, setEditingExpense] = useState<TravelExpense | null>(null)
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [newExpenseDesc, setNewExpenseDesc] = useState('')
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [selectedAssignmentForExpense, setSelectedAssignmentForExpense] = useState<{
    employeeId: string
    week: number
    year: number
  } | null>(null)

  const project = projects.find(p => p.id === selectedProjectId)
  const projectAssignments = assignments.filter(a => a.projectId === selectedProjectId)
  const projectExpenses = travelExpenses.filter(t => t.projectId === selectedProjectId)
  const costs = selectedProjectId ? getProjectCost(selectedProjectId) : { labor: 0, travel: 0, total: 0 }

  // Group assignments by employee and week
  const assignmentsByEmployee = useMemo(() => {
    const grouped = new Map<string, typeof projectAssignments>()

    projectAssignments.forEach(a => {
      if (!grouped.has(a.employeeId)) {
        grouped.set(a.employeeId, [])
      }
      grouped.get(a.employeeId)!.push(a)
    })

    return Array.from(grouped.entries()).map(([empId, assigns]) => {
      const employee = employees.find(e => e.id === empId)
      return {
        employee,
        assignments: assigns.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.week - b.week
        })
      }
    })
  }, [projectAssignments, employees])

  // Get expense for assignment
  const getExpenseForAssignment = (employeeId: string, week: number, year: number) => {
    return projectExpenses.find(
      e => e.employeeId === employeeId && e.week === week && e.year === year
    )
  }

  // Handle back navigation
  const handleBack = () => {
    setSelectedProject(null)
    setCurrentView('projects')
  }

  // Save edited hours
  const handleSaveHours = (assignmentId: string) => {
    updateAssignment(assignmentId, { hoursPlanned: editHours })
    setEditingAssignment(null)
  }

  // Open add expense dialog
  const handleAddExpense = (employeeId: string, week: number, year: number) => {
    setSelectedAssignmentForExpense({ employeeId, week, year })
    setNewExpenseAmount('')
    setNewExpenseDesc('')
    setIsAddExpenseOpen(true)
  }

  // Save new expense
  const handleSaveNewExpense = () => {
    if (!selectedAssignmentForExpense || !newExpenseAmount) return

    const assignment = projectAssignments.find(
      a => a.employeeId === selectedAssignmentForExpense.employeeId &&
           a.week === selectedAssignmentForExpense.week &&
           a.year === selectedAssignmentForExpense.year
    )

    addTravelExpense({
      assignmentId: assignment?.id || '',
      employeeId: selectedAssignmentForExpense.employeeId,
      projectId: selectedProjectId!,
      week: selectedAssignmentForExpense.week,
      year: selectedAssignmentForExpense.year,
      amount: parseFloat(newExpenseAmount),
      description: newExpenseDesc || undefined
    })

    setIsAddExpenseOpen(false)
    setSelectedAssignmentForExpense(null)
  }

  // Handle Concur import
  const handleConcurImport = () => {
    if (selectedProjectId) {
      importFromConcur(selectedProjectId)
    }
  }

  // Generate and download invoice
  const handleGenerateInvoice = () => {
    if (!selectedProjectId) return

    const invoice = generateProjectInvoice(selectedProjectId)
    if (!invoice) return

    // Create invoice HTML
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rechnung ${invoice.projectNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #333; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .project-info { margin-bottom: 30px; }
    .project-info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .amount { text-align: right; }
    .total-row { font-weight: bold; background: #f5f5f5; }
    .grand-total { font-size: 1.2em; }
    .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RECHNUNG</h1>
    <p>Rechnungsdatum: ${new Date().toLocaleDateString('de-DE')}</p>
  </div>

  <div class="project-info">
    <p><strong>Projekt:</strong> ${invoice.projectName}</p>
    <p><strong>Projektnummer:</strong> ${invoice.projectNumber}</p>
  </div>

  <h2>Arbeitsleistungen</h2>
  <table>
    <thead>
      <tr>
        <th>Beschreibung</th>
        <th class="amount">Stunden</th>
        <th class="amount">Stundensatz</th>
        <th class="amount">Betrag</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.laborItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="amount">${item.quantity} h</td>
          <td class="amount">${item.unitPrice.toFixed(2)} €</td>
          <td class="amount">${item.total.toFixed(2)} €</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3">Summe Arbeitsleistungen</td>
        <td class="amount">${invoice.totalLabor.toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <h2>Reisekosten</h2>
  <table>
    <thead>
      <tr>
        <th>Mitarbeiter</th>
        <th>KW</th>
        <th>Beschreibung</th>
        <th class="amount">Betrag</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.travelExpenses.length > 0 ? invoice.travelExpenses.map(exp => {
        const emp = employees.find(e => e.id === exp.employeeId)
        return `
          <tr>
            <td>${emp?.name || 'Unbekannt'}</td>
            <td>KW ${exp.week}/${exp.year}</td>
            <td>${exp.description || '-'}</td>
            <td class="amount">${exp.amount.toFixed(2)} €</td>
          </tr>
        `
      }).join('') : '<tr><td colspan="4">Keine Reisekosten erfasst</td></tr>'}
      <tr class="total-row">
        <td colspan="3">Summe Reisekosten</td>
        <td class="amount">${invoice.totalTravel.toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <table>
    <tbody>
      <tr class="total-row grand-total">
        <td>GESAMTBETRAG</td>
        <td class="amount">${invoice.grandTotal.toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Generiert am ${new Date().toLocaleString('de-DE')}</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([invoiceHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Rechnung-${invoice.projectNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Projekt nicht gefunden</p>
        <Button onClick={handleBack} className="ml-4">Zurück</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: project.color }}
              />
              <h2 className="text-xl font-bold">{project.name}</h2>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                {project.projectNumber}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          </div>
          <Button onClick={handleGenerateInvoice} className="gap-2">
            <FileText className="h-4 w-4" />
            Rechnung erstellen
          </Button>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="p-4 border-b bg-muted/30">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              Arbeitskosten
            </div>
            <div className="text-2xl font-bold">{costs.labor.toLocaleString('de-DE')} €</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Plane className="h-4 w-4" />
              Reisekosten
            </div>
            <div className="text-2xl font-bold">{costs.travel.toLocaleString('de-DE')} €</div>
          </div>
          <div className="bg-card rounded-lg p-4 border bg-primary/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Euro className="h-4 w-4" />
              Gesamtkosten
            </div>
            <div className="text-2xl font-bold text-primary">{costs.total.toLocaleString('de-DE')} €</div>
          </div>
        </div>
      </div>

      {/* Assignments & Expenses */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Mitarbeiter & Einsätze</h3>
          <Button variant="outline" onClick={handleConcurImport} className="gap-2">
            <Upload className="h-4 w-4" />
            Import aus Concur
          </Button>
        </div>

        <div className="space-y-4">
          {assignmentsByEmployee.map(({ employee, assignments: empAssignments }) => {
            if (!employee) return null

            const totalHours = empAssignments.reduce((sum, a) => sum + a.hoursPlanned, 0)
            const totalCost = totalHours * employee.hourlyRate

            return (
              <div key={employee.id} className="bg-card rounded-lg border">
                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.role} • {employee.hourlyRate} €/h
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{totalHours} Stunden</div>
                    <div className="text-sm text-muted-foreground">{totalCost.toLocaleString('de-DE')} €</div>
                  </div>
                </div>
                <div className="divide-y">
                  {empAssignments.map(assignment => {
                    const expense = getExpenseForAssignment(employee.id, assignment.week, assignment.year)
                    const isEditing = editingAssignment === assignment.id

                    return (
                      <div key={assignment.id} className="p-3 flex items-center gap-4">
                        <div className="w-20 text-sm font-medium">
                          KW {assignment.week}/{assignment.year}
                        </div>

                        {/* Hours */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                value={editHours}
                                onChange={(e) => setEditHours(parseInt(e.target.value) || 0)}
                                className="w-16 p-1 border rounded text-sm"
                                min={0}
                                max={80}
                              />
                              <span className="text-sm text-muted-foreground">h</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleSaveHours(assignment.id)}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setEditingAssignment(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">{assignment.hoursPlanned}h</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => {
                                  setEditingAssignment(assignment.id)
                                  setEditHours(assignment.hoursPlanned)
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="flex-1" />

                        {/* Travel Expense */}
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-muted-foreground" />
                          {expense ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {expense.amount.toFixed(2)} €
                              </span>
                              {expense.importedFromConcur && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                                  Concur
                                </span>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => setEditingExpense(expense)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive"
                                onClick={() => deleteTravelExpense(expense.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => handleAddExpense(employee.id, assignment.week, assignment.year)}
                            >
                              + Reisekosten
                            </Button>
                          )}
                        </div>

                        {/* Cost for this assignment */}
                        <div className="w-24 text-right text-sm">
                          {(assignment.hoursPlanned * employee.hourlyRate).toLocaleString('de-DE')} €
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reisekosten hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Betrag (€)</label>
              <input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                placeholder="0.00"
                className="w-full mt-1 p-2 border rounded-md"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung (optional)</label>
              <input
                type="text"
                value={newExpenseDesc}
                onChange={(e) => setNewExpenseDesc(e.target.value)}
                placeholder="z.B. Flug, Hotel, Mietwagen..."
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveNewExpense} disabled={!newExpenseAmount}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reisekosten bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Betrag (€)</label>
              <input
                type="number"
                value={editingExpense?.amount || ''}
                onChange={(e) => setEditingExpense(prev =>
                  prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null
                )}
                className="w-full mt-1 p-2 border rounded-md"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung</label>
              <input
                type="text"
                value={editingExpense?.description || ''}
                onChange={(e) => setEditingExpense(prev =>
                  prev ? { ...prev, description: e.target.value } : null
                )}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                if (editingExpense) {
                  updateTravelExpense(editingExpense.id, {
                    amount: editingExpense.amount,
                    description: editingExpense.description
                  })
                  setEditingExpense(null)
                }
              }}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
