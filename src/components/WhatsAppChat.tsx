import { MessageSquare } from "lucide-react";

declare global {
  interface Window {
    MomentCRM?: (action: string, options?: any) => void;
  }
}

export const WhatsAppChat: React.FC = () => {
  const openLiveChat = () => {
    if (window.MomentCRM) {
      window.MomentCRM('openChat');
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button
        onClick={openLiveChat}
        aria-label="Open live chat"
        className="group relative rounded-full w-16 h-16 flex items-center justify-center shadow-2xl focus:outline-none transition transform hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-500 to-blue-600"></span>
        <MessageSquare className="relative w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
        </span>
      </button>
    </div>
  );
};

export default WhatsAppChat;
