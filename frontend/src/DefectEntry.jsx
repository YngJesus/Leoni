import React, { useEffect, useState } from "react";
import { api } from "./api";
import { DEFECT_CODES } from "./DefectCodes";
import { ErrorBanner, FieldHint, fieldClass } from "./formFeedback";

const DETECTION_STAGES = [
  { code: "M", label: "Montage (M)" },
  { code: "CE", label: "Contrôle électrique (CE)" },
  { code: "CF", label: "Contrôle final GM (CF)" },
  { code: "CI", label: "Contrôle intermédiaire GM (CI)" },
  { code: "MQ", label: "Mur Qualité (MQ)" },
  { code: "WKF", label: "Werkseigener VF (WKF)" },
];

export default function DefectEntry({
  userSession,
  onBack,
  onSubmitDefect,
  onPrint,
  initialData,
  autoPrint = false,
}) {
  const [defectCodes, setDefectCodes] = useState(DEFECT_CODES);

  useEffect(() => {
    api
      .defectCodes()
      .then(setDefectCodes)
      .catch(() => setDefectCodes(DEFECT_CODES));
  }, []);

  const [headerInfo, setHeaderInfo] = useState({
    segment: userSession?.site || "",
    date: new Date().toISOString().split("T")[0],
    repairType: "Unitaire",
  });
  const [fieldErrors, setFieldErrors] = useState([]);

  const [rows, setRows] = useState([
    {
      id: Date.now(),
      stopLabelNo: "",
      prodDate: new Date().toISOString().split("T")[0],
      seriesVariant: "",
      kskProdNo: "",
      groupTeam: "",
      wireConnectorNo: "",
      defectCode: "",
      defectQty: 1,
      detectedAt: "M",
      repairTime: "",
      defectDescription: "",
      entryDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      releasedBy: userSession?.matricule || "",
    },
  ]);

  useEffect(() => {
    if (!initialData) return;
    setHeaderInfo({
      segment: initialData.site?.name || userSession?.site || "",
      date: String(initialData.date || new Date().toISOString()).slice(0, 10),
      repairType: initialData.typeReparation || "Unitaire",
    });
    setRows(
      (initialData.defectLines || []).map((line) => ({
        id: line.id || Date.now(),
        stopLabelNo: line.etiquetteStop || "",
        prodDate: String(line.dateProduction || new Date().toISOString()).slice(
          0,
          10,
        ),
        seriesVariant: line.serieVariante || "",
        kskProdNo: line.kskIdUnique || "",
        groupTeam: line.groupeEquipe || "",
        wireConnectorNo: line.numFilDouilleConn || "",
        defectCode: line.codeDefaut || "",
        defectQty: line.qte || 1,
        detectedAt: line.defautDetecteA || "M",
        repairTime: line.tempsMin || "",
        defectDescription: line.descriptionFaute || "",
        entryDateTime: String(line.dateHeureEntree || new Date().toISOString())
          .slice(0, 16)
          .replace("T", " "),
        releasedBy: line.sortiPar || userSession?.matricule || "",
      })),
    );
  }, [initialData, userSession]);

  useEffect(() => {
    if (!autoPrint || !initialData) return;
    const timer = window.setTimeout(() => window.print(), 300);
    return () => window.clearTimeout(timer);
  }, [autoPrint, initialData]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderInfo((prev) => ({ ...prev, [name]: value }));
  };

  const getBilingualDescription = (item) => {
    if (!item) return "";
    const fr = item.desFr || item.descriptionFr || item.description || "";
    const en = item.desEng || item.descriptionEn || item.label || "";
    if (fr && en && fr !== en) return `${fr} / ${en}`;
    return fr || en;
  };

  const findDefectMatch = (inputVal) => {
    if (!inputVal) return null;
    const cleanCode = inputVal.split("-")[0].trim().toUpperCase();
    if (!Array.isArray(defectCodes)) return null;

    return defectCodes.find((item) => {
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
      return (
        codeVal === cleanCode ||
        (cleanCode !== "" &&
          codeVal === cleanCode.padStart(codeVal.length, "0"))
      );
    });
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "defectCode") {
      const match = findDefectMatch(value);
      if (match) {
        updatedRows[index].defectDescription = getBilingualDescription(match);
      }
    }
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now(),
        stopLabelNo: "",
        prodDate: new Date().toISOString().split("T")[0],
        seriesVariant: "",
        kskProdNo: "",
        groupTeam: "",
        wireConnectorNo: "",
        defectCode: "",
        defectQty: 1,
        detectedAt: "M",
        repairTime: "",
        defectDescription: "",
        entryDateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
        releasedBy: userSession?.matricule || "",
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = [];
    if (!headerInfo.segment.trim()) {
      errors.push({
        id: "field-segment",
        label: "Production facility & Segment",
      });
    }
    rows.forEach((row, index) => {
      if (!String(row.kskProdNo || "").trim()) {
        errors.push({
          id: `field-ksk-${index}`,
          label: `Ligne ${index + 1} · N° KSK / ID`,
        });
      }
      if (!String(row.defectCode || "").trim()) {
        errors.push({
          id: `field-code-${index}`,
          label: `Ligne ${index + 1} · Code défaut`,
        });
      }
    });
    if (errors.length) {
      setFieldErrors(errors);
      document
        .getElementById(errors[0].id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setFieldErrors([]);
    const payload = {
      siteId: initialData?.site?.id || userSession?.siteId,
      clientOemId: initialData?.clientOem?.id || userSession?.clientOemId,
      date: new Date(`${headerInfo.date}T00:00:00`),
      typeReparation: headerInfo.repairType,
      defectLines: rows.map((row) => ({
        etiquetteStop: row.stopLabelNo,
        dateProduction: new Date(`${row.prodDate}T00:00:00`),
        serieVariante: row.seriesVariant,
        kskIdUnique: row.kskProdNo,
        groupeEquipe: row.groupTeam,
        numFilDouilleConn: row.wireConnectorNo,
        codeDefaut: row.defectCode,
        qte: Number(row.defectQty),
        defautDetecteA: row.detectedAt,
        tempsMin: row.repairTime,
        descriptionFaute: row.defectDescription,
        dateHeureEntree: new Date(row.entryDateTime.replace(" ", "T")),
        sortiPar: row.releasedBy || userSession?.matricule,
      })),
    };

    if (onSubmitDefect) await onSubmitDefect(payload);
  };

  const handlePrintTrigger = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 9pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 4px 6px !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex flex-wrap justify-between items-center border-b border-slate-700 print:bg-transparent print:text-black print:border-b-2 print:border-black print:p-0 print:mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase print:border print:border-black print:bg-white print:text-black">
                IT TN 3067 - Annexe 1
              </span>
              <span className="text-slate-400 text-xs font-mono print:text-black print:font-bold">
                Page 1
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold uppercase tracking-wide mt-1 print:text-sm print:font-black">
              Carte d'enregistrement des défauts retouchés et / ou réparés
            </h1>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="no-print bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-bold transition border border-slate-700"
            >
              ← Retour au Dashboard
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 print:p-0 print:space-y-3"
        >
          <ErrorBanner errors={fieldErrors} />
          {/* Top Form Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs print:bg-white print:border-black print:rounded-none print:p-2">
            <div>
              <label className="block text-slate-600 font-bold mb-1 print:text-black">
                Production facility & Segment :
              </label>
              <input
                id="field-segment"
                type="text"
                name="segment"
                value={headerInfo.segment}
                onChange={handleHeaderChange}
                placeholder="Ex: Sousse 1 (LT4) / MB"
                className={fieldClass(
                  fieldErrors.some((item) => item.id === "field-segment"),
                  "no-print w-full rounded-md p-2 bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-500",
                )}
              />
              <FieldHint
                show={fieldErrors.some((item) => item.id === "field-segment")}
              >
                Champ obligatoire
              </FieldHint>
              <span className="hidden print:block font-bold text-xs">
                {headerInfo.segment || "—"}
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 print:text-black">
                Date :
              </label>
              <input
                type="date"
                name="date"
                value={headerInfo.date}
                onChange={handleHeaderChange}
                className="no-print w-full border border-slate-300 rounded-md p-2 bg-white font-mono outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="hidden print:block font-mono font-bold text-xs">
                {headerInfo.date || "—"}
              </span>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1 print:text-black">
                Retouche et / ou réparation :
              </label>
              <div className="flex items-center space-x-4 mt-2">
                {["Unitaire", "Série", "Montage"].map((type) => (
                  <label
                    key={type}
                    className="inline-flex items-center font-bold text-slate-700 cursor-pointer print:text-black"
                  >
                    <input
                      type="radio"
                      name="repairType"
                      value={type}
                      checked={headerInfo.repairType === type}
                      onChange={handleHeaderChange}
                      className="form-radio text-blue-600 h-4 w-4 print:hidden"
                    />
                    <span className="ml-1.5 print:ml-0 print:text-xs">
                      {headerInfo.repairType === type
                        ? `[X] ${type}`
                        : `[  ] ${type}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner print:overflow-visible print:border-none print:rounded-none">
            <table className="w-full text-left border-collapse min-w-[1250px] print:min-w-full">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider print:text-black print:text-[9px]">
                  <th className="p-2 border-b border-slate-700 w-24">
                    N° Etiquette Stop
                  </th>
                  <th className="p-2 border-b border-slate-700 w-24">
                    Date prod.
                  </th>
                  <th className="p-2 border-b border-slate-700 w-20">
                    Série / Var.
                  </th>
                  <th className="p-2 border-b border-slate-700 w-28">
                    N° KSK / ID
                  </th>
                  <th className="p-2 border-b border-slate-700 w-16">Groupe</th>
                  <th className="p-2 border-b border-slate-700 w-24">
                    N° Douille
                  </th>
                  <th className="p-2 border-b border-slate-700 w-20">
                    Code déf.
                  </th>
                  <th className="p-2 border-b border-slate-700 w-12 text-center">
                    Qté
                  </th>
                  <th className="p-2 border-b border-slate-700 w-20">
                    Détecté à
                  </th>
                  <th className="p-2 border-b border-slate-700 w-16">
                    Temps retouche/reparation
                  </th>
                  <th className="p-2 border-b border-slate-700">
                    Description faute
                  </th>
                  <th className="p-2 border-b border-slate-700 w-28">
                    Date & Heure
                  </th>
                  <th className="p-2 border-b border-slate-700 w-20">
                    Sorti par
                  </th>
                  <th className="p-2 border-b border-slate-700 w-10 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs bg-white print:divide-black print:text-[9px]">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.stopLabelNo}
                        onChange={(e) =>
                          handleRowChange(index, "stopLabelNo", e.target.value)
                        }
                        placeholder="Stop N°"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                      />
                      <span className="hidden print:block font-mono">
                        {row.stopLabelNo || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="date"
                        value={row.prodDate}
                        onChange={(e) =>
                          handleRowChange(index, "prodDate", e.target.value)
                        }
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                      />
                      <span className="hidden print:block font-mono">
                        {row.prodDate || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.seriesVariant}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "seriesVariant",
                            e.target.value,
                          )
                        }
                        placeholder="Série"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 text-[11px]"
                      />
                      <span className="hidden print:block">
                        {row.seriesVariant || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.kskProdNo}
                        onChange={(e) =>
                          handleRowChange(index, "kskProdNo", e.target.value)
                        }
                        placeholder="KSK / ID"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 font-mono font-bold text-[11px]"
                        required
                      />
                      <span className="hidden print:block font-mono font-bold">
                        {row.kskProdNo || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.groupTeam}
                        onChange={(e) =>
                          handleRowChange(index, "groupTeam", e.target.value)
                        }
                        placeholder="Eq."
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 text-[11px]"
                      />
                      <span className="hidden print:block">
                        {row.groupTeam || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.wireConnectorNo}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "wireConnectorNo",
                            e.target.value,
                          )
                        }
                        placeholder="N° Douille"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                      />
                      <span className="hidden print:block font-mono">
                        {row.wireConnectorNo || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        list="fault-codes-list"
                        value={row.defectCode}
                        onChange={(e) =>
                          handleRowChange(index, "defectCode", e.target.value)
                        }
                        placeholder="Code"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 font-mono font-bold text-blue-700 text-[11px]"
                        required
                      />
                      <span className="hidden print:block font-mono font-bold">
                        {row.defectCode || "—"}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={row.defectQty}
                        onChange={(e) =>
                          handleRowChange(index, "defectQty", e.target.value)
                        }
                        className="no-print w-full border border-slate-300 rounded px-1 py-1 font-mono text-center text-[11px]"
                        required
                      />
                      <span className="hidden print:block font-mono font-bold">
                        {row.defectQty}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <select
                        value={row.detectedAt}
                        onChange={(e) =>
                          handleRowChange(index, "detectedAt", e.target.value)
                        }
                        className="no-print w-full border border-slate-300 rounded px-1 py-1 font-semibold text-[11px] bg-white"
                      >
                        {DETECTION_STAGES.map((stg) => (
                          <option key={stg.code} value={stg.code}>
                            {stg.label}
                          </option>
                        ))}
                      </select>
                      <span className="hidden print:block font-bold">
                        {DETECTION_STAGES.find(
                          (stg) => stg.code === row.detectedAt,
                        )?.label ||
                          row.detectedAt ||
                          "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.repairTime}
                        onChange={(e) =>
                          handleRowChange(index, "repairTime", e.target.value)
                        }
                        placeholder="Ex: 5 min"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 text-[11px]"
                      />
                      <span className="hidden print:block">
                        {row.repairTime || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.defectDescription}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "defectDescription",
                            e.target.value,
                          )
                        }
                        placeholder="Description"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 text-[11px]"
                      />
                      <span className="hidden print:block">
                        {row.defectDescription || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.entryDateTime}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "entryDateTime",
                            e.target.value,
                          )
                        }
                        className="no-print w-full border border-slate-300 rounded px-1 py-1 font-mono text-[10px]"
                      />
                      <span className="hidden print:block font-mono">
                        {row.entryDateTime || "—"}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={row.releasedBy}
                        onChange={(e) =>
                          handleRowChange(index, "releasedBy", e.target.value)
                        }
                        placeholder="Matricule"
                        className="no-print w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                      />
                      <span className="hidden print:block font-mono">
                        {row.releasedBy || "—"}
                      </span>
                    </td>
                    <td className="p-1.5 text-center no-print">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm px-1"
                          title="Supprimer la ligne"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <datalist id="fault-codes-list">
            {Array.isArray(defectCodes) &&
              defectCodes.map((item, idx) => {
                const code =
                  item.code ?? item.defectCode ?? item.id ?? item.code_defaut;
                const desc = getBilingualDescription(item);
                return (
                  <option key={item.id || code || idx} value={code}>
                    {code} - {desc}
                  </option>
                );
              })}
          </datalist>

          {/* Action Buttons */}
          <div className="no-print flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg text-xs border border-slate-300 transition flex items-center space-x-1"
            >
              <span>+</span> <span>Ajouter une ligne de défaut</span>
            </button>

            <div className="flex space-x-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-5 py-2.5 rounded-lg text-xs transition"
                >
                  Annuler
                </button>
              )}
              <button
                type="button"
                onClick={handlePrintTrigger}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg text-xs border border-slate-300 transition"
              >
                Imprimer / PDF
              </button>
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold px-7 py-2.5 rounded-lg text-xs shadow-md transition uppercase tracking-wider"
              >
                ✓ Enregistrer la Carte
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
