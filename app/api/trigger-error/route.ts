import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple undefined function call as requested
    (globalThis as any).myUndefinedFunction();
    
    return NextResponse.json({ message: "This should not be reached" });
  } catch (error) {
    Sentry.captureException(error);
    
    return NextResponse.json(
      { 
        error: "myUndefinedFunction() error captured by Sentry",
        message: "Check your Sentry dashboard for the error event"
      },
      { status: 500 }
    );
  }
}