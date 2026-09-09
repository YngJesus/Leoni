import React, { useEffect, useState } from "react";
import { api } from "./api";
import { canEditRole } from "./formAccess";
import { printTriagePlan } from "./printTriage";
import {
  ErrorBanner,
  FieldHint,
  fieldClass,
  generateOrderNumber,
  jumpTo,
} from "./formFeedback";

const FORM_FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
  .triage-form { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; }
  .triage-form .fm { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
`;

const STATIONS = [
  { id: "s1", num: "01", label: "Données", owner: "Production" },
  { id: "s2", num: "02", label: "Triage & décision", owner: "Production" },
  { id: "s3", num: "03", label: "Retouche", owner: "PE" },
  { id: "s4", num: "04", label: "Contrôle", owner: "QM" },
];

const STATION_STYLES = {
  Production: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    ring: "ring-amber-500",
    tabActive: "border-amber-500 text-amber-800 bg-white",
    headerBg: "bg-amber-50",
    headerTag: "bg-amber-500 text-white",
    button: "bg-amber-500 hover:bg-amber-600 text-slate-950",
  },
  PE: {
    dot: "bg-sky-600",
    text: "text-sky-800",
    ring: "ring-sky-600",
    tabActive: "border-sky-600 text-sky-800 bg-white",
    headerBg: "bg-sky-50",
    headerTag: "bg-sky-600 text-white",
    button: "bg-sky-700 hover:bg-sky-800 text-white",
  },
  QM: {
    dot: "bg-emerald-600",
    text: "text-emerald-800",
    ring: "ring-emerald-600",
    tabActive: "border-emerald-600 text-emerald-800 bg-white",
    headerBg: "bg-emerald-50",
    headerTag: "bg-emerald-600 text-white",
    button: "bg-emerald-700 hover:bg-emerald-800 text-white",
  },
};

const emptyInstruction = () => ({
  id: Date.now(),
  description: "",
  responsible: "PE",
  deadline: "",
  estimatedTime: "",
});

const emptyControl = () => ({
  id: Date.now(),
  description: "",
  responsible: "Quality",
  deadline: "",
  estimatedTime: "",
});

const emptyRisk = () => ({
  id: Date.now(),
  riskDescription: "",
  action: "",
  responsible: "QM",
  deadline: "",
});

export function TriageInbox({ userSession, onOpenPlan, onCreateNew, onBack }) {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const canCreate = canEditRole(userSession, "PRODUCTION");

  useEffect(() => {
    const loader =
      userSession?.role === "ADMIN" ? api.triagePlans() : api.triageMine();
    loader.then(setPlans).catch((err) => setError(err.message));
  }, [userSession?.role]);

  const statusStyle = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s.includes("SCRAP") || s.includes("REBUT"))
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    if (s.includes("CLOS") || s.includes("DONE") || s.includes("VALID"))
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  };

  return (
    <div className="triage-form mx-auto max-w-4xl space-y-6">
      <style>{FORM_FONTS}</style>
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="fm text-[11px] font-semibold tracking-wide text-slate-400">
            IT TN 3067 · Annexe 2
          </p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-slate-900">
            Plans de triage et de retouche
          </h1>
          <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-slate-500">
            Une seule fiche par ID. Production, PE et QM remplissent chacun
            leurs champs ; la fiche complète reste consultable et imprimable à
            tout moment.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {canCreate && (
            <button
              type="button"
              onClick={onCreateNew}
              className="rounded-md bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Nouvelle fiche
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-slate-300 px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Retour
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700 ring-1 ring-inset ring-red-200">
          {error}
        </p>
      )}

      <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {plans.length ? (
          plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onOpenPlan(plan)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="fm truncate text-[13px] font-semibold text-slate-900">
                  {plan.numFicheRetouche || "Sans numéro"}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-slate-500">
                  {plan.numOrdre} · {plan.numSerie} · {plan.motifBlocage}
                </p>
                <p className="fm mt-1 text-[10px] text-slate-400">
                  ID {plan.id}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-2">
                {userSession?.role === "ADMIN" && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      printTriagePlan(plan);
                    }}
                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Imprimer
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                    plan.status,
                  )}`}
                >
                  {plan.status || "PENDING"}
                </span>
              </span>
            </button>
          ))
        ) : (
          <p className="p-10 text-center text-[13px] text-slate-400">
            Aucune fiche assignée pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ReworkPlanForm({
  userSession,
  onBack,
  onSaved,
  initialData,
  autoPrint,
}) {
  const [activeSection, setActiveSection] = useState("s1");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [planId, setPlanId] = useState(initialData?.id || null);
  const [users, setUsers] = useState([]);

  const generateReworkSheetNumber = () => {
    const today = new Date();
    return `FR-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const [generalData, setGeneralData] = useState({
    date: new Date().toISOString().split("T")[0],
    orderNumber: generateOrderNumber(),
    reworkSheetNumber: generateReworkSheetNumber(),
    serialNumber: "",
    blockedQty: 1,
    reworkReason: "",
  });
  const [responsibles, setResponsibles] = useState({
    productionEngineering: { name: "" },
    qualityQM: { name: "" },
  });
  const [triageCriteria, setTriageCriteria] = useState([
    {
      id: 1,
      criterion: "",
      harnessOrBoxRef: "",
      matricules: userSession?.matricule || "",
      estimatedTime: "",
    },
  ]);
  const [triageResults, setTriageResults] = useState({
    conformingQty: 0,
    nonConformingQty: 0,
    actualTriageTime: "",
  });
  const [decision, setDecision] = useState({ action: "Rework", argument: "" });
  const [workInstructions, setWorkInstructions] = useState([
    emptyInstruction(),
  ]);
  const [hasRisk, setHasRisk] = useState("Non");
  const [controlPoints, setControlPoints] = useState([emptyControl()]);
  const [riskAnalysis, setRiskAnalysis] = useState([emptyRisk()]);

  const peUsers = users.filter((user) => user.role === "PE");
  const qmUsers = users.filter((user) => user.role === "QM");
  const canEditProduction = canEditRole(userSession, "PRODUCTION");
  const canEditPe = canEditRole(userSession, "PE");
  const canEditQm = canEditRole(userSession, "QM");
  const isScrap = decision.action === "Scrap";
  const displaySite = userSession.site || initialData?.siteName || "";
  const displayOem = userSession.client || initialData?.clientOemName || "";
  const hasFieldError = (id) => fieldErrors.some((item) => item.id === id);

  const productionDone = Boolean(
    generalData.serialNumber && generalData.reworkReason && decision.argument,
  );
  const peDone =
    isScrap || workInstructions.some((i) => String(i.description || "").trim());
  const qmDone = controlPoints.some((i) => String(i.description || "").trim());
  const stationDone = {
    s1: productionDone,
    s2: productionDone,
    s3: peDone,
    s4: qmDone,
  };

  useEffect(() => {
    api
      .users()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (!initialData?.id && !initialData?.numFicheRetouche) return;
    setPlanId(initialData.id || null);
    setGeneralData((current) => ({
      ...current,
      date: String(initialData.date || current.date).slice(0, 10),
      orderNumber: initialData.numOrdre || "",
      reworkSheetNumber:
        initialData.numFicheRetouche || current.reworkSheetNumber,
      serialNumber: initialData.numSerie || "",
      blockedQty: initialData.quantiteBloquee || 0,
      reworkReason: initialData.motifBlocage || "",
    }));
    setResponsibles({
      productionEngineering: {
        name: initialData.assignedPeMatricule || "",
      },
      qualityQM: { name: initialData.assignedQmMatricule || "" },
    });
    setTriageCriteria(
      (initialData.criteresTriage || []).map((item, index) => ({
        id: item.id || index + 1,
        criterion: item.critere || "",
        harnessOrBoxRef: item.reperageCablagesCaisse || "",
        matricules: item.matriculeExecuteur || "",
        estimatedTime: item.tempsPrevu || "",
      })),
    );
    setTriageResults({
      conformingQty: initialData.quantiteConforme || 0,
      nonConformingQty: initialData.quantiteNonConforme || 0,
      actualTriageTime: initialData.tempsReelTriage || "",
    });
    setDecision({
      action: initialData.decision?.includes("REBUT") ? "Scrap" : "Rework",
      argument: initialData.justificationDecision || "",
    });
    setWorkInstructions(
      (initialData.instructionsRetouche || []).length
        ? initialData.instructionsRetouche.map((item, index) => ({
            id: item.id || index + 1,
            description: item.descriptionEtape || "",
            responsible: item.responsable || "PE",
            deadline: item.delai || "",
            estimatedTime: item.tempsPrevu || "",
          }))
        : [emptyInstruction()],
    );
    setControlPoints(
      (initialData.pointsControle || []).length
        ? initialData.pointsControle.map((item, index) => ({
            id: item.id || index + 1,
            description: item.descriptionControle || "",
            responsible: item.responsable || "Quality",
            deadline: item.delai || "",
            estimatedTime: item.tempsPrevu || "",
          }))
        : [emptyControl()],
    );
    setRiskAnalysis(
      (initialData.analysesRisques || []).length
        ? initialData.analysesRisques.map((item, index) => ({
            id: item.id || index + 1,
            riskDescription: item.risquePotentiel || "",
            action: item.actionPreventive || "",
            responsible: item.responsable || "QM",
            deadline: item.delai || "",
          }))
        : [emptyRisk()],
    );
    setHasRisk(initialData.hasPotentialRisks ? "Oui" : "Non");
  }, [initialData]);

  const productionPayload = () => ({
    date: generalData.date,
    numOrdre: generalData.orderNumber,
    numSerie: generalData.serialNumber,
    quantiteBloquee: Number(generalData.blockedQty),
    numFicheRetouche: generalData.reworkSheetNumber,
    motifBlocage: generalData.reworkReason,
    siteName: displaySite,
    clientOemName: displayOem,
    assignedPeMatricule: responsibles.productionEngineering.name || undefined,
    assignedQmMatricule: responsibles.qualityQM.name,
    criteresTriage: triageCriteria.map((item) => ({
      critere: item.criterion,
      reperageCablagesCaisse: item.harnessOrBoxRef,
      matriculeExecuteur: item.matricules || userSession.matricule,
      tempsPrevu: item.estimatedTime,
    })),
    quantiteConforme: Number(triageResults.conformingQty),
    quantiteNonConforme: Number(triageResults.nonConformingQty),
    tempsReelTriage: triageResults.actualTriageTime,
    decision:
      decision.action === "Scrap"
        ? "REBUTER (SCRAP)"
        : "Réparer et / ou Retoucher",
    justificationDecision: decision.argument,
  });

  const buildPrintSnapshot = () => ({
    id: planId,
    status: initialData?.status,
    date: generalData.date,
    numOrdre: generalData.orderNumber,
    numFicheRetouche: generalData.reworkSheetNumber,
    numSerie: generalData.serialNumber,
    quantiteBloquee: Number(generalData.blockedQty),
    motifBlocage: generalData.reworkReason,
    siteName: displaySite,
    clientOemName: displayOem,
    createdByMatricule:
      initialData?.createdByMatricule || userSession?.matricule,
    assignedPeMatricule: responsibles.productionEngineering.name,
    productionEngineeringMatricule: responsibles.productionEngineering.name,
    assignedQmMatricule: responsibles.qualityQM.name,
    criteresTriage: triageCriteria.map((item) => ({
      critere: item.criterion,
      reperageCablagesCaisse: item.harnessOrBoxRef,
      matriculeExecuteur: item.matricules || userSession?.matricule,
      tempsPrevu: item.estimatedTime,
    })),
    quantiteConforme: Number(triageResults.conformingQty),
    quantiteNonConforme: Number(triageResults.nonConformingQty),
    tempsReelTriage: triageResults.actualTriageTime,
    decision:
      decision.action === "Scrap"
        ? "REBUTER (SCRAP)"
        : "Réparer et / ou Retoucher",
    justificationDecision: decision.argument,
    instructionsRetouche: workInstructions.map((item) => ({
      descriptionEtape: item.description,
      responsable: item.responsible,
      delai: item.deadline,
      tempsPrevu: item.estimatedTime,
    })),
    pointsControle: controlPoints.map((item) => ({
      descriptionControle: item.description,
      responsable: item.responsible,
      delai: item.deadline,
      tempsPrevu: item.estimatedTime,
    })),
    hasPotentialRisks: hasRisk === "Oui",
    analysesRisques:
      hasRisk === "Oui"
        ? riskAnalysis.map((item) => ({
            risquePotentiel: item.riskDescription,
            actionPreventive: item.action,
            responsable: item.responsible,
            delai: item.deadline,
          }))
        : [],
    qmMatriculeValidation: userSession?.matricule,
  });

  const handlePrint = () => {
    printTriagePlan(buildPrintSnapshot());
  };

  useEffect(() => {
    if (autoPrint && initialData) {
      const timer = window.setTimeout(
        () => printTriagePlan(buildPrintSnapshot()),
        400,
      );
      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint, initialData]);

  const persist = async (action) => {
    setSaving(true);
    setNotice("");
    setFieldErrors([]);
    try {
      const saved = await action();
      const full = saved?.id ? await api.triagePlan(saved.id) : saved;
      setPlanId(full.id);
      if (onSaved) onSaved(full);
      setNotice(
        "Fiche enregistrée. Production, PE et QM complètent la même fiche ; ouvrez-la pour voir tous les champs.",
      );
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  };

  const showErrors = (errors, section) => {
    setFieldErrors(errors);
    setNotice(
      "Impossible d'enregistrer : des champs obligatoires sont vides. Ils sont marqués en rouge.",
    );
    if (section) setActiveSection(section);
    jumpTo(errors[0]?.id);
  };

  const saveProduction = () => {
    const errors = [];
    if (!String(generalData.serialNumber || "").trim()) {
      errors.push({ id: "field-serial", label: "N° de série" });
    }
    if (!Number(generalData.blockedQty)) {
      errors.push({ id: "field-qty", label: "Quantité bloquée" });
    }
    if (!String(generalData.reworkReason || "").trim()) {
      errors.push({ id: "field-reason", label: "Motif du triage" });
    }
    if (!responsibles.qualityQM.name) {
      errors.push({ id: "field-qm", label: "Responsable Qualité (QM)" });
    }
    if (!triageCriteria.some((item) => String(item.criterion || "").trim())) {
      errors.push({ id: "field-criterion-0", label: "Critère de triage" });
    }
    if (!String(decision.argument || "").trim()) {
      errors.push({ id: "field-justification", label: "Justification" });
    }
    if (errors.length) {
      showErrors(
        errors,
        errors[0].id.startsWith("field-criterion") ||
          errors[0].id === "field-qm" ||
          errors[0].id === "field-justification"
          ? "s2"
          : "s1",
      );
      return;
    }
    persist(() =>
      planId
        ? api.updateTriageProduction(planId, productionPayload())
        : api.createTriagePlan(productionPayload()),
    );
  };

  const savePe = () => {
    if (!planId) {
      setNotice("Ouvrez une fiche existante créée par Production.");
      return;
    }
    const errors = [];
    if (
      !workInstructions.some((item) => String(item.description || "").trim())
    ) {
      errors.push({ id: "field-pe-0", label: "Étape de retouche PE" });
    }
    if (errors.length) {
      showErrors(errors, "s3");
      return;
    }
    persist(() =>
      api.updateTriagePe(planId, {
        instructionsRetouche: workInstructions.map((item) => ({
          descriptionEtape: item.description,
          responsable: item.responsible,
          delai: item.deadline,
          tempsPrevu: item.estimatedTime,
        })),
      }),
    );
  };

  const saveQm = () => {
    if (!planId) {
      setNotice("Ouvrez une fiche existante créée par Production.");
      return;
    }
    const errors = [];
    if (!controlPoints.some((item) => String(item.description || "").trim())) {
      errors.push({ id: "field-qm-ctrl-0", label: "Point de contrôle QM" });
    }
    if (hasRisk === "Oui") {
      riskAnalysis.forEach((item, index) => {
        if (!String(item.riskDescription || "").trim()) {
          errors.push({
            id: `field-risk-${index}`,
            label: `Risque ${index + 1}`,
          });
        }
      });
    }
    if (errors.length) {
      showErrors(errors, "s4");
      return;
    }
    persist(() =>
      api.updateTriageQm(planId, {
        pointsControle: controlPoints.map((item) => ({
          descriptionControle: item.description,
          responsable: item.responsible,
          delai: item.deadline,
          tempsPrevu: item.estimatedTime,
        })),
        hasPotentialRisks: hasRisk === "Oui",
        analysesRisques:
          hasRisk === "Oui"
            ? riskAnalysis.map((item) => ({
                risquePotentiel: item.riskDescription,
                actionPreventive: item.action,
                responsable: item.responsible,
                delai: item.deadline,
              }))
            : [],
        qmMatriculeValidation: userSession.matricule,
      }),
    );
  };

  const goTo = (id) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Routing strip: each station shows its number, who owns it, and a
  // small filled dot once that station's minimum content is present.
  const stationTab = (station) => {
    const isActive = activeSection === station.id;
    const styles = STATION_STYLES[station.owner];
    const isS3AndScrap = station.id === "s3" && isScrap;
    return (
      <button
        key={station.id}
        type="button"
        onClick={() => goTo(station.id)}
        className={`group relative flex flex-1 items-center gap-2.5 border-b-2 px-3 py-3.5 text-left transition-colors ${
          isActive
            ? styles.tabActive
            : "border-transparent text-slate-400 hover:text-slate-600"
        }`}
      >
        <span
          className={`fm flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
            isActive
              ? `${styles.dot} text-white`
              : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
          }`}
        >
          {station.num}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold leading-tight">
            {isS3AndScrap ? "Retouche · N/A" : station.label}
          </span>
          <span className="block truncate text-[10px] uppercase tracking-wide opacity-70">
            {station.owner}
          </span>
        </span>
        {stationDone[station.id] && !isS3AndScrap && (
          <span
            className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
            title="Renseigné"
          />
        )}
      </button>
    );
  };

  const sectionHeader = (owner, title, description) => {
    const styles = STATION_STYLES[owner];
    return (
      <div
        className={`flex items-start gap-3 rounded-lg ${styles.headerBg} px-4 py-3`}
      >
        <span
          className={`mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.headerTag}`}
        >
          {owner}
        </span>
        <div>
          <p className={`text-[13px] font-semibold ${styles.text}`}>{title}</p>
          <p className="text-[12px] text-slate-500">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="triage-form mx-auto max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <style>{FORM_FONTS}</style>

      {/* Header — reads like the stamped top strip of the paper traveler */}
      <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900 p-5 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="fm rounded bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-slate-950">
              IT TN 3067 · Annexe 2
            </span>
            <span className="text-[12px] font-medium text-slate-400">
              État 01.2023
            </span>
          </div>
          <h1 className="mt-2 text-xl font-bold leading-tight md:text-2xl">
            Plan de triage et de retouche / réparation
          </h1>
          <p className="fm mt-1 text-[12px] text-slate-400">
            {planId ? `Fiche ${planId.slice(0, 8)}…` : "Nouvelle fiche"} ·{" "}
            {generalData.reworkSheetNumber}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-[13px] font-semibold text-slate-100 transition-colors hover:bg-slate-700"
          >
            Imprimer la fiche complète
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-[13px] font-semibold text-slate-100 transition-colors hover:bg-slate-700"
            >
              ← Retour
            </button>
          )}
        </div>
      </div>

      {/* Routing strip */}
      <div className="sticky top-0 z-20 flex border-b border-slate-200 bg-white">
        {STATIONS.map(stationTab)}
      </div>

      {notice && (
        <div
          className={`mx-6 mt-4 rounded-md px-4 py-3 text-[13px] font-medium ${
            fieldErrors.length
              ? "border border-red-300 bg-red-50 text-red-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice}
        </div>
      )}
      <ErrorBanner errors={fieldErrors} />

      <div className="space-y-10 p-6">
        {/* Section 1 — Données */}
        <section id="s1" className="scroll-mt-20 space-y-4">
          {sectionHeader(
            "Production",
            "Section 1 · Données",
            "Informations générales de blocage.",
          )}
          <fieldset
            disabled={!canEditProduction}
            className={!canEditProduction ? "opacity-60" : ""}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Date</span>
                <input
                  type="date"
                  value={generalData.date}
                  readOnly
                  className="fm bg-transparent font-semibold text-slate-800 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">N° d'ordre</span>
                <input
                  id="field-ordre"
                  type="text"
                  readOnly
                  value={generalData.orderNumber}
                  className="fm rounded border border-slate-300 bg-white px-2.5 py-1 text-[13px] font-bold text-slate-800"
                />
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  Auto
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
              <div className="bg-slate-800 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-wide text-white">
                Données générales
              </div>
              <div className="grid grid-cols-1 gap-4 divide-y divide-slate-200 p-4 md:grid-cols-3 md:gap-5 md:divide-x md:divide-y-0">
                <div className="pt-4 first:pt-0 md:pl-5 md:pt-0 first:md:pl-0">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Site LEONI
                  </label>
                  <div className="mt-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700">
                    {displaySite || "Non renseigné"}
                  </div>
                </div>
                <div className="pt-4 md:pl-5 md:pt-0">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Projet client (OEM)
                  </label>
                  <div className="mt-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700">
                    {displayOem || "Non renseigné"}
                  </div>
                </div>
                <div className="pt-4 md:pl-5 md:pt-0">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    N° de série
                  </label>
                  <input
                    id="field-serial"
                    type="text"
                    value={generalData.serialNumber}
                    onChange={(e) =>
                      setGeneralData({
                        ...generalData,
                        serialNumber: e.target.value,
                      })
                    }
                    className={fieldClass(
                      hasFieldError("field-serial"),
                      "fm mt-1 w-full rounded px-2.5 py-1.5 text-[13px]",
                    )}
                  />
                  <FieldHint show={hasFieldError("field-serial")}>
                    Champ obligatoire
                  </FieldHint>
                </div>
                <div className="pt-4 md:pl-5 md:pt-0">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Quantité bloquée
                  </label>
                  <input
                    id="field-qty"
                    type="number"
                    min="1"
                    value={generalData.blockedQty}
                    onChange={(e) =>
                      setGeneralData({
                        ...generalData,
                        blockedQty: Number(e.target.value),
                      })
                    }
                    className={fieldClass(
                      hasFieldError("field-qty"),
                      "mt-1 w-full rounded px-2.5 py-1.5 text-[13px] font-semibold",
                    )}
                  />
                  <FieldHint show={hasFieldError("field-qty")}>
                    Champ obligatoire
                  </FieldHint>
                </div>
                <div className="pt-4 md:pl-5 md:pt-0">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    N° de fiche
                  </label>
                  <input
                    type="text"
                    value={generalData.reworkSheetNumber}
                    readOnly
                    className="fm mt-1 w-full rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[12px] font-semibold text-slate-700">
                Motif du triage *
              </label>
              <textarea
                id="field-reason"
                rows="3"
                value={generalData.reworkReason}
                onChange={(e) =>
                  setGeneralData({
                    ...generalData,
                    reworkReason: e.target.value,
                  })
                }
                className={fieldClass(
                  hasFieldError("field-reason"),
                  "mt-1 w-full rounded-md p-2.5 text-[13px]",
                )}
              />
              <FieldHint show={hasFieldError("field-reason")}>
                Champ obligatoire
              </FieldHint>
            </div>
          </fieldset>
        </section>

        {/* Section 2 — Triage & décision */}
        <section id="s2" className="scroll-mt-20 space-y-4">
          {sectionHeader(
            "Production",
            "Section 2 · Triage et décision",
            "Approuveurs, critères de triage et décision.",
          )}
          <fieldset
            disabled={!canEditProduction}
            className={!canEditProduction ? "opacity-60" : ""}
          >
            <div className="overflow-hidden rounded-md border border-slate-200">
              <div className="bg-slate-800 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-wide text-white">
                Responsables &amp; approuveurs
              </div>
              <div className="grid grid-cols-1 gap-4 divide-y divide-slate-200 p-4 md:grid-cols-3 md:gap-5 md:divide-x md:divide-y-0">
                <div className="pt-4 first:pt-0 md:pl-5 md:pt-0 first:md:pl-0">
                  <span className="block text-[11px] font-semibold text-slate-500">
                    Production
                  </span>
                  <div className="mt-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-semibold text-slate-700">
                    {userSession?.username || userSession?.matricule}
                  </div>
                </div>
                <div className="pt-4 md:pl-5 md:pt-0">
                  <span className="block text-[11px] font-semibold text-slate-500">
                    Production Engineering
                  </span>
                  <select
                    value={responsibles.productionEngineering.name}
                    onChange={(e) =>
                      setResponsibles({
                        ...responsibles,
                        productionEngineering: { name: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 text-[13px]"
                  >
                    <option value="">— Sélectionner un PE —</option>
                    {peUsers.map((pe) => (
                      <option key={pe.id} value={pe.matricule}>
                        {pe.nomComplet} ({pe.matricule})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 md:pl-5 md:pt-0">
                  <span className="block text-[11px] font-semibold text-sky-800">
                    Qualité (QM) *
                  </span>
                  <select
                    id="field-qm"
                    value={responsibles.qualityQM.name}
                    onChange={(e) =>
                      setResponsibles({
                        ...responsibles,
                        qualityQM: { name: e.target.value },
                      })
                    }
                    className={fieldClass(
                      hasFieldError("field-qm"),
                      "mt-1 w-full rounded px-2.5 py-1.5 text-[13px]",
                    )}
                  >
                    <option value="">— Sélectionner un QM —</option>
                    {qmUsers.map((qm) => (
                      <option key={qm.id} value={qm.matricule}>
                        {qm.nomComplet} ({qm.matricule})
                      </option>
                    ))}
                  </select>
                  <FieldHint show={hasFieldError("field-qm")}>
                    Champ obligatoire
                  </FieldHint>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                Critères de triage
              </h3>
              <button
                type="button"
                onClick={() =>
                  setTriageCriteria([
                    ...triageCriteria,
                    {
                      id: Date.now(),
                      criterion: "",
                      harnessOrBoxRef: "",
                      matricules: userSession?.matricule || "",
                      estimatedTime: "",
                    },
                  ])
                }
                className="rounded-md border border-slate-300 px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                + Ajouter
              </button>
            </div>
            <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-slate-800 text-[11px] uppercase tracking-wide text-white">
                    <th className="p-2.5 font-semibold">Critère</th>
                    <th className="p-2.5 font-semibold">Repérage</th>
                    <th className="p-2.5 font-semibold">Matricule</th>
                    <th className="p-2.5 font-semibold">Temps prévu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {triageCriteria.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="odd:bg-white even:bg-slate-50/60"
                    >
                      <td className="p-2">
                        <input
                          id={idx === 0 ? "field-criterion-0" : undefined}
                          className={fieldClass(
                            hasFieldError("field-criterion-0") && idx === 0,
                            "w-full rounded px-2 py-1.5",
                          )}
                          value={item.criterion}
                          onChange={(e) => {
                            const next = [...triageCriteria];
                            next[idx].criterion = e.target.value;
                            setTriageCriteria(next);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1.5"
                          value={item.harnessOrBoxRef}
                          onChange={(e) => {
                            const next = [...triageCriteria];
                            next[idx].harnessOrBoxRef = e.target.value;
                            setTriageCriteria(next);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="fm w-full rounded border border-slate-300 px-2 py-1.5"
                          value={item.matricules}
                          onChange={(e) => {
                            const next = [...triageCriteria];
                            next[idx].matricules = e.target.value;
                            setTriageCriteria(next);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1.5"
                          value={item.estimatedTime}
                          onChange={(e) => {
                            const next = [...triageCriteria];
                            next[idx].estimatedTime = e.target.value;
                            setTriageCriteria(next);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-[13px] md:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700">
                  Quantité conforme
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 font-semibold"
                  value={triageResults.conformingQty}
                  onChange={(e) =>
                    setTriageResults({
                      ...triageResults,
                      conformingQty: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-red-700">
                  Quantité non conforme
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5 font-semibold"
                  value={triageResults.nonConformingQty}
                  onChange={(e) =>
                    setTriageResults({
                      ...triageResults,
                      nonConformingQty: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500">
                  Temps réel
                </label>
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-2.5 py-1.5"
                  value={triageResults.actualTriageTime}
                  onChange={(e) =>
                    setTriageResults({
                      ...triageResults,
                      actualTriageTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-[13px]">
              <label className="block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                Décision suite au triage *
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                <label className="flex cursor-pointer items-center gap-1.5 text-slate-700">
                  <input
                    type="radio"
                    className="accent-emerald-600"
                    checked={decision.action === "Rework"}
                    onChange={() =>
                      setDecision({ ...decision, action: "Rework" })
                    }
                  />
                  Réparer et / ou retoucher
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 font-semibold text-red-700">
                  <input
                    type="radio"
                    className="accent-red-600"
                    checked={decision.action === "Scrap"}
                    onChange={() =>
                      setDecision({ ...decision, action: "Scrap" })
                    }
                  />
                  Rebuter (scrap)
                </label>
              </div>
              <input
                id="field-justification"
                className={fieldClass(
                  hasFieldError("field-justification"),
                  "w-full rounded px-3 py-2",
                )}
                placeholder="Justification…"
                value={decision.argument}
                onChange={(e) =>
                  setDecision({ ...decision, argument: e.target.value })
                }
              />
              <FieldHint show={hasFieldError("field-justification")}>
                Champ obligatoire
              </FieldHint>
            </div>
          </fieldset>
          {canEditProduction && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={saveProduction}
                className="rounded-md bg-amber-500 px-5 py-2.5 text-[13px] font-bold text-slate-950 transition-colors hover:bg-amber-600 disabled:opacity-60"
              >
                Enregistrer la partie Production
              </button>
            </div>
          )}
        </section>

        {/* Section 3 — Retouche PE */}
        <section
          id="s3"
          className={`scroll-mt-20 space-y-4 ${isScrap ? "opacity-50" : ""}`}
        >
          {sectionHeader(
            "PE",
            "Section 3 · Retouche",
            "Instruction et méthode de retouche.",
          )}
          {isScrap ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
              Section verrouillée : décision de rebut.
            </p>
          ) : (
            <fieldset
              disabled={!canEditPe}
              className={!canEditPe ? "opacity-60" : ""}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                  Méthode et instruction de travail
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setWorkInstructions([
                      ...workInstructions,
                      emptyInstruction(),
                    ])
                  }
                  className="rounded-md border border-slate-300 px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  + Ajouter
                </button>
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="bg-slate-800 text-[11px] uppercase tracking-wide text-white">
                      <th className="p-2.5 font-semibold">Étape</th>
                      <th className="p-2.5 font-semibold">Resp.</th>
                      <th className="p-2.5 font-semibold">Délai</th>
                      <th className="p-2.5 font-semibold">Temps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {workInstructions.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="odd:bg-white even:bg-slate-50/60"
                      >
                        <td className="p-2">
                          <input
                            id={idx === 0 ? "field-pe-0" : undefined}
                            className={fieldClass(
                              hasFieldError("field-pe-0") && idx === 0,
                              "w-full rounded px-2 py-1.5",
                            )}
                            value={item.description}
                            onChange={(e) => {
                              const next = [...workInstructions];
                              next[idx].description = e.target.value;
                              setWorkInstructions(next);
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1.5"
                            value={item.responsible}
                            onChange={(e) => {
                              const next = [...workInstructions];
                              next[idx].responsible = e.target.value;
                              setWorkInstructions(next);
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1.5"
                            value={item.deadline}
                            onChange={(e) => {
                              const next = [...workInstructions];
                              next[idx].deadline = e.target.value;
                              setWorkInstructions(next);
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1.5"
                            value={item.estimatedTime}
                            onChange={(e) => {
                              const next = [...workInstructions];
                              next[idx].estimatedTime = e.target.value;
                              setWorkInstructions(next);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </fieldset>
          )}
          {canEditPe && !isScrap && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={savePe}
                className="rounded-md bg-sky-700 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-sky-800 disabled:opacity-60"
              >
                Enregistrer la partie PE
              </button>
            </div>
          )}
        </section>

        {/* Section 4 — Contrôle QM */}
        <section id="s4" className="scroll-mt-20 space-y-4">
          {sectionHeader(
            "QM",
            "Section 4 · Contrôle",
            "Contrôle, risques et clôture.",
          )}
          <fieldset
            disabled={!canEditQm}
            className={!canEditQm ? "opacity-60" : ""}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                Points de contrôle
              </h3>
              <button
                type="button"
                onClick={() =>
                  setControlPoints([...controlPoints, emptyControl()])
                }
                className="rounded-md border border-slate-300 px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                + Ajouter
              </button>
            </div>
            <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-slate-800 text-[11px] uppercase tracking-wide text-white">
                    <th className="p-2.5 font-semibold">Contrôle</th>
                    <th className="p-2.5 font-semibold">Resp.</th>
                    <th className="p-2.5 font-semibold">Délai</th>
                    <th className="p-2.5 font-semibold">Temps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {controlPoints.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="odd:bg-white even:bg-slate-50/60"
                    >
                      <td className="p-2">
                        <input
                          id={idx === 0 ? "field-qm-ctrl-0" : undefined}
                          className={fieldClass(
                            hasFieldError("field-qm-ctrl-0") && idx === 0,
                            "w-full rounded px-2 py-1.5",
                          )}
                          value={item.description}
                          onChange={(e) => {
                            const next = [...controlPoints];
                            next[idx].description = e.target.value;
                            setControlPoints(next);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1.5"
                          value={item.responsible}
                          onChange={(e) => {
                            const next = [...controlPoints];
                            next[idx].responsible = e.target.value;
                            setControlPoints(next);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1.5"
                          value={item.deadline}
                          onChange={(e) => {
                            const next = [...controlPoints];
                            next[idx].deadline = e.target.value;
                            setControlPoints(next);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1.5"
                          value={item.estimatedTime}
                          onChange={(e) => {
                            const next = [...controlPoints];
                            next[idx].estimatedTime = e.target.value;
                            setControlPoints(next);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-[13px]">
              <label className="block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                Risques potentiels ?
              </label>
              <div className="mt-2 flex gap-6">
                <label className="flex cursor-pointer items-center gap-1.5 text-slate-700">
                  <input
                    type="radio"
                    className="accent-amber-600"
                    checked={hasRisk === "Oui"}
                    onChange={() => setHasRisk("Oui")}
                  />
                  Oui
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-slate-700">
                  <input
                    type="radio"
                    className="accent-slate-600"
                    checked={hasRisk === "Non"}
                    onChange={() => setHasRisk("Non")}
                  />
                  Non
                </label>
              </div>
            </div>

            <div
              className={
                hasRisk === "Non"
                  ? "pointer-events-none mt-4 opacity-40"
                  : "mt-4"
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-slate-700">
                  Analyse des risques
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setRiskAnalysis([...riskAnalysis, emptyRisk()])
                  }
                  className="rounded-md border border-slate-300 px-2.5 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  + Ajouter
                </button>
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="bg-slate-800 text-[11px] uppercase tracking-wide text-white">
                      <th className="p-2.5 font-semibold">Risque</th>
                      <th className="p-2.5 font-semibold">Action</th>
                      <th className="p-2.5 font-semibold">Resp.</th>
                      <th className="p-2.5 font-semibold">Délai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {riskAnalysis.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="odd:bg-white even:bg-slate-50/60"
                      >
                        <td className="p-2">
                          <input
                            id={`field-risk-${idx}`}
                            className={fieldClass(
                              hasFieldError(`field-risk-${idx}`),
                              "w-full rounded px-2 py-1.5",
                            )}
                            value={item.riskDescription}
                            onChange={(e) => {
                              const next = [...riskAnalysis];
                              next[idx].riskDescription = e.target.value;
                              setRiskAnalysis(next);
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1.5"
                            value={item.action}
                            onChange={(e) => {
                              const next = [...riskAnalysis];
                              next[idx].action = e.target.value;
                              setRiskAnalysis(next);
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1.5"
                            value={item.responsible}
                            onChange={(e) => {
                              const next = [...riskAnalysis];
                              next[idx].responsible = e.target.value;
                              setRiskAnalysis(next);
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1.5"
                            value={item.deadline}
                            onChange={(e) => {
                              const next = [...riskAnalysis];
                              next[idx].deadline = e.target.value;
                              setRiskAnalysis(next);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </fieldset>
          {canEditQm && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={saveQm}
                className="rounded-md bg-emerald-700 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
              >
                Valider la partie QM
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
