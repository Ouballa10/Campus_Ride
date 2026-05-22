import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";

export default function Chat({ chatContext, navigate }) {
  const { session } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const userId = session?.user?.id || "";

  const reservationId = chatContext?.reservationId || "";
  const otherName = chatContext?.otherName || "Contact";
  const tripRoute = chatContext?.tripRoute || "";

  // Load messages
  useEffect(() => {
    if (!reservationId) return;

    let active = true;

    async function load() {
      try {
        const data = await messageService.getMessages(reservationId);
        if (active) {
          setMessages(data);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => { active = false; };
  }, [reservationId]);

  // Subscribe to realtime
  useEffect(() => {
    if (!reservationId) return;

    const unsubscribe = messageService.subscribeToMessages(reservationId, (newMsg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return unsubscribe;
  }, [reservationId]);

  // Auto-scroll to bottom
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
      // Add locally immediately (realtime will also add it, dedup handles it)
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
          <p>Aucune conversation selectionnee</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--chat">
      <AppHeader
        title={otherName}
        subtitle={tripRoute}
        leftIcon="arrow-left"
        onLeftClick={() => navigate(chatContext?.backRoute || "my-reservations")}
      />

      {/* Messages list */}
      <div className="chat-messages" ref={listRef}>
        {loading ? (
          <div className="chat-loading">Chargement...</div>
        ) : error ? (
          <div className="chat-error">{error}</div>
        ) : !messages.length ? (
          <div className="chat-empty">
            <Icon name="phone" size={24} />
            <p>Aucun message. Envoie le premier !</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              className={`chat-bubble ${msg.sender_id === userId ? "chat-bubble--mine" : "chat-bubble--other"}`}
              key={msg.id}
            >
              <p>{msg.content}</p>
              <small>
                {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))
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
