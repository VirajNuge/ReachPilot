// Chatbot Event Helper - allows any component to trigger the chatbot
// Usage: import { triggerChatbot } from '@/app/components/Chatbot/chatbotEvents';
//        triggerChatbot("Rewrite my bio to be more professional");

export const CHATBOT_TRIGGER_EVENT = "reachpilot:chatbot:trigger";

export interface ChatbotTriggerDetail {
  message: string;
  context?: string;
}

export const triggerChatbot = (message: string, context?: string) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent<ChatbotTriggerDetail>(CHATBOT_TRIGGER_EVENT, {
      detail: { message, context },
    });
    window.dispatchEvent(event);
  }
};
