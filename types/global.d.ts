declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

declare module 'next/server' {
  interface NextRequest {
    ip?: string;
  }
}

export {};
