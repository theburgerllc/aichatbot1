import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const calculatorSchema = z.object({
  industry: z.enum(['healthcare', 'legal', 'ecommerce']),
  providers: z.number().min(1).max(100),
  patientsPerDay: z.number().min(1).max(500),
  location: z.string().min(2).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, providers, patientsPerDay, location } =
      calculatorSchema.parse(body);

    const calculation = await calculateROI({
      industry,
      providers,
      patientsPerDay,
      location,
    });

    // Track calculation event
    await trackEvent('calculator_completed', {
      industry,
      result: calculation.monthlySavings,
    });

    return NextResponse.json(calculation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Calculator API error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}

async function calculateROI(params: {
  industry: string;
  providers: number;
  patientsPerDay: number;
  location: string;
}) {
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

async function trackEvent(event: string, properties: any) {
  // Send to analytics service
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
