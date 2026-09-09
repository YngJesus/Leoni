import React, { useEffect, useState } from "react";
import Header from "./layout/Header";
import Step1Auth from "./auth/Step1Auth";
import Step2Perimeter from "./auth/Step2Auth";
import ModuleSelector from "./dashboard/ModuleSelector";
import ProductAudit from "./ProductAudit";
import IntersegmentAudit from "./IntersegmentAudit";
import ReworkPlanForm, { TriageInbox } from "./ReworkPlan";
import { printTriagePlan } from "./printTriage";
import DefectEntry from "./DefectEntry";
import AdminDashboard from "./dashboard/AdminDashboard";
import History from "./History";
import { api, clearSession } from "./api";

function readSavedSession() {
  try {
    return JSON.parse(localStorage.getItem("leoni_user_session") || "null");
  } catch {
    localStorage.removeItem("leoni_user_session");
    return null;
  }
}

export default function App() {
  const savedSession = readSavedSession();
  const hasSavedLogin = Boolean(savedSession?.role && savedSession?.matricule);
  const [step, setStep] = useState(
    hasSavedLogin
      ? savedSession.siteId && savedSession.clientOemId
        ? 3
        : 2
      : 1,
  );
  const [selectedModule, setSelectedModule] = useState(null);
  const [editingDefectCard, setEditingDefectCard] = useState(null);
  const [printDefectCard, setPrintDefectCard] = useState(false);
  const [editingAnnexe3, setEditingAnnexe3] = useState(null);
  const [editingTriage, setEditingTriage] = useState(null);
  const [printTriage, setPrintTriage] = useState(false);
  const [creatingTriage, setCreatingTriage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [userSession, setUserSession] = useState({
    username: "",
    matricule: "",
    password: "",
    role: "",
    site: "",
    client: "",
    siteId: "",
    clientOemId: "",
    ...savedSession,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (userSession.role && userSession.matricule) {
      const safeSession = { ...userSession };
      delete safeSession.password;
      localStorage.setItem("leoni_user_session", JSON.stringify(safeSession));
    }
  }, [userSession]);

  const handleLogout = () => {
    setUserSession({
      username: "",
      matricule: "",
      password: "",
      role: "",
      site: "",
      client: "",
      siteId: "",
      clientOemId: "",
    });
    clearSession();
    localStorage.removeItem("leoni_user_session");
    setSelectedModule(null);
    setEditingTriage(null);
    setCreatingTriage(false);
    setPrintTriage(false);
    setStep(1);
    setSuccessMessage("");
  };

  const goHome = () => {
    setSelectedModule(null);
    setEditingTriage(null);
    setCreatingTriage(false);
    setPrintTriage(false);
    setEditingDefectCard(null);
    setEditingAnnexe3(null);
    setStep(3);
    setSuccessMessage("");
  };

  const openTriage = async (planOrId, shouldPrint = false) => {
    try {
      const plan =
        typeof planOrId === "string"
          ? await api.triagePlan(planOrId)
          : planOrId?.id
            ? await api.triagePlan(planOrId.id)
            : planOrId;
      setEditingTriage(plan);
      setPrintTriage(shouldPrint);
      setCreatingTriage(false);
      setSelectedModule("rework");
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
  };

  const moduleLabel =
    {
      defects: "Enregistrement des défauts",
      intersegment: "Intersegment / Annexe 3",
      audit: "Product Audit",
      rework: "Plan de triage et de retouche",
      history: "Mon historique",
      admin: "Administration",
      "edit-defect": "Carte de réparation",
      "edit-annexe3": "Annexe 3",
      "edit-triage": "Plan de triage",
    }[selectedModule] || null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans text-slate-800">
      {/* Top navbar only shows after step 1 */}
      {step > 1 && (
        <div className="no-print">
          <Header
            step={step}
            userSession={userSession}
            moduleLabel={moduleLabel}
            onGoHome={goHome}
            onOpenTriage={(id) => openTriage(id)}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Main Container */}
      <main
        key={`${step}-${selectedModule || "hub"}-${creatingTriage}-${editingTriage?.id || ""}`}
        className={
          step === 1
            ? "page-enter flex flex-1"
            : "page-enter mx-auto w-full max-w-6xl flex-1 p-6 print:max-w-none print:p-0"
        }
      >
        {error && step !== 1 && (
          <div className="no-print app-toast app-toast-error">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
                !
              </span>
              <div>
                <p className="text-sm font-bold text-red-900">Erreur</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setError("")}
              className="text-red-500 transition hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="no-print app-toast app-toast-success">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-900">Succès</p>
                <p className="text-xs text-emerald-700">{successMessage}</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setSuccessMessage("")}
              className="text-emerald-600 transition hover:text-emerald-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Étape 1 : Auth */}
        {step === 1 && (
          <Step1Auth
            userSession={userSession}
            setUserSession={setUserSession}
            error={error}
            onLogin={async () => {
              try {
                const result = await api.login(
                  userSession.matricule,
                  userSession.password,
                );
                localStorage.setItem("leoni_access_token", result.access_token);
                setUserSession((current) => ({
                  ...current,
                  username: result.user.nomComplet,
                  role: result.user.role,
                }));
                setError("");
                setStep(2);
              } catch (err) {
                setError(
                  "Connexion impossible. Vérifiez votre matricule et votre mot de passe, puis réessayez.",
                );
              }
            }}
          />
        )}

        {/* Étape 2 : Périmètre */}
        {step === 2 && (
          <Step2Perimeter
            userSession={userSession}
            setUserSession={setUserSession}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {/* Étape 3 : Hub des Modules */}
        {step === 3 && !selectedModule && (
          <ModuleSelector
            isAdmin={userSession.role === "ADMIN"}
            onSelectModule={(mod) => setSelectedModule(mod)}
          />
        )}

        {step === 3 && selectedModule === "admin" && (
          <AdminDashboard
            onBack={() => setSelectedModule(null)}
            onEditDefectCard={(_kind, card) => {
              setEditingDefectCard(card);
              setPrintDefectCard(false);
              setSelectedModule("edit-defect");
            }}
            onPrintDefectCard={(_title, card) => {
              setEditingDefectCard(card);
              setPrintDefectCard(true);
              setSelectedModule("edit-defect");
            }}
            onEditAnnexe3={(_kind, card) => {
              setEditingAnnexe3(card);
              setSelectedModule("edit-annexe3");
            }}
            onEditTriage={(_kind, plan) => openTriage(plan)}
            onPrintTriage={(_title, plan) => openTriage(plan, true)}
          />
        )}

        {/* Module Product Audit */}
        {step === 3 && selectedModule === "audit" && (
          <ProductAudit
            userSession={userSession}
            onBack={() => setSelectedModule(null)}
            onSubmitAudit={(payload) =>
              api
                .createAnnexe3Card(toAnnexe3Payload(payload, userSession))
                .then(() => setSelectedModule(null))
                .catch((err) => setError(err.message))
            }
          />
        )}

        {/* Module Intersegment */}
        {step === 3 && selectedModule === "intersegment" && (
          <IntersegmentAudit
            userSession={userSession}
            onBack={() => setSelectedModule(null)}
            onSubmitAudit={(payload) =>
              api
                .createAnnexe3Card(toAnnexe3Payload(payload, userSession))
                .then(() => setSelectedModule(null))
                .catch((err) => setError(err.message))
            }
          />
        )}

        {step === 3 &&
          selectedModule === "rework" &&
          !editingTriage &&
          !creatingTriage && (
            <TriageInbox
              userSession={userSession}
              onBack={goHome}
              onCreateNew={() => setCreatingTriage(true)}
              onOpenPlan={(plan) => openTriage(plan)}
            />
          )}

        {step === 3 &&
          selectedModule === "rework" &&
          (editingTriage || creatingTriage) && (
            <ReworkPlanForm
              userSession={userSession}
              initialData={editingTriage}
              autoPrint={printTriage}
              onBack={() => {
                setEditingTriage(null);
                setCreatingTriage(false);
                setPrintTriage(false);
              }}
              onSaved={(plan) => {
                setEditingTriage(plan);
                setCreatingTriage(false);
                setPrintTriage(false);
                setSuccessMessage(
                  "La fiche a été enregistrée avec succès. Vous pouvez maintenant la compléter ou la consulter.",
                );
              }}
            />
          )}

        {/* Module Enregistrement des Défauts */}
        {step === 3 && selectedModule === "defects" && (
          <DefectEntry
            userSession={userSession}
            onBack={() => setSelectedModule(null)}
            onSubmitDefect={(defectData) => {
              api
                .createReparationCard(defectData)
                .then(() => setSelectedModule(null))
                .catch((err) => setError(err.message));
            }}
          />
        )}

        {step === 3 && selectedModule === "history" && (
          <History
            userSession={userSession}
            onBack={goHome}
            onOpenTriage={(plan) => openTriage(plan)}
            onPrintTriage={(plan) => printTriagePlan(plan)}
          />
        )}

        {step === 3 && selectedModule === "edit-annexe3" && editingAnnexe3 && (
          <ProductAudit
            userSession={userSession}
            initialData={editingAnnexe3}
            onBack={() => {
              setEditingAnnexe3(null);
              setSelectedModule("admin");
            }}
            onSubmitAudit={(payload) =>
              api
                .updateAnnexe3Card(
                  editingAnnexe3.id,
                  toAnnexe3Payload(payload, userSession),
                )
                .then(() => {
                  setEditingAnnexe3(null);
                  setSelectedModule("admin");
                })
                .catch((err) => setError(err.message))
            }
          />
        )}

        {step === 3 && selectedModule === "edit-triage" && editingTriage && (
          <ReworkPlanForm
            userSession={userSession}
            initialData={editingTriage}
            onBack={() => {
              setEditingTriage(null);
              setSelectedModule("admin");
            }}
            onSaved={() => {
              setEditingTriage(null);
              setSelectedModule("admin");
            }}
          />
        )}

        {step === 3 &&
          selectedModule === "edit-defect" &&
          editingDefectCard && (
            <DefectEntry
              userSession={userSession}
              initialData={editingDefectCard}
              autoPrint={printDefectCard}
              onBack={() => {
                setEditingDefectCard(null);
                setPrintDefectCard(false);
                setSelectedModule("admin");
              }}
              onPrint={() => window.print()}
              onSubmitDefect={(payload) =>
                api
                  .updateReparationCard(editingDefectCard.id, payload)
                  .then(() => {
                    setEditingDefectCard(null);
                    setPrintDefectCard(false);
                    setSelectedModule("admin");
                  })
                  .catch((err) => setError(err.message))
              }
            />
          )}

        {/* Placeholder pour tout autre module en cours de développement */}
        {step === 3 &&
          selectedModule &&
          ![
            "audit",
            "intersegment",
            "rework",
            "defects",
            "history",
            "admin",
            "edit-defect",
            "edit-annexe3",
            "edit-triage",
          ].includes(selectedModule) && (
            <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg">
              <h2 className="mb-4 text-xl font-bold uppercase text-blue-900">
                Module Actif : {selectedModule} ({userSession.site} -{" "}
                {userSession.client})
              </h2>
              <p className="mb-6 text-slate-500">
                Module en cours de développement...
              </p>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="rounded bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                ← Retour au choix des modules
              </button>
            </div>
          )}
      </main>
    </div>
  );
}

function toAnnexe3Payload(data, session) {
  const checked = (values) =>
    Object.entries(values || {})
      .filter(([, value]) => value)
      .map(([key]) => key);
  return {
    productionProcess: data.processType,
    date: data.date,
    segmentLine: data.segment,
    siteName: session.site,
    clientOemName: session.client,
    responsiblePerson: data.respPerson || session.username,
    zonesAffected: checked(data.affectedZones),
    manufacturingLinesConcerned: data.manufacturingLines,
    originOfNC: checked(data.originNC),
    redHoldLabelNo: data.originNC?.redHoldLabel,
    originOther: data.originNC?.other,
    subjectOfNC: checked(data.subjectNC),
    severity: data.subjectNC?.severity,
    manufacturingDate: data.subjectNC?.mfgDate || undefined,
    defectCode: data.defectCode,
    defectDescription: data.defectDescription,
    vehicle: data.vehicle,
    family: data.family,
    refIndex: data.refIndex,
    itemCode: data.itemCode,
    quantityToBeControlled: Number(data.quantities.toControl),
    controlledQuantity: Number(data.quantities.controlled),
    defectiveQuantity: Number(data.quantities.defective),
    ncDescription: data.ncDescription,
    riskForReworkOrRepair: data.riskOfRework === "Yes",
    riskActions: (data.riskActions || [])
      .filter((item) => item.action)
      .map((item) => ({
        actionRiskDescription: item.action,
        ownerPilot: item.pilot,
        completionDate: item.date || data.date,
        successCheck: item.successCheck || item.successStatus,
      })),
    correctiveActions: Object.entries(data.correctiveActions || {})
      .filter(([, action]) => action.pilot || action.qty || action.timePast)
      .map(([actionType, action]) => ({
        actionType,
        ownerPilot: action.pilot,
        completionDate: action.date || undefined,
        quantity: Number(action.qty) || 0,
        elapsedTimeMin: Number(action.timePast) || 0,
      })),
    comments: data.comments,
    traceability: data.tracability,
    assignedProductionLeaderMatricule: data.approvalRequests?.prodSegment?.name,
    assignedQualityReviewerMatricule:
      data.approvalRequests?.qualitySegment?.name,
  };
}

function toTriagePayload(data, session) {
  return {
    date: data.generalData.date,
    numOrdre: data.generalData.orderNumber,
    numSerie: data.generalData.serialNumber,
    quantiteBloquee: Number(data.generalData.blockedQty),
    numFicheRetouche: data.generalData.reworkSheetNumber,
    motifBlocage: data.generalData.reworkReason,
    assignedPeMatricule:
      data.responsibles.productionEngineering.name || undefined,
    assignedQmMatricule: data.responsibles.qualityQM.name,
    criteresTriage: data.triageCriteria.map((item) => ({
      critere: item.criterion,
      reperageCablagesCaisse: item.harnessOrBoxRef,
      matriculeExecuteur: item.matricules || session.matricule,
      tempsPrevu: item.estimatedTime,
    })),
    quantiteConforme: Number(data.triageResults.conformingQty),
    quantiteNonConforme: Number(data.triageResults.nonConformingQty),
    tempsReelTriage: data.triageResults.actualTriageTime,
    decision:
      data.decision.action === "Scrap"
        ? "REBUTER (SCRAP)"
        : "Réparer et / ou Retoucher",
    justificationDecision: data.decision.argument,
  };
}
