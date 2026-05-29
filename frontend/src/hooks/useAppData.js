import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  currentUser as defaultCurrentUser,
  publishedTrips as defaultPublishedTrips,
  reservations as defaultReservations,
  tripOptions as defaultTripOptions,
} from "../data/mockData";
import { reservationService } from "../services/reservationService";
import { trajetService } from "../services/trajetService";
import { buildCurrentUser } from "../utils/appDataMappers";

const defaultAppData = {
  currentUser: defaultCurrentUser,
  publishedTrips: defaultPublishedTrips,
  reservations: defaultReservations,
  tripOptions: defaultTripOptions,
};

const emptyAppData = {
  currentUser: {
    name: "",
    initials: "",
    role: "",
    roleValue: "passager",
    email: "",
    phone: "",
    photo: "",
    rating: 0,
    tripsCount: 0,
    reservationsCount: 0,
    reviewCount: 0,
    car: "",
    bio: "",
    campus: "",
    vehicle: null,
  },
  publishedTrips: [],
  reservations: [],
  tripOptions: [],
};

/**
 * Hook that manages all app data (trips, reservations, user stats).
 * Fetches from Supabase when configured, falls back to mock data otherwise.
 */
export function useAppData() {
  const { isConfigured, loading: authLoading, profile, session } = useAuth();
  const sessionUserId = session?.user?.id || "";
  const demoMode = !isConfigured;
  const canUseSupabaseData = isConfigured && Boolean(sessionUserId);

  const [appData, setAppData] = useState(() => isConfigured ? emptyAppData : defaultAppData);
  const [dataError, setDataError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!canUseSupabaseData) {
      if (!isConfigured) {
        setDataError("");
        setAppData(defaultAppData);
      } else {
        setDataError("");
        setAppData(emptyAppData);
      }
      return;
    }

    let isActive = true;

    async function loadSupabaseData() {
      try {
        const [availableTrajets, myTrajets, myReservations] = await Promise.all([
          trajetService.listAvailableTrajets(),
          trajetService.listPublishedTrajets(sessionUserId),
          reservationService.listReservations(sessionUserId),
        ]);

        if (!isActive) return;

        setDataError("");
        setAppData({
          currentUser: buildCurrentUser(profile, {
            reservationsCount: myReservations.length,
            reviewCount: 0,
            tripsCount: myTrajets.length,
          }),
          publishedTrips: myTrajets,
          reservations: myReservations,
          tripOptions: availableTrajets,
        });
      } catch (error) {
        if (!isActive) return;

        console.error("Supabase data sync failed:", error);
        const isLockError = (error.message || "").toLowerCase().includes("lock");
        if (!isLockError) {
          setDataError(error.message || "Synchronisation Supabase impossible.");
        }
        setAppData({
          currentUser: buildCurrentUser(profile, {
            reservationsCount: 0,
            reviewCount: 0,
            tripsCount: 0,
          }),
          publishedTrips: [],
          reservations: [],
          tripOptions: [],
        });
      }
    }

    loadSupabaseData();

    return () => { isActive = false; };
  }, [authLoading, canUseSupabaseData, isConfigured, profile, refreshKey, sessionUserId]);

  return {
    appData,
    setAppData,
    dataError,
    demoMode,
    canUseSupabaseData,
    sessionUserId,
    refresh,
  };
}
