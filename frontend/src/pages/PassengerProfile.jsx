import React, { useEffect, useState } from "react";
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
  const memberSince = passengerProfile?.created_at
    ? new Date(passengerProfile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  if (!passengerData) {
    return (
      <div className="screen screen--simple dp-page">
        <div className="dp-hero">
          <div className="dp-hero__banner">
            <button className="dp-hero__back" type="button" onClick={() => navigate(backRoute || "my-trips")}>
              <Icon name="arrow-left" size={18} />
            </button>
          </div>
        </div>
        <div className="empty-box">
          <Icon name="user" size={28} />
          <p>Passager introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--simple dp-page">
      {/* Hero banner + Avatar */}
      <div className="dp-hero">
        <div className="dp-hero__banner">
          <button className="dp-hero__back" type="button" onClick={() => navigate(backRoute || "my-trips")}>
            <Icon name="arrow-left" size={18} />
          </button>
        </div>
        <div
          className="dp-hero__avatar"
          onClick={() => avatar && setLightboxSrc(avatar)}
          style={avatar ? { cursor: "zoom-in" } : {}}
        >
          {avatar ? <img alt={name} src={avatar} /> : <span>{initials}</span>}
        </div>
        <h2 className="dp-hero__name">{name}</h2>
        <span className="dp-hero__role">
          <Icon name="check-badge" size={13} /> Passager vérifié
        </span>
        {campus ? (
          <span className="dp-hero__campus">
            <Icon name="location" size={12} /> {campus}
          </span>
        ) : null}
      </div>

      {/* Stats */}
      <div className="dp-stats">
        <div className="dp-stats__item">
          <strong>{rating > 0 ? rating.toFixed(1) : "—"}</strong>
          <span>Note</span>
          <Stars value={rating} />
        </div>
        <div className="dp-stats__divider" />
        <div className="dp-stats__item">
          <strong>{tripCount}</strong>
          <span>Trajet{tripCount > 1 ? "s" : ""}</span>
        </div>
        {memberSince ? (
          <>
            <div className="dp-stats__divider" />
            <div className="dp-stats__item">
              <strong><Icon name="calendar" size={16} /></strong>
              <span>{memberSince}</span>
            </div>
          </>
        ) : null}
      </div>

      {/* Bio */}
      {bio ? (
        <div className="dp-section">
          <h4>
            <span className="dp-section__icon dp-section__icon--blue">
              <Icon name="user" size={15} />
            </span>
            À propos
          </h4>
          <p>{bio}</p>
        </div>
      ) : null}

      {/* Contact */}
      <div className="dp-section">
        <h4>
          <span className="dp-section__icon dp-section__icon--green">
            <Icon name="phone" size={15} />
          </span>
          Contact
        </h4>
        {phone ? (
          <a className="dp-call-btn" href={`tel:${phone}`}>
            <Icon name="phone" size={15} /> Appeler {phone}
          </a>
        ) : (
          <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Téléphone non renseigné</span>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem" }}>Chargement...</p>
      ) : null}

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} alt={name} onClose={() => setLightboxSrc("")} />
      )}
    </div>
  );
}
