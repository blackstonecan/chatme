import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  currentUsername: string;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageList({ messages, currentUsername }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
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
      {messages.map((msg) => {
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
