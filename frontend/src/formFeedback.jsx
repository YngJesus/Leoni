export function fieldClass(hasError, extra = "") {
  return [
    extra,
    hasError
      ? "border-red-400 bg-red-50 text-red-900 ring-4 ring-red-100 shadow-[0_0_0_3px_rgba(239,68,54,0.12)]"
      : "border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
    "rounded-xl border px-3 py-2.5 text-sm transition duration-150 outline-none",
  ]
    .filter(Boolean)
    .join(" ");
}

export function FieldHint({ show, children }) {
  if (!show) return null;
  return (
    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-red-600">
      {children}
    </p>
  );
}

export function jumpTo(id) {
  const node = document.getElementById(id);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof node.focus === "function") {
    window.setTimeout(() => node.focus(), 250);
  }
}

export function ErrorBanner({ errors, onJump }) {
  if (!errors?.length) return null;
  return (
    <div
      role="alert"
      className="no-print sticky top-16 z-30 mx-4 mt-4 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-red-900 shadow-lg md:mx-6"
    >
      <p className="text-sm font-black uppercase tracking-wide">
        Champs manquants — corrigez les zones en rouge
      </p>
      <p className="mt-1 text-xs font-semibold">
        {errors.length} champ{errors.length > 1 ? "s" : ""} à remplir. Cliquez
        pour y aller :
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {errors.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => (onJump || jumpTo)(item.id)}
              className="rounded-full border border-red-400 bg-white px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100"
            >
              → {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const seq = String(now.getTime()).slice(-6);
  return `ORD-${year}-${seq}`;
}
