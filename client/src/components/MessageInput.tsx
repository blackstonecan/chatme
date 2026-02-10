import { useState, type FormEvent } from "react";
import { socket } from "../socket";

function MessageInput() {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    socket.emit("chat:sendMessage", trimmed);
    setValue("");
  }

  return (
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
  );
}

export default MessageInput;
