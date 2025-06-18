import { z } from 'zod';

export const analyticsPayloadSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export const demoProgressSchema = z.object({
  stepNumber: z.number().min(1).max(15),
  industry: z.enum(['healthcare', 'legal', 'ecommerce']),
  timeSpent: z.number().positive(),
  completed: z.boolean(),
});

export const calculatorInputSchema = z.object({
  industry: z.enum(['healthcare', 'legal', 'ecommerce']),
  providers: z.number().min(1).max(100),
  patientsPerDay: z.number().min(1).max(500),
  location: z.string().min(2).max(50),
  currentConversionRate: z.number().min(0).max(100).optional(),
  averageOrderValue: z.number().min(0).optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().min(1).max(100).optional(),
  industry: z.enum(['healthcare', 'legal', 'ecommerce', 'other']),
  message: z.string().min(10).max(1000),
  phone: z.string().optional(),
});

export const trialSignupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  company: z.string().min(1).max(100),
  industry: z.enum(['healthcare', 'legal', 'ecommerce', 'other']),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  currentSolution: z.string().max(200).optional(),
});

export const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  planId: z.string(),
  customerId: z.string().optional(),
});

export const webhookPayloadSchema = z.object({
  type: z.string(),
  data: z.record(z.unknown()),
  created_at: z.string().datetime().optional(),
});

// Validation helper functions
export function validateAnalyticsPayload(data: unknown) {
  return analyticsPayloadSchema.parse(data);
}

export function validateDemoProgress(data: unknown) {
  return demoProgressSchema.parse(data);
}

export function validateCalculatorInput(data: unknown) {
  return calculatorInputSchema.parse(data);
}

export function validateContactForm(data: unknown) {
  return contactFormSchema.parse(data);
}

export function validateTrialSignup(data: unknown) {
  return trialSignupSchema.parse(data);
}

export function validatePaymentIntent(data: unknown) {
  return paymentIntentSchema.parse(data);
}

export function validateWebhookPayload(data: unknown) {
  return webhookPayloadSchema.parse(data);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Rate limiting validation
export function validateRateLimit(ip: string): boolean {
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  return ipRegex.test(ip) || ip === '127.0.0.1';
}
