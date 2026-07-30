# Board — Data Science Seminar

Kanban-Board für dieses Repo. Gepflegt als Datei, damit es zusammen mit dem Code
versioniert ist und die Historie zeigt, wann welche Aufgabe gewandert ist.

**Bedienung:** Eine Aufgabe verschieben heißt, die Zeile in eine andere Spalte
(Überschrift) zu schneiden. Format einer Karte:

```
- **ID** Titel `label` — optionale Notiz
```

Labels: `bug` `feature` `docs` `cleanup` `infra`

---

## Backlog

- **T-007** Ordnernamen vereinheitlichen `cleanup` — BLRS2, BRSC, BRSC2, DijkstraA, Linear folgen keinem gemeinsamen Schema
- **T-008** Alte Dateiversionen aufräumen `cleanup` — `Datascience_Projekt (13).pdf` und `ASTAR-~1.HTM` sehen nach Zufallsständen aus
- **T-009** responsive-test.html klären `cleanup` — Test-Artefakt: behalten und dokumentieren oder entfernen

## To Do

- **T-001** Toten Link /BC-IRNN/ reparieren `bug` — in index.html und impressum.html verlinkt, aber der Ordner existiert nicht; nginx liefert dafür 404
- **T-002** README anlegen `docs` — Repo hat keins; Kurzbeschreibung, Setup, wie man die Simulatoren startet
- **T-003** Startanleitung dokumentieren `docs` — `npm start` (server.js, Port 3000) vs. Docker Compose vs. start-dijkstraa.cmd

## In Progress

_(leer)_

## Done

- **T-004** BRSC-Implementierung korrigieren `feature` — Commit "new & correct BRSC"
- **T-005** Oberfläche auf Englisch umstellen `feature` — Commit "change everything into english"
- **T-006** Responsive Design umsetzen `feature` — dokumentiert in RESPONSIVE_DESIGN.md und RESPONSIVE_IMPLEMENTIERUNG.md

---

Die Karten in Backlog und To Do sind ein Vorschlag aus dem aktuellen Repo-Stand,
kein festgelegter Plan — streichen und umschreiben ist ausdrücklich vorgesehen.
Done spiegelt die bisherige Commit-Historie.
