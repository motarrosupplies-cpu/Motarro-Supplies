'use client';

import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Check if Tawk.to is already loaded
    if (window.Tawk_API && window.Tawk_API.getStatus) {
      return;
    }

    try {
      // Initialize Tawk.to variables
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      // Create and inject the Tawk.to script
      const script1 = document.createElement('script');
      script1.type = 'text/javascript';
      script1.async = true;
      script1.src = 'https://embed.tawk.to/68fe95796b37cd19503f1369/1j8h7fp89';
      script1.charset = 'UTF-8';
      script1.setAttribute('crossorigin', '*');

      // Add error handling
      script1.onerror = () => {
        console.warn('Tawk.to script failed to load. This is usually safe to ignore.');
      };

      // Use the original Tawk.to script insertion method
      const s0 = document.getElementsByTagName('script')[0];
      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(script1, s0);
      } else {
        document.head.appendChild(script1);
      }

      // Cleanup function
      return () => {
        const tawkScript = document.querySelector('script[src*="tawk.to"]');
        if (tawkScript) {
          tawkScript.remove();
        }
      };
    } catch (error) {
      console.warn('Error loading Tawk.to chat widget:', error);
    }
  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

