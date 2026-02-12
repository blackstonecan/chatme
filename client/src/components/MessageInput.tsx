import { useState, type FormEvent } from "react";
import { socket } from "../socket";
import { encrypt } from "../crypto";

interface MessageInputProps {
  encryptionKey: string;
  onEncryptionKeyChange: (key: string) => void;
}

function MessageInput({ encryptionKey, onEncryptionKeyChange }: MessageInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;

    let payload: { key: string; data: string };

    if (encryptionKey.length > 0) {
      const encryptedKey = await encrypt(encryptionKey, encryptionKey);
      const encryptedData = await encrypt(trimmed, encryptionKey);
      payload = { key: encryptedKey, data: encryptedData };
    } else {
      payload = { key: "", data: trimmed };
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
          <span className="encryption-indicator">encrypted</span>
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
