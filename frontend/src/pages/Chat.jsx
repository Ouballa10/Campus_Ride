import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";
import { requireSupabase } from "../services/supabaseClient";

export default function Chat({ chatContext, navigate, onViewProfile }) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otherPhoto, setOtherPhoto] = useState(chatContext?.otherAvatar || "");
  const listRef = useRef(null);
  const userId = session?.user?.id || "";

  const reservationId = chatContext?.reservationId || "";
  const otherName = chatContext?.otherName || "Contact";
  const tripRoute = chatContext?.tripRoute || "";

  // Fetch other person's photo if not provided
  useEffect(() => {
    if (otherPhoto || !reservationId) return;
    let active = true;
    async function fetchOtherPhoto() {
      try {
        const client = requireSupabase();
        // Get the reservation to find the other person's ID
        const { data: reservation } = await client
          .from("reservations")
          .select("passager_id, trajets(conducteur_id)")
          .eq("id", reservationId)
          .maybeSingle();
        if (!reservation || !active) return;
        const otherId = reservation.passager_id === userId
          ? reservation.trajets?.conducteur_id
          : reservation.passager_id;
        if (!otherId) return;
        const { data: prof } = await client
          .from("profiles")
          .select("photo_profil")
          .eq("id", otherId)
          .maybeSingle();
        if (prof?.photo_profil && active) {
          setOtherPhoto(prof.photo_profil);
        }
      } catch { /* ignore */ }
    }
    fetchOtherPhoto();
    return () => { active = false; };
  }, [reservationId, userId, otherPhoto]);

  // Load messages + mark as read
  useEffect(() => {
    if (!reservationId || !userId) return;
    let active = true;
    async function load() {
      try {
        const data = await messageService.getMessages(reservationId);
        if (active) { setMessages(data); setLoading(false); }
        // Mark other person's messages as read
        await messageService.markAsRead(reservationId, userId);
      } catch (e) {
        if (active) { setError(e.message); setLoading(false); }
      }
    }
    load();
    return () => { active = false; };
  }, [reservationId, userId]);

  // Subscribe to realtime + mark new messages as read
  useEffect(() => {
    if (!reservationId || !userId) return;
    const unsubscribe = messageService.subscribeToMessages(
      reservationId,
      // New message
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // If message is from the other person, mark as read immediately
        if (newMsg.sender_id !== userId) {
          messageService.markAsRead(reservationId, userId);
        }
      },
      // Message updated (read receipt)
      (updatedMsg) => {
        setMessages((prev) =>
          prev.map((m) => m.id === updatedMsg.id ? { ...m, read_at: updatedMsg.read_at } : m),
        );
      },
    );
    return unsubscribe;
  }, [reservationId, userId]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending || !reservationId || !userId) return;
    try {
      setSending(true);
      const msg = await messageService.sendMessage({
        reservationId,
        senderId: userId,
        content: input.trim(),
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setInput("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (!reservationId) {
    return (
      <div className="screen screen--simple">
        <AppHeader title="Chat" leftIcon="arrow-left" onLeftClick={() => navigate("my-reservations")} />
        <div className="empty-box">
          <Icon name="phone" size={28} />
          <p>Aucune conversation</p>
        </div>
      </div>
    );
  }

  // Find last message sent by me that has been read
  const myMessages = messages.filter((m) => m.sender_id === userId);
  const lastReadMsgId = myMessages.reduce((lastId, msg) => msg.read_at ? msg.id : lastId, null);

  return (
    <div className="screen screen--chat">
      {/* Header with avatar - clickable to view profile */}
      <div className="chat-header">
        <button className="chat-header__back" type="button" onClick={() => navigate(chatContext?.backRoute || "my-reservations")}>
          <Icon name="arrow-left" size={18} />
        </button>
        <div className="chat-header__profile" onClick={() => onViewProfile?.(chatContext)} role="button" tabIndex={0}>
          <div className="chat-header__avatar">
            {otherPhoto ? (
              <img alt={otherName} src={otherPhoto} />
            ) : (
              otherName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="chat-header__info">
            <strong>{otherName}</strong>
            <small>{tripRoute}</small>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={listRef}>
        {loading ? (
          <div className="chat-loading">Chargement...</div>
        ) : error ? (
          <div className="chat-error">{error}</div>
        ) : !messages.length ? (
          <div className="chat-empty">
            <div className="chat-empty__icon">💬</div>
            <p>Envoie le premier message !</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === userId;
            const isLastMine = isMine && index === messages.length - 1;
            const showOtherAvatar = !isMine && (
              index === 0 || messages[index - 1]?.sender_id === userId
            );

            return (
              <div className={`chat-row ${isMine ? "chat-row--mine" : "chat-row--other"}`} key={msg.id}>
                {!isMine && showOtherAvatar ? (
                  <div className="chat-row__avatar" onClick={() => onViewProfile?.(chatContext)} role="button" tabIndex={0}>
                    {otherPhoto ? (
                      <img alt={otherName} src={otherPhoto} />
                    ) : (
                      otherName.charAt(0)
                    )}
                  </div>
                ) : !isMine ? (
                  <div className="chat-row__avatar-spacer" />
                ) : null}
                <div className={`chat-bubble ${isMine ? "chat-bubble--mine" : "chat-bubble--other"}`}>
                  <p>{msg.content}</p>
                  <small>
                    {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {isMine && msg.read_at ? (
                      <span className="chat-bubble__seen"> · Vu ✓</span>
                    ) : isMine ? (
                      <span> · Envoye</span>
                    ) : null}
                  </small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Ecris un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          disabled={sending}
        />
        <button type="submit" disabled={!input.trim() || sending} className="chat-send">
          <Icon name="arrow-right" size={18} />
        </button>
      </form>
    </div>
  );
}
