import React, { useMemo, useState, useEffect, useRef } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";

function getNotificationTone(status = "") {
  if (status === "Confirmee" || status === "Actif") return "success";
  if (status === "En attente") return "pending";
  if (status === "message") return "chat";
  if (["Annulee", "Refusee"].includes(status)) return "danger";
  return "neutral";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "a l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

// Persist read notification IDs in localStorage
function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem("campusride-read-notifs") || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids) {
  try {
    // Keep only last 200 to avoid localStorage bloat
    const arr = [...ids].slice(-200);
    localStorage.setItem("campusride-read-notifs", JSON.stringify(arr));
  } catch { /* ignore */ }
}

// Persist notification history so items don't disappear on data refresh
function getSavedNotifs() {
  try {
    return JSON.parse(localStorage.getItem("campusride-notif-history") || "[]");
  } catch {
    return [];
  }
}

function saveNotifHistory(items) {
  try {
    // Keep last 100
    const arr = items.slice(0, 100);
    localStorage.setItem("campusride-notif-history", JSON.stringify(arr));
  } catch { /* ignore */ }
}

export default function Notifications({
  mode = "passenger",
  navigate,
  onSelectNotification,
  publishedTrips = [],
  reservations = [],
  recentMessages = [],
}) {
  const [readIds, setReadIds] = useState(getReadIds);
  const savedHistoryRef = useRef(getSavedNotifs());

  // Sync from localStorage on mount
  useEffect(() => {
    setReadIds(getReadIds());
  }, []);

  const items = useMemo(() => {
    const messageItems = recentMessages.map((msg) => ({
      id: `msg-${msg.id}`,
      type: "message",
      title: `💬 Message de ${msg.senderName || "Contact"}`,
      route: msg.tripRoute || "Conversation",
      driver: msg.senderName || "Contact",
      passenger: msg.senderName || "Contact",
      time: timeAgo(msg.created_at),
      status: "message",
      tone: "chat",
      reservationId: msg.reservation_id,
      otherName: msg.senderName || "Contact",
      tripRoute: msg.tripRoute || "",
      backRoute: mode === "driver" ? "my-trips" : "my-reservations",
      createdAt: msg.created_at,
    }));

    const passengerItems = reservations.map((reservation) => ({
      id: `reservation-${reservation.id}`,
      type: "reservation",
      title: reservation.status === "Confirmee"
        ? "✅ Reservation acceptee"
        : reservation.status === "En attente"
          ? "🕐 Demande envoyee"
          : "📋 Reservation mise a jour",
      route: `${reservation.depart} → ${reservation.destination}`,
      driver: reservation.driver,
      time: timeAgo(reservation.createdAt || reservation.dateReservation),
      status: reservation.status,
      tone: getNotificationTone(reservation.status),
      reservationId: reservation.id,
      otherName: reservation.driver,
      tripRoute: `${reservation.depart} → ${reservation.destination}`,
      createdAt: reservation.createdAt || reservation.dateReservation || "",
    }));

    const driverItems = publishedTrips.flatMap((trip) =>
      (trip.passengerReservations || []).map((reservation) => ({
        id: `driver-${trip.id}-${reservation.id}`,
        type: "driver-reservation",
        title: reservation.status === "En attente"
          ? "🔔 Nouvelle demande"
          : reservation.status === "Confirmee"
            ? "✅ Passager confirme"
            : "📋 Demande traitee",
        route: trip.route || `${trip.depart} → ${trip.destination}`,
        passenger: reservation.passenger,
        time: timeAgo(reservation.createdAt || reservation.dateReservation),
        status: reservation.status,
        tone: getNotificationTone(reservation.status),
        reservationId: reservation.id,
        otherName: reservation.passenger,
        tripRoute: trip.route || `${trip.depart} → ${trip.destination}`,
        createdAt: reservation.createdAt || reservation.dateReservation || "",
      })),
    );

    const reservationItems = mode === "driver" ? driverItems : passengerItems;
    const currentItems = [...messageItems, ...reservationItems];

    // Merge with saved history: keep old items that are no longer in current data
    const currentIds = new Set(currentItems.map((item) => item.id));
    const oldItems = savedHistoryRef.current.filter((item) => !currentIds.has(item.id));
    const allItems = [...currentItems, ...oldItems];

    // Sort by most recent first
    allItems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const result = allItems.slice(0, 50);

    // Persist to localStorage (no state update to avoid loop)
    savedHistoryRef.current = result;
    saveNotifHistory(result);

    return result;
  }, [mode, publishedTrips, reservations, recentMessages]);

  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;

  function handleClick(item) {
    // Mark as read
    const newReadIds = new Set(readIds);
    newReadIds.add(item.id);
    setReadIds(newReadIds);
    saveReadIds(newReadIds);
    // Navigate
    onSelectNotification(item);
  }

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      {!items.length ? (
        <div className="empty-box">
          <Icon name="bell" size={28} />
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="notif-list">
          {items.map((item) => {
            const isRead = readIds.has(item.id);
            return (
              <button
                className={`notif-item notif-item--${item.tone} ${isRead ? "notif-item--read" : "notif-item--unread"}`}
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
              >
                {!isRead ? <span className="notif-item__dot" /> : null}
                <div className="notif-item__content">
                  <strong>{item.title}</strong>
                  <span className="notif-item__route">{item.route}</span>
                  <span className="notif-item__meta">
                    {item.driver || item.passenger} · {item.time}
                  </span>
                </div>
                <Icon name="chevron-right" size={16} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
