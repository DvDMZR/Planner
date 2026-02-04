# Team Ressourcen Planer

> **Version 0.7.1** | Web-basiertes Tool zur Visualisierung und Verwaltung von Team-Verfügbarkeiten

![Status](https://img.shields.io/badge/Status-Prototype-blue)
![Version](https://img.shields.io/badge/Version-0.7.1-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Überblick

Der **Team Ressourcen Planer** ist eine leichtgewichtige Web-Anwendung zur visuellen Planung von Mitarbeiter-Ressourcen über einen 12-Wochen-Zeitraum. Ideal für kleine bis mittlere Teams, die einen schnellen Überblick über Verfügbarkeiten und Aufgabenzuweisungen benötigen.

### Hauptfunktionen

| Feature | Beschreibung |
|---------|--------------|
| **Timeline-Ansicht** | 12-Wochen-Übersicht mit Hervorhebung der aktuellen Woche |
| **Team-Organisation** | Mitarbeiter nach Teams gruppiert (Development, Sales, Consulting, Marketing) |
| **Aufgabentypen** | Projektarbeit, Support/Wartung, Dienstreise, Training |
| **Lokale Speicherung** | Daten werden im Browser gespeichert (localStorage) |
| **Responsive Design** | Optimiert für Desktop, Tablet und Mobile |
| **Barrierefreiheit** | ARIA-Labels, Tastaturnavigation, Screen-Reader-Support |

---

## Schnellstart

### Option 1: Direkt öffnen
```bash
# Einfach die index.html im Browser öffnen
open index.html
```

### Option 2: Mit lokalem Server
```bash
# Mit npm serve
npx serve .

# Oder mit Python
python -m http.server 8000
```

---

## Bedienung

| Aktion | Beschreibung |
|--------|--------------|
| **Klick auf leere Zelle** | Neuen Eintrag erstellen |
| **Klick auf Eintrag** | Eintrag löschen |
| **ESC-Taste** | Dialog schließen |
| **Tab-Taste** | Durch Elemente navigieren |
| **Enter/Leertaste** | Element aktivieren |

---

## Projektstruktur

```
Planner/
├── index.html      # Haupt-HTML-Datei
├── styles.css      # Alle CSS-Styles
├── app.js          # Anwendungslogik (modular)
├── package.json    # Projektmetadaten & Version
└── README.md       # Diese Dokumentation
```

---

## Technologie-Stack

- **Frontend:** Vanilla JavaScript (ES6+), CSS3, HTML5
- **Speicherung:** Browser localStorage
- **Abhängigkeiten:** Keine externen Libraries

---

## Roadmap

### Geplante Features (v1.0)

- [ ] Daten-Export (CSV, JSON)
- [ ] Daten-Import
- [ ] Suchfunktion
- [ ] Filter nach Team/Aufgabentyp
- [ ] Aufgaben bearbeiten (nicht nur löschen)
- [ ] Konflikt-Erkennung (Doppelbuchungen)

### Zukünftige Ideen

- [ ] Backend-Integration
- [ ] Multi-User Support
- [ ] Auslastungsberichte
- [ ] Dark Mode
- [ ] Kalender-Integration

---

## Changelog

### v0.7.1 (aktuell)
- Code in separate Dateien aufgeteilt (HTML, CSS, JS)
- Modulare JavaScript-Architektur
- Barrierefreiheit verbessert (ARIA, Keyboard-Navigation)
- Responsive Design implementiert
- Toast-Benachrichtigungen hinzugefügt
- Fehlerbehandlung verbessert
- Print-Styles hinzugefügt
- Reduced-Motion Support

### v0.7.0
- Initiale Prototype-Version
- Basis-Timeline-Ansicht
- Lokale Datenspeicherung

---

## Lizenz

MIT License - Frei verwendbar für private und kommerzielle Projekte.

---

<div align="center">

**Made with** ☕ **for better team planning**

</div>
