export interface ServerToClientEvents {
  "chat:message": (message: ChatMessage) => void;
  "chat:userJoined": (user: User) => void;
  "chat:userLeft": (user: User) => void;
  "chat:welcome": (data: { user: User; users: User[]; messages: ChatMessage[] }) => void;
}

export interface ClientToServerEvents {
  "chat:sendMessage": (content: string) => void;
}

export interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
}
