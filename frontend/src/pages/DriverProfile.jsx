import React, { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon, Stars } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient";

function formatVehicleLabel(profile) {
  const parts = [
    profile?.vehicle_make,
    profile?.vehicle_model,
    profile?.vehicle_color,
  ].filter(Boolean);
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

export default function DriverProfile({ driverData, navigate }) {
  const { isConfigured } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const conducteurId = driverData?.conducteurId || "";

  useEffect(() => {
    if (!conducteurId || !isConfigured || !isSupabaseConfigured) {
      return;
    }

    let active = true;
    setLoading(true);

    async function fetchDriver() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", conducteurId)
          .single();

        if (!error && data && active) {
          setDriverProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch driver profile:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDriver();
    return () => { active = false; };
  }, [conducteurId, isConfigured]);

  // Use fetched profile or fallback to trip data
  const name = driverProfile?.full_name || driverData?.driver || "Conducteur";
  const avatar = driverProfile?.photo_profil || driverData?.driverAvatar || "";
  const phone = driverProfile?.phone || driverData?.driverPhone || "";
  const campus = driverProfile?.campus || "";
  const bio = driverProfile?.bio || "";
  const rating = driverProfile?.note_moyenne || driverData?.rating || 0;
  const car = driverProfile ? formatVehicleLabel(driverProfile) : (driverData?.car || "");
  const vehiclePhotos = normalizeVehiclePhotos(driverProfile?.vehicle_photos);
  const vehiclePlate = driverProfile?.vehicle_plate || "";
  const vehicleSeats = driverProfile?.vehicle_seats || "";
  const initials = driverData?.driverInitials || name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (!driverData) {
    return (
      <div className="screen screen--records">
        <AppHeader
          title="Profil conducteur"
          subtitle="Aucun conducteur selectionne"
          leftIcon="arrow-left"
          onLeftClick={() => navigate("search")}
        />
        <div className="empty-state-card">
          <span className="empty-state-card__icon">
            <Icon name="user" size={22} />
          </span>
          <strong>Conducteur introuvable</strong>
          <p>Selectionne un trajet pour voir le profil du conducteur.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--profile">
      <AppHeader
        title="Profil conducteur"
        subtitle={name}
        leftIcon="arrow-left"
        onLeftClick={() => navigate("search")}
      />

      <div className="screen-panel">
        <section className="driver-profile-hero">
          <div className="driver-profile-hero__avatar">
            {avatar ? (
              <img alt={name} src={avatar} />
            ) : (
              <span className="driver-profile-hero__initials">{initials}</span>
            )}
          </div>

          <div className="driver-profile-hero__info">
            <h2>{name}</h2>
            <p className="driver-profile-hero__role">Conducteur campus</p>
            <Stars value={rating} />
            {campus ? (
              <span className="driver-profile-hero__campus">
                <Icon name="location" size={14} />
                {campus}
              </span>
            ) : null}
          </div>
        </section>

        {bio ? (
          <section className="driver-profile-section">
            <h4><Icon name="edit" size={16} /> A propos</h4>
            <p>{bio}</p>
          </section>
        ) : null}

        {car ? (
          <section className="driver-profile-section">
            <h4><Icon name="car" size={16} /> Vehicule</h4>
            <div className="driver-profile-vehicle-info">
              <span><strong>Voiture:</strong> {car}</span>
              {vehiclePlate ? <span><strong>Plaque:</strong> {vehiclePlate}</span> : null}
              {vehicleSeats ? <span><strong>Places:</strong> {vehicleSeats}</span> : null}
            </div>

            {vehiclePhotos.length > 0 ? (
              <div className="driver-profile-vehicle-gallery">
                {vehiclePhotos.map((url, i) => (
                  <div className="driver-profile-vehicle-photo" key={url}>
                    <img alt={`Vehicule ${i + 1}`} src={url} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="driver-profile-section">
          <h4><Icon name="phone" size={16} /> Contact</h4>
          <div className="driver-profile-contact">
            {phone ? (
              <a className="mini-button" href={`tel:${phone}`}>
                <Icon name="phone" size={16} />
                Appeler {phone}
              </a>
            ) : (
              <span className="text-muted">Telephone non renseigne</span>
            )}
          </div>
        </section>

        {loading ? (
          <p className="profile-editor-status profile-editor-status--loading">
            Chargement du profil complet...
          </p>
        ) : null}
      </div>
    </div>
  );
}
