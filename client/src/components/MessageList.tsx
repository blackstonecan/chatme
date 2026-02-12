import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { decrypt } from "../crypto";

interface MessageListProps {
  messages: ChatMessage[];
  currentUsername: string;
  encryptionKey: string;
  showPublic: boolean;
}

interface ResolvedMessage {
  id: string;
  username: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageList({ messages, currentUsername, encryptionKey, showPublic }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [resolvedMessages, setResolvedMessages] = useState<ResolvedMessage[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function resolveMessages() {
      const resolved: ResolvedMessage[] = [];

      for (const msg of messages) {
        if (msg.key === "") {
          resolved.push({
            id: msg.id,
            username: msg.username,
            content: msg.data,
            timestamp: msg.timestamp,
            encrypted: false,
          });
        } else {
          if (encryptionKey.length === 0) continue;
          const decryptedKey = await decrypt(msg.key, encryptionKey);
          if (decryptedKey === null || decryptedKey !== encryptionKey) continue;
          const decryptedData = await decrypt(msg.data, encryptionKey);
          if (decryptedData === null) continue;
          resolved.push({
            id: msg.id,
            username: msg.username,
            content: decryptedData,
            timestamp: msg.timestamp,
            encrypted: true,
          });
        }
      }

      if (!cancelled) {
        setResolvedMessages(resolved);
      }
    }

    resolveMessages();
    return () => { cancelled = true; };
  }, [messages, encryptionKey]);

  const displayMessages = showPublic
    ? resolvedMessages
    : resolvedMessages.filter((msg) => msg.encrypted);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  if (displayMessages.length === 0) {
    return (
      <div className="message-list">
        <div className="message-list-empty">
          No messages yet. Say something!
        </div>
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="message-list">
      {displayMessages.map((msg) => {
        const isOwn = msg.username === currentUsername;
        return (
          <div
            key={msg.id}
            className={`message ${isOwn ? "message-own" : "message-other"}`}
          >
            <div className="message-header">
              <span className="message-username">
                {isOwn ? "You" : msg.username}
              </span>
              {msg.encrypted && (
                <span className="message-encrypted-badge">encrypted</span>
              )}
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;
