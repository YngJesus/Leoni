import React, { useEffect, useState } from "react";
import { api } from "../api";
import { printTriagePlan, triagePrintHtml } from "../printTriage";
import { printRepairCard, repairCardHtml } from "../printRepair";
import { printAnnexe3Card, annexe3CardHtml } from "../printAnnexe3";
import { openPrintWindow, escapeHtml } from "../printTheme";

const roles = ["ADMIN", "PRODUCTION", "PE", "QM"];

const ROLE_META = {
  ADMIN: {
    label: "Administrateur",
    color: "#0f172a",
    bg: "#f1f5f9",
    border: "#cbd5e1",
  },
  PRODUCTION: {
    label: "Production",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  PE: {
    label: "Product Engineer(PE)",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  QM: {
    label: "Qualité (QM)",
    color: "#047857",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
};

const DOMAIN = {
  repair: {
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "Réparation",
  },
  annexe3: {
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    label: "Annexe 3",
  },
  triage: {
    color: "#047857",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    label: "Triage",
  },
  neutral: { color: "#0f172a", bg: "#f1f5f9", border: "#cbd5e1", label: "" },
};

/* ---------- Clean Stroke Icons ---------- */
const Icon = {
  Users: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Building: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M12 6h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M12 10h.01"></path>
      <path d="M8 14h.01"></path>
      <path d="M16 14h.01"></path>
      <path d="M12 14h.01"></path>
    </svg>
  ),
  Clipboard: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  ),
  Grid: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  Wrench: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  ),
  Doc: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Check: (p) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...p}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
};

export default function AdminDashboard({
  onBack,
  onEditDefectCard,
  onPrintDefectCard,
  onEditAnnexe3,
  onEditTriage,
  onPrintTriage,
}) {
  const [tab, setTab] = useState("users");
  const [data, setData] = useState({
    users: [],
    sites: [],
    reparation: [],
    annexe3: [],
    triage: [],
  });

  const [siteName, setSiteName] = useState("");
  const [editingSite, setEditingSite] = useState(null);
  const [editingOem, setEditingOem] = useState(null);
  const [addingOemSiteId, setAddingOemSiteId] = useState(null);
  const [newOemName, setNewOemName] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [oemForm, setOemForm] = useState({ name: "", siteId: "" });
  const [userForm, setUserForm] = useState({
    matricule: "",
    nomComplet: "",
    password: "",
    role: "PRODUCTION",
  });

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    const requests = [
      ["users", api.users()],
      ["sites", api.sites()],
      ["reparation", api.reparationCards()],
      ["annexe3", api.annexe3Cards()],
      ["triage", api.triagePlans()],
    ];
    const results = await Promise.allSettled(
      requests.map(async ([key, request]) => [key, await request]),
    );
    const failed = [];
    const nextData = { ...data };
    results.forEach((result, index) => {
      const key = requests[index][0];
      if (result.status === "fulfilled") {
        nextData[key] = result.value[1];
      } else {
        failed.push(`${key}: ${result.reason.message}`);
      }
    });
    setData(nextData);
    if (failed.length)
      setError(
        `Certaines données n'ont pas pu être chargées. ${failed.join(" ")}`,
      );
  };

  useEffect(() => {
    load();
  }, [tab]);

  const run = async (action, message) => {
    setError("");
    try {
      await action();
      setNotice(message);
      setTimeout(() => setNotice(""), 4000);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const createSite = (event) => {
    event.preventDefault();
    if (siteName.trim())
      run(
        () => api.createSite({ name: siteName.trim(), isActive: true }),
        "Site créé avec succès.",
      ).then(() => setSiteName(""));
  };

  const createUser = (event) => {
    event.preventDefault();
    run(() => api.createUser(userForm), "Utilisateur créé avec succès.").then(
      () =>
        setUserForm({
          matricule: "",
          nomComplet: "",
          password: "",
          role: "PRODUCTION",
        }),
    );
  };

  const updateUser = (event) => {
    event.preventDefault();
    run(
      () =>
        api.updateUser(editingUser.id, {
          matricule: editingUser.matricule,
          nomComplet: editingUser.nomComplet,
          role: editingUser.role,
        }),
      "Utilisateur mis à jour.",
    ).then(() => setEditingUser(null));
  };

  const updateSite = (event) => {
    event.preventDefault();
    run(
      () =>
        api.updateSite(editingSite.id, {
          name: editingSite.name,
          isActive: editingSite.isActive,
        }),
      "Site mis à jour.",
    ).then(() => setEditingSite(null));
  };

  const updateOem = (event) => {
    event.preventDefault();
    run(
      () =>
        api.updateOem(editingOem.id, {
          name: editingOem.name,
          siteId: editingOem.siteId,
          isActive: editingOem.isActive,
        }),
      "OEM mis à jour.",
    ).then(() => setEditingOem(null));
  };

  const createOem = (event) => {
    event.preventDefault();
    if (oemForm.name.trim() && oemForm.siteId)
      run(
        () =>
          api.createOem({
            name: oemForm.name.trim(),
            siteId: oemForm.siteId,
            isActive: true,
          }),
        "OEM créé avec succès.",
      ).then(() => setOemForm({ name: "", siteId: oemForm.siteId }));
  };

  const createOemForSite = (event, siteId) => {
    event.preventDefault();
    if (!newOemName.trim()) return;
    run(
      () => api.createOem({ name: newOemName.trim(), siteId, isActive: true }),
      "OEM créé avec succès.",
    ).then(() => {
      setNewOemName("");
      setAddingOemSiteId(null);
    });
  };

  const editSavedRecord = async (kind, item) => {
    if (kind === "repair") {
      const typeReparation = window.prompt(
        "Type de réparation",
        item.typeReparation,
      );
      if (!typeReparation) return;
      await run(
        () => api.updateReparationCard(item.id, { typeReparation }),
        "Carte de réparation modifiée.",
      );
      return;
    }

    if (kind === "annexe3") {
      const defectDescription = window.prompt(
        "Description du défaut",
        item.defectDescription,
      );
      if (!defectDescription) return;
      await run(
        () =>
          api.updateAnnexe3Card(item.id, {
            defectDescription,
            segmentLine: window.prompt("Segment / ligne", item.segmentLine),
            responsiblePerson: window.prompt(
              "Responsable",
              item.responsiblePerson,
            ),
          }),
        "Carte Annexe 3 modifiée.",
      );
      return;
    }

    if (kind === "triage") {
      const numOrdre = window.prompt("N° d'ordre", item.numOrdre || "");
      const motifBlocage = window.prompt(
        "Motif du blocage",
        item.motifBlocage || "",
      );
      const justificationDecision = window.prompt(
        "Justification de la décision",
        item.justificationDecision || "",
      );
      if (
        numOrdre === null ||
        motifBlocage === null ||
        justificationDecision === null
      )
        return;
      await run(
        () =>
          api.updateTriagePlan(item.id, {
            numOrdre,
            motifBlocage,
            justificationDecision,
          }),
        "Plan de triage modifié.",
      );
    }
  };

  const printAllRecords = () => {
    const groups = [
      ["Cartes de réparation", data.reparation, repairCardHtml],
      ["Cartes Annexe 3", data.annexe3, annexe3CardHtml],
      ["Plans de triage", data.triage, triagePrintHtml],
    ];
    const sections = groups
      .map(([title, records, toHtml]) => {
        const content = records.length
          ? records
              .map((record) => `<div class="keep">${toHtml(record)}</div>`)
              .join("")
          : `<p class="empty">Aucune fiche.</p>`;
        return `<div class="section-title">${escapeHtml(title)} (${records.length})</div>${content}`;
      })
      .join("");
    openPrintWindow("LEONI - Rapport complet des saisies", sections);
  };

  const tabs = [
    { id: "users", label: "Utilisateurs", Icon: Icon.Users },
    { id: "sites", label: "Sites & OEM", Icon: Icon.Building },
    { id: "cards", label: "Cartes & Plans", Icon: Icon.Clipboard },
    { id: "overview", label: "Vue d'ensemble", Icon: Icon.Grid },
  ];

  return (
    <div className="adm-page">
      <style>{STYLES}</style>

      <div className="adm-shell">
        {/* Header */}
        <header className="adm-header">
          <div className="adm-header__left">
            <div className="adm-logo">LEONI</div>
            <div>
              <div className="adm-eyebrow-row">
                <span className="adm-eyebrow">Repair Management Suite</span>
                <span className="adm-role-pill adm-role-pill--admin">
                  ADMINISTRATION
                </span>
              </div>
              <h1 className="adm-title">Panneau Administratif</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="adm-btn adm-btn--outline"
          >
            ← Quitter l'administration
          </button>
        </header>

        {notice && (
          <div className="adm-alert adm-alert--success">
            <span className="adm-alert__indicator" />
            {notice}
          </div>
        )}
        {error && (
          <div className="adm-alert adm-alert--error">
            <span className="adm-alert__indicator" />
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="adm-tabs" aria-label="Navigation administration">
          {tabs.map(({ id, label, Icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`adm-tab ${tab === id ? "adm-tab--active" : ""}`}
            >
              <TabIcon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <main className="adm-content">
          {/* Users Tab */}
          {tab === "users" && (
            <div className="adm-grid-users">
              <form
                onSubmit={editingUser ? updateUser : createUser}
                className="adm-card"
              >
                <div className="adm-card__header">
                  <h2>
                    {editingUser
                      ? "Modifier le compte"
                      : "Créer un utilisateur"}
                  </h2>
                  <p>Gestion des habilitations et accès utilisateurs.</p>
                </div>

                <div className="adm-form-stack">
                  {[
                    ["matricule", "Matricule employé"],
                    ["nomComplet", "Nom et prénom"],
                  ].map(([key, label]) => (
                    <div className="adm-field" key={key}>
                      <label className="adm-label">{label}</label>
                      <input
                        required
                        placeholder={label}
                        value={editingUser ? editingUser[key] : userForm[key]}
                        onChange={(e) =>
                          editingUser
                            ? setEditingUser({
                                ...editingUser,
                                [key]: e.target.value,
                              })
                            : setUserForm({
                                ...userForm,
                                [key]: e.target.value,
                              })
                        }
                        className="adm-input"
                      />
                    </div>
                  ))}

                  {!editingUser && (
                    <div className="adm-field">
                      <label className="adm-label">
                        Mot de passe temporaire
                      </label>
                      <input
                        required
                        minLength={6}
                        type="password"
                        placeholder="••••••••"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm({ ...userForm, password: e.target.value })
                        }
                        className="adm-input"
                      />
                    </div>
                  )}

                  <div className="adm-field">
                    <label className="adm-label">Rôle fonctionnel</label>
                    <select
                      value={editingUser ? editingUser.role : userForm.role}
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({
                              ...editingUser,
                              role: e.target.value,
                            })
                          : setUserForm({ ...userForm, role: e.target.value })
                      }
                      className="adm-input adm-select"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_META[role]?.label || role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="adm-card__footer">
                  <button type="submit" className="adm-btn adm-btn--primary">
                    {editingUser
                      ? "Mettre à jour"
                      : "Enregistrer l'utilisateur"}
                  </button>
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="adm-btn adm-btn--outline"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>

              <div className="adm-card adm-card--flush">
                <div className="adm-table-wrapper">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Matricule</th>
                        <th>Nom complet</th>
                        <th>Rôle</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.length ? (
                        data.users.map((user) => (
                          <tr key={user.id}>
                            <td className="adm-mono text-medium">
                              {user.matricule}
                            </td>
                            <td className="text-bold text-dark">
                              {user.nomComplet}
                            </td>
                            <td>
                              <RoleBadge role={user.role} />
                            </td>
                            <td className="text-right">
                              <div className="adm-table-actions">
                                <button
                                  type="button"
                                  onClick={() => setEditingUser(user)}
                                  className="adm-action-link"
                                >
                                  Modifier
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    run(
                                      () => api.deleteUser(user.id),
                                      "Utilisateur supprimé.",
                                    )
                                  }
                                  className="adm-action-link adm-action-link--danger"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="adm-empty">
                            Aucun utilisateur enregistré.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sites & OEM Tab */}
          {tab === "sites" && (
            <div className="adm-stack">
              <div className="adm-grid-2">
                <form
                  onSubmit={createSite}
                  className="adm-card adm-card--compact"
                >
                  <h3 className="adm-section-subtitle">
                    Ajouter un site de production
                  </h3>
                  <div className="adm-inline-row">
                    <input
                      required
                      placeholder="Ex: Sousse 1 (LT4)"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="adm-input"
                    />
                    <button type="submit" className="adm-btn adm-btn--primary">
                      Ajouter
                    </button>
                  </div>
                </form>

                <form
                  onSubmit={createOem}
                  className="adm-card adm-card--compact"
                >
                  <h3 className="adm-section-subtitle">
                    Ajouter un client OEM
                  </h3>
                  <div className="adm-inline-row">
                    <input
                      required
                      placeholder="Ex: BMW U11"
                      value={oemForm.name}
                      onChange={(e) =>
                        setOemForm({ ...oemForm, name: e.target.value })
                      }
                      className="adm-input"
                    />
                    <select
                      required
                      value={oemForm.siteId}
                      onChange={(e) =>
                        setOemForm({ ...oemForm, siteId: e.target.value })
                      }
                      className="adm-input adm-select"
                    >
                      <option value="">Sélectionner le site</option>
                      {data.sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="adm-btn adm-btn--primary">
                      Créer
                    </button>
                  </div>
                </form>
              </div>

              <div className="adm-grid-sites">
                {data.sites.map((site) => (
                  <div key={site.id} className="adm-site-card">
                    <div className="adm-site-card__header">
                      {editingSite?.id === site.id ? (
                        <form onSubmit={updateSite} className="adm-inline-edit">
                          <input
                            required
                            value={editingSite.name}
                            onChange={(e) =>
                              setEditingSite({
                                ...editingSite,
                                name: e.target.value,
                              })
                            }
                            className="adm-input adm-input-sm"
                          />
                          <button
                            type="submit"
                            className="adm-btn adm-btn--primary adm-btn--xs"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSite(null)}
                            className="adm-btn adm-btn--outline adm-btn--xs"
                          >
                            ✕
                          </button>
                        </form>
                      ) : (
                        <h3>{site.name}</h3>
                      )}
                      <div className="adm-table-actions">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSite({
                              id: site.id,
                              name: site.name,
                              isActive: site.isActive,
                            })
                          }
                          className="adm-action-link"
                        >
                          Éditer
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            run(() => api.deleteSite(site.id), "Site supprimé.")
                          }
                          className="adm-action-link adm-action-link--danger"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <div className="adm-site-card__body">
                      <span className="adm-label-micro">
                        Programmes OEM associés ({site.oems?.length || 0})
                      </span>
                      <div className="adm-chips">
                        {site.oems?.map((oem) =>
                          editingOem?.id === oem.id ? (
                            <form
                              key={oem.id}
                              onSubmit={updateOem}
                              className="adm-inline-edit"
                            >
                              <input
                                required
                                value={editingOem.name}
                                onChange={(e) =>
                                  setEditingOem({
                                    ...editingOem,
                                    name: e.target.value,
                                  })
                                }
                                className="adm-input adm-input-sm"
                              />
                              <button
                                type="submit"
                                className="adm-btn adm-btn--primary adm-btn--xs"
                              >
                                OK
                              </button>
                            </form>
                          ) : (
                            <div key={oem.id} className="adm-chip">
                              <span>{oem.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingOem({
                                    id: oem.id,
                                    name: oem.name,
                                    siteId: site.id,
                                    isActive: oem.isActive,
                                  })
                                }
                                className="adm-chip-btn"
                                title="Modifier"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  run(
                                    () => api.deleteOem(oem.id),
                                    "OEM supprimé.",
                                  )
                                }
                                className="adm-chip-btn adm-chip-btn--danger"
                                title="Supprimer"
                              >
                                ×
                              </button>
                            </div>
                          ),
                        )}
                      </div>

                      {addingOemSiteId === site.id ? (
                        <form
                          onSubmit={(event) => createOemForSite(event, site.id)}
                          className="adm-inline-form-tight"
                        >
                          <input
                            required
                            autoFocus
                            placeholder="Nom du nouvel OEM"
                            value={newOemName}
                            onChange={(event) =>
                              setNewOemName(event.target.value)
                            }
                            className="adm-input adm-input-sm"
                          />
                          <button
                            type="submit"
                            className="adm-btn adm-btn--primary adm-btn--xs"
                          >
                            Ajouter
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingOemSiteId(null)}
                            className="adm-btn adm-btn--outline adm-btn--xs"
                          >
                            Annuler
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingOemSiteId(site.id)}
                          className="adm-action-link adm-add-link"
                        >
                          + Ajouter un OEM sur ce site
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards & Plans Tab */}
          {tab === "cards" && (
            <div>
              <div className="adm-toolbar no-print">
                <button
                  type="button"
                  onClick={load}
                  className="adm-btn adm-btn--outline"
                >
                  Actualiser les données
                </button>
                <button
                  type="button"
                  onClick={printAllRecords}
                  className="adm-btn adm-btn--primary"
                >
                  Imprimer l'ensemble des fiches
                </button>
              </div>

              <div className="adm-grid-3">
                <DataList
                  title="Cartes de réparation"
                  items={data.reparation}
                  kind="repair"
                  onEdit={onEditDefectCard || editSavedRecord}
                  onPrint={
                    onPrintDefectCard || ((_, item) => printRepairCard(item))
                  }
                />
                <DataList
                  title="Cartes Annexe 3"
                  items={data.annexe3}
                  kind="annexe3"
                  onEdit={onEditAnnexe3 || editSavedRecord}
                  onPrint={(_, item) => printAnnexe3Card(item)}
                />
                <DataList
                  title="Plans de triage"
                  items={data.triage}
                  kind="triage"
                  onEdit={onEditTriage || editSavedRecord}
                  onPrint={
                    onPrintTriage || ((_, item) => printTriagePlan(item))
                  }
                />
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {tab === "overview" && (
            <div className="adm-grid-stats">
              {[
                [
                  "Utilisateurs actifs",
                  data.users.length,
                  "neutral",
                  <Icon.Users key="i" />,
                ],
                [
                  "Sites & Usines",
                  data.sites.length,
                  "neutral",
                  <Icon.Building key="i" />,
                ],
                [
                  "Cartes de réparation",
                  data.reparation.length,
                  "repair",
                  <Icon.Wrench key="i" />,
                ],
                [
                  "Fiches Annexe 3",
                  data.annexe3.length,
                  "annexe3",
                  <Icon.Doc key="i" />,
                ],
                [
                  "Plans de triage",
                  data.triage.length,
                  "triage",
                  <Icon.Check key="i" />,
                ],
              ].map(([label, value, kind, icon]) => (
                <div
                  key={label}
                  className={`adm-stat-card adm-stat-card--${kind}`}
                >
                  <div className="adm-stat-card__top">
                    <span>{label}</span>
                    <div className="adm-stat-card__icon">{icon}</div>
                  </div>
                  <div className="adm-stat-card__value">{value}</div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.ADMIN;
  return (
    <span
      className="adm-badge"
      style={{
        color: meta.color,
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      {meta.label}
    </span>
  );
}

function DataList({ title, items, kind, onEdit, onPrint }) {
  const domain = DOMAIN[kind] || DOMAIN.neutral;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("fr-FR");
  };

  const statusStyle = (status) => {
    if (!status) return null;
    const s = status.toUpperCase();
    if (s.includes("APPROV") || s.includes("VALID") || s.includes("TERMINE"))
      return { color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" };
    if (s.includes("PENDING") || s.includes("EN COURS"))
      return { color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
    if (s.includes("REJECT") || s.includes("REFUS"))
      return { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" };
    return { color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" };
  };

  const getItemTitle = (item) => {
    if (item.cardNo) return item.cardNo;
    if (item.numFicheRetouche) return item.numFicheRetouche;
    if (item.code) return item.code;
    if (item.id)
      return item.id.length > 18 ? `${item.id.slice(0, 8)}...` : item.id;
    return "Fiche technique";
  };

  const getItemAuthor = (item) =>
    item.creator ||
    item.createdBy ||
    item.responsiblePerson ||
    item.user ||
    null;
  const getItemDate = (item) =>
    formatDate(
      item.createdAt || item.dateCreation || item.date || item.updatedAt,
    );

  return (
    <div className="adm-datalist" style={{ borderTopColor: domain.color }}>
      <div className="adm-datalist__header">
        <h3>{title}</h3>
        <span
          className="adm-datalist__counter"
          style={{
            color: domain.color,
            background: domain.bg,
            borderColor: domain.border,
          }}
        >
          {items?.length || 0}
        </span>
      </div>

      <div className="adm-datalist__list">
        {items && items.length > 0 ? (
          items.map((item, idx) => {
            const author = getItemAuthor(item);
            const date = getItemDate(item);
            const badge = statusStyle(item.status);

            return (
              <div key={item.id || idx} className="adm-record-row">
                <div className="adm-record-info">
                  <div className="adm-record-top">
                    <span className="adm-record-code">
                      {getItemTitle(item)}
                    </span>
                    {badge && (
                      <span
                        className="adm-badge adm-badge-sm"
                        style={{
                          color: badge.color,
                          background: badge.bg,
                          borderColor: badge.border,
                        }}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                  {(author || date) && (
                    <div className="adm-record-meta">
                      {author && (
                        <span>
                          Par <strong className="text-dark">{author}</strong>
                        </span>
                      )}
                      {author && date && <span>•</span>}
                      {date && <span>{date}</span>}
                    </div>
                  )}
                </div>
                <div className="adm-record-actions">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(kind, item)}
                      className="adm-action-link"
                    >
                      Éditer
                    </button>
                  )}
                  {onPrint && (
                    <button
                      type="button"
                      onClick={() => onPrint(title, item)}
                      className="adm-action-link adm-action-link--muted"
                    >
                      Imprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="adm-empty">Aucun enregistrement disponible.</p>
        )}
      </div>
    </div>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

.adm-page {
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --border-color: #e2e8f0;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --primary: #0f172a;
  --primary-hover: #1e293b;
  --accent-blue: #2563eb;
  
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  min-height: 100vh;
  padding: 32px 24px 64px;
}

.adm-page * { box-sizing: border-box; }

.adm-shell {
  max-width: 1320px;
  margin: 0 auto;
}

/* Header */
.adm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.adm-header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.adm-logo {
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.08em;
  background: #0f172a;
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 8px;
}

.adm-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.adm-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.adm-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.01em;
}

.adm-role-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.adm-role-pill--admin {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

/* Alerts / Notifications */
.adm-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid transparent;
}
.adm-alert__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.adm-alert--success {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}
.adm-alert--success .adm-alert__indicator { background: #059669; }
.adm-alert--error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}
.adm-alert--error .adm-alert__indicator { background: #dc2626; }

/* Tabs Navigation */
.adm-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.adm-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.adm-tab:hover {
  color: var(--text-main);
}

.adm-tab--active {
  color: var(--accent-blue);
  border-bottom-color: var(--accent-blue);
  background: rgba(37, 99, 235, 0.02);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

/* Common Card Containers */
.adm-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
}

.adm-card--compact { padding: 20px; }
.adm-card--flush { padding: 0; overflow: hidden; }

.adm-card__header {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
}

.adm-card__header h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 4px;
}

.adm-card__header p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.adm-section-subtitle {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text-main);
}

/* Forms & Fields */
.adm-form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.adm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.adm-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.adm-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: var(--text-main);
  background: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.adm-input:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.adm-input-sm { padding: 6px 10px; font-size: 12px; }
.adm-select { cursor: pointer; }
.adm-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

.adm-card__footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

/* Buttons */
.adm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;
}

.adm-btn:active { transform: translateY(1px); }
.adm-btn--primary { background: var(--primary); color: #ffffff; }
.adm-btn--primary:hover { background: var(--primary-hover); }
.adm-btn--outline { background: #ffffff; color: var(--text-main); border-color: var(--border-color); }
.adm-btn--outline:hover { background: #f8fafc; }
.adm-btn--xs { padding: 4px 10px; font-size: 11px; }

/* Tables */
.adm-table-wrapper { width: 100%; overflow-x: auto; }
.adm-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
.adm-table th { background: #f8fafc; padding: 12px 16px; font-weight: 700; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
.adm-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
.adm-table tr:last-child td { border-bottom: none; }
.adm-table tr:hover td { background: #fcfcfd; }
.adm-empty { text-align: center; padding: 32px; color: var(--text-muted); font-size: 13px; }

/* Badges */
.adm-badge {
  display: inline-flex;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
}
.adm-badge-sm { font-size: 10px; padding: 2px 6px; }

/* Actions */
.adm-table-actions { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }
.adm-action-link { background: none; border: none; padding: 0; font-size: 12px; font-weight: 600; color: var(--accent-blue); cursor: pointer; }
.adm-action-link:hover { text-decoration: underline; }
.adm-action-link--danger { color: #dc2626; }
.adm-action-link--muted { color: var(--text-muted); }
.adm-add-link { margin-top: 12px; display: inline-block; }

/* Layouts & Grids */
.adm-grid-users { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
@media (max-width: 960px) { .adm-grid-users { grid-template-columns: 1fr; } }

.adm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
@media (max-width: 768px) { .adm-grid-2 { grid-template-columns: 1fr; } }

.adm-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 1024px) { .adm-grid-3 { grid-template-columns: 1fr; } }

.adm-stack { display: flex; flex-direction: column; gap: 24px; }
.adm-inline-row { display: flex; gap: 10px; }

/* Sites & OEM cards */
.adm-grid-sites { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.adm-site-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; }
.adm-site-card__header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px; }
.adm-site-card__header h3 { font-size: 14px; font-weight: 700; margin: 0; }
.adm-label-micro { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
.adm-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.adm-chip { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 500; }
.adm-chip-btn { background: none; border: none; cursor: pointer; color: #1e3a8a; font-size: 12px; padding: 0; opacity: 0.7; }
.adm-chip-btn:hover { opacity: 1; }
.adm-chip-btn--danger { color: #dc2626; font-weight: 700; }

.adm-inline-edit { display: flex; gap: 6px; align-items: center; }
.adm-inline-form-tight { display: flex; gap: 6px; margin-top: 12px; }

/* Toolbar */
.adm-toolbar { display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 20px; }

/* Datalists / Card items */
.adm-datalist { background: var(--bg-card); border: 1px solid var(--border-color); border-top: 3px solid; border-radius: 12px; padding: 20px; }
.adm-datalist__header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px; }
.adm-datalist__header h3 { font-size: 14px; font-weight: 700; margin: 0; }
.adm-datalist__counter { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; border: 1px solid transparent; }
.adm-datalist__list { display: flex; flex-direction: column; gap: 10px; max-height: 460px; overflow-y: auto; padding-right: 4px; }

.adm-record-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
.adm-record-top { display: flex; align-items: center; gap: 8px; }
.adm-record-code { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: var(--text-main); }
.adm-record-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.adm-record-actions { display: flex; gap: 12px; flex-shrink: 0; }

/* Overview Stats Grid */
.adm-grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
.adm-stat-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
.adm-stat-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.adm-stat-card--neutral::before { background: #0f172a; }
.adm-stat-card--repair::before { background: #b45309; }
.adm-stat-card--annexe3::before { background: #2563eb; }
.adm-stat-card--triage::before { background: #047857; }

.adm-stat-card__top { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; color: var(--text-muted); }
.adm-stat-card__icon { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: var(--text-main); }
.adm-stat-card--repair .adm-stat-card__icon { background: #fffbeb; color: #b45309; }
.adm-stat-card--annexe3 .adm-stat-card__icon { background: #eff6ff; color: #2563eb; }
.adm-stat-card--triage .adm-stat-card__icon { background: #ecfdf5; color: #047857; }
.adm-stat-card__value { font-size: 28px; font-weight: 700; color: var(--text-main); margin-top: 12px; letter-spacing: -0.02em; }

.text-bold { font-weight: 600; }
.text-dark { color: var(--text-main); }
.text-medium { font-weight: 500; }
.text-right { text-align: right; }

@media print { .no-print { display: none !important; } }
`;
