import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

/**
 * Hook that manages realtime subscriptions (Supabase channels + polling)
 * for messages and data refresh.
 */
export function useRealtime({ canUseSupabaseData, sessionUserId, onRefresh }) {
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (!canUseSupabaseData || !supabase) {
      return undefined;
    }

    // Load recent messages on startup (last 24h)
    async function loadRecentMessages() {
      try {
        const since = new Date(Date.now() - 86400000).toISOString();
        const { data } = await supabase
          .from("messages")
          .select("*, profiles!messages_sender_id_fkey(full_name), reservations!messages_reservation_id_fkey(trajet_id, trajets(depart, destination))")
          .neq("sender_id", sessionUserId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(30);
        if (data && data.length > 0) {
          const msgs = data.map((msg) => ({
            ...msg,
            senderName: msg.profiles?.full_name || "Contact",
            tripRoute: msg.reservations?.trajets ? `${msg.reservations.trajets.depart} → ${msg.reservations.trajets.destination}` : "",
            profiles: undefined,
            reservations: undefined,
          }));
          setRecentMessages(msgs);
        }
      } catch { /* ignore */ }
    }
    loadRecentMessages();

    const channel = supabase
      .channel(`campusride-live-${sessionUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, onRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "trajets" }, onRefresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, onRefresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const msg = payload.new;
        if (!msg || msg.sender_id === sessionUserId) return;
        try {
          const [profileRes, reservationRes] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", msg.sender_id).maybeSingle(),
            supabase.from("reservations").select("*, trajets(depart, destination)").eq("id", msg.reservation_id).maybeSingle(),
          ]);
          setRecentMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [{
              ...msg,
              senderName: profileRes.data?.full_name || "Contact",
              tripRoute: reservationRes.data?.trajets ? `${reservationRes.data.trajets.depart} → ${reservationRes.data.trajets.destination}` : "",
            }, ...prev].slice(0, 30);
          });
        } catch {
          setRecentMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [{ ...msg, senderName: "Message", tripRoute: "" }, ...prev].slice(0, 30);
          });
        }
      })
      .subscribe();

    // Poll new messages every 5s
    let lastPoll = Date.now();
    const pollInterval = setInterval(async () => {
      try {
        const since = new Date(lastPoll - 2000).toISOString();
        const { data } = await supabase
          .from("messages")
          .select("*, profiles!messages_sender_id_fkey(full_name), reservations!messages_reservation_id_fkey(trajet_id, trajets(depart, destination))")
          .neq("sender_id", sessionUserId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(10);
        lastPoll = Date.now();
        if (data && data.length > 0) {
          setRecentMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id));
            const fresh = data.filter((m) => !ids.has(m.id)).map((msg) => ({
              ...msg,
              senderName: msg.profiles?.full_name || "Contact",
              tripRoute: msg.reservations?.trajets ? `${msg.reservations.trajets.depart} → ${msg.reservations.trajets.destination}` : "",
              profiles: undefined,
              reservations: undefined,
            }));
            if (!fresh.length) return prev;
            return [...fresh, ...prev].slice(0, 30);
          });
        }
      } catch { /* ignore */ }
    }, 5000);

    // Auto-refresh all app data every 5s
    const dataInterval = setInterval(onRefresh, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      clearInterval(dataInterval);
    };
  }, [canUseSupabaseData, sessionUserId, onRefresh]);

  return { recentMessages };
}
