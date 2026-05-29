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
    const arr = [...ids].slice(-200);
    localStorage.setItem("campusride-read-notifs", JSON.stringify(arr));
  } catch { /* ignore */ }
}

// Persist notification history so items don't disappear on data refresh
function getSavedNotifs(currentMode) {
  try {
    const key = `campusride-notif-history-${currentMode}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveNotifHistory(items, currentMode) {
  try {
    const key = `campusride-notif-history-${currentMode}`;
    const arr = items.slice(0, 100);
    localStorage.setItem(key, JSON.stringify(arr));
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
  const savedHistoryRef = useRef(getSavedNotifs(mode));

  useEffect(() => {
    setReadIds(getReadIds());
    savedHistoryRef.current = getSavedNotifs(mode);
  }, [mode]);

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
      backRoute: mode === "driver" ? "my-trips" : "my-reservations",
      createdAt: msg.created_at,
    }));

    // --- Passenger notifications (from reservations) ---
    const passengerItems = reservations.map((reservation) => {
      let title = "";
      let icon = "";
      if (reservation.status === "Confirmee") {
        title = "Reservation confirmee";
        icon = "✅";
      } else if (reservation.status === "En attente") {
        title = "Demande envoyee";
        icon = "🕐";
      } else if (reservation.status === "Annulee") {
        title = "Reservation annulee";
        icon = "❌";
      } else if (reservation.status === "Refusee") {
        title = "Demande refusee";
        icon = "🚫";
      } else {
        title = "Reservation mise a jour";
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

    // --- Driver notifications (from passenger reservations on published trips) ---
    const driverItems = publishedTrips.flatMap((trip) =>
      (trip.passengerReservations || []).map((reservation) => {
        let title = "";
        let icon = "";
        if (reservation.status === "En attente") {
          title = "Nouvelle demande";
          icon = "🔔";
        } else if (reservation.status === "Confirmee") {
          title = "Passager confirme";
          icon = "✅";
        } else if (reservation.status === "Annulee") {
          title = "Passager a annule";
          icon = "❌";
        } else if (reservation.status === "Refusee") {
          title = "Demande refusee";
          icon = "🚫";
        } else {
          title = "Demande traitee";
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

    const result = allItems.slice(0, 60);

    savedHistoryRef.current = result;
    saveNotifHistory(result, mode);

    return result;
  }, [mode, publishedTrips, reservations, recentMessages]);

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
          <small style={{ color: "#9ca3af" }}>Les demandes et messages apparaitront ici</small>
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
