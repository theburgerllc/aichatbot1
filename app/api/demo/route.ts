import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const demoProgressSchema = z.object({
  stepNumber: z.number().min(1).max(15),
  industry: z.enum(['healthcare', 'legal', 'ecommerce']),
  timeSpent: z.number().positive(),
  completed: z.boolean(),
});

const demoFeedbackSchema = z.object({
  industry: z.enum(['healthcare', 'legal', 'ecommerce']),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  email: z.string().email().optional(),
  interestedInTrial: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'track_progress':
        return await handleTrackProgress(data);
      case 'submit_feedback':
        return await handleSubmitFeedback(data);
      case 'request_custom_demo':
        return await handleCustomDemoRequest(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Demo API error:', error);
    return NextResponse.json(
      { error: 'Demo processing failed' },
      { status: 500 }
    );
  }
}

async function handleTrackProgress(data: any) {
  try {
    const validatedData = demoProgressSchema.parse(data);

    // Track demo progress
    await trackEvent('demo_progress', {
      step: validatedData.stepNumber,
      industry: validatedData.industry,
      timeSpent: validatedData.timeSpent,
      completed: validatedData.completed,
    });

    // Store progress in session/database if needed

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid demo data', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

async function handleSubmitFeedback(data: any) {
  try {
    const validatedData = demoFeedbackSchema.parse(data);

    // Store feedback
    await storeDemoFeedback(validatedData);

    // Track feedback event
    await trackEvent('demo_feedback_submitted', {
      industry: validatedData.industry,
      rating: validatedData.rating,
      interestedInTrial: validatedData.interestedInTrial,
    });

    // If interested in trial and email provided, add to follow-up list
    if (validatedData.interestedInTrial && validatedData.email) {
      await addToTrialFollowUp(validatedData.email, validatedData.industry);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}

async function handleCustomDemoRequest(data: any) {
  try {
    const { email, industry, company, message } = data;

    // Store custom demo request
    await storeCustomDemoRequest({
      email,
      industry,
      company,
      message,
      requestedAt: new Date().toISOString(),
    });

    // Send notification to sales team
    await notifySalesTeam({
      email,
      industry,
      company,
      message,
    });

    // Track event
    await trackEvent('custom_demo_requested', {
      industry,
      hasCompany: !!company,
      hasMessage: !!message,
    });

    return NextResponse.json({
      success: true,
      message: 'Custom demo request submitted successfully!',
    });
  } catch (error) {
    throw error;
  }
}

async function trackEvent(event: string, properties: any) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

async function storeDemoFeedback(feedback: any) {
  // Store in database
  // Implementation depends on your database choice
  console.log('Storing demo feedback:', feedback);
}

async function addToTrialFollowUp(email: string, industry: string) {
  // Add to CRM or email marketing system
  // Implementation depends on your CRM choice
  console.log('Adding to trial follow-up:', { email, industry });
}

async function storeCustomDemoRequest(request: any) {
  // Store in database
  console.log('Storing custom demo request:', request);
}

async function notifySalesTeam(request: any) {
  // Send notification to sales team via email/Slack
  console.log('Notifying sales team:', request);
}
