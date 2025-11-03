import { useEffect } from "react";

declare global {
  interface Window {
    MomentCRM?: (action: string, options?: any) => void;
  }
}

export const WhatsAppChat: React.FC = () => {
  useEffect(() => {
    // Initialize MomentCRM
    const script1 = document.createElement('script');
    script1.src = 'https://app.momentcrm.com/embed';
    script1.async = true;
    document.body.appendChild(script1);

    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.innerHTML = `
        MomentCRM('init', {
          'teamVanityId': 'th-hide-luxe-legacy',
          'doChat': true,
          'doTimeTravel': true,
          'quadClickForFeedback': true,
        });
      `;
      document.body.appendChild(script2);
    };

    return () => {
      if (document.body.contains(script1)) {
        document.body.removeChild(script1);
      }
    };
  }, []);

  return null;
};

export default WhatsAppChat;
