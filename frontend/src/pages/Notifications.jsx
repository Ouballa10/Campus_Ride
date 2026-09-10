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

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Persist only READ notification IDs (not the full history)
function getReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem("campusride-read-notifs") || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids) {
  try {
    // Keep only last 500 read IDs
    const arr = [...ids].slice(-500);
    localStorage.setItem("campusride-read-notifs", JSON.stringify(arr));
  } catch { /* ignore */ }
}

// Clear old history cache (no longer used — notifications come from live data only)
try {
  localStorage.removeItem("campusride-notif-history");
  localStorage.removeItem("campusride-notif-history-driver");
  localStorage.removeItem("campusride-notif-history-passenger");
} catch { /* ignore */ }

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
    const arr = items.slice(0, 100);
    localStorage.setItem("campusride-notif-history", JSON.stringify(arr));
  } catch { /* ignore */ }
}

export default function Notifications({
  navigate,
  onSelectNotification,
  publishedTrips = [],
  reservations = [],
  recentMessages = [],
}) {
  const [readIds, setReadIds] = useState(getReadIds);

  const items = useMemo(() => {
    // --- Messages ---
    const messageItems = recentMessages.map((msg) => ({
      id: `msg-${msg.id}`,
      type: "message",
      title: `💬 ${msg.senderName || "Contact"}`,
      subtitle: msg.content || "Nouveau message",
      route: msg.tripRoute || "",
      driver: msg.senderName || "Contact",
      passenger: msg.senderName || "Contact",
      time: timeAgo(msg.created_at),
      timeLabel: formatDate(msg.created_at),
      status: "message",
      tone: "chat",
      reservationId: msg.reservation_id,
      otherName: msg.senderName || "Contact",
      otherAvatar: msg.senderAvatar || "",
      tripRoute: msg.tripRoute || "",
      backRoute: "notifications",
      createdAt: msg.created_at,
    }));

    // --- Passenger notifications (my reservations) ---
    const passengerItems = reservations.map((reservation) => {
      let title = "";
      let icon = "";
      if (reservation.status === "Confirmee") {
        title = "Réservation confirmée";
        icon = "✅";
      } else if (reservation.status === "En attente") {
        title = "Demande envoyée";
        icon = "🕐";
      } else if (reservation.status === "Annulee") {
        title = "Réservation annulée";
        icon = "❌";
      } else if (reservation.status === "Refusee") {
        title = "Demande refusée";
        icon = "🚫";
      } else {
        title = "Réservation mise à jour";
        icon = "📋";
      }

      return {
        id: `res-${reservation.id}-${reservation.status}`,
        type: "reservation",
        title: `${icon} ${title}`,
        subtitle: `${reservation.driver} · ${reservation.price || ""} DH`,
        route: `${reservation.depart} → ${reservation.destination}`,
        driver: reservation.driver,
        time: timeAgo(reservation.createdAt || reservation.dateReservation),
        timeLabel: formatDate(reservation.createdAt || reservation.dateReservation),
        status: reservation.status,
        tone: getNotificationTone(reservation.status),
        reservationId: reservation.id,
        otherName: reservation.driver,
        otherAvatar: reservation.driverAvatar || "",
        tripRoute: `${reservation.depart} → ${reservation.destination}`,
        createdAt: reservation.createdAt || reservation.dateReservation || "",
      };
    });

    // --- Driver notifications (passenger requests on my published trips) ---
    const driverItems = publishedTrips.flatMap((trip) =>
      (trip.passengerReservations || []).map((reservation) => {
        let title = "";
        let icon = "";
        if (reservation.status === "En attente") {
          title = "Nouvelle demande";
          icon = "🔔";
        } else if (reservation.status === "Confirmee") {
          title = "Passager confirmé";
          icon = "✅";
        } else if (reservation.status === "Annulee") {
          title = "Passager a annulé";
          icon = "❌";
        } else if (reservation.status === "Refusee") {
          title = "Demande refusée";
          icon = "🚫";
        } else {
          title = "Demande traitée";
          icon = "📋";
        }

        return {
          id: `drv-${trip.id}-${reservation.id}-${reservation.status}`,
          type: "driver-reservation",
          title: `${icon} ${title}`,
          subtitle: `${reservation.passenger} veut rejoindre ton trajet`,
          route: trip.route || `${trip.depart} → ${trip.destination}`,
          passenger: reservation.passenger,
          passengerAvatar: reservation.passengerAvatar || "",
          time: timeAgo(reservation.createdAt || reservation.dateReservation),
          timeLabel: formatDate(reservation.createdAt || reservation.dateReservation),
          status: reservation.status,
          tone: getNotificationTone(reservation.status),
          reservationId: reservation.id,
          otherName: reservation.passenger,
          tripRoute: trip.route || `${trip.depart} → ${trip.destination}`,
          createdAt: reservation.createdAt || reservation.dateReservation || "",
        };
      }),
    );

    // Combine ALL notifications — both driver and passenger side
    const currentItems = [...messageItems, ...driverItems, ...passengerItems];

    // Sort by most recent first — live data only (no old cache)
    currentItems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return currentItems.slice(0, 60);
  }, [publishedTrips, reservations, recentMessages]);

  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;

  function handleClick(item) {
    const newReadIds = new Set(readIds);
    newReadIds.add(item.id);
    setReadIds(newReadIds);
    saveReadIds(newReadIds);
    onSelectNotification(item);
  }

  return (
    <div className="screen screen--simple page-enter">
      <AppHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""}` : "A jour"}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("home")}
      />

      {!items.length ? (
        <div className="empty-box">
          <Icon name="bell" size={28} />
          <p>Aucune notification</p>
          <small style={{ color: "#9ca3af" }}>Les demandes et messages apparaîtront ici</small>
        </div>
      ) : (
        <div className="notif-list">
          {items.map((item) => {
            const isRead = readIds.has(item.id);
            const isNew = !isRead && item.createdAt &&
              (Date.now() - new Date(item.createdAt).getTime()) < 24 * 60 * 60 * 1000;
            return (
              <button
                className={`notif-item notif-item--${item.tone} ${isRead ? "notif-item--read" : "notif-item--unread"}`}
                key={item.id}
                type="button"
                onClick={() => handleClick(item)}
              >
                {!isRead ? <span className="notif-item__dot" /> : null}
                <div className="notif-item__content">
                  <div className="notif-item__title-row">
                    <strong>{item.title}</strong>
                    {isNew && <span className="notif-item__new-badge">Nouveau</span>}
                  </div>
                  {item.subtitle ? <span className="notif-item__subtitle">{item.subtitle}</span> : null}
                  <span className="notif-item__route">{item.route}</span>
                  <span className="notif-item__meta">{item.time}</span>
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
