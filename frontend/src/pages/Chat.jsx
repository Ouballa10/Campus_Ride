import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/AppHeader";
import { Icon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";

export default function Chat({ chatContext, navigate }) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const userId = session?.user?.id || "";

  const reservationId = chatContext?.reservationId || "";
  const otherName = chatContext?.otherName || "Contact";
  const otherAvatar = chatContext?.otherAvatar || "";
  const tripRoute = chatContext?.tripRoute || "";
  const myAvatar = profile?.photo_profil || "";

  // Load messages
  useEffect(() => {
    if (!reservationId) return;
    let active = true;
    async function load() {
      try {
        const data = await messageService.getMessages(reservationId);
        if (active) { setMessages(data); setLoading(false); }
      } catch (e) {
        if (active) { setError(e.message); setLoading(false); }
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
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    return unsubscribe;
  }, [reservationId]);

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

  // Group consecutive messages by sender for cleaner display
  const lastOtherMsgIndex = messages.reduce((last, msg, i) => msg.sender_id !== userId ? i : last, -1);

  return (
    <div className="screen screen--chat">
      {/* Header with avatar */}
      <div className="chat-header">
        <button className="chat-header__back" type="button" onClick={() => navigate(chatContext?.backRoute || "my-reservations")}>
          <Icon name="arrow-left" size={18} />
        </button>
        <div className="chat-header__avatar">
          {otherAvatar ? (
            <img alt={otherName} src={otherAvatar} />
          ) : (
            otherName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="chat-header__info">
          <strong>{otherName}</strong>
          <small>{tripRoute}</small>
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
                  <div className="chat-row__avatar">
                    {otherAvatar ? (
                      <img alt={otherName} src={otherAvatar} />
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
                    {isLastMine && lastOtherMsgIndex > index ? (
                      <span className="chat-bubble__seen"> · Vu ✓</span>
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
