#!/usr/bin/env node
/**
 * Erzeugt board.html aus BOARD.md.
 * Aufruf: node build-board.js
 * Keine Abhängigkeiten — läuft mit jedem Node ab v14.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'BOARD.md');
const OUT = path.join(__dirname, 'board.html');

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Done'];

function parse(markdown) {
  const board = new Map(COLUMNS.map((c) => [c, []]));
  let current = null;

  for (const line of markdown.split('\n')) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      const name = heading[1].trim();
      current = board.has(name) ? name : null;
      continue;
    }
    if (!current) continue;

    // - **ID** Titel `label` `label` — Notiz
    const card = line.match(/^-\s+\*\*(.+?)\*\*\s+(.*)$/);
    if (!card) continue;

    const id = card[1].trim();
    const rest = card[2].trim();

    // Erst am Gedankenstrich trennen: Labels stehen nur im Titelteil.
    // Backticks in der Notiz sind Code, keine Labels.
    const split = rest.split(/\s+—\s+/);
    let titlePart = split.shift();
    const note = split.join(' — ');

    const labels = [];
    titlePart = titlePart.replace(/`([^`]+)`/g, (_, label) => {
      labels.push(label.trim());
      return '';
    });

    board.get(current).push({
      id,
      title: titlePart.replace(/\s+/g, ' ').trim(),
      note: note.replace(/\s+/g, ' ').trim(),
      labels,
    });
  }
  return board;
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

// Escapt und rendert `...` in Notizen als <code>.
const inlineCode = (s) =>
  escapeHtml(s).replace(/`([^`]+)`/g, '<code>$1</code>');

function render(board, meta) {
  const columns = COLUMNS.map((name) => {
    const cards = board.get(name) || [];
    const items = cards.length
      ? cards
          .map(
            (c) => `
          <li class="card">
            <div class="card-head">
              <span class="id">${escapeHtml(c.id)}</span>
              ${c.labels
                .map(
                  (l) =>
                    `<span class="label label-${escapeHtml(
                      l.replace(/[^a-z0-9-]/gi, '')
                    )}">${escapeHtml(l)}</span>`
                )
                .join('')}
            </div>
            <p class="title">${escapeHtml(c.title)}</p>
            ${c.note ? `<p class="note">${inlineCode(c.note)}</p>` : ''}
          </li>`
          )
          .join('')
      : `<li class="empty">nichts hier</li>`;

    return `
      <section class="column" data-column="${escapeHtml(name)}">
        <h2>${escapeHtml(name)} <span class="count">${cards.length}</span></h2>
        <ul>${items}</ul>
      </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Board — ${escapeHtml(meta.project)}</title>
<style>
  :root {
    --bg: #fbfaf9;
    --surface: #ffffff;
    --border: #e4e0da;
    --text: #26231f;
    --muted: #6f6a63;
    --accent: #7a6a55;
    --chip-bg: #f0ece6;
    --shadow: 0 1px 2px rgba(30,26,20,.06), 0 1px 8px rgba(30,26,20,.04);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1a1815;
      --surface: #232019;
      --border: #38332b;
      --text: #ece7df;
      --muted: #9d968b;
      --accent: #c3b294;
      --chip-bg: #302b23;
      --shadow: none;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2.5rem 1.5rem 4rem;
    background: var(--bg);
    color: var(--text);
    font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  header { max-width: 1240px; margin: 0 auto 2rem; }
  h1 { margin: 0 0 .35rem; font-size: 1.4rem; font-weight: 600; letter-spacing: -.01em; }
  header p { margin: 0; color: var(--muted); font-size: .875rem; }
  header code { background: var(--chip-bg); padding: .1em .4em; border-radius: 4px; font-size: .9em; }
  .board {
    max-width: 1240px; margin: 0 auto;
    display: grid; gap: 1rem;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 1000px) { .board { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 620px)  { .board { grid-template-columns: 1fr; } }
  .column {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: .9rem .8rem 1rem;
  }
  .column h2 {
    margin: 0 0 .8rem; padding: 0 .2rem;
    font-size: .74rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: .07em;
    color: var(--muted);
    display: flex; align-items: center; gap: .5rem;
  }
  .count {
    background: var(--chip-bg); color: var(--muted);
    border-radius: 999px; padding: .05rem .45rem;
    font-size: .78em; letter-spacing: 0;
  }
  .column ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .55rem; }
  .card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 8px;
    padding: .6rem .7rem .65rem;
    box-shadow: var(--shadow);
  }
  .card-head { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; margin-bottom: .3rem; }
  .id { font: 600 .7rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); letter-spacing: .02em; }
  .title { margin: 0; font-size: .875rem; font-weight: 500; }
  .note { margin: .3rem 0 0; font-size: .78rem; color: var(--muted); }
  .note code {
    font: .93em/1 ui-monospace, SFMono-Regular, Menlo, monospace;
    background: var(--chip-bg); padding: .1em .3em; border-radius: 3px;
    overflow-wrap: anywhere;
  }
  .label {
    font-size: .65rem; font-weight: 600; letter-spacing: .03em;
    text-transform: uppercase;
    padding: .1rem .38rem; border-radius: 4px;
    background: var(--chip-bg); color: var(--muted);
  }
  .label-bug     { background: #f7dcd6; color: #8c3a26; }
  .label-feature { background: #d9e6da; color: #2f5c3a; }
  .label-docs    { background: #dee2ef; color: #37477a; }
  .label-cleanup { background: #f2e6cd; color: #77551d; }
  .label-infra   { background: #e2dced; color: #53407a; }
  @media (prefers-color-scheme: dark) {
    .label-bug     { background: #4a2820; color: #f0b9a8; }
    .label-feature { background: #24402c; color: #a8ceb2; }
    .label-docs    { background: #262f4c; color: #b1bee4; }
    .label-cleanup { background: #453619; color: #ddc188; }
    .label-infra   { background: #332a4c; color: #c0b0e0; }
  }
  .empty { color: var(--muted); font-size: .8rem; font-style: italic; padding: .3rem .2rem; }
  footer { max-width: 1240px; margin: 2rem auto 0; color: var(--muted); font-size: .78rem; }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(meta.project)}</h1>
    <p>Generiert aus <code>BOARD.md</code> — Stand ${escapeHtml(meta.date)}</p>
  </header>
  <main class="board">${columns}
  </main>
  <footer>Zum Ändern die Karten in BOARD.md verschieben, dann <code>node build-board.js</code> laufen lassen.</footer>
</body>
</html>
`;
}

const markdown = fs.readFileSync(SRC, 'utf8');
const titleLine = markdown.match(/^#\s+(.+)$/m);
const html = render(parse(markdown), {
  project: titleLine ? titleLine[1].trim() : 'Board',
  date: new Date().toISOString().slice(0, 10),
});

fs.writeFileSync(OUT, html, 'utf8');

const counts = COLUMNS.map((c) => `${c}: ${parse(markdown).get(c).length}`).join('  |  ');
console.log(`board.html geschrieben — ${counts}`);
