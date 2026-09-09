import React from "react";

const modules = [
  {
    id: "defects",
    title: "Enregistrement des Défauts",
    description:
      "Saisie et suivi détaillé des défauts retouchés et/ou réparés sur la ligne.",
    buttonText: "Saisir les Défauts",
    code: "MOD·DEF",
    accent: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
      bar: "bg-amber-500",
      btnHover: "hover:bg-amber-600 hover:text-white hover:border-amber-600",
    },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path
          d="M12 3.5 21.5 20h-19L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 9.5v4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17" r="0.9" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "intersegment",
    title: "Serial defects",
    description: "Annexe 3 .",
    buttonText: "Ouvrir le Plan",
    code: "MOD·ISG",
    accent: {
      text: "text-blue-700",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
      bar: "bg-blue-600",
      btnHover: "hover:bg-blue-600 hover:text-white hover:border-blue-600",
    },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1M18.6 18.6l-2.1-2.1M7.5 7.5 5.4 5.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "rework",
    title: "Plan de triage et de retouche",
    description:
      "Une fiche unique (Annexe 2) : Production, PE et QM remplissent leurs champs, puis la fiche complète est consultable.",
    buttonText: "Ouvrir les fiches",
    code: "MOD·RWK",
    accent: {
      text: "text-teal-700",
      bg: "bg-teal-50",
      ring: "ring-teal-100",
      bar: "bg-teal-600",
      btnHover: "hover:bg-teal-600 hover:text-white hover:border-teal-600",
    },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path
          d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.2L4 16.6V20h3.4l6.1-6.1a3.5 3.5 0 0 0 4.2-4.6l-2.2 2.2-1.9-.5-.5-1.9 2.2-2.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "history",
    title: "Mon historique",
    description: "Consulter les pages créées ou assignées à votre matricule.",
    buttonText: "Voir l'historique",
    code: "MOD·HIS",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-100",
      bar: "bg-cyan-600",
      btnHover: "hover:bg-cyan-600 hover:text-white hover:border-cyan-600",
    },
    icon: <span className="text-xl">◷</span>,
  },
];

export default function ModuleSelector({ onSelectModule, isAdmin }) {
  const allModules = [
    ...modules,
    ...(isAdmin
      ? [
          {
            id: "admin",
            title: "Administration",
            description: "Utilisateurs, sites, cartes et plans.",
            buttonText: "Ouvrir",
            code: "SYS·ADM",
            accent: {
              text: "text-slate-700",
              bg: "bg-slate-100",
              ring: "ring-slate-200",
              bar: "bg-slate-900",
              btnHover:
                "hover:bg-slate-900 hover:text-white hover:border-slate-900",
            },
            icon: <span className="text-xl">⚙</span>,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Choix du Module d'Intervention
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allModules.map((mod) => (
          <button
            type="button"
            key={mod.id}
            onClick={() => onSelectModule(mod.id)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Barre de couleur supérieure */}
            <div className={`h-1.5 w-full ${mod.accent.bar}`} />

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.accent.bg} ${mod.accent.text} ring-1 ${mod.accent.ring}`}
                  >
                    {mod.icon}
                  </div>
                  <span className="pt-1 font-mono text-[10px] tracking-wider text-slate-300 transition-colors group-hover:text-slate-400">
                    {mod.code}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-bold text-slate-900">
                  {mod.title}
                </h3>
                <p className="mb-6 text-xs leading-relaxed text-slate-500">
                  {mod.description}
                </p>
              </div>

              <span
                className={`block w-full rounded-xl border border-slate-200 py-2.5 px-4 text-center text-xs font-semibold text-slate-700 transition-all duration-200 ${mod.accent.btnHover}`}
              >
                {mod.buttonText}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
