import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WhatsAppChat = () => {
  const phoneNumber = "2348012345678"; // Replace with actual WhatsApp business number
  const message = "Hello! I'm interested in your luxury leather products.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat with us on WhatsApp"
    >
      <Button
        size="lg"
        className="rounded-full w-16 h-16 shadow-2xl bg-[#25D366] hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 relative"
      >
        <MessageCircle className="h-8 w-8 text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </span>
      </Button>
      <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-background border shadow-lg rounded-lg px-4 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <p className="text-sm font-medium">Chat with us!</p>
      </div>
    </a>
  );
};
