declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

declare module 'next/server' {
  interface NextRequest {
    ip?: string;
  }
}

export {};
