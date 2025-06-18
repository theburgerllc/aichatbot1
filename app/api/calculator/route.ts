import { NextRequest, NextResponse } from 'next/server';
import { logger, generateCorrelationId, logApiRequest, logApiError } from '@/lib/logger';
import { z } from 'zod';

const calculatorSchema = z.object({
  industry: z.enum(['healthcare', 'legal', 'ecommerce']),
  providers: z.number().min(1).max(100),
  patientsPerDay: z.number().min(1).max(500),
  location: z.string().min(2).max(50),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = generateCorrelationId();
  const requestLogger = logger.forRequest(correlationId);
  
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  
  try {
    requestLogger.info('Calculator API request started', {
      method: 'POST',
      url: '/api/calculator',
      ip,
      userAgent: request.headers.get('user-agent'),
    });

    const body = await request.json();
    const { industry, providers, patientsPerDay, location } =
      calculatorSchema.parse(body);

    requestLogger.debug('Calculator input validated', {
      industry,
      providers,
      patientsPerDay,
      location,
    });

    const calculation = await calculateROI({
      industry,
      providers,
      patientsPerDay,
      location,
    }, requestLogger);

    // Track calculation event
    await trackEvent('calculator_completed', {
      industry,
      result: calculation.monthlySavings,
    }, requestLogger);

    const duration = Date.now() - startTime;
    logApiRequest('POST', '/api/calculator', 200, duration, { 
      correlationId, 
      ip,
      industry,
      monthlySavings: calculation.monthlySavings 
    });

    requestLogger.info('Calculator calculation completed', {
      industry,
      monthlySavings: calculation.monthlySavings,
      yearlyProjection: calculation.yearlyProjection,
      duration,
    });

    return NextResponse.json(calculation);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      requestLogger.warn('Calculator validation failed', {
        validationErrors: error.errors,
        duration,
      });
      logApiRequest('POST', '/api/calculator', 400, duration, { 
        correlationId, 
        ip,
        errorType: 'validation_error' 
      });
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    logApiError('POST', '/api/calculator', error as Error, { 
      correlationId, 
      ip,
      duration 
    });
    
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}

async function calculateROI(params: {
  industry: string;
  providers: number;
  patientsPerDay: number;
  location: string;
}, requestLogger: ReturnType<typeof logger.forRequest>) {
  const { industry, providers, patientsPerDay, location } = params;

  // Industry-specific multipliers
  const industryMultipliers = {
    healthcare: { efficiency: 1.2, savings: 1.15, satisfaction: 1.1 },
    legal: { efficiency: 1.1, savings: 1.25, satisfaction: 1.2 },
    ecommerce: { efficiency: 1.3, savings: 1.1, satisfaction: 1.15 },
  };

  const multiplier =
    industryMultipliers[industry as keyof typeof industryMultipliers] ||
    industryMultipliers.healthcare;

  // Base calculations
  const _hoursPerDay = 8;
  const workingDaysPerMonth = 22;
  const avgHourlyRate =
    industry === 'legal' ? 75 : industry === 'healthcare' ? 45 : 35;

  // Current manual handling time per interaction
  const minutesPerInteraction =
    industry === 'legal' ? 8 : industry === 'healthcare' ? 6 : 4;
  const totalInteractionsPerMonth =
    patientsPerDay * workingDaysPerMonth * providers;

  // Time savings with AI
  const aiAutomationRate = 0.73; // 73% of interactions automated
  const automatedInteractions = totalInteractionsPerMonth * aiAutomationRate;
  const timeSavedMinutes = automatedInteractions * minutesPerInteraction;
  const timeSavedHours = timeSavedMinutes / 60;

  // Financial calculations
  const monthlySavings = Math.round(
    timeSavedHours * avgHourlyRate * multiplier.savings
  );
  const yearlyProjection = monthlySavings * 12;
  const efficiencyGain = Math.round(
    aiAutomationRate * 100 * multiplier.efficiency
  );

  // Additional benefits
  const customerSatisfactionIncrease = Math.round(25 * multiplier.satisfaction);
  const responseTimeReduction = 85; // 85% faster response times

  return {
    monthlySavings,
    yearlyProjection,
    efficiencyGain,
    customerSatisfactionIncrease,
    responseTimeReduction,
    automatedInteractions: Math.round(automatedInteractions),
    timeSavedHours: Math.round(timeSavedHours),
    industry,
    location,
  };
}

async function trackEvent(
  event: string, 
  properties: Record<string, unknown>,
  requestLogger: ReturnType<typeof logger.forRequest>
) {
  // Send to analytics service
  try {
    requestLogger.debug('Tracking calculator event', {
      event,
      properties,
      eventType: 'calculator_analytics',
    });

    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    });

    requestLogger.debug('Calculator event tracked successfully', {
      event,
      trackingComplete: true,
    });
  } catch (error) {
    requestLogger.error('Failed to track calculator event', error as Error, {
      event,
      properties,
      errorType: 'analytics_tracking_error',
    });
  }
}
