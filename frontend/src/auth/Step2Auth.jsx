import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Step2Perimeter({
  userSession,
  setUserSession,
  onBack,
  onNext,
}) {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    api
      .sites()
      .then(setSites)
      .catch(() => setSites([]));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userSession.siteId && userSession.clientOemId) onNext();
  };

  const selectedSiteObj = sites.find((site) => site.id === userSession.siteId);
  const availableOems = selectedSiteObj?.oems || [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Title */}
      <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-slate-900">
        Sélection du périmètre
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Sites LEONI */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#2563eb]">
            SITE LEONI
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sites.map((site) => {
              const isSelected = userSession.siteId === site.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() =>
                    setUserSession({
                      ...userSession,
                      site: site.name,
                      siteId: site.id,
                      client: "",
                      clientOemId: "",
                    })
                  }
                  className={`flex items-center space-x-3 rounded-xl border px-4 py-3.5 text-left transition duration-150 ${
                    isSelected
                      ? "border-[#3b82f6] bg-[#eff6ff] text-[#1d4ed8]"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-[#3b82f6]" : "text-slate-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold">{site.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: OEMs */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#d97706]">
            PROJET CLIENT (OEM)
          </label>

          {!userSession.siteId ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
              Veuillez d'abord sélectionner un site LEONI ci-dessus.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {availableOems.map((client) => {
                const isSelected = userSession.clientOemId === client.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() =>
                      setUserSession({
                        ...userSession,
                        client: client.name,
                        clientOemId: client.id,
                      })
                    }
                    className={`rounded-xl border px-3 py-3.5 text-center transition duration-150 ${
                      isSelected
                        ? "border-[#3b82f6] bg-[#eff6ff] text-[#1d4ed8]"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold">{client.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={!userSession.siteId || !userSession.clientOemId}
            className="w-2/3 rounded-xl bg-[#0a1224] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#111e38] disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.99]"
          >
            Accéder aux modules
          </button>
        </div>
      </form>
    </div>
  );
}