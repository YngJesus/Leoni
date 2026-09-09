import { box, cell, openPrintWindow } from "./printTheme";

export function repairCardHtml(card) {
  const site = card?.site?.name || card?.siteName || "—";
  const oem = card?.clientOem?.name || card?.clientOemName || "—";
  const lines = card?.defectLines || [];
  const date = card?.date ? String(card.date).slice(0, 10) : "—";
  
  const lineRows = lines.length
    ? lines
        .map(
          (line) => `<tr class="keep">
            <td>${cell(line.etiquetteStop)}</td>
            <td>${cell(line.dateProduction ? String(line.dateProduction).slice(0, 10) : "")}</td>
            <td>${cell(line.serieVariante)}</td>
            <td>${cell(line.kskIdUnique)}</td>
            <td>${cell(line.groupeEquipe)}</td>
            <td>${cell(line.numFilDouilleConn)}</td>
            <td>${cell(line.codeDefaut)}</td>
            <td>${cell(line.qte)}</td>
            <td>${cell(line.defautDetecteA)}</td>
            <td>${cell(line.tempsMin)}</td>
            <td>${cell(line.descriptionFaute)}</td>
            <td>${cell(line.dateHeureEntree)}</td>
            <td>${cell(line.sortiPar)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td class="empty" colspan="13">Aucun défaut enregistré.</td></tr>`;

  return `<div class="sheet">
      <div class="header keep">
        <div>
          <span class="badge">IT TN 3067 - Annexe 2</span>
          <span>Page 1</span>
          <h1>Carte d'enregistrement des défauts retouchés et / ou réparés</h1>
        </div>
        <div class="meta">
          <strong>Date:</strong> ${cell(date)}<br/>
          <strong>Type:</strong> ${cell(card?.typeReparation)}
        </div>
      </div>
      <div class="grid g-3 keep">
        ${box("Production facility & Segment", site)}
        ${box("Date", date)}
        ${box("Retouche et / ou réparation", card?.typeReparation)}
        ${box("Projet client (OEM)", oem)}
        ${box("Matricule créateur", card?.createdByMatricule)}
        ${box("Nombre de défauts", lines.length)}
      </div>
      <div class="section-title keep">Défauts enregistrés</div>
      <table>
        <thead>
          <tr class="keep">
            <th>N° Etiquette Stop</th>
            <th>Date prod.</th>
            <th>Série / Var.</th>
            <th>N° KSK / ID</th>
            <th>Groupe</th>
            <th>N° Douille</th>
            <th>Code déf.</th>
            <th>Qté</th>
            <th>Détecté à</th>
            <th>Temps</th>
            <th>Description faute</th>
            <th>Date & Heure</th>
            <th>Sorti par</th>
          </tr>
        </thead>
        <tbody>${lineRows}</tbody>
      </table>
    </div>`;
}

export function printRepairCard(card) {
  openPrintWindow("LEONI - Carte de réparation", repairCardHtml(card));
}