import type { User, ChatMessage } from "../types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserList from "./UserList";

interface ChatProps {
  currentUser: User;
  users: User[];
  messages: ChatMessage[];
}

function Chat({ currentUser, users, messages }: ChatProps) {
  return (
    <div className="chat">
      <div className="chat-sidebar">
        <div className="chat-logo">chatme</div>
        <UserList users={users} currentUsername={currentUser.username} />
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <span className="chat-header-title">General Chat</span>
          <span className="chat-header-user">
            {currentUser.username}
          </span>
        </div>
        <MessageList
          messages={messages}
          currentUsername={currentUser.username}
        />
        <MessageInput />
      </div>
    </div>
  );
}

export default Chat;
