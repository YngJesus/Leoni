import React, { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function Header({
  step,
  userSession,
  onLogout,
  onGoHome,
  moduleLabel,
  onOpenTriage,
}) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  /* =========================================================
     LOAD NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const items = await api.notifications();

        if (active) {
          setNotifications(items || []);
        }
      } catch {
        // Notifications are non-blocking.
      }
    };

    loadNotifications();

    const timer = window.setInterval(loadNotifications, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  /* =========================================================
     CLOSE NOTIFICATIONS WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markRead = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.markNotificationRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  isRead: true,
                }
              : item,
          ),
        );
      }

      if (
        notification.entityType === "TRIAGE_PLAN" &&
        notification.entityId &&
        onOpenTriage
      ) {
        setShowNotifications(false);
        onOpenTriage(notification.entityId);
      }
    } catch {
      // Non-blocking.
    }
  };

  const respond = async (notification, status) => {
    try {
      if (notification.entityType === "ANNEXE3") {
        await api.approveAnnexe3(notification.entityId, status);
      } else if (notification.entityType === "TRIAGE_PLAN") {
        await api.approveTriage(notification.entityId, status);
      }

      await api.respondNotification(notification.id, status);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                status,
              }
            : item,
        ),
      );
    } catch {
      // Non-blocking.
    }
  };

  const getNotificationType = (notification) => {
    if (notification.entityType === "TRIAGE_PLAN") {
      return "PLAN DE TRIAGE";
    }

    if (notification.entityType === "ANNEXE3") {
      return "ANNEXE 3";
    }

    return "NOTIFICATION";
  };

  return (
    <header className="sticky top-0 z-50 h-[68px] w-full border-b border-[#20345f] bg-[#0d1b3e] text-white shadow-[0_4px_16px_rgba(13,27,62,0.18)]">
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-5 lg:px-7">
        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <div className="flex min-w-0 items-center">
          {/* LEONI */}

          <button
            type="button"
            onClick={onGoHome}
            aria-label="Accueil"
            className="group flex items-center"
          >
            <span className="text-[22px] font-black tracking-[0.18em] text-white transition group-hover:text-blue-200">
              LEONI
            </span>
          </button>

          {/* Vertical divider */}

          <div className="mx-5 hidden h-7 w-px bg-white/15 sm:block" />

          {/* Application + breadcrumb */}

          <div className="hidden min-w-0 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/60">
              Repair Management
            </p>

            <div className="mt-0.5 flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onGoHome}
                className="font-semibold text-blue-100/60 transition hover:text-white"
              >
                Modules
              </button>

              {moduleLabel && (
                <>
                  <span className="text-white/20">/</span>

                  <span className="max-w-[260px] truncate font-semibold text-white">
                    {moduleLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mobile module */}

          {moduleLabel && (
            <div className="ml-4 max-w-[170px] truncate text-sm font-semibold text-white sm:hidden">
              {moduleLabel}
            </div>
          )}
        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        {step > 1 && (
          <div className="flex items-center gap-2">
            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div ref={notificationRef} className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((current) => !current)}
                aria-label="Notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  showNotifications
                    ? "border-white/20 bg-white text-[#0d1b3e]"
                    : "border-white/10 bg-white/5 text-blue-100 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                <svg
                  className="h-[18px] w-[18px]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-[#0d1b3e]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* =================================================
                  NOTIFICATION PANEL
              ================================================= */}

              {showNotifications && (
                <div className="absolute right-0 top-[50px] z-[100] w-[370px] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-[0_16px_45px_rgba(0,0,0,0.25)]">
                  {/* Panel header */}

                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Notifications
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Centre de suivi
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <span className="rounded-md bg-[#eef2f8] px-2 py-1 text-[10px] font-bold text-[#0d1b3e]">
                        {unreadCount} non lue
                        {unreadCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Notification list */}

                  <div className="max-h-[390px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                          <svg
                            className="h-5 w-5 text-slate-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                        </div>

                        <p className="text-xs font-semibold text-slate-500">
                          Aucune notification
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Vous êtes à jour.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`border-b border-slate-100 px-4 py-3.5 transition ${
                            !notification.isRead ? "bg-slate-50" : "bg-white"
                          }`}
                        >
                          {/* Notification */}

                          <button
                            type="button"
                            onClick={() => markRead(notification)}
                            className="block w-full text-left"
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                  notification.isRead
                                    ? "bg-slate-200"
                                    : "bg-[#0d1b3e]"
                                }`}
                              />

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    {getNotificationType(notification)}
                                  </span>

                                  {!notification.isRead && (
                                    <span className="text-[9px] font-bold text-[#0d1b3e]">
                                      NOUVEAU
                                    </span>
                                  )}
                                </div>

                                <p
                                  className={`text-xs leading-5 ${
                                    notification.isRead
                                      ? "font-medium text-slate-500"
                                      : "font-semibold text-slate-800"
                                  }`}
                                >
                                  {notification.message}
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-[9px] text-slate-400">
                                  <span>
                                    {notification.senderName ||
                                      notification.senderMatricule ||
                                      "Système"}
                                  </span>

                                  <span className="text-slate-200">•</span>

                                  <span>
                                    {new Date(
                                      notification.createdAt,
                                    ).toLocaleString("fr-FR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Approval actions */}

                          {notification.status === "PENDING" && (
                            <div className="mt-3 ml-5 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  respond(notification, "APPROVED")
                                }
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-700"
                              >
                                Approuver
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  respond(notification, "REJECTED")
                                }
                                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              >
                                Refuser
                              </button>
                            </div>
                          )}

                          {/* Completed status */}

                          {notification.status &&
                            notification.status !== "PENDING" && (
                              <div className="mt-2 ml-5">
                                <span
                                  className={`inline-flex rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                                    notification.status === "APPROVED"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {notification.status === "APPROVED"
                                    ? "Approuvé"
                                    : "Refusé"}
                                </span>
                              </div>
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="mx-1 hidden h-8 w-px bg-white/10 sm:block" />

            {/* =================================================
                USER
            ================================================= */}

            <div className="flex items-center gap-2.5">
              {/* Avatar */}

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white ring-1 ring-white/10">
                {(userSession.username || userSession.matricule || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>

              {/* User info */}

              <div className="hidden leading-tight md:block">
                <p className="max-w-[150px] truncate text-xs font-bold text-white">
                  {userSession.username || userSession.matricule}
                </p>

                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-blue-200/60">
                  {userSession.role || "Utilisateur"}
                </p>
              </div>
            </div>

            {/* =================================================
                SCOPE
            ================================================= */}

            {userSession.site && (
              <div className="hidden h-9 items-center border-l border-white/10 pl-3 lg:flex">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-blue-200/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.7}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21s8-4.5 8-10a8 8 0 10-16 0c0 5.5 8 10 8 10z"
                    />

                    <circle cx="12" cy="11" r="2.5" />
                  </svg>

                  <div className="leading-tight">
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-blue-200/50">
                      Périmètre
                    </p>

                    <p className="max-w-[190px] truncate text-[11px] font-semibold text-blue-50">
                      {userSession.site}

                      {userSession.client ? ` · ${userSession.client}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                LOGOUT
            ================================================= */}

            <button
              type="button"
              onClick={onLogout}
              className="ml-1 flex h-9 items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 text-xs font-semibold text-red-200 transition hover:border-red-400/40 hover:bg-red-500/20 hover:text-white active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 17l5-5-5-5m5 5H3m9-9V4a2 2 0 012-2h5a2 2 0 012 2v16a2 2 0 01-2 2h-5a2 2 0 01-2-2v-1"
                />
              </svg>

              <span className="hidden lg:inline">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
