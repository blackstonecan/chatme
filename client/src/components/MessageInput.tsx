import { useState, type FormEvent } from "react";
import { socket } from "../socket";
import { encrypt, hashKey } from "../crypto";

interface MessageInputProps {
  encryptionKey: string;
  onEncryptionKeyChange: (key: string) => void;
  encryptionLocked: boolean;
  onEncryptionLockedChange: (locked: boolean) => void;
}

function MessageInput({ encryptionKey, onEncryptionKeyChange, encryptionLocked, onEncryptionLockedChange }: MessageInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;

    let payload: { keyHash: string; key: string; data: string };

    if (encryptionKey.length > 0 && encryptionLocked) {
      const kh = await hashKey(encryptionKey);
      const encryptedKey = await encrypt(encryptionKey, encryptionKey);
      const encryptedData = await encrypt(trimmed, encryptionKey);
      payload = { keyHash: kh, key: encryptedKey, data: encryptedData };
    } else {
      payload = { keyHash: "", key: "", data: trimmed };
    }

    socket.emit("chat:sendMessage", payload);
    setValue("");
  }

  return (
    <div className="message-input-container">
      <div className="encryption-key-row">
        <input
          type="password"
          value={encryptionKey}
          onChange={(e) => onEncryptionKeyChange(e.target.value)}
          placeholder="Encryption key (leave empty for plaintext)"
          className="encryption-key-input"
        />
        {encryptionKey.length > 0 && (
          <>
            <button
              type="button"
              className={`lock-toggle${encryptionLocked ? " locked" : ""}`}
              onClick={() => onEncryptionLockedChange(!encryptionLocked)}
              aria-label={encryptionLocked ? "Unlock encryption" : "Lock encryption"}
            >
              {encryptionLocked ? "[locked]" : "[unlocked]"}
            </button>
            <span className={`encryption-indicator${encryptionLocked ? "" : " paused"}`}>
              {encryptionLocked ? "encrypted" : "plaintext"}
            </span>
          </>
        )}
      </div>
      <form className="message-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message..."
          autoFocus
          maxLength={1000}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default MessageInput;
