import { box, cell, openPrintWindow } from "./printTheme";

function rowsHtml(headers, items, cells) {
  if (!items?.length) {
    return `<tr><td class="empty" colspan="${headers.length}">Aucune ligne.</td></tr>`;
  }
  return items
    .map(
      (item) =>
        `<tr>${cells(item)
          .map((value) => `<td>${cell(value)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
}

export function triagePrintHtml(plan) {
  const date = plan?.date ? String(plan.date).slice(0, 10) : "—";
  const isScrap = String(plan?.decision || "").includes("REBUT");
  return `<div class="sheet">
  <div class="header">
    <div>
      <span class="badge">IT TN 3067 - Annexe 2</span>
      <span>Etat 01.2023</span>
      <h1>Plan de Triage et de Retouche et/ou Réparation</h1>
      <div>Document de suivi production · fiche complète (Production, PE, QM)</div>
    </div>
    <div class="meta">
      <strong>N° fiche:</strong> ${cell(plan?.numFicheRetouche)}<br/>
      <strong>N° d'ordre:</strong> ${cell(plan?.numOrdre)}<br/>
      <strong>Statut:</strong> ${cell(plan?.status)}
    </div>
  </div>

  <div class="section-title">1. Données générales (Production)</div>
  <div class="note">Section 1 (Production) — informations générales de blocage.</div>
  <div class="grid g-4">
    ${box("Date", date)}
    ${box("Site LEONI", plan?.siteName)}
    ${box("Projet client (OEM)", plan?.clientOemName)}
    ${box("N° d'ordre (auto)", plan?.numOrdre)}
    ${box("N° de série", plan?.numSerie)}
    ${box("Quantité bloquée", plan?.quantiteBloquee)}
    ${box("N° de fiche", plan?.numFicheRetouche)}
    ${box("Créé par", plan?.createdByMatricule)}
    ${box("Motif du triage", plan?.motifBlocage, "wide")}
  </div>

  <div class="section-title">2. Triage et décision (Production)</div>
  <div class="grid g-3">
    ${box("Production", plan?.createdByMatricule)}
    ${box("Production Engineering", plan?.assignedPeMatricule || plan?.productionEngineeringMatricule)}
    ${box("Qualité (QM)", plan?.assignedQmMatricule)}
  </div>
  <table>
    <thead><tr><th>Critère</th><th>Repérage</th><th>Matricule exécuteur</th><th>Temps prévu</th></tr></thead>
    <tbody>${rowsHtml(["a", "b", "c", "d"], plan?.criteresTriage, (item) => [item.critere, item.reperageCablagesCaisse, item.matriculeExecuteur, item.tempsPrevu])}</tbody>
  </table>
  <div class="grid g-4">
    ${box("Quantité conforme", plan?.quantiteConforme)}
    ${box("Quantité non conforme", plan?.quantiteNonConforme)}
    ${box("Temps réel", plan?.tempsReelTriage)}
    ${box("Décision", plan?.decision)}
    ${box("Justification", plan?.justificationDecision, "wide")}
  </div>

  <div class="section-title">3. Plan de retouche (PE)</div>
  ${
    isScrap
      ? `<div class="note">Section verrouillée : décision de rebut.</div>`
      : `<p>Matricule PE: ${cell(plan?.productionEngineeringMatricule || plan?.assignedPeMatricule)}</p>
  <table>
    <thead><tr><th>Étape</th><th>Responsable</th><th>Délai</th><th>Temps prévu</th></tr></thead>
    <tbody>${rowsHtml(["a", "b", "c", "d"], plan?.instructionsRetouche, (item) => [item.descriptionEtape, item.responsable, item.delai, item.tempsPrevu])}</tbody>
  </table>`
  }

  <div class="section-title">4. Contrôle et validation (QM)</div>
  <p>Matricule QM: ${cell(plan?.qualiteQmMatricule || plan?.qmMatriculeValidation || plan?.assignedQmMatricule)}</p>
  <table>
    <thead><tr><th>Contrôle</th><th>Responsable</th><th>Délai</th><th>Temps prévu</th></tr></thead>
    <tbody>${rowsHtml(["a", "b", "c", "d"], plan?.pointsControle, (item) => [item.descriptionControle, item.responsable, item.delai, item.tempsPrevu])}</tbody>
  </table>
  <div class="grid g-4">
    ${box("Risques potentiels", plan?.hasPotentialRisks)}
  </div>
  <table>
    <thead><tr><th>Risque</th><th>Action préventive</th><th>Resp.</th><th>Délai</th></tr></thead>
    <tbody>${rowsHtml(["a", "b", "c", "d"], plan?.analysesRisques, (item) => [item.risquePotentiel, item.actionPreventive, item.responsable, item.delai])}</tbody>
  </table>
</div>`;
}

export function printTriagePlan(plan) {
  openPrintWindow(
    `LEONI - Plan de triage ${plan?.numFicheRetouche || ""}`,
    triagePrintHtml(plan),
  );
}