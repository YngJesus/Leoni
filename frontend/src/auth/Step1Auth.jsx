import React, { useState } from "react";

export default function Step1Auth({
  userSession,
  setUserSession,
  onLogin,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userSession.matricule || !userSession.password) return;

    setIsLoading(true);

    try {
      await onLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-900 antialiased">
      <div className="flex min-h-screen w-full">
        {/* =========================================================
            LEFT — INDUSTRIAL BRAND PANEL
        ========================================================= */}
        <section className="relative hidden overflow-hidden bg-[#06101f] text-white lg:flex lg:w-[53%]">
          {/* Blueprint grid */}
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #94a3b8 1px, transparent 1px),
                linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
              `,
              backgroundSize: "42px 42px",
            }}
          />

          {/* Fine technical lines */}
          <div className="absolute left-0 top-[22%] h-px w-full bg-slate-700/30" />
          <div className="absolute left-[12%] top-0 h-full w-px bg-slate-700/20" />
          <div className="absolute right-[18%] top-0 h-full w-px bg-slate-700/10" />

          {/* Decorative circles */}
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full border border-slate-700/30" />
          <div className="absolute -right-20 -top-20 h-[350px] w-[350px] rounded-full border border-slate-700/20" />

          {/* Blue glow */}
          <div className="absolute left-[20%] top-[30%] h-72 w-72 rounded-full bg-blue-600/10 blur-[120px]" />

          {/* Content */}
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-14 py-12 xl:px-20 xl:py-14">
            {/* Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60">
                  <span className="text-lg font-black tracking-tight">L</span>
                </div>

                <div>
                  <div className="text-lg font-black tracking-[0.18em]">
                    LEONI
                  </div>

                  <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Wiring Systems
                  </div>
                </div>
              </div>

              <div className="rounded-full border border-slate-700/70 bg-slate-900/50 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    System Online
                  </span>
                </div>
              </div>
            </div>

            {/* Main hero */}
            <div className="my-auto max-w-xl py-20">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-8 bg-blue-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-400">
                  Digital Workflow Platform
                </span>
              </div>

              <h1 className="text-5xl font-black leading-[1.04] tracking-[-0.035em] xl:text-6xl">
                Retouche
                <br />
                <span className="text-blue-500">&amp; Réparation</span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-slate-400">
                Une plateforme centralisée pour digitaliser le traitement des
                défauts, le triage, les opérations de retouche et la validation
                qualité.
              </p>

              {/* Workflow indicators */}
              <div className="mt-10 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold">
                    01
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Défaut
                  </span>
                </div>

                <span className="h-px w-8 bg-slate-700" />

                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-400">
                    02
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Triage
                  </span>
                </div>

                <span className="h-px w-8 bg-slate-700" />

                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-400">
                    03
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Validation
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between border-t border-slate-800/80 pt-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  LEONI Wiring Systems
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[9px] text-slate-600">
                  IT TN 3067
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT — LOGIN
        ========================================================= */}
        <main className="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-12 lg:w-[47%] lg:px-16 xl:px-24">
          <div className="w-full max-w-[420px]">
            {/* Mobile brand */}
            <div className="mb-14 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#06101f] text-sm font-black text-white">
                L
              </div>

              <div>
                <div className="text-base font-black tracking-[0.15em] text-slate-900">
                  LEONI
                </div>

                <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Wiring Systems
                </div>
              </div>
            </div>

            {/* Login heading */}
            <div className="mb-9">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-sm bg-blue-600" />

                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Accès sécurisé
                </span>
              </div>

              <h2 className="text-[32px] font-black tracking-[-0.03em] text-slate-950">
                Connexion
              </h2>

              <p className="mt-3 max-w-sm text-[13px] leading-6 text-slate-500">
                Connectez-vous avec votre matricule professionnel pour accéder à
                la plateforme.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Matricule */}
              <div>
                <label
                  htmlFor="matricule"
                  className="mb-2.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
                >
                  Matricule
                </label>

                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center border-r border-slate-200">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="text-slate-400 transition group-focus-within:text-blue-600"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 8h10M7 12h4M7 16h7" />
                    </svg>
                  </div>

                  <input
                    id="matricule"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="ADMIN-001"
                    value={userSession.matricule}
                    onChange={(e) =>
                      setUserSession({
                        ...userSession,
                        matricule: e.target.value,
                      })
                    }
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50
                      pl-16
                      pr-4
                      font-mono
                      text-sm
                      font-semibold
                      tracking-wide
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-blue-600
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-600/10
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600"
                  >
                    Mot de passe
                  </label>
                </div>

                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center border-r border-slate-200">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="text-slate-400 transition group-focus-within:text-blue-600"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </div>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={userSession.password}
                    onChange={(e) =>
                      setUserSession({
                        ...userSession,
                        password: e.target.value,
                      })
                    }
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-slate-50
                      pl-16
                      pr-12
                      text-sm
                      font-semibold
                      tracking-wide
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-blue-600
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-600/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 8-.4 1.5-1.2 2.9-2.3 4" />
                        <path d="M6.6 6.6C4.5 8 3.3 10.2 2.5 12c1 4 4.5 8 9.5 8 1.7 0 3.2-.4 4.5-1.1" />
                      </svg>
                    ) : (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3.5"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-red-600"
                    >
                      <path d="M12 8v5M12 16h.01" />
                    </svg>
                  </div>

                  <p className="text-xs font-semibold leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  group
                  relative
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-lg
                  bg-[#071225]
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-slate-900/10
                  transition
                  duration-200
                  hover:bg-[#0d1c35]
                  hover:shadow-xl
                  hover:shadow-slate-900/15
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Authentification...</span>
                  </span>
                ) : (
                  <>
                    <span>Se connecter</span>

                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Security information */}
            <div className="mt-10 border-t border-slate-100 pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="text-slate-500"
                  >
                    <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                    Environnement sécurisé
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    L'accès à cette plateforme est réservé aux utilisateurs
                    autorisés de LEONI Wiring Systems.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom version */}
            <div className="mt-8 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.15em] text-slate-300">
              <span>Retouche &amp; Réparation</span>
              <span>v1.0.0 · 2026</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
