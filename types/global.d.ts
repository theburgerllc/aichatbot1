declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

declare module 'next/server' {
  interface NextRequest {
    ip?: string;
  }
}

export {};