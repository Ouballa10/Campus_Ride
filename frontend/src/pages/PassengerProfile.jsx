import React, { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import ImageLightbox from "../components/ImageLightbox";
import { Icon, Stars } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default function PassengerProfile({ passengerData, navigate, backRoute }) {
  const { isConfigured } = useAuth();
  const [passengerProfile, setPassengerProfile] = useState(null);
  const [tripCount, setTripCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");

  const passengerId = passengerData?.passengerId || "";

  useEffect(() => {
    if (!passengerId || !isConfigured || !isSupabaseConfigured) return;
    let active = true;
    setLoading(true);

    async function fetchData() {
      try {
        const [profileRes, reservationsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", passengerId).single(),
          supabase
            .from("reservations")
            .select("id", { count: "exact", head: true })
            .eq("passager_id", passengerId)
            .eq("statut", "confirmee"),
        ]);
        if (active && profileRes.data) setPassengerProfile(profileRes.data);
        if (active) setTripCount(reservationsRes.count || 0);
      } catch (err) {
        console.error("Failed to fetch passenger:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => { active = false; };
  }, [passengerId, isConfigured]);

  const name = passengerProfile?.full_name || passengerData?.passenger || "Passager";
  const avatar = passengerProfile?.photo_profil || passengerData?.passengerAvatar || "";
  const phone = passengerProfile?.phone || passengerData?.phone || "";
  const campus = passengerProfile?.campus || "";
  const bio = passengerProfile?.bio || "";
  const rating = Number(passengerProfile?.note_moyenne || 0);
  const initials = passengerData?.passengerInitials || name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const memberSince = passengerProfile?.created_at ? new Date(passengerProfile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "";

  if (!passengerData) {
    return (
      <div className="screen screen--simple">
        <AppHeader title="Profil" leftIcon="arrow-left" onLeftClick={() => navigate(backRoute || "my-trips")} />
        <div className="empty-box">
          <Icon name="user" size={28} />
          <p>Passager introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Profil passager"
        subtitle={name}
        leftIcon="arrow-left"
        onLeftClick={() => navigate(backRoute || "my-trips")}
      />

      {/* Profile card */}
      <div className="dp-card">
        <div className="dp-card__avatar" onClick={() => avatar && setLightboxSrc(avatar)} style={avatar ? { cursor: "zoom-in" } : {}}>
          {avatar ? <img alt={name} src={avatar} /> : <span>{initials}</span>}
        </div>
        <h2 className="dp-card__name">{name}</h2>
        <span className="dp-card__role">Passager</span>
        <div className="dp-card__rating">
          <Stars value={rating} />
          <span>{rating > 0 ? rating.toFixed(1) : "Pas encore note"}</span>
        </div>
        {campus ? <span className="dp-card__campus">📍 {campus}</span> : null}
      </div>

      {/* Bio */}
      {bio ? (
        <div className="dp-section">
          <h4>A propos</h4>
          <p>{bio}</p>
        </div>
      ) : null}

      {/* Stats */}
      <div className="dp-section">
        <h4>📊 Statistiques</h4>
        <div className="dp-stats">
          <div className="dp-stats__item">
            <strong>{tripCount}</strong>
            <small>trajet{tripCount > 1 ? "s" : ""} effectue{tripCount > 1 ? "s" : ""}</small>
          </div>
          {memberSince ? (
            <div className="dp-stats__item">
              <strong>📅</strong>
              <small>Membre depuis {memberSince}</small>
            </div>
          ) : null}
        </div>
      </div>

      {/* Contact */}
      <div className="dp-section">
        <h4>📞 Contact</h4>
        {phone ? (
          <a className="dp-call-btn" href={`tel:${phone}`}>
            Appeler {phone}
          </a>
        ) : (
          <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>Telephone non renseigne</span>
        )}
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem" }}>Chargement...</p> : null}

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} alt={name} onClose={() => setLightboxSrc("")} />
      )}
    </div>
  );
}
