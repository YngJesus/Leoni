import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { printTriagePlan } from "./printTriage";
import { printRepairCard } from "./printRepair";
import { printAnnexe3Card } from "./printAnnexe3";

export default function History({
  userSession,
  onBack,
  onOpenTriage,
  onPrintTriage,
}) {
  const [history, setHistory] = useState({
    repairs: [],
    annexe3: [],
    triage: [],
  });

  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const triageRequest =
          userSession?.role === "ADMIN" ? api.triagePlans() : api.triageMine();

        const [repairs, annexe3, triage] = await Promise.all([
          api.reparationMine(),
          api.annexe3Mine(),
          triageRequest,
        ]);

        if (!mounted) return;

        setHistory({
          repairs: Array.isArray(repairs) ? repairs : [],
          annexe3: Array.isArray(annexe3) ? annexe3 : [],
          triage: Array.isArray(triage) ? triage : [],
        });
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Impossible de charger l'historique.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [userSession?.role]);

  const allRecords = useMemo(() => {
    return [
      ...history.repairs.map((item) => ({
        type: "REPAIR",
        title: "Carte de réparation",
        item,
        date: item.createdAt || item.date,
        number: item.cardNo || item.numFicheRetouche || item.id,
      })),

      ...history.annexe3.map((item) => ({
        type: "ANNEXE3",
        title: "Annexe 3",
        item,
        date: item.createdAt || item.date,
        number: item.cardNo || item.numFicheRetouche || item.id,
      })),

      ...history.triage.map((item) => ({
        type: "TRIAGE",
        title: "Plan de triage",
        item,
        date: item.createdAt || item.date,
        number: item.numFicheRetouche || item.cardNo || item.id,
      })),
    ].sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }, [history]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allRecords.filter((record) => {
      const matchesFilter =
        activeFilter === "ALL" || record.type === activeFilter;

      if (!matchesFilter) return false;

      if (!q) return true;

      const item = record.item;

      const searchable = [
        record.title,
        record.number,
        item?.status,
        item?.siteName,
        item?.siteLeoni,
        item?.projetClient,
        item?.clientOEM,
        item?.clientOem,
        item?.process,
        item?.productionProcess,
        item?.segmentLine,
        item?.defectCode,
        item?.typeReparation,
        item?.createdByMatricule,
        item?.responsiblePerson,
        item?.responsible,
      ]
        .map((v) =>
          typeof v === "object"
            ? v?.name || v?.title || v?.code || ""
            : String(v || ""),
        )
        .join(" ")
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [allRecords, search, activeFilter]);

  const counts = {
    all: allRecords.length,
    repair: history.repairs.length,
    annexe3: history.annexe3.length,
    triage: history.triage.length,
  };

  function openRecord(record) {
    if (record.type === "TRIAGE" && onOpenTriage) {
      onOpenTriage(record.item);
      return;
    }

    setSelected(record);
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER
        ========================================================== */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md border border-blue-400/30 bg-blue-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">
                    LEONI
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Système de Retouche & Réparation
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Mon historique
                </h1>

                <p className="mt-2 max-w-xl text-sm text-slate-400">
                  Retrouvez les fiches créées, enregistrées ou associées à votre
                  matricule.
                </p>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="group flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                <span className="transition group-hover:-translate-x-0.5">
                  ←
                </span>
                Retour
              </button>
            </div>
          </div>

          {/* =========================================================
              STATS
          ========================================================== */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
            <StatCard
              label="Total"
              value={counts.all}
              active={activeFilter === "ALL"}
              onClick={() => setActiveFilter("ALL")}
            />

            <StatCard
              label="Réparation"
              value={counts.repair}
              active={activeFilter === "REPAIR"}
              onClick={() => setActiveFilter("REPAIR")}
            />

            <StatCard
              label="Annexe 3"
              value={counts.annexe3}
              active={activeFilter === "ANNEXE3"}
              onClick={() => setActiveFilter("ANNEXE3")}
            />

            <StatCard
              label="Triage"
              value={counts.triage}
              active={activeFilter === "TRIAGE"}
              onClick={() => setActiveFilter("TRIAGE")}
            />
          </div>
        </div>

        {/* =========================================================
            SEARCH
        ========================================================== */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par numéro, site, défaut, projet..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Effacer
            </button>
          )}
        </div>

        {/* =========================================================
            ERROR
        ========================================================== */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <span className="text-lg">!</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide">
                Erreur
              </p>
              <p className="mt-1 text-xs font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* =========================================================
            LOADING
        ========================================================== */}
        {loading ? (
          <LoadingState />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(search)}
            onClear={() => {
              setSearch("");
              setActiveFilter("ALL");
            }}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-black text-slate-900">Documents</h2>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {filteredRecords.length} document
                  {filteredRecords.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {filteredRecords.map((record, index) => (
                <HistoryCard
                  key={`${record.type}-${record.item?.id || index}`}
                  record={record}
                  onOpen={() => openRecord(record)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          DOCUMENT PREVIEW
      ========================================================== */}
      {selected && (
        <DocumentPreview
          record={selected}
          onClose={() => setSelected(null)}
          onPrintTriage={onPrintTriage}
        />
      )}
    </div>
  );
}

/* ===============================================================
   STAT CARD
================================================================ */

function StatCard({ label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group px-5 py-4 text-left transition ${
        active ? "bg-blue-50/70" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-end justify-between">
        <div>
          <p
            className={`text-[9px] font-black uppercase tracking-[0.16em] ${
              active ? "text-blue-600" : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>

        <span
          className={`mb-1 h-2 w-2 rounded-full transition ${
            active
              ? "bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
              : "bg-slate-200 group-hover:bg-blue-300"
          }`}
        />
      </div>
    </button>
  );
}

/* ===============================================================
   HISTORY CARD
================================================================ */

function HistoryCard({ record, onOpen }) {
  const item = record.item;

  const number = item?.cardNo || item?.numFicheRetouche || item?.id || "—";

  const site =
    item?.site?.name ||
    item?.siteName ||
    item?.siteLeoni ||
    item?.segment?.site?.name ||
    "Site non renseigné";

  const client =
    item?.clientOEM?.name ||
    item?.clientOem?.name ||
    item?.clientOem ||
    item?.clientOEM ||
    item?.projetClient ||
    "Projet non renseigné";

  const status = item?.status || "EN COURS";

  const date = item?.createdAt || item?.date;

  const typeConfig = {
    REPAIR: {
      label: "RÉPARATION",
      icon: "↻",
      color: "blue",
    },
    ANNEXE3: {
      label: "ANNEXE 3",
      icon: "▣",
      color: "violet",
    },
    TRIAGE: {
      label: "TRIAGE",
      icon: "≡",
      color: "emerald",
    },
  };

  const config = typeConfig[record.type];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          record.type === "REPAIR"
            ? "bg-blue-500"
            : record.type === "ANNEXE3"
              ? "bg-violet-500"
              : "bg-emerald-500"
        }`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
              record.type === "REPAIR"
                ? "bg-blue-50 text-blue-700"
                : record.type === "ANNEXE3"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {config.icon}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[9px] font-black uppercase tracking-[0.15em] ${
                  record.type === "REPAIR"
                    ? "text-blue-600"
                    : record.type === "ANNEXE3"
                      ? "text-violet-600"
                      : "text-emerald-600"
                }`}
              >
                {config.label}
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="text-[10px] text-slate-400">
                {formatDate(date)}
              </span>
            </div>

            <h3 className="mt-1 truncate text-sm font-black text-slate-900">
              Fiche #{number}
            </h3>

            <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
              {site}
              <span className="mx-1.5 text-slate-300">•</span>
              {client}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex gap-5 text-[10px] text-slate-400">
          {record.type === "REPAIR" && (
            <span>
              Défauts :{" "}
              <strong className="text-slate-700">
                {item?.defectLines?.length || 0}
              </strong>
            </span>
          )}

          {record.type === "ANNEXE3" && (
            <span>
              Actions :{" "}
              <strong className="text-slate-700">
                {item?.correctiveActions?.length || 0}
              </strong>
            </span>
          )}

          {record.type === "TRIAGE" && <span>Plan de triage</span>}
        </div>

        <span className="text-[10px] font-black text-blue-600 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100">
          Ouvrir →
        </span>
      </div>
    </button>
  );
}

/* ===============================================================
   DOCUMENT PREVIEW
================================================================ */

function DocumentPreview({ record, onClose, onPrintTriage }) {
  const item = record.item;

  const handlePrint = () => {
    if (record.type === "TRIAGE") {
      (onPrintTriage || printTriagePlan)(item);
      return;
    }

    if (record.type === "REPAIR") {
      printRepairCard(item);
      return;
    }

    if (record.type === "ANNEXE3") {
      printAnnexe3Card(item);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5">
      <div className="flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-100 shadow-2xl">
        {/* =====================================================
            MODAL TOP BAR
        ====================================================== */}
        <div className="flex shrink-0 items-center justify-between bg-slate-950 px-4 py-3 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-black sm:flex">
              L
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
                LEONI · DOCUMENT
              </p>

              <h2 className="truncate text-sm font-black">
                {record.title}
                <span className="ml-2 font-mono font-normal text-slate-500">
                  #{item?.cardNo || item?.numFicheRetouche || item?.id || "—"}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-black text-white transition hover:bg-blue-500"
            >
              Imprimer
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* =====================================================
            PAPER
        ====================================================== */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="mx-auto max-w-5xl rounded-sm border border-slate-300 bg-white shadow-xl">
            {/* OFFICIAL HEADER */}
            <DocumentHeader record={record} item={item} />

            {/* CONTENT */}
            <div className="p-5 sm:p-8">
              {record.type === "REPAIR" && <RepairDocument item={item} />}

              {record.type === "ANNEXE3" && <Annexe3Document item={item} />}

              {record.type === "TRIAGE" && <TriageDocument item={item} />}
            </div>

            {/* FOOTER */}
            <div className="border-t-2 border-slate-900 px-5 py-3 sm:px-8">
              <div className="flex flex-col justify-between gap-1 text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:flex-row">
                <span>LEONI · Système de Retouche & Réparation</span>
                <span>Document généré depuis la plateforme digitale</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   DOCUMENT HEADER
================================================================ */

function DocumentHeader({ record, item }) {
  const number = item?.cardNo || item?.numFicheRetouche || item?.id || "—";

  const site =
    item?.site?.name ||
    item?.siteName ||
    item?.siteLeoni ||
    item?.segment?.site?.name ||
    "—";

  const client =
    item?.clientOEM?.name ||
    item?.clientOem?.name ||
    item?.clientOem ||
    item?.clientOEM ||
    item?.projetClient ||
    "—";

  return (
    <div className="border-b-2 border-slate-900">
      <div className="flex flex-col border-b border-slate-300 sm:flex-row">
        <div className="flex items-center gap-3 border-b border-slate-300 px-5 py-4 sm:w-1/3 sm:border-b-0 sm:border-r">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-lg font-black text-white">
            L
          </div>

          <div>
            <p className="text-sm font-black tracking-tight text-slate-950">
              LEONI
            </p>

            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
              Quality System
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 py-4">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
            DOCUMENT DE CONTRÔLE
          </p>

          <h1 className="mt-1 text-lg font-black uppercase text-slate-950">
            {record.title}
          </h1>
        </div>

        <div className="border-t border-slate-300 px-5 py-4 sm:w-40 sm:border-l sm:border-t-0">
          <p className="text-[8px] font-black uppercase text-slate-400">
            N° FICHE
          </p>

          <p className="mt-1 font-mono text-base font-black text-slate-950">
            {number}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-300 sm:grid-cols-4">
        <PaperMeta label="Site LEONI" value={site} />

        <PaperMeta label="Projet / OEM" value={client} />

        <PaperMeta
          label="Date"
          value={formatDate(item?.date || item?.createdAt)}
        />

        <PaperMeta label="Statut" value={item?.status || "EN COURS"} />
      </div>
    </div>
  );
}

/* ===============================================================
   REPAIR DOCUMENT
================================================================ */

function RepairDocument({ item }) {
  const defects = Array.isArray(item?.defectLines) ? item.defectLines : [];

  return (
    <div className="space-y-6">
      <DocumentSection title="1. Informations générales">
        <PaperGrid columns={3}>
          <PaperField label="Type de réparation" value={item?.typeReparation} />

          <PaperField label="Date" value={item?.date} />

          <PaperField
            label="Matricule créateur"
            value={item?.createdByMatricule}
          />

          <PaperField label="Statut" value={item?.status} />

          <PaperField label="Nombre de défauts" value={defects.length} />
        </PaperGrid>
      </DocumentSection>

      <DocumentSection title={`2. Défauts enregistrés (${defects.length})`}>
        {defects.length === 0 ? (
          <EmptyPaper text="Aucun défaut enregistré." />
        ) : (
          <div className="space-y-5">
            {defects.map((line, index) => (
              <DefectPaperBlock
                key={line?.id || index}
                line={line}
                index={index}
              />
            ))}
          </div>
        )}
      </DocumentSection>
    </div>
  );
}

/* ===============================================================
   DEFECT BLOCK
================================================================ */

function DefectPaperBlock({ line, index }) {
  return (
    <div className="overflow-hidden border-2 border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-100 px-3 py-2">
        <span className="text-[10px] font-black uppercase tracking-wider">
          Défaut #{index + 1}
        </span>

        <span className="font-mono text-[10px] font-black">
          CODE : {displayValue(line?.codeDefaut)}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-300 sm:grid-cols-4">
        <PaperField label="Étiquette STOP" value={line?.etiquetteStop} />
        <PaperField label="Date production" value={line?.dateProduction} />
        <PaperField label="Série / variante" value={line?.serieVariante} />
        <PaperField label="Quantité" value={line?.qte} />

        <PaperField label="Détecté à" value={line?.defautDetecteA} />
        <PaperField label="N° KSK / ID" value={line?.kskIdUnique} />
        <PaperField label="Groupe / équipe" value={line?.groupeEquipe} />
        <PaperField label="Temps (min)" value={line?.tempsMin} />
      </div>

      <div className="border-t border-slate-300">
        <div className="px-3 py-2">
          <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
            Description du défaut
          </p>

          <p className="mt-1 min-h-[42px] whitespace-pre-wrap text-[10px] font-semibold leading-relaxed text-slate-900">
            {displayValue(line?.descriptionFaute)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===============================================================
   ANNEXE 3
================================================================ */

function Annexe3Document({ item }) {
  const actions = Array.isArray(item?.correctiveActions)
    ? item.correctiveActions
    : [];

  const risks = Array.isArray(item?.riskActions) ? item.riskActions : [];

  return (
    <div className="space-y-6">
      <DocumentSection title="1. Données principales">
        <PaperGrid columns={3}>
          <PaperField label="Card No" value={item?.cardNo} />

          <PaperField
            label="Production Process"
            value={item?.process || item?.productionProcess}
          />

          <PaperField label="Date" value={item?.date || item?.createdAt} />

          <PaperField
            label="Segment / Line"
            value={item?.segmentLine || item?.segment}
          />

          <PaperField
            label="Responsible"
            value={item?.responsiblePerson || item?.responsible}
          />

          <PaperField
            label="Manufacturing Lines"
            value={item?.manufacturingLinesConcerned}
          />
        </PaperGrid>
      </DocumentSection>

      <DocumentSection title="2. Détails du défaut">
        <PaperGrid columns={3}>
          <PaperField label="Red Hold Label No" value={item?.redHoldLabelNo} />

          <PaperField label="Defect Code" value={item?.defectCode} />

          <PaperField label="Severity" value={item?.severity} />

          <PaperField
            label="Qty To Control"
            value={item?.quantityToBeControlled}
          />

          <PaperField label="Defective Qty" value={item?.defectiveQuantity} />
        </PaperGrid>
      </DocumentSection>

      <DocumentSection title={`3. Actions correctives (${actions.length})`}>
        {actions.length === 0 ? (
          <EmptyPaper text="Aucune action corrective enregistrée." />
        ) : (
          <PaperTable
            columns={[
              "Type d'action",
              "Responsable",
              "Date de réalisation",
              "Quantité",
            ]}
            rows={actions.map((action) => [
              action?.actionType,
              action?.ownerPilot,
              action?.completionDate,
              action?.quantity,
            ])}
          />
        )}
      </DocumentSection>

      {risks.length > 0 && (
        <DocumentSection title={`4. Actions risques (${risks.length})`}>
          <PaperTable
            columns={["Action", "Responsable", "Date", "Statut"]}
            rows={risks.map((risk) => [
              risk?.action || risk?.actionType || risk?.description,
              risk?.owner || risk?.ownerPilot || risk?.responsible,
              risk?.date || risk?.completionDate,
              risk?.status,
            ])}
          />
        </DocumentSection>
      )}

      <GenericFilledFields item={item} />
    </div>
  );
}

/* ===============================================================
   TRIAGE
================================================================ */

function TriageDocument({ item }) {
  return (
    <div className="space-y-6">
      <DocumentSection title="1. Informations du plan">
        <PaperGrid columns={3}>
          <PaperField
            label="N° fiche retouche"
            value={item?.numFicheRetouche}
          />

          <PaperField label="Card No" value={item?.cardNo} />

          <PaperField label="Date" value={item?.date || item?.createdAt} />

          <PaperField
            label="Process"
            value={item?.process || item?.productionProcess}
          />

          <PaperField
            label="Responsable"
            value={item?.responsiblePerson || item?.responsible}
          />

          <PaperField label="Statut" value={item?.status} />
        </PaperGrid>
      </DocumentSection>

      <DocumentSection title="2. Données du triage">
        <PaperGrid columns={3}>
          <PaperField
            label="Segment / ligne"
            value={item?.segmentLine || item?.segment}
          />

          <PaperField
            label="Lignes concernées"
            value={item?.manufacturingLinesConcerned}
          />

          <PaperField label="Code défaut" value={item?.defectCode} />

          <PaperField
            label="Quantité à contrôler"
            value={item?.quantityToBeControlled}
          />

          <PaperField
            label="Quantité défectueuse"
            value={item?.defectiveQuantity}
          />

          <PaperField label="Sévérité" value={item?.severity} />
        </PaperGrid>
      </DocumentSection>

      <GenericFilledFields item={item} />
    </div>
  );
}

/* ===============================================================
   GENERIC EXTRA FILLED DATA
================================================================ */

function GenericFilledFields({ item }) {
  if (!item || typeof item !== "object") return null;

  const excluded = new Set([
    "id",
    "createdAt",
    "updatedAt",
    "site",
    "segment",
    "clientOem",
    "clientOEM",
    "defectLines",
    "correctiveActions",
    "riskActions",
  ]);

  const entries = Object.entries(item).filter(([key, value]) => {
    if (excluded.has(key)) return false;

    if (value === null || value === undefined || value === "") {
      return false;
    }

    if (Array.isArray(value)) return false;

    if (typeof value === "object") {
      if (!value) return false;

      return Boolean(value.name || value.title || value.code || value.label);
    }

    return true;
  });

  if (!entries.length) return null;

  return (
    <DocumentSection title="Informations complémentaires">
      <PaperGrid columns={3}>
        {entries.map(([key, value]) => (
          <PaperField key={key} label={humanizeKey(key)} value={value} />
        ))}
      </PaperGrid>
    </DocumentSection>
  );
}

/* ===============================================================
   PAPER COMPONENTS
================================================================ */

function DocumentSection({ title, children }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-5 w-1 rounded-full bg-slate-950" />

        <h2 className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-900">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function PaperGrid({ columns = 3, children }) {
  const classes =
    columns === 2
      ? "grid grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid grid-cols-2 sm:grid-cols-4"
        : "grid grid-cols-1 sm:grid-cols-3";

  return (
    <div className={`${classes} overflow-hidden border border-slate-300`}>
      {children}
    </div>
  );
}

function PaperField({ label, value }) {
  return (
    <div className="min-h-[58px] border-b border-r border-slate-300 bg-white px-3 py-2.5">
      <p className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-[10px] font-bold leading-relaxed text-slate-900">
        {displayValue(value)}
      </p>
    </div>
  );
}

function PaperMeta({ label, value }) {
  return (
    <div className="border-t border-slate-300 px-4 py-3 sm:border-t-0">
      <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-black text-slate-900">
        {displayValue(value)}
      </p>
    </div>
  );
}

function PaperTable({ columns, rows }) {
  return (
    <div className="overflow-hidden border border-slate-300">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-100">
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-r border-slate-300 px-3 py-2 text-[8px] font-black uppercase tracking-wider text-slate-600 last:border-r-0"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((value, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-r border-slate-300 px-3 py-2.5 text-[9px] font-semibold text-slate-900 last:border-r-0"
                >
                  {displayValue(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyPaper({ text }) {
  return (
    <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="text-[10px] font-semibold italic text-slate-400">{text}</p>
    </div>
  );
}

/* ===============================================================
   STATUS
================================================================ */

function StatusBadge({ status }) {
  const normalized = String(status || "EN COURS").toUpperCase();

  let classes = "border-slate-200 bg-slate-50 text-slate-600";

  if (
    normalized.includes("TERM") ||
    normalized.includes("CLOSE") ||
    normalized.includes("VALID")
  ) {
    classes = "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("ATTENTE") || normalized.includes("PENDING")) {
    classes = "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized.includes("REJET") || normalized.includes("CANCEL")) {
    classes = "border-red-200 bg-red-50 text-red-700";
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${classes}`}
    >
      {normalized}
    </span>
  );
}

/* ===============================================================
   EMPTY / LOADING
================================================================ */

function LoadingState() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {[1, 2, 3, 4].map((x) => (
        <div
          key={x}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-40 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-5 h-3 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
        ▤
      </div>

      <h3 className="mt-4 text-sm font-black text-slate-900">
        {hasSearch ? "Aucun document trouvé" : "Aucune fiche disponible"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400">
        {hasSearch
          ? "Essayez avec un autre numéro de fiche, site, projet ou code défaut."
          : "Les fiches que vous créez ou qui vous sont associées apparaîtront ici."}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}

/* ===============================================================
   HELPERS
================================================================ */

function displayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  if (typeof value === "object") {
    return value.name || value.title || value.code || value.label || "—";
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanizeKey(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}
