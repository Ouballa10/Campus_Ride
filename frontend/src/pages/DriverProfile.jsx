import React, { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";
import { evaluationService } from "../services/evaluationService";

function formatVehicleLabel(profile) {
  const parts = [profile?.vehicle_make, profile?.vehicle_model, profile?.vehicle_color].filter(Boolean);
  return parts.join(" ") || profile?.vehicle_label || "";
}

function normalizeVehiclePhotos(value) {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.trim());
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v) => typeof v === "string" && v.trim());
    } catch { return [value]; }
  }
  return [];
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default function DriverProfile({ driverData, navigate }) {
  const { isConfigured } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);

  const conducteurId = driverData?.conducteurId || "";

  useEffect(() => {
    if (!conducteurId || !isConfigured || !isSupabaseConfigured) return;
    let active = true;
    setLoading(true);

    async function fetchData() {
      try {
        const [profileRes, evals] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", conducteurId).single(),
          evaluationService.getEvaluationsForDriver(conducteurId),
        ]);
        if (active && profileRes.data) setDriverProfile(profileRes.data);
        if (active) setEvaluations(evals || []);
      } catch (err) {
        console.error("Failed to fetch driver:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => { active = false; };
  }, [conducteurId, isConfigured]);

  const name = driverProfile?.full_name || driverData?.driver || "Conducteur";
  const avatar = driverProfile?.photo_profil || driverData?.driverAvatar || "";
  const phone = driverProfile?.phone || driverData?.driverPhone || "";
  const campus = driverProfile?.campus || "";
  const bio = driverProfile?.bio || "";
  const rating = Number(driverProfile?.note_moyenne || driverData?.rating || 0);
  const car = driverProfile ? formatVehicleLabel(driverProfile) : (driverData?.car || "");
  const vehiclePhotos = normalizeVehiclePhotos(driverProfile?.vehicle_photos);
  const vehiclePlate = driverProfile?.vehicle_plate || "";
  const initials = driverData?.driverInitials || name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (!driverData) {
    return (
      <div className="screen screen--simple">
        <AppHeader title="Profil" leftIcon="arrow-left" onLeftClick={() => navigate("search")} />
        <div className="empty-box">
          <Icon name="user" size={28} />
          <p>Conducteur introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--simple">
      <AppHeader
        title="Profil"
        subtitle={name}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("search")}
      />

      {/* Profile card */}
      <div className="dp-card">
        <div className="dp-card__avatar">
          {avatar ? <img alt={name} src={avatar} /> : <span>{initials}</span>}
        </div>
        <h2 className="dp-card__name">{name}</h2>
        <span className="dp-card__role">Conducteur campus</span>
        <div className="dp-card__rating">
          <Stars value={rating} />
          <span>{rating > 0 ? rating.toFixed(1) : "Pas encore note"} · {evaluations.length} avis</span>
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

      {/* Vehicle */}
      {car ? (
        <div className="dp-section">
          <h4>🚗 Vehicule</h4>
          <div className="dp-vehicle-info">
            <span><strong>{car}</strong></span>
            {vehiclePlate ? <span>Plaque: {vehiclePlate}</span> : null}
          </div>
          {vehiclePhotos.length > 0 ? (
            <div className="dp-vehicle-photos">
              {vehiclePhotos.map((url, i) => (
                <img key={url} alt={`Vehicule ${i + 1}`} src={url} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

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

      {/* Evaluations */}
      <div className="dp-section">
        <h4>⭐ Avis des passagers ({evaluations.length})</h4>
        {!evaluations.length ? (
          <p style={{ color: "#9ca3af", fontSize: "0.82rem" }}>Aucun avis pour le moment</p>
        ) : (
          <div className="dp-reviews">
            {evaluations.slice(0, 10).map((ev) => (
              <div className="dp-review" key={ev.id}>
                <div className="dp-review__top">
                  <Stars value={ev.note} />
                  <small>{timeAgo(ev.created_at)}</small>
                </div>
                {ev.commentaire ? <p>{ev.commentaire}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem" }}>Chargement...</p> : null}
    </div>
  );
}
