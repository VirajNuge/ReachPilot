"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface ChatbotContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
  pendingMessage: string | null;
  clearPendingMessage: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
};

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const sendMessage = useCallback((message: string) => {
    setPendingMessage(message);
    setIsOpen(true);
  }, []);

  const clearPendingMessage = useCallback(() => setPendingMessage(null), []);

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        sendMessage,
        pendingMessage,
        clearPendingMessage,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
