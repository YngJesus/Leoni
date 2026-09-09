import React, { useState } from "react";
import { DEFECT_CODES } from "./DefectCodes";
import { canEditRole } from "./formAccess";
import { api } from "./api";
import { printAnnexe3Card } from "./printAnnexe3";

function fromInitialData(initialData) {
  if (!initialData) return null;

  const toBooleanMap = (keys, selected) =>
    Object.fromEntries(keys.map((k) => [k, (selected || []).includes(k)]));

  const correctiveActionKeys = [
    "acceptedState",
    "sorting",
    "reworkRepair",
    "deviationBeforeProd",
    "deviationAfterProd",
    "changeReference",
    "scrap",
    "newManufacturing",
    "returnToSupplier",
    "others",
  ];
  const correctiveActions = Object.fromEntries(
    correctiveActionKeys.map((key) => {
      const match = (initialData.correctiveActions || []).find(
        (a) => a.actionType === key,
      );
      return [
        key,
        {
          pilot: match?.ownerPilot || "",
          date: match?.completionDate
            ? String(match.completionDate).slice(0, 10)
            : "",
          qty: match?.quantity ?? "",
          timePast: match?.elapsedTimeMin ?? "",
        },
      ];
    }),
  );

  const riskActionsSource = initialData.riskActions || [];
  const riskActions = [0, 1].map((i) => {
    const r = riskActionsSource[i];
    return {
      id: i + 1,
      action: r?.actionRiskDescription || "",
      pilot: r?.ownerPilot || "",
      date: r?.completionDate ? String(r.completionDate).slice(0, 10) : "",
      successStatus: "OK",
      successCheck: r?.successCheck || "",
    };
  });

  return {
    processType:
      initialData.processType || initialData.productionProcess || "Coupe",
    docNo: initialData.docNo || initialData.cardNo || "",
    date: initialData.date
      ? String(initialData.date).slice(0, 10)
      : new Date().toISOString().split("T")[0],
    segment: initialData.segment || initialData.segmentLine || "Segment 02",
    respPerson: initialData.respPerson || initialData.responsiblePerson || "",
    affectedZones: toBooleanMap(
      [
        "reception",
        "warehouse",
        "manufacturing",
        "expeditions",
        "otherSite",
        "advancedWarehouse",
        "customer",
      ],
      initialData.zonesAffected,
    ),
    manufacturingLines:
      initialData.manufacturingLines ||
      initialData.manufacturingLinesConcerned ||
      "",
    originNC: {
      ...toBooleanMap(
        ["noticeNC", "otherSite", "customerIncident", "residentAlert"],
        initialData.originOfNC,
      ),
      redHoldLabel: initialData.redHoldLabelNo || "",
      other: initialData.originOther || "",
    },
    subjectNC: {
      ...toBooleanMap(
        ["components", "wiresEquipped", "subElements", "harness", "cables"],
        initialData.subjectOfNC,
      ),
      severity: initialData.severity || "",
      mfgDate: initialData.manufacturingDate
        ? String(initialData.manufacturingDate).slice(0, 10)
        : "",
    },
    defectCode: initialData.defectCode || "",
    defectDescription: initialData.defectDescription || "",
    vehicle: initialData.vehicle || "",
    family: initialData.family || "",
    refIndex: initialData.refIndex || "",
    itemCode: initialData.itemCode || "",
    quantities: {
      toControl:
        initialData.quantities?.toControl ??
        initialData.quantityToBeControlled ??
        300,
      controlled:
        initialData.quantities?.controlled ??
        initialData.controlledQuantity ??
        300,
      defective:
        initialData.quantities?.defective ??
        initialData.defectiveQuantity ??
        20,
    },
    ncDescription: initialData.ncDescription || "",
    riskOfRework:
      initialData.riskOfRework ||
      (initialData.riskForReworkOrRepair ? "Yes" : "No"),
    riskOfReworkDetails: initialData.riskOfReworkDetails || "",
    correctiveActions,
    riskActions,
    comments: initialData.comments || "",
    tracability: initialData.tracability || initialData.traceability || "",
    approvalRequests: {
      prodSegment: {
        name:
          initialData.approvalRequests?.prodSegment?.name ||
          initialData.assignedProductionLeaderMatricule ||
          "",
        status:
          initialData.approvalRequests?.prodSegment?.status || "NOT_REQUESTED",
        requestedAt:
          initialData.approvalRequests?.prodSegment?.requestedAt || null,
        signedBy: initialData.approvalRequests?.prodSegment?.signedBy || null,
      },
      qualitySegment: {
        name:
          initialData.approvalRequests?.qualitySegment?.name ||
          initialData.assignedQualityReviewerMatricule ||
          "",
        status:
          initialData.approvalRequests?.qualitySegment?.status ||
          "NOT_REQUESTED",
        requestedAt:
          initialData.approvalRequests?.qualitySegment?.requestedAt || null,
        signedBy:
          initialData.approvalRequests?.qualitySegment?.signedBy || null,
      },
    },
  };
}

export default function ProductAudit({
  userSession,
  onBack,
  activeTab,
  onSubmitAudit,
  initialData,
}) {
  const isEditing = !!initialData;
  const [nextCardSequence, setNextCardSequence] = useState(9245);

  const [formData, setFormData] = useState(
    () =>
      fromInitialData(initialData) || {
        processType: "Coupe",
        docNo: `CARD-COUPE-${nextCardSequence}`,
        date: new Date().toISOString().split("T")[0],
        segment: "Segment 02",
        respPerson: "Mohamed trabelsi",

        affectedZones: {
          reception: false,
          warehouse: false,
          manufacturing: true,
          expeditions: false,
          otherSite: false,
          advancedWarehouse: false,
          customer: false,
        },
        manufacturingLines: "",

        originNC: {
          noticeNC: false,
          otherSite: false,
          redHoldLabel: "",
          customerIncident: false,
          residentAlert: false,
          other: "",
        },

        subjectNC: {
          components: false,
          wiresEquipped: false,
          subElements: false,
          harness: false,
          cables: false,
          severity: "",
          mfgDate: "",
        },

        defectCode: "",
        defectDescription: "",
        vehicle: "",
        family: "",
        refIndex: "",
        itemCode: "",

        quantities: {
          toControl: 300,
          controlled: 300,
          defective: 20,
        },

        ncDescription: "",

        riskOfRework: "No",
        riskOfReworkDetails: "",

        correctiveActions: {
          acceptedState: { pilot: "", date: "", qty: "", timePast: "" },
          sorting: { pilot: "", date: "", qty: "", timePast: "" },
          reworkRepair: { pilot: "", date: "", qty: "", timePast: "" },
          deviationBeforeProd: { pilot: "", date: "", qty: "", timePast: "" },
          deviationAfterProd: { pilot: "", date: "", qty: "", timePast: "" },
          changeReference: { pilot: "", date: "", qty: "", timePast: "" },
          scrap: { pilot: "", date: "", qty: "", timePast: "" },
          newManufacturing: { pilot: "", date: "", qty: "", timePast: "" },
          returnToSupplier: { pilot: "", date: "", qty: "", timePast: "" },
          others: { pilot: "", date: "", qty: "", timePast: "" },
        },

        riskActions: [
          {
            id: 1,
            action: "",
            pilot: "",
            date: "",
            successStatus: "OK",
            successCheck: "",
          },
          {
            id: 2,
            action: "",
            pilot: "",
            date: "",
            successStatus: "OK",
            successCheck: "",
          },
        ],

        comments: "",
        tracability: "",

        approvalRequests: {
          prodSegment: {
            name: "",
            status: "NOT_REQUESTED",
            requestedAt: null,
            signedBy: null,
          },
          qualitySegment: {
            name: "",
            status: "NOT_REQUESTED",
            requestedAt: null,
            signedBy: null,
          },
        },
      },
  );

  const [submitted, setSubmitted] = useState(false);
  const [requestSentNotice, setRequestSentNotice] = useState(false);
  const canEdit = canEditRole(userSession, "PRODUCTION");
  const [users, setUsers] = useState([]);

  React.useEffect(() => {
    api
      .users()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const productionLeaders = users.filter((user) => user.role === "PRODUCTION");
  const qualityReviewers = users.filter((user) => user.role === "QM");

  const isRiskEnabled = formData.riskOfRework === "Yes";

  const handleProcessChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      processType: type,
      docNo: `CARD-${type.toUpperCase()}-${nextCardSequence}`,
    }));
  };

  const handleRiskOfReworkChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      riskOfRework: value,
      riskOfReworkDetails: value === "Yes" ? prev.riskOfReworkDetails : "",
      riskActions:
        value === "Yes"
          ? prev.riskActions
          : prev.riskActions.map((r) => ({
              ...r,
              action: "",
              pilot: "",
              date: "",
              successStatus: "OK",
              successCheck: "",
            })),
    }));
  };

  const handleDefectCodeChange = (e) => {
    const inputVal = e.target.value;
    const cleanCode = inputVal.split("-")[0].trim().toUpperCase();

    const match = Array.isArray(DEFECT_CODES)
      ? DEFECT_CODES.find((item) => {
          if (!item) return false;
          const codeVal = (
            item.code ??
            item.defectCode ??
            item.id ??
            item.code_defaut ??
            ""
          )
            .toString()
            .trim()
            .toUpperCase();

          const fr = (
            item.desFr ||
            item.descriptionFr ||
            item.des_fr ||
            ""
          ).toUpperCase();
          const en = (
            item.desEng ||
            item.descriptionEng ||
            item.des_en ||
            ""
          ).toUpperCase();

          return (
            codeVal === cleanCode ||
            (cleanCode !== "" &&
              codeVal === cleanCode.padStart(codeVal.length, "0")) ||
            (cleanCode !== "" &&
              (fr.includes(cleanCode) || en.includes(cleanCode)))
          );
        })
      : null;

    let desc = "";
    if (match) {
      const frDesc = match.desFr || match.descriptionFr || match.des_fr || "";
      const enDesc = match.desEng || match.descriptionEng || match.des_en || "";
      desc =
        frDesc && enDesc && frDesc !== enDesc
          ? `${frDesc} / ${enDesc}`
          : frDesc || enDesc || "";
    }

    setFormData((prev) => ({
      ...prev,
      defectCode: cleanCode,
      defectDescription: desc,
    }));
  };

  const controlledQty = Number(formData.quantities.controlled) || 0;
  const defectiveQty = Number(formData.quantities.defective) || 0;
  const defectRate =
    controlledQty > 0
      ? ((defectiveQty / controlledQty) * 100).toFixed(1)
      : "0.0";

  const totalAllocatedMinutes = Object.values(
    formData.correctiveActions,
  ).reduce((sum, act) => sum + (parseFloat(act.timePast) || 0), 0);
  const totalAllocatedSeconds = Math.round(totalAllocatedMinutes * 60);

  const handleActionChange = (actionKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      correctiveActions: {
        ...prev.correctiveActions,
        [actionKey]: {
          ...prev.correctiveActions[actionKey],
          [field]: value,
        },
      },
    }));
  };

  const handleRiskActionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.riskActions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, riskActions: updated };
    });
  };

  const handlePrint = () => printAnnexe3Card(formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitAudit) onSubmitAudit(formData);

    if (isEditing) {
      // Edit mode: just save, no approval workflow to (re)trigger.
      setSubmitted(true);
      setRequestSentNotice(false);
      return;
    }

    if (!formData.approvalRequests.prodSegment.name.trim()) {
      alert("Please select the Production Leader before submitting.");
      return;
    }
    if (!formData.approvalRequests.qualitySegment.name.trim()) {
      alert(
        "Please select the Quality Operation Segment reviewer before submitting.",
      );
      return;
    }

    const now = new Date().toLocaleString();

    setFormData((prev) => ({
      ...prev,
      approvalRequests: {
        prodSegment: {
          ...prev.approvalRequests.prodSegment,
          status: "PENDING_REVIEW",
          requestedAt: now,
          signedBy: null,
        },
        qualitySegment: {
          ...prev.approvalRequests.qualitySegment,
          status: "PENDING_REVIEW",
          requestedAt: now,
          signedBy: null,
        },
      },
    }));

    setSubmitted(true);
    setRequestSentNotice(true);
    setNextCardSequence((prev) => prev + 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 md:p-5 flex flex-wrap justify-between items-center gap-3 border-b border-slate-700">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded uppercase tracking-wider">
              WI3006 - Annexe 3
            </span>
            <span className="text-slate-400 text-sm font-semibold">
              Enclosure 3/05.21
            </span>
          </div>
          <h1 className="text-lg md:text-2xl font-extrabold uppercase tracking-wide mt-1">
            Rework / Repair Card for Serial Defects
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-bold transition border border-slate-700 whitespace-nowrap"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <h3 className="text-2xl font-bold text-slate-800">
              {isEditing
                ? "Card Updated"
                : "Card Saved & Approval Requests Dispatched"}
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Card{" "}
              <strong className="text-blue-900 font-mono">
                {formData.docNo}
              </strong>{" "}
              has been saved.
            </p>

            {requestSentNotice && (
              <div className="bg-slate-50 border border-slate-200 text-slate-800 text-xs p-4 rounded-lg max-w-md mx-auto text-left space-y-2 shadow-sm">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-blue-900">
                  Notification Center Dispatched
                </span>
                <p>
                  • <strong>Production Leader ({formData.processType}):</strong>{" "}
                  <span className="text-blue-900 font-semibold">
                    {formData.approvalRequests.prodSegment.name}
                  </span>
                </p>
                <p>
                  • <strong>Quality Operation Segment:</strong>{" "}
                  <span className="text-blue-900 font-semibold">
                    {formData.approvalRequests.qualitySegment.name}
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                type="button"
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-lg text-xs shadow-md transition uppercase tracking-wider"
              >
                Imprimer / PDF
              </button>
              {isEditing ? (
                onBack && (
                  <button
                    onClick={onBack}
                    type="button"
                    className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold px-6 py-2.5 rounded-lg text-xs shadow-md transition uppercase tracking-wider"
                  >
                    ← Back to Dashboard
                  </button>
                )
              ) : (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setRequestSentNotice(false);
                    setFormData((prev) => ({
                      ...prev,
                      docNo: `CARD-${formData.processType.toUpperCase()}-${nextCardSequence}`,
                      approvalRequests: {
                        prodSegment: {
                          name: "",
                          status: "NOT_REQUESTED",
                          requestedAt: null,
                          signedBy: null,
                        },
                        qualitySegment: {
                          name: "",
                          status: "NOT_REQUESTED",
                          requestedAt: null,
                          signedBy: null,
                        },
                      },
                    }));
                  }}
                  type="button"
                  className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold px-6 py-2.5 rounded-lg text-xs shadow-md transition uppercase tracking-wider"
                >
                  Create New Card (`CARD-${formData.processType.toUpperCase()}-$
                  {nextCardSequence}`)
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Process Type Selector */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-wrap justify-between items-center gap-3">
              <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Select Production Process:
              </span>
              <div className="flex space-x-2">
                {["Coupe", "WPA", "WEK"].map((proc) => (
                  <button
                    key={proc}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleProcessChange(proc)}
                    className={`px-4 py-1.5 rounded-md font-bold text-xs transition ${
                      formData.processType === proc
                        ? "bg-slate-900 text-white shadow"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {proc}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Fields Wrapper */}
            <fieldset disabled={!canEdit} className="space-y-4 text-sm">
              {/* SECTION 1 : General Info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Card No.
                  </label>
                  <div className="w-full border rounded px-2.5 py-1 font-mono font-bold text-blue-900 bg-slate-100 border-slate-300 flex items-center justify-between">
                    <span>{formData.docNo}</span>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-sans font-black uppercase tracking-wider">
                      Auto
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full border rounded px-2.5 py-1 bg-white font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Segment / Line
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.segment}
                    onChange={(e) =>
                      setFormData({ ...formData, segment: e.target.value })
                    }
                    className="w-full border rounded px-2.5 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Responsible Person
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.respPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, respPerson: e.target.value })
                    }
                    className="w-full border rounded px-2.5 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 2 : Zones Affected & Origin of N.C. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-900">
                    Zones Affected by the N.C.
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { id: "reception", label: "Receiving" },
                      { id: "warehouse", label: "Warehouse" },
                      { id: "manufacturing", label: "Manufacturing" },
                      { id: "expeditions", label: "Shipping" },
                      { id: "otherSite", label: "Other Site" },
                      {
                        id: "advancedWarehouse",
                        label: "Advanced Warehouse / Surface",
                      },
                      { id: "customer", label: "Customer" },
                    ].map((z) => (
                      <label
                        key={z.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.affectedZones[z.id]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              affectedZones: {
                                ...formData.affectedZones,
                                [z.id]: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-blue-900"
                        />
                        <span>{z.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                      Manufacturing Lines Concerned:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Line A, Line B..."
                      value={formData.manufacturingLines}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufacturingLines: e.target.value,
                        })
                      }
                      className="w-full border rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-900">
                    Origin of the N.C.
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.originNC.noticeNC}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originNC: {
                              ...formData.originNC,
                              noticeNC: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Notice of the N.C.</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.originNC.otherSite}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originNC: {
                              ...formData.originNC,
                              otherSite: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Other Site</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.originNC.customerIncident}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originNC: {
                              ...formData.originNC,
                              customerIncident: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Customer Incident</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.originNC.residentAlert}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originNC: {
                              ...formData.originNC,
                              residentAlert: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>Resident Alert</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-0.5">
                        Red Hold Label No.:
                      </label>
                      <input
                        type="text"
                        value={formData.originNC.redHoldLabel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originNC: {
                              ...formData.originNC,
                              redHoldLabel: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-0.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-0.5">
                        Other:
                      </label>
                      <input
                        type="text"
                        value={formData.originNC.other}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            originNC: {
                              ...formData.originNC,
                              other: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded px-2 py-0.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3 : Subject of N.C. */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-blue-900">
                  Subject of the N.C.
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: "components", label: "Components" },
                    { id: "wiresEquipped", label: "Wires equipped" },
                    { id: "subElements", label: "Sub-elements" },
                    { id: "harness", label: "Harness" },
                    { id: "cables", label: "Cables" },
                  ].map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.subjectNC[s.id]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subjectNC: {
                              ...formData.subjectNC,
                              [s.id]: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-0.5">
                      Severity:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Critical, Major..."
                      value={formData.subjectNC.severity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectNC: {
                            ...formData.subjectNC,
                            severity: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-0.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-0.5">
                      Manufacturing date:
                    </label>
                    <input
                      type="date"
                      value={formData.subjectNC.mfgDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectNC: {
                            ...formData.subjectNC,
                            mfgDate: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-0.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4 : Defect Details & Vehicle Reference */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 mb-0.5">
                      Defect Code
                    </label>
                    <input
                      type="text"
                      list="defect-list-main"
                      placeholder="Code..."
                      value={formData.defectCode}
                      onChange={handleDefectCodeChange}
                      className="w-full border border-blue-300 rounded px-2 py-0.5 text-xs font-mono font-bold bg-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <datalist id="defect-list-main">
                      {DEFECT_CODES?.map((item, idx) => {
                        const code = (
                          item.code ??
                          item.defectCode ??
                          item.id ??
                          item.code_defaut ??
                          ""
                        )
                          .toString()
                          .trim();
                        const fr =
                          item.desFr || item.descriptionFr || item.des_fr || "";
                        const en =
                          item.desEng ||
                          item.descriptionEng ||
                          item.des_en ||
                          "";
                        return (
                          <option key={idx} value={code}>
                            {code} - {fr && en ? `${fr} / ${en}` : fr || en}
                          </option>
                        );
                      })}
                    </datalist>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-blue-900 mb-0.5">
                      Defect Description
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.defectDescription}
                      placeholder="Auto-filled..."
                      className="w-full border border-slate-200 rounded px-2 py-0.5 text-xs bg-slate-100 text-slate-800 outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                      Vehicle
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicle: e.target.value })
                      }
                      className="w-full border rounded px-2 py-0.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                      Family
                    </label>
                    <input
                      type="text"
                      value={formData.family}
                      onChange={(e) =>
                        setFormData({ ...formData, family: e.target.value })
                      }
                      className="w-full border rounded px-2 py-0.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                      Ref. + index
                    </label>
                    <input
                      type="text"
                      value={formData.refIndex}
                      onChange={(e) =>
                        setFormData({ ...formData, refIndex: e.target.value })
                      }
                      className="w-full border rounded px-2 py-0.5 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Qty to Control
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantities.toControl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantities: {
                            ...formData.quantities,
                            toControl: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-1 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Controlled Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantities.controlled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantities: {
                            ...formData.quantities,
                            controlled: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-1 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">
                      Defective Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantities.defective}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantities: {
                            ...formData.quantities,
                            defective: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded px-2 py-1 text-xs bg-white"
                    />
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <span className="block text-[10px] uppercase font-bold text-slate-500">
                      Defect Rate
                    </span>
                    <span
                      className={`text-lg font-black ${
                        Number(defectRate) > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {defectRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 5 : Description & Risk Gate */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      N.C. DESCRIPTION
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Detailed description of the issue..."
                      value={formData.ncDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ncDescription: e.target.value,
                        })
                      }
                      className="w-full border rounded p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Risk for Rework or Repair?
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRiskOfReworkChange("Yes")}
                        className={`px-4 py-1 rounded-md font-bold text-xs uppercase tracking-wider transition ${
                          formData.riskOfRework === "Yes"
                            ? "bg-red-600 text-white shadow"
                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRiskOfReworkChange("No")}
                        className={`px-4 py-1 rounded-md font-bold text-xs uppercase tracking-wider transition ${
                          formData.riskOfRework === "No"
                            ? "bg-slate-900 text-white shadow"
                            : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        No
                      </button>
                    </div>

                    {isRiskEnabled && (
                      <div className="mt-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-0.5">
                          Describe the identified risk(s):
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Identified risks regarding the rework operation..."
                          value={formData.riskOfReworkDetails}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              riskOfReworkDetails: e.target.value,
                            })
                          }
                          className="w-full border border-red-300 rounded p-2 text-xs outline-none focus:ring-1 focus:ring-red-500 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 6 : Corrective Actions Related to Risks */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                    Corrective Actions Related to Risks
                  </h3>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-1.5 border-b border-slate-700 w-1/3">
                          Action / Risk Description
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Owner / Pilot
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Completion Date
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Success Check
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {formData.riskActions.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-1">
                            <input
                              type="text"
                              disabled={!isRiskEnabled}
                              placeholder="Risk-related action..."
                              value={item.action}
                              onChange={(e) =>
                                handleRiskActionChange(
                                  idx,
                                  "action",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              disabled={!isRiskEnabled}
                              value={item.pilot}
                              onChange={(e) =>
                                handleRiskActionChange(
                                  idx,
                                  "pilot",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="date"
                              disabled={!isRiskEnabled}
                              value={item.date}
                              onChange={(e) =>
                                handleRiskActionChange(
                                  idx,
                                  "date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs font-mono disabled:bg-slate-100"
                            />
                          </td>
                          <td className="p-1 flex space-x-1">
                            <select
                              disabled={!isRiskEnabled}
                              value={item.successStatus || "OK"}
                              onChange={(e) =>
                                handleRiskActionChange(
                                  idx,
                                  "successStatus",
                                  e.target.value,
                                )
                              }
                              className="border rounded px-1 py-0.5 text-xs font-bold text-slate-700 bg-slate-50 outline-none"
                            >
                              <option value="OK">OK</option>
                              <option value="NOK">NOK</option>
                              <option value="PENDING">Pending</option>
                              <option value="N/A">N/A</option>
                            </select>
                            <input
                              type="text"
                              disabled={!isRiskEnabled}
                              placeholder="Verification details..."
                              value={item.successCheck}
                              onChange={(e) =>
                                handleRiskActionChange(
                                  idx,
                                  "successCheck",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs disabled:bg-slate-100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 7 : Corrective Actions Table */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                    Corrective Actions
                  </h3>
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Total Allocated Time: {totalAllocatedMinutes} Min (
                    {totalAllocatedSeconds} Sec)
                  </span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-1.5 border-b border-slate-700">
                          Action Type
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Owner / Pilot
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Completion Date
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Quantity
                        </th>
                        <th className="p-1.5 border-b border-slate-700">
                          Elapsed Time (min)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {[
                        { key: "acceptedState", label: "Accepted state" },
                        { key: "sorting", label: "Sorting" },
                        { key: "reworkRepair", label: "Rework / Repair" },
                        {
                          key: "deviationBeforeProd",
                          label: "Deviation before production",
                        },
                        {
                          key: "deviationAfterProd",
                          label: "Deviation after production",
                        },
                        { key: "changeReference", label: "Change reference" },
                        { key: "scrap", label: "Scrap" },
                        { key: "newManufacturing", label: "New manufacturing" },
                        {
                          key: "returnToSupplier",
                          label: "Return to Supplier",
                        },
                        { key: "others", label: "Others" },
                      ].map((row) => (
                        <tr key={row.key}>
                          <td className="p-1.5 font-medium bg-slate-50/50">
                            {row.label}
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={
                                formData.correctiveActions[row.key]?.pilot || ""
                              }
                              onChange={(e) =>
                                handleActionChange(
                                  row.key,
                                  "pilot",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="date"
                              value={
                                formData.correctiveActions[row.key]?.date || ""
                              }
                              onChange={(e) =>
                                handleActionChange(
                                  row.key,
                                  "date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs font-mono"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={
                                formData.correctiveActions[row.key]?.qty || ""
                              }
                              onChange={(e) =>
                                handleActionChange(
                                  row.key,
                                  "qty",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              step="1"
                              placeholder="Minutes"
                              value={
                                formData.correctiveActions[row.key]?.timePast ||
                                ""
                              }
                              onChange={(e) =>
                                handleActionChange(
                                  row.key,
                                  "timePast",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-0.5 border rounded text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 8 : Comments & Traceability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Comments
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Additional comments..."
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    className="w-full border rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Traceability
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Traceability info (Batch No., Lot No., etc.)..."
                    value={formData.tracability}
                    onChange={(e) =>
                      setFormData({ ...formData, tracability: e.target.value })
                    }
                    className="w-full border rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* SECTION 9 : Workflow Request & Approval Status */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                    Approval Workflow Status
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 block">
                      Production Leader ({formData.processType}):
                    </span>

                    {formData.approvalRequests.prodSegment.status ===
                    "NOT_REQUESTED" ? (
                      <select
                        required
                        value={formData.approvalRequests.prodSegment.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            approvalRequests: {
                              ...prev.approvalRequests,
                              prodSegment: {
                                ...prev.approvalRequests.prodSegment,
                                name: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full border border-blue-300 rounded px-2 py-1 text-xs font-semibold bg-blue-50/30 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Production Leader...</option>
                        {productionLeaders.map((user) => (
                          <option key={user.id} value={user.matricule}>
                            {user.nomComplet} ({user.matricule})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs font-bold text-blue-900">
                        {formData.approvalRequests.prodSegment.name}
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-700 block">
                      Quality Operation Segment:
                    </span>

                    {formData.approvalRequests.qualitySegment.status ===
                    "NOT_REQUESTED" ? (
                      <select
                        required
                        value={formData.approvalRequests.qualitySegment.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            approvalRequests: {
                              ...prev.approvalRequests,
                              qualitySegment: {
                                ...prev.approvalRequests.qualitySegment,
                                name: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full border border-blue-300 rounded px-2 py-1 text-xs font-semibold bg-blue-50/30 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Quality Reviewer...</option>
                        {qualityReviewers.map((user) => (
                          <option key={user.id} value={user.matricule}>
                            {user.nomComplet} ({user.matricule})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs font-bold text-blue-900">
                        {formData.approvalRequests.qualitySegment.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={handlePrint}
                    type="button"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold px-6 py-2.5 rounded-lg text-xs shadow transition uppercase tracking-wider"
                  >
                    Imprimer / PDF
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold px-6 py-2.5 rounded-lg text-xs shadow-md transition uppercase tracking-wider"
                  >
                    {isEditing ? "Save" : "Save & Send Approval Requests"}
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}
