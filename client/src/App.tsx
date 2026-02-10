import { useState, useEffect } from "react";
import { socket } from "./socket";
import type { User, ChatMessage } from "./types";
import Chat from "./components/Chat";
import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onWelcome(data: { user: User; users: User[] }) {
      setCurrentUser(data.user);
      setUsers(data.users);
    }

    function onMessage(message: ChatMessage) {
      setMessages((prev) => [...prev, message]);
    }

    function onUserJoined(user: User) {
      setUsers((prev) => [...prev, user]);
    }

    function onUserLeft(user: User) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat:welcome", onWelcome);
    socket.on("chat:message", onMessage);
    socket.on("chat:userJoined", onUserJoined);
    socket.on("chat:userLeft", onUserLeft);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat:welcome", onWelcome);
      socket.off("chat:message", onMessage);
      socket.off("chat:userJoined", onUserJoined);
      socket.off("chat:userLeft", onUserLeft);
      socket.disconnect();
    };
  }, []);

  if (!isConnected || !currentUser) {
    return <div className="connecting">Connecting...</div>;
  }

  return (
    <Chat currentUser={currentUser} users={users} messages={messages} />
  );
}

export default App;
