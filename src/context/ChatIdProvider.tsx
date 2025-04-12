"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatIdContextType {
  chatId: string;
  setChatId: (id: string) => void;
}

// Create context with default values
const ChatIdContext = createContext<ChatIdContextType | undefined>(undefined);

export function ChatIdProvider({ children }: { children: ReactNode }) {
  const [chatId, setChatId] = useState<string>("");

  return (
    <ChatIdContext.Provider value={{ chatId, setChatId }}>
      {children}
    </ChatIdContext.Provider>
  );
}

// Custom hook for using chatId
export function useChatId() {
  const context = useContext(ChatIdContext);
  if (!context) {
    throw new Error("useChatId must be used within a ChatIdProvider");
  }
  return context;
}
