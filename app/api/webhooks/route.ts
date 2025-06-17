import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload = JSON.parse(body);
    
    // Process webhook based on type
    await processWebhook(payload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const webhookSecret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return false;
    }
    
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(body);
    const expectedSignature = hmac.digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function processWebhook(payload: any) {
  const { type, data } = payload;
  
  switch (type) {
    case 'payment.created':
      await handlePaymentCreated(data);
      break;
    case 'payment.updated':
      await handlePaymentUpdated(data);
      break;
    case 'subscription.created':
      await handleSubscriptionCreated(data);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(data);
      break;
    case 'invoice.payment_made':
      await handleInvoicePaymentMade(data);
      break;
    default:
      console.log('Unhandled webhook type:', type);
  }
}

async function handlePaymentCreated(data: any) {
  console.log('Payment created:', data);
  
  // Update order status
  // Send confirmation email
  // Track analytics event
  await trackEvent('payment_successful', {
    amount: data.payment?.amount_money?.amount,
    currency: data.payment?.amount_money?.currency,
  });
}

async function handlePaymentUpdated(data: any) {
  console.log('Payment updated:', data);
  
  // Handle payment status changes
  // Update customer records
}

async function handleSubscriptionCreated(data: any) {
  console.log('Subscription created:', data);
  
  // Provision access
  // Send welcome email
  // Update customer status
  await trackEvent('subscription_created', {
    planId: data.subscription?.plan_id,
  });
}

async function handleSubscriptionUpdated(data: any) {
  console.log('Subscription updated:', data);
  
  // Handle subscription changes
  // Update billing information
}

async function handleInvoicePaymentMade(data: any) {
  console.log('Invoice payment made:', data);
  
  // Update billing records
  // Send receipt
}

async function trackEvent(event: string, properties: any) {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties }),
    });
  } catch (error) {
    console.error('Failed to track webhook event:', error);
  }
}