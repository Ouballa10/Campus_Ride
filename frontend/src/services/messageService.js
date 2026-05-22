import { requireSupabase } from "./supabaseClient";

async function getMessages(reservationId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message || "Impossible de charger les messages.");
  }

  return data || [];
}

async function sendMessage({ reservationId, senderId, content }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("messages")
    .insert({
      reservation_id: reservationId,
      sender_id: senderId,
      content: content.trim(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Impossible d'envoyer le message.");
  }

  return data;
}

async function markAsRead(reservationId, currentUserId) {
  const client = requireSupabase();
  // Mark all messages from the OTHER person as read
  await client
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("reservation_id", reservationId)
    .neq("sender_id", currentUserId)
    .is("read_at", null);
}

function subscribeToMessages(reservationId, onNewMessage, onMessageUpdated) {
  const client = requireSupabase();
  const channel = client
    .channel(`chat-${reservationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `reservation_id=eq.${reservationId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `reservation_id=eq.${reservationId}`,
      },
      (payload) => {
        if (onMessageUpdated) onMessageUpdated(payload.new);
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

export const messageService = {
  getMessages,
  markAsRead,
  sendMessage,
  subscribeToMessages,
};
