"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BsChatDotsFill,
  BsX,
  BsSend,
  BsStars,
  BsTrash,
  BsArrowDown,
  BsDash,
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import "./Chatbot.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const STORAGE_KEY = "reachpilot_chat_history";

const getInitialMessages = (): Message[] => {
  if (typeof window === "undefined") {
    return [
      {
        id: "welcome",
        text: "Hi! I'm your ReachPilot assistant. How can I help you optimize your social media presence today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (e) {
    console.error("Error loading chat history:", e);
  }

  return [
    {
      id: "welcome",
      text: "Hi! I'm your ReachPilot assistant. How can I help you optimize your social media presence today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ];
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error("Error saving chat history:", e);
      }
    }
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Listen for external trigger events (from Re-write with AI buttons)
  useEffect(() => {
    const handleTrigger = (
      e: CustomEvent<{ message: string; context?: string }>,
    ) => {
      const { message, context } = e.detail;

      // Open chat and ensure not minimized
      setIsOpen(true);
      setIsMinimized(false);

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Call API with context
      const sendToAPI = async () => {
        try {
          const response = await fetch("/api/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: context ? `${message}\n\nContext: ${context}` : message,
              history: messages
                .filter((m) => m.id !== "welcome")
                .map((m) => ({
                  sender: m.sender,
                  text: m.text,
                })),
            }),
          });

          const data = await response.json();

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.response || "I couldn't process that. Please try again!",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          console.error("Chatbot error:", error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "I'm having trouble connecting right now. Please try again! 🔄",
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      };

      sendToAPI();
    };

    window.addEventListener(
      "reachpilot:chatbot:trigger",
      handleTrigger as EventListener,
    );
    return () =>
      window.removeEventListener(
        "reachpilot:chatbot:trigger",
        handleTrigger as EventListener,
      );
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Show scroll button if user scrolls up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const clearChat = () => {
    const newMessages = [
      {
        id: "welcome-" + Date.now(),
        text: "Chat cleared! How can I help you?",
        sender: "ai" as const,
        timestamp: new Date(),
      },
    ];
    setMessages(newMessages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call the chatbot API
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          history: messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I couldn't process that. Please try again!",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment! 🔄",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="chatbot-fab"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <BsX size={28} />
        ) : (
          <>
            <BsChatDotsFill size={24} />
            <span className="fab-pulse" />
          </>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbot-panel ${isMinimized ? "minimized" : ""}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="chatbot-header"
              onClick={isMinimized ? toggleMinimize : undefined}
            >
              <div className="header-info">
                <div className="header-icon">
                  <BsStars size={18} />
                </div>
                <div>
                  <h3>ReachPilot Assistant</h3>
                  {!isMinimized && <p>Always here to help</p>}
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="header-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearChat();
                  }}
                  title="Clear chat"
                >
                  <BsTrash size={16} />
                </button>
                <button
                  className="header-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize();
                  }}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <BsDash size={20} />
                </button>
                <button
                  className="header-btn close"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChat();
                  }}
                  title="Close"
                >
                  <BsX size={22} />
                </button>
              </div>
            </div>

            {/* Messages - hidden when minimized */}
            {!isMinimized && (
              <>
                <div
                  className="chatbot-messages"
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      className={`message ${msg.sender}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {msg.sender === "ai" && (
                        <div className="ai-avatar">
                          <BsStars size={12} />
                        </div>
                      )}
                      <div className="message-content">
                        <div className="message-bubble">{msg.text}</div>
                        <span className="message-time">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <div className="message ai">
                      <div className="ai-avatar">
                        <BsStars size={12} />
                      </div>
                      <div className="message-bubble typing">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                  {showScrollBtn && (
                    <motion.button
                      className="scroll-btn"
                      onClick={scrollToBottom}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <BsArrowDown size={16} />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Quick Suggestions */}
                {messages.length <= 2 && !isTyping && (
                  <div className="suggestions-container">
                    <div className="suggestions-label">Quick questions:</div>
                    <div className="suggestions-chips">
                      {[
                        "🎯 Analyze my profile",
                        "💡 Content ideas",
                        "⏰ Best time to post?",
                        "🔑 Keyword tips",
                      ].map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => {
                            setInputValue(suggestion);
                            setTimeout(() => handleSend(), 100);
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Input - hidden when minimized */}
            {!isMinimized && (
              <div className="chatbot-input">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                >
                  <BsSend size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
