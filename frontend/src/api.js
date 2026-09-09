const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("leoni_access_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message;
    const readableMessage = Array.isArray(message)
      ? message
          .map((item) => {
            if (item.includes("numOrdre"))
              return "Le N° d'ordre est obligatoire.";
            if (item.includes("numSerie"))
              return "Le N° de série est obligatoire.";
            if (item.includes("motifBlocage"))
              return "Le motif du triage est obligatoire.";
            if (item.includes("assignedQmMatricule"))
              return "Sélectionnez un responsable Qualité (QM).";
            return item;
          })
          .join(" ")
      : message;
    throw new Error(readableMessage || `Erreur API (${response.status})`);
  }
  return body;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  login: (matricule, password) =>
    request("/auth/login", json("POST", { matricule, password })),
  sites: () => request("/admin/sites"),
  createSite: (data) => request("/admin/sites", json("POST", data)),
  updateSite: (id, data) => request(`/admin/sites/${id}`, json("PATCH", data)),
  deleteSite: (id) => request(`/admin/sites/${id}`, { method: "DELETE" }),
  createOem: (data) => request("/admin/oems", json("POST", data)),
  updateOem: (id, data) => request(`/admin/oems/${id}`, json("PATCH", data)),
  siteOems: (siteId) => request(`/admin/sites/${siteId}/oems`),
  deleteOem: (id) => request(`/admin/oems/${id}`, { method: "DELETE" }),
  users: () => request("/users"),
  reparationMine: () => request("/reparation-cards/mine"),
  createUser: (data) => request("/users", json("POST", data)),
  updateUser: (id, data) => request(`/users/${id}`, json("PATCH", data)),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),
  defectCodes: (query = "") =>
    request(`/defect-codes${query ? `?q=${encodeURIComponent(query)}` : ""}`),
  reparationCards: () => request("/reparation-cards"),
  createReparationCard: (data) =>
    request("/reparation-cards", json("POST", data)),
  reparationCard: (id) => request(`/reparation-cards/${id}`),
  updateReparationCard: (id, data) =>
    request(`/reparation-cards/${id}`, json("PATCH", data)),
  annexe3Cards: () => request("/annexe3"),
  annexe3Mine: () => request("/annexe3/mine"),
  createAnnexe3Card: (data) => request("/annexe3", json("POST", data)),
  updateAnnexe3Card: (id, data) =>
    request(`/annexe3/${id}`, json("PATCH", data)),
  deleteAnnexe3Card: (id) => request(`/annexe3/${id}`, { method: "DELETE" }),
  triagePlans: () => request("/triage-plans"),
  triageMine: () => request("/triage-plans/mine"),
  triagePlan: (id) => request(`/triage-plans/${id}`),
  createTriagePlan: (data) => request("/triage-plans", json("POST", data)),
  updateTriageProduction: (id, data) =>
    request(`/triage-plans/${id}/production`, json("PATCH", data)),
  updateTriagePe: (id, data) =>
    request(`/triage-plans/${id}/step-3-pe`, json("PATCH", data)),
  updateTriageQm: (id, data) =>
    request(`/triage-plans/${id}/step-4-qm`, json("PATCH", data)),
  updateTriagePlan: (id, data) =>
    request(`/triage-plans/${id}`, json("PATCH", data)),
  notifications: () => request("/notifications/mine"),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: "PATCH" }),
  respondNotification: (id, status) =>
    request(`/notifications/${id}/respond`, json("PATCH", { status })),
  approveAnnexe3: (id, status) =>
    request(`/annexe3/${id}/approval`, json("PATCH", { status })),
  approveTriage: (id, status) =>
    request(`/triage-plans/${id}/approval`, json("PATCH", { status })),
};

export function clearSession() {
  localStorage.removeItem("leoni_access_token");
}
