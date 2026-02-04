# Team Ressourcen Planer - Vollständige Dokumentation

> **Version 0.7.1** | Stand: 04.02.2026

---

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Schnellstart](#schnellstart)
3. [Technologie-Stack](#technologie-stack)
4. [Architektur](#architektur)
5. [Module im Detail](#module-im-detail)
6. [Datenmodelle](#datenmodelle)
7. [Features](#features)
8. [Benutzeroberfläche](#benutzeroberfläche)
9. [Barrierefreiheit](#barrierefreiheit)
10. [Tastaturnavigation](#tastaturnavigation)
11. [Styling-System](#styling-system)
12. [Deployment](#deployment)
13. [Entwicklung](#entwicklung)
14. [Backup & Wiederherstellung](#backup--wiederherstellung)
15. [Roadmap](#roadmap)
16. [Troubleshooting](#troubleshooting)

---

## Übersicht

Der **Team Ressourcen Planer** ist eine leichtgewichtige, browserbasierte Single-Page-Application (SPA) zur visuellen Planung und Verwaltung von Mitarbeiter-Ressourcen. Die Anwendung zeigt einen 12-Wochen-Zeitraum und ermöglicht die Zuweisung von Aufgabentypen zu einzelnen Mitarbeitern.

### Zielgruppe

- Kleine bis mittlere Teams (bis ca. 30 Mitarbeiter)
- Projektmanager und Teamleiter
- Ressourcenplaner

### Hauptmerkmale

| Merkmal | Beschreibung |
|---------|--------------|
| **Kein Backend erforderlich** | Läuft komplett im Browser |
| **Keine Abhängigkeiten** | Pure HTML, CSS, JavaScript |
| **Offline-fähig** | Daten werden lokal gespeichert |
| **Responsive** | Desktop, Tablet, Mobile |
| **Barrierefrei** | WCAG 2.1 konform |
| **Druckbar** | Optimierte Print-Styles |

---

## Schnellstart

### Voraussetzungen

- Moderner Browser (Chrome, Firefox, Safari, Edge)
- Optional: Node.js >= 14.0.0 für lokalen Entwicklungsserver

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd Planner

# Option 1: Direkt öffnen
open index.html

# Option 2: Mit lokalem Server (empfohlen)
npm run dev        # Port 3000
# oder
npm start          # Standard-Port
# oder
python -m http.server 8000
```

### Erster Start

1. Beim ersten Start werden automatisch **30 Demo-Mitarbeiter** in 4 Teams generiert
2. Die Mitarbeiterdaten werden im `localStorage` des Browsers gespeichert
3. Klicken Sie auf eine leere Zelle, um einen Eintrag zu erstellen
4. Klicken Sie auf einen bestehenden Eintrag, um ihn zu löschen

---

## Technologie-Stack

### Frontend

| Technologie | Version/Standard | Verwendung |
|-------------|------------------|------------|
| HTML5 | Living Standard | Semantisches Markup, ARIA |
| CSS3 | Modern | Flexbox, Grid, CSS Variables |
| JavaScript | ES6+ | Module, Destructuring, Arrow Functions |

### Speicherung

| Technologie | Beschreibung |
|-------------|--------------|
| localStorage | Persistente Speicherung im Browser |
| JSON | Serialisierungsformat für Daten |

### Build & Deploy

| Tool | Verwendung |
|------|------------|
| GitHub Actions | CI/CD Pipeline |
| GitHub Pages | Hosting |
| npx serve | Lokaler Entwicklungsserver |

---

## Architektur

### Dateistruktur

```
Planner/
├── app.js              # Hauptanwendungslogik (628 Zeilen)
├── index.html          # HTML-Struktur (73 Zeilen)
├── styles.css          # Styling (573 Zeilen)
├── package.json        # Projektmetadaten
├── README.md           # Kurzdokumentation
├── DOCUMENTATION.md    # Diese Dokumentation
├── docs/               # GitHub Pages Deployment
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── backup/             # Backup-Verzeichnis
│   └── v0.7.1-backup-2026-02-04/
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions Workflow
```

### Modulare JavaScript-Architektur

Die Anwendung ist in **9 unabhängige Module** aufgeteilt:

```
┌─────────────────────────────────────────────────────────┐
│                         App                              │
│                    (Orchestrator)                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ CONFIG  │  │  State  │  │ Storage │  │  Toast  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
├─────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌────────────┐  ┌─────────┐            │
│  │ DateUtils │  │ DataManager│  │ Renderer│            │
│  └───────────┘  └────────────┘  └─────────┘            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐                                            │
│  │  Modal  │                                            │
│  └─────────┘                                            │
└─────────────────────────────────────────────────────────┘
```

---

## Module im Detail

### 1. CONFIG

Zentrale Konfigurationskonstanten für die Anwendung.

```javascript
const CONFIG = {
    version: '0.7.1',
    teams: ['Development', 'Sales', 'Consulting', 'Marketing'],
    employeesPerTeam: [8, 6, 10, 6],  // = 30 Mitarbeiter total
    weeksToShow: 12,
    storageKeys: {
        employees: 'planer_employees',
        tasks: 'planer_tasks'
    },
    toastDuration: 3000  // Millisekunden
};
```

**Anpassbare Parameter:**

| Parameter | Beschreibung | Standard |
|-----------|--------------|----------|
| `teams` | Array der Teamnamen | 4 Teams |
| `employeesPerTeam` | Mitarbeiter pro Team | [8, 6, 10, 6] |
| `weeksToShow` | Anzahl sichtbarer Wochen | 12 |
| `toastDuration` | Dauer der Benachrichtigungen | 3000ms |

---

### 2. State

Globaler Anwendungszustand.

```javascript
const State = {
    employees: [],    // Array aller Mitarbeiter
    tasks: [],        // Array aller Aufgaben
    weekKeys: [],     // Array der Wochen-Schlüssel

    reset() {         // State zurücksetzen
        this.employees = [];
        this.tasks = [];
        this.weekKeys = [];
    }
};
```

---

### 3. Storage

Wrapper für localStorage mit Fehlerbehandlung.

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `isAvailable()` | - | `boolean` | Prüft localStorage-Verfügbarkeit |
| `get(key)` | `string` | `any\|null` | Liest und parst JSON |
| `set(key, value)` | `string, any` | `boolean` | Speichert als JSON |
| `clear()` | - | `void` | Löscht App-Daten |

**Fehlerbehandlung:**
- Bei nicht verfügbarem localStorage: Warning-Toast
- Bei Parse-Fehlern: Error-Toast + Console-Log
- Bei Speicherfehlern (z.B. Quota): Error-Toast

---

### 4. Toast

Benachrichtigungssystem mit Auto-Dismiss.

```javascript
Toast.show('Nachricht', 'success');  // success, error, info, warning
```

| Typ | Farbe | Verwendung |
|-----|-------|------------|
| `success` | Grün | Erfolgreiche Aktionen |
| `error` | Rot | Fehler |
| `warning` | Orange | Warnungen |
| `info` | Blau | Informationen |

**Features:**
- Automatisches Ausblenden nach 3 Sekunden
- Slide-In/Out Animationen
- ARIA `role="alert"` für Screenreader

---

### 5. DateUtils

Hilfsfunktionen für Datumsberechnungen.

| Methode | Parameter | Rückgabe | Beschreibung |
|---------|-----------|----------|--------------|
| `getWeekNumber(date)` | `Date` | `{year, week}` | ISO-Kalenderwoche |
| `generateWeekKeys()` | - | `Array` | 12 Wochen ab heute |

**Wochen-Schlüssel-Format:**
```javascript
{
    key: '2026-W06',       // ISO 8601 Format
    label: 'KW 6',         // Anzeige
    full: { year: 2026, week: 6 }
}
```

---

### 6. DataManager

Kernmodul für Datenoperationen.

| Methode | Beschreibung |
|---------|--------------|
| `load()` | Lädt Daten aus localStorage |
| `save()` | Speichert State in localStorage |
| `reset()` | Löscht alle Daten (mit Bestätigung) |
| `generateDummyEmployees()` | Erstellt Demo-Mitarbeiter |
| `createTaskLookup()` | Erstellt Map für O(1)-Zugriff |
| `addTask(empId, week, type, desc)` | Neuen Task hinzufügen |
| `deleteTask(taskId)` | Task löschen (mit Bestätigung) |
| `sanitizeInput(input)` | XSS-Schutz für Eingaben |

**XSS-Schutz:**
```javascript
sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
```

---

### 7. Renderer

UI-Rendering-Modul.

| Methode | Beschreibung |
|---------|--------------|
| `renderHeader()` | Rendert Tabellenkopf mit Wochen |
| `renderBody()` | Rendert Mitarbeiter und Tasks |
| `getTaskTypeLabel(type)` | Übersetzt Task-Typ |

**Performance-Optimierung:**
- Task-Lookup via `Map` für O(1) Zugriff
- Minimale DOM-Manipulationen
- Event-Delegation wo möglich

---

### 8. Modal

Dialog-Controller für Task-Erstellung.

| Methode | Beschreibung |
|---------|--------------|
| `init()` | Event-Listener einrichten |
| `open(empId, weekKey)` | Modal öffnen |
| `close()` | Modal schließen |
| `save()` | Task speichern |

**Schließ-Möglichkeiten:**
- ESC-Taste
- Klick auf Backdrop
- Abbrechen-Button
- Nach erfolgreichem Speichern

---

### 9. App

Hauptmodul zur Orchestrierung.

```javascript
App.init();  // Startet die Anwendung
```

**Initialisierungsreihenfolge:**
1. Toast-Container initialisieren
2. Modal-Events einrichten
3. Daten laden
4. UI rendern
5. Event-Handler einrichten
6. Version anzeigen

---

## Datenmodelle

### Employee (Mitarbeiter)

```javascript
{
    id: number,      // Eindeutige ID (1, 2, 3, ...)
    name: string,    // "Mitarbeiter 1"
    team: string     // "Development" | "Sales" | "Consulting" | "Marketing"
}
```

### Task (Aufgabe)

```javascript
{
    id: number,      // Zeitstempel + Random (einzigartig)
    empId: number,   // Referenz auf Employee.id
    week: string,    // "2026-W06" (ISO 8601)
    type: string,    // "projekt" | "support" | "reise" | "training"
    desc: string     // Optionale Beschreibung (max. 100 Zeichen)
}
```

### WeekKey (Wochen-Schlüssel)

```javascript
{
    key: string,     // "2026-W06"
    label: string,   // "KW 6"
    full: {
        year: number,  // 2026
        week: number   // 6
    }
}
```

### localStorage Keys

| Key | Inhalt |
|-----|--------|
| `planer_employees` | JSON-Array aller Mitarbeiter |
| `planer_tasks` | JSON-Array aller Tasks |

---

## Features

### Aufgabentypen

| Typ | Key | Farbe | Hex |
|-----|-----|-------|-----|
| Projektarbeit | `projekt` | Blau | `#3b82f6` |
| Support/Wartung | `support` | Grün | `#10b981` |
| Dienstreise | `reise` | Orange | `#f59e0b` |
| Training/Schulung | `training` | Lila | `#8b5cf6` |

### Teams (Standard-Konfiguration)

| Team | Mitarbeiter |
|------|-------------|
| Development | 8 |
| Sales | 6 |
| Consulting | 10 |
| Marketing | 6 |
| **Gesamt** | **30** |

### Timeline

- **Zeitraum:** 12 Wochen ab aktuellem Datum
- **Aktuelle Woche:** Gelb hervorgehoben (`#fffbeb`)
- **Wochen-Format:** ISO 8601 (YYYY-Www)

---

## Benutzeroberfläche

### Komponenten

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                     │
│  ┌─────────────────────────────────┐  ┌──────────────────┐ │
│  │ Titel + Version + Anleitung     │  │ Daten löschen    │ │
│  └─────────────────────────────────┘  └──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Main Table                                                 │
│  ┌─────────┬───────┬───────┬───────┬───────┬─────────────┐ │
│  │ Mitarb. │ KW 6  │ KW 7  │ KW 8  │ ...   │ KW 17       │ │
│  ├─────────┼───────┼───────┼───────┼───────┼─────────────┤ │
│  │ DEVELOPMENT ──────────────────────────────────────────│ │
│  ├─────────┼───────┼───────┼───────┼───────┼─────────────┤ │
│  │ MA 1    │ [Task]│       │       │       │             │ │
│  │ MA 2    │       │ [Task]│       │       │             │ │
│  │ ...     │       │       │       │       │             │ │
│  ├─────────┼───────┼───────┼───────┼───────┼─────────────┤ │
│  │ SALES ────────────────────────────────────────────────│ │
│  │ ...     │       │       │       │       │             │ │
│  └─────────┴───────┴───────┴───────┴───────┴─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Modal (bei Bedarf)                          Toast-Area    │
└─────────────────────────────────────────────────────────────┘
```

### Interaktionen

| Element | Klick | Hover | Tastatur |
|---------|-------|-------|----------|
| Leere Zelle | Modal öffnen | Hintergrund ändern | Enter/Space |
| Task-Block | Löschen (Confirm) | Skalierung + Schatten | Enter/Space |
| Modal-Backdrop | Modal schließen | - | ESC |
| Reset-Button | Alle Daten löschen | Transform | Enter |

---

## Barrierefreiheit

### ARIA-Attribute

| Element | Attribut | Wert |
|---------|----------|------|
| Tabelle | `role` | `grid` |
| Zeile | `role` | `row` |
| Zelle | `role` | `gridcell` |
| Team-Header | `role` | `rowheader` |
| Modal | `role` | `dialog` |
| Modal | `aria-modal` | `true` |
| Toast | `role` | `alert` |
| Toast | `aria-live` | `polite` |

### Screenreader-Labels

- Jede Zelle hat ein `aria-label` mit Mitarbeiter + Woche
- Tasks haben `aria-label` mit Beschreibung + "Klicken zum Löschen"
- Aktuelle Woche wird als "(Aktuelle Woche)" angezeigt

### Fokus-Management

- Sichtbare Fokus-Indikatoren (`outline: 2px solid`)
- Auto-Fokus auf erstes Input im Modal
- Tab-Navigation durch alle interaktiven Elemente

---

## Tastaturnavigation

| Taste | Aktion |
|-------|--------|
| `Tab` | Nächstes interaktives Element |
| `Shift + Tab` | Vorheriges Element |
| `Enter` | Element aktivieren |
| `Space` | Element aktivieren |
| `Escape` | Modal/Dialog schließen |

---

## Styling-System

### CSS-Variablen

```css
:root {
    /* Farben */
    --bg-body: #f4f4f9;
    --bg-card: #ffffff;
    --text-main: #333;
    --text-muted: #64748b;
    --primary: #2563eb;
    --danger: #ef4444;
    --success: #10b981;
    --warning: #f59e0b;

    /* Task-Farben */
    --task-projekt: #3b82f6;
    --task-support: #10b981;
    --task-reise: #f59e0b;
    --task-training: #8b5cf6;

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 20px;

    /* Sonstiges */
    --radius-sm: 4px;
    --radius-md: 8px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
    --transition-fast: 0.1s ease;
}
```

### Responsive Breakpoints

| Breakpoint | Zielgerät | Anpassungen |
|------------|-----------|-------------|
| > 1200px | Desktop | Volle Ansicht |
| <= 768px | Tablet | Kompaktere Abstände, kleinere Schrift |
| <= 480px | Mobile | Minimale Abstände, noch kleinere Schrift |

### Spezielle Styles

| Feature | CSS-Klasse | Beschreibung |
|---------|------------|--------------|
| Aktuelle Woche | `.current-week` | Gelber Hintergrund |
| Team-Header | `.team-header` | Grauer Hintergrund, Uppercase |
| Task-Typen | `.type-projekt`, etc. | Farbcodierung |
| Toast-Animation | `.hiding` | Slide-Out Animation |

### Media Queries

- **Print:** Versteckt Buttons, Modal, Toasts
- **Reduced Motion:** Deaktiviert alle Animationen

---

## Deployment

### GitHub Pages

Die Anwendung wird automatisch via GitHub Actions auf GitHub Pages deployed.

**Workflow:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./docs
      - uses: actions/deploy-pages@v4
```

**Wichtig:** Die Dateien in `/docs` sind die deployte Version!

### Manuelles Update

```bash
# Dateien in docs/ aktualisieren
cp app.js index.html styles.css docs/

# Änderungen committen und pushen
git add docs/
git commit -m "Update deployed version"
git push origin main
```

---

## Entwicklung

### Lokaler Server starten

```bash
# Mit npm
npm run dev      # Port 3000

# Mit Python
python -m http.server 8000

# Mit PHP
php -S localhost:8000
```

### Debugging

Die Anwendung exportiert alle Module für Tests:

```javascript
// In Browser-Konsole verfügbar:
CONFIG      // Konfiguration
State       // Aktueller Zustand
Storage     // localStorage-Wrapper
Toast       // Benachrichtigungen
DateUtils   // Datum-Hilfsfunktionen
DataManager // Datenverwaltung
Renderer    // UI-Rendering
Modal       // Dialog-Steuerung
App         // Hauptmodul
```

### Code-Konventionen

- **Namensgebung:** camelCase für Variablen/Funktionen
- **Konstanten:** UPPER_CASE für echte Konstanten
- **Module:** PascalCase für Modul-Objekte
- **Kommentare:** JSDoc-Format für Funktionen
- **Sprache:** Code auf Englisch, UI auf Deutsch

---

## Backup & Wiederherstellung

### Backup-Verzeichnis

Ein vollständiges Backup aller Dateien befindet sich in:

```
backup/v0.7.1-backup-2026-02-04/
├── app.js
├── index.html
├── styles.css
├── package.json
├── README.md
└── docs/
```

### Git Tag

Es existiert ein Git-Tag für den Backup-Zustand:

```bash
# Backup-Tag anzeigen
git tag -l "*backup*"

# Zum Backup-Stand zurückkehren
git checkout v0.7.1-backup-2026-02-04

# Wieder zum aktuellen Stand
git checkout main
```

### localStorage Backup

Um die localStorage-Daten zu sichern:

```javascript
// In Browser-Konsole:
const backup = {
    employees: localStorage.getItem('planer_employees'),
    tasks: localStorage.getItem('planer_tasks')
};
console.log(JSON.stringify(backup));
// Output kopieren und sichern
```

### Wiederherstellung

```javascript
// In Browser-Konsole:
const backup = /* gepasteter JSON-String */;
localStorage.setItem('planer_employees', backup.employees);
localStorage.setItem('planer_tasks', backup.tasks);
location.reload();
```

---

## Roadmap

### Version 1.0 (Geplant)

| Feature | Status | Priorität |
|---------|--------|-----------|
| Daten-Export (CSV, JSON) | Geplant | Hoch |
| Daten-Import | Geplant | Hoch |
| Suchfunktion | Geplant | Mittel |
| Filter nach Team/Typ | Geplant | Mittel |
| Tasks bearbeiten | Geplant | Hoch |
| Konflikt-Erkennung | Geplant | Niedrig |

### Zukünftige Versionen

| Feature | Beschreibung |
|---------|--------------|
| Backend-Integration | Optional: REST API Anbindung |
| Multi-User | Mehrere Benutzer mit Login |
| Auslastungsberichte | Statistiken und Grafiken |
| Dark Mode | Dunkles Farbschema |
| Kalender-Integration | iCal/Google Calendar Export |
| Drag & Drop | Tasks per Drag & Drop verschieben |
| Undo/Redo | Aktionen rückgängig machen |

---

## Troubleshooting

### Häufige Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Daten verschwunden | localStorage gelöscht | Backup einspielen |
| Keine Daten gespeichert | Private Browsing | Normalen Modus verwenden |
| Tabelle zu breit | Kleine Bildschirmgröße | Horizontal scrollen |
| Modal öffnet nicht | JavaScript-Fehler | Konsole prüfen |

### Konsolen-Befehle

```javascript
// Version prüfen
CONFIG.version

// Anzahl Mitarbeiter
State.employees.length

// Anzahl Tasks
State.tasks.length

// Alle Daten löschen
DataManager.reset()

// UI neu rendern
Renderer.renderHeader();
Renderer.renderBody();
```

### Browser-Kompatibilität

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 80+ | Vollständig |
| Firefox | 75+ | Vollständig |
| Safari | 13+ | Vollständig |
| Edge | 80+ | Vollständig |
| IE | - | Nicht unterstützt |

---

## Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte.

---

*Dokumentation erstellt am 04.02.2026*
*Version: 0.7.1*
