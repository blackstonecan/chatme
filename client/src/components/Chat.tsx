import { useState } from "react";
import type { User, ChatMessage } from "../types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserList from "./UserList";

interface ChatProps {
  currentUser: User;
  users: User[];
  messages: ChatMessage[];
  encryptionKey: string;
  onEncryptionKeyChange: (key: string) => void;
}

function Chat({ currentUser, users, messages, encryptionKey, onEncryptionKeyChange }: ChatProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPublic, setShowPublic] = useState(true);

  return (
    <div className="chat">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle user list"
      >
        {sidebarOpen ? "x" : ">"}
      </button>
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className={`chat-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="chat-logo">chatme</div>
        <UserList users={users} currentUsername={currentUser.username} />
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <span className="chat-header-title"># general</span>
          <span className="chat-header-user">
            {currentUser.username}
          </span>
        </div>
        <MessageList
          messages={messages}
          currentUsername={currentUser.username}
          encryptionKey={encryptionKey}
          showPublic={showPublic}
        />
        <MessageInput
          encryptionKey={encryptionKey}
          onEncryptionKeyChange={onEncryptionKeyChange}
          showPublic={showPublic}
          onShowPublicChange={setShowPublic}
        />
      </div>
    </div>
  );
}

export default Chat;
