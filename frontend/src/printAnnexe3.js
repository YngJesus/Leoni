import { box, cell, openPrintWindow } from "./printTheme";

function list(values, labels) {
  if (!values?.length) return "—";
  if (!labels) return values.join(", ");
  return values.map((v) => labels[v] || v).join(", ");
}

export function annexe3CardHtml(card) {
  const date = card?.date ? String(card.date).slice(0, 10) : "—";

  // Mapping des libellés d'actions correctives (identiques au formulaire React)
  const actionLabels = {
    acceptedState: "Accepted state",
    sorting: "Sorting",
    reworkRepair: "Rework / Repair",
    deviationBeforeProd: "Deviation before production",
    deviationAfterProd: "Deviation after production",
    changeReference: "Change reference",
    scrap: "Scrap",
    newManufacturing: "New manufacturing",
    returnToSupplier: "Return to Supplier",
    others: "Others",
  };

  // Traitement des actions correctives (objet de l'état React ou tableau)
  let actions = card?.correctiveActions || [];
  if (actions && !Array.isArray(actions) && typeof actions === "object") {
    actions = Object.entries(actions).map(([key, val]) => ({
      actionType: actionLabels[key] || key,
      ownerPilot: val?.pilot,
      completionDate: val?.date,
      quantity: val?.qty,
      elapsedTimeMin: val?.timePast,
    }));
  }

  const actionRows = actions.length
    ? actions
        .map(
          (item) => `<tr>
            <td>${cell(actionLabels[item.actionType] || item.actionType)}</td>
            <td>${cell(item.ownerPilot)}</td>
            <td>${cell(item.completionDate)}</td>
            <td>${cell(item.quantity)}</td>
            <td>${cell(item.elapsedTimeMin)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td class="empty" colspan="5">Aucune action.</td></tr>`;

  // Traitement des actions liées aux risques
  // (le formulaire React envoie action/pilot/date, la carte persistée en
  // base envoie actionRiskDescription/ownerPilot/completionDate — on
  // supporte les deux formes)
  const risks = card?.riskActions || [];
  const riskRows = risks.length
    ? risks
        .map(
          (item) => `<tr>
            <td>${cell(item.action || item.actionRiskDescription)}</td>
            <td>${cell(item.pilot || item.ownerPilot)}</td>
            <td>${cell(item.date || (item.completionDate ? String(item.completionDate).slice(0, 10) : ""))}</td>
            <td>${cell(item.successStatus || "OK")} - ${cell(item.successCheck)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td class="empty" colspan="4">Aucune action risque.</td></tr>`;

  // Traduction propre des zones affectées (checkboxes)
  const zoneLabels = {
    reception: "Receiving",
    warehouse: "Warehouse",
    manufacturing: "Manufacturing",
    expeditions: "Shipping",
    otherSite: "Other Site",
    advancedWarehouse: "Advanced Warehouse / Surface",
    customer: "Customer",
  };
  const affectedZonesText = card?.affectedZones
    ? Object.entries(card.affectedZones)
        .filter(([_, val]) => val)
        .map(([k]) => zoneLabels[k] || k)
        .join(", ")
    : list(card?.zonesAffected, zoneLabels);

  // Traduction propre des origines de NC
  const originLabels = {
    noticeNC: "Notice of the N.C.",
    otherSite: "Other Site",
    customerIncident: "Customer Incident",
    residentAlert: "Resident Alert",
  };
  const originNcText = card?.originNC
    ? Object.entries(card.originNC)
        .filter(([k, val]) => val && k !== "redHoldLabel" && k !== "other")
        .map(([k]) => originLabels[k] || k)
        .join(", ")
    : list(card?.originOfNC, originLabels);

  // Traduction propre des sujets de NC
  const subjectLabels = {
    components: "Components",
    wiresEquipped: "Wires equipped",
    subElements: "Sub-elements",
    harness: "Harness",
    cables: "Cables",
  };
  const subjectNcText = card?.subjectNC
    ? Object.entries(card.subjectNC)
        .filter(([k, val]) => val && k !== "severity" && k !== "mfgDate")
        .map(([k]) => subjectLabels[k] || k)
        .join(", ")
    : list(card?.subjectOfNC, subjectLabels);

  // Calcul du taux de défaut
  const controlled =
    Number(card?.quantities?.controlled || card?.controlledQuantity) || 0;
  const defective =
    Number(card?.quantities?.defective || card?.defectiveQuantity) || 0;
  const defectRate =
    controlled > 0 ? ((defective / controlled) * 100).toFixed(1) : "0.0";

  return `<div class="sheet">
      <!-- En-tête du document -->
      <div class="header">
        <div>
          <span class="badge">WI3006 - Annexe 3</span>
          <h1>Rework / Repair Card for Serial Defects</h1>
        </div>
        <div class="meta">
          <strong>Card No:</strong> ${cell(card?.docNo || card?.cardNo)}<br/>
          <strong>Process:</strong> ${cell(card?.processType || card?.productionProcess)}<br/>
          <strong>Statut:</strong> ${cell(card?.status || "PENDING_REVIEW")}
        </div>
      </div>

      <!-- 1. General Information -->
      <div class="section-title">General Information</div>
      <div class="grid g-4">
        ${box("Card No.", card?.docNo || card?.cardNo)}
        ${box("Date", date)}
        ${box("Segment / Line", card?.segment || card?.segmentLine)}
        ${box("Responsible Person", card?.respPerson || card?.responsiblePerson)}
      </div>

      <!-- 2. Zones & Origin -->
      <div class="grid g-2">
        ${box("Zones Affected by the N.C.", affectedZonesText)}
        ${box("Manufacturing Lines Concerned", card?.manufacturingLines || card?.manufacturingLinesConcerned)}
        ${box("Origin of the N.C.", originNcText)}
        ${box("Red Hold Label No.", card?.originNC?.redHoldLabel || card?.redHoldLabelNo)}
      </div>

      <!-- 3. Subject of N.C. -->
      <div class="grid g-2">
        ${box("Subject of the N.C.", subjectNcText)}
        ${box("Severity", card?.subjectNC?.severity || card?.severity)}
        ${box("Manufacturing Date", card?.subjectNC?.mfgDate || card?.manufacturingDate)}
      </div>

      <!-- 4. Defect & Quantities -->
      <div class="grid g-4">
        ${box("Defect Code", card?.defectCode)}
        ${box("Defect Description", card?.defectDescription, "wide")}
        ${box("Vehicle", card?.vehicle)}
        ${box("Family", card?.family)}
        ${box("Ref. + Index", card?.refIndex)}
        ${box("Qty to Control", card?.quantities?.toControl || card?.quantityToBeControlled)}
        ${box("Controlled Qty", controlled)}
        ${box("Defective Qty", defective)}
      </div>

      <!-- 5. N.C. Description, Photo & Risk Assessment -->
      <div class="section-title">N.C. Description &amp; Risk Assessment</div>
      <div class="grid g-1">
        ${box("N.C. Description", card?.ncDescription, "wide")}
        ${box("Risk for Rework or Repair?", card?.riskOfRework || (card?.riskForReworkOrRepair ? "Yes" : "No"))}
        ${(card?.riskOfRework === "Yes" || card?.riskForReworkOrRepair) && card?.riskOfReworkDetails ? box("Identified Risk Details", card?.riskOfReworkDetails, "wide") : ""}
      </div>

      <!-- 6. Corrective Actions Related to Risks -->
      <div class="section-title">Corrective Actions Related to Risks</div>
      <table>
        <thead>
          <tr>
            <th>Action / Risk Description</th>
            <th>Owner / Pilot</th>
            <th>Completion Date</th>
            <th>Success Check</th>
          </tr>
        </thead>
        <tbody>${riskRows}</tbody>
      </table>

      <!-- 7. Corrective Actions -->
      <div class="section-title">Corrective Actions</div>
      <table>
        <thead>
          <tr>
            <th>Action Type</th>
            <th>Owner / Pilot</th>
            <th>Completion Date</th>
            <th>Quantity</th>
            <th>Elapsed Time (min)</th>
          </tr>
        </thead>
        <tbody>${actionRows}</tbody>
      </table>

      <!-- 8. Comments & Traceability -->
      <div class="grid g-2" style="margin-top: 8px;">
        ${box("Comments", card?.comments, "wide")}
        ${box("Traceability", card?.tracability || card?.traceability, "wide")}
      </div>

      <!-- 9. Approval Workflow Status -->
      <div class="section-title">Approval Workflow Status</div>
      <div class="grid g-2">
        ${box("Production Leader", card?.approvalRequests?.prodSegment?.name || card?.prodLeader || card?.assignedProductionLeaderMatricule)}
        ${box("Quality Operation Segment", card?.approvalRequests?.qualitySegment?.name || card?.qualityReviewer || card?.assignedQualityReviewerMatricule)}
      </div>
    </div>`;
}

export function printAnnexe3Card(card) {
  openPrintWindow(
    `LEONI - Annexe 3 ${card?.docNo || card?.cardNo || ""}`,
    annexe3CardHtml(card),
  );
}
