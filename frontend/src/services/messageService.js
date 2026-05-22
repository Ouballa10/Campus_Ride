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

function subscribeToMessages(reservationId, onNewMessage) {
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
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

export const messageService = {
  getMessages,
  sendMessage,
  subscribeToMessages,
};
