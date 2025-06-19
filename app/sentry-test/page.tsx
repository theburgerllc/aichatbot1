'use client';

import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  const triggerError = () => {
    try {
      // Call a function that doesn't exist to trigger an error
      (window as any).myUndefinedFunction();
    } catch (error) {
      // Capture the error with Sentry
      Sentry.captureException(error);
      console.error('Error captured by Sentry:', error);
    }
  };

  const triggerSpan = () => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        span.setAttribute("test", "sentry-verification");
        span.setAttribute("timestamp", new Date().toISOString());
        console.log('Sentry span created successfully');
      }
    );
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Sentry Integration Test</h1>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={triggerError}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Trigger Test Error
          </button>
          <p className="text-sm text-gray-600 mt-2">
            This will trigger an error and send it to Sentry
          </p>
        </div>

        <div>
          <button
            onClick={triggerSpan}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Create Test Span
          </button>
          <p className="text-sm text-gray-600 mt-2">
            This will create a performance span in Sentry
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">How to verify:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Trigger Test Error" button</li>
            <li>Check your browser console for the error message</li>
            <li>Go to your Sentry dashboard at sentry.io</li>
            <li>Look for the error event in your javascript-nextjs project</li>
            <li>Click "Create Test Span" to test performance monitoring</li>
          </ol>
        </div>
      </div>
    </div>
  );
}