import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Intentionally trigger an error for testing
    const undefinedVariable: any = undefined;
    undefinedVariable.someMethod(); // This will throw an error
    
    return NextResponse.json({ message: "This should not be reached" });
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error);
    
    return NextResponse.json(
      { 
        error: "Test error captured by Sentry", 
        message: "Check your Sentry dashboard for the error event" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/sentry-test",
    },
    async () => {
      try {
        const body = await request.json();
        
        // Simulate some processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return NextResponse.json({
          message: "Test span created successfully",
          received: body
        });
      } catch (error) {
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Server error" },
          { status: 500 }
        );
      }
    }
  );
}