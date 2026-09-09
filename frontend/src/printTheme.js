export const PRINT_CSS = `
@page {
  size: A4 landscape;
  margin: 6mm;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  background: #fff;
}

body {
  color: #0f172a;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9px;
  line-height: 1.2;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

/* =========================
   PRINT SHEET
   ========================= */

.sheet {
  width: 100%;
  border: 1px solid #0f172a;
  padding: 7px 9px;
  margin: 0;
}

/* Don't force the sheet itself to stay on one page */
.sheet {
  break-inside: auto;
  page-break-inside: auto;
}

/* =========================
   HEADER
   ========================= */

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  border-bottom: 2px solid #0f172a;
  padding-bottom: 6px;
  margin-bottom: 6px;

  break-inside: avoid;
  page-break-inside: avoid;
}

.badge {
  display: inline-block;
  background: #0f172a;
  color: #fff;

  font-size: 7px;
  font-weight: 800;
  letter-spacing: .12em;

  padding: 3px 6px;
  text-transform: uppercase;
}

h1 {
  font-size: 14px;
  line-height: 1.1;
  margin: 3px 0 2px;
  text-transform: uppercase;
}

.meta {
  text-align: right;
  font-size: 9px;
  line-height: 1.35;
}

/* =========================
   SECTIONS
   ========================= */

.section-title {
  background: #0f172a;
  color: #fff;

  font-size: 8px;
  font-weight: 800;
  letter-spacing: .08em;

  text-transform: uppercase;

  padding: 4px 7px;
  margin: 6px 0 0;

  /* Keep title attached to following content */
  break-after: avoid;
  page-break-after: avoid;
}

.note {
  border-left: 3px solid #1e3a8a;
  background: #f8fafc;

  padding: 4px 7px;
  margin-top: 4px;

  font-size: 8px;

  break-inside: avoid;
  page-break-inside: avoid;
}

/* =========================
   GRIDS
   ========================= */

.grid {
  display: grid;
  gap: 4px;
  margin-top: 4px;

  /* Allow grid to continue naturally */
  break-inside: auto;
  page-break-inside: auto;
}

.g-2 {
  grid-template-columns: 1fr 1fr;
}

.g-3 {
  grid-template-columns: repeat(3, 1fr);
}

.g-4 {
  grid-template-columns: repeat(4, 1fr);
}

.box {
  border: 1px solid #0f172a;

  min-height: 25px;
  padding: 3px 5px;

  background: #fff;

  /* Never split an individual box */
  break-inside: avoid;
  page-break-inside: avoid;
}

.label {
  display: block;

  font-size: 6.5px;
  font-weight: 800;
  letter-spacing: .05em;

  text-transform: uppercase;
  color: #334155;

  margin-bottom: 1px;
}

.value {
  font-weight: 700;

  overflow-wrap: anywhere;
  word-break: break-word;

  white-space: pre-wrap;
}

.wide {
  grid-column: 1 / -1;
}

/* =========================
   TABLES
   ========================= */

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 4px;

  table-layout: fixed;
}

thead {
  display: table-header-group;
}

tfoot {
  display: table-footer-group;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

th,
td {
  border: 1px solid #0f172a;

  padding: 3px 4px;

  text-align: left;
  vertical-align: top;

  overflow-wrap: anywhere;
  word-break: break-word;
}

th {
  background: #0f172a;
  color: #fff;

  font-size: 7px;
  line-height: 1.1;

  text-transform: uppercase;
}

td {
  font-size: 8px;
  line-height: 1.15;
}

.empty {
  text-align: center;
  color: #64748b;
  padding: 6px;
}

/* =========================
   KEEP BLOCKS TOGETHER
   ========================= */

.keep {
  break-inside: avoid;
  page-break-inside: avoid;
}

.keep-together {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Keep headings with the content after them */
h1,
h2,
h3,
h4 {
  break-after: avoid;
  page-break-after: avoid;
}

/* =========================
   PRINT ONLY
   ========================= */

@media print {

  html,
  body {
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0;
  }

  body {
    overflow: visible !important;
  }

  .sheet {
    width: 100%;
    margin: 0;
    padding: 7px 9px;

    /* Important: don't force a new page */
    page-break-before: auto;
    page-break-after: auto;
  }

  .section-title {
    break-before: auto;
    page-break-before: auto;

    break-after: avoid;
    page-break-after: avoid;
  }

  .box,
  .note,
  .keep {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Avoid blank pages caused by oversized elements */
  img {
    max-width: 100%;
    height: auto;
  }
}
`;

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function cell(value) {
  if (value === true) return "Oui";
  if (value === false) return "Non";
  if (value === 0) return "0";
  if (value === null || value === undefined || value === "") return "—";
  return escapeHtml(value);
}

export function box(label, value, extra = "") {
  return `<div class="box ${extra}"><span class="label">${escapeHtml(label)}</span><div class="value">${cell(value)}</div></div>`;
}

export function openPrintWindow(title, bodyHtml) {
  const win = window.open("", "_blank", "width=1200,height=850");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${PRINT_CSS}</style></head><body>${bodyHtml}<script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}