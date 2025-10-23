import React, { useState } from "react";
import { X, MessageCircle, Mail } from "lucide-react";

export const WhatsAppChat: React.FC = () => {
  const [open, setOpen] = useState(false);

  const phone = "+2348144977227";
  const phoneDigits = phone.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${phoneDigits}`;
  const email = "28hideluxe@gmail.com";
  const mailto = `mailto:${email}`;

  return (
    <>
      {/* Chat panel */}
      <div
        className={`fixed right-6 bottom-24 z-50 w-[320px] max-w-[90vw] rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 pointer-events-none translate-y-6"
        }`}
        aria-hidden={!open}
      >
        <div className="bg-neutral-900 text-white px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">
                Hi <span aria-hidden>👋</span>
              </div>
              <div className="text-sm text-neutral-300">
                How can we help you?
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-white/10"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-neutral-100" />
          </button>
        </div>

        <div className="bg-white p-4">
          <div className="bg-gray-50 rounded-xl p-3 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium">Contact us</div>
                <div className="text-xs text-neutral-500 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  <span>We are online</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white px-3 py-2 font-medium transition"
                aria-label="Chat on WhatsApp"
              >
                {/* WhatsApp SVG */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    fill="#fff"
                    d="M20.52 3.48A11.88 11.88 0 0012 0C5.383 0 .01 5.373 0 12c0 2.115.553 4.18 1.6 6.02L0 24l6.24-1.62A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.246-6.02-3.48-8.52z"
                  />
                  <path
                    fill="#25D366"
                    d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10c-1.94 0-3.74-.56-5.26-1.52L4 22l1.52-2.74A9.965 9.965 0 012 12C2 6.477 6.477 2 12 2z"
                    opacity="0.0"
                  />
                  <path
                    fill="#fff"
                    d="M7.2 6.6c-.26 0-.5.1-.68.28-.36.36-.36.94 0 1.3l.86.86c.34.34.88.43 1.32.24 1.3-.56 2.78-.56 4.08 0 .42.18.94.09 1.28-.27l.86-.86c.36-.36.36-.94 0-1.3-.36-.36-.94-.36-1.3 0l-.86.86a2.9 2.9 0 01-1.48.57c-1.8 0-3.36-1.56-3.36-3.36 0-.4-.32-.72-.72-.72z"
                  />
                </svg>
                WhatsApp
              </a>

              <a
                href={mailto}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-neutral-900 px-3 py-2 font-medium border border-neutral-200 transition"
                aria-label="Email us"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>

          <div className="mt-4 text-xs text-center text-neutral-400">
            Powered by 28th hide luxe
          </div>
        </div>
      </div>

      {/* Floating button */}
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close chat panel" : "Open chat panel"}
          className="group relative rounded-full w-16 h-16 flex items-center justify-center shadow-2xl focus:outline-none transition transform hover:scale-105"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-b from-[#4ade80] to-[#16a34a]"></span>
          <MessageCircle className="relative w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </button>
      </div>
    </>
  );
};

export default WhatsAppChat;
