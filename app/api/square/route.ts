import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'squareup';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

type PaymentData = {
  amount: number;
  sourceId: string;
  currency?: string;
  note?: string;
  idempotencyKey?: string;
};

type SubscriptionData = {
  planId: string;
  customerId: string;
  locationId?: string;
  idempotencyKey?: string;
};

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

const paymentsApi = squareClient.paymentsApi;
const subscriptionsApi = squareClient.subscriptionsApi;

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/square",
    },
    async () => {
      try {
        const { action, ...data } = await request.json();
        
        logger.info('Square API request received', { action, dataKeys: Object.keys(data) });

        switch (action) {
          case 'create_payment':
            return await handleCreatePayment(data);
          case 'create_subscription':
            return await handleCreateSubscription(data);
          default:
            logger.warn('Invalid Square API action', { action });
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
      } catch (error) {
        logger.error('Square API error', { error: error instanceof Error ? error.message : error });
        Sentry.captureException(error);
        return NextResponse.json(
          { error: 'Payment processing failed' },
          { status: 500 }
        );
      }
    }
  );
}

async function handleCreatePayment(data: PaymentData) {
  return Sentry.startSpan(
    {
      op: "square.payment",
      name: "Create Square Payment",
    },
    async (span) => {
      try {
        span.setAttribute("amount", data.amount);
        span.setAttribute("currency", data.currency || "USD");

        const idempotencyKey = data.idempotencyKey || `payment_${Date.now()}_${Math.random()}`;
        
        logger.info('Creating Square payment', {
          amount: data.amount,
          currency: data.currency || 'USD',
          idempotencyKey
        });

        const requestBody = {
          sourceId: data.sourceId,
          idempotencyKey,
          amountMoney: {
            amount: BigInt(data.amount), // Amount in cents
            currency: data.currency || 'USD',
          },
          ...(data.note && { note: data.note }),
        };

        const response = await paymentsApi.createPayment(requestBody);

        if (response.result && response.result.payment) {
          const payment = response.result.payment;
          
          logger.info('Square payment created successfully', {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amountMoney?.amount?.toString()
          });

          span.setAttribute("payment_id", payment.id || "unknown");
          span.setAttribute("status", payment.status || "unknown");

          return NextResponse.json({
            success: true,
            payment: {
              id: payment.id,
              status: payment.status,
              amount: payment.amountMoney?.amount?.toString(),
              currency: payment.amountMoney?.currency,
              receiptUrl: payment.receiptUrl,
            },
          });
        } else {
          throw new Error('Invalid response from Square API');
        }
      } catch (error) {
        logger.error('Square payment creation failed', {
          error: error instanceof Error ? error.message : error,
          amount: data.amount,
          sourceId: data.sourceId
        });
        
        Sentry.captureException(error);
        span.setAttribute("error", true);
        
        return NextResponse.json(
          { error: 'Failed to process payment' },
          { status: 500 }
        );
      }
    }
  );
}

async function handleCreateSubscription(data: SubscriptionData) {
  return Sentry.startSpan(
    {
      op: "square.subscription",
      name: "Create Square Subscription",
    },
    async (span) => {
      try {
        span.setAttribute("plan_id", data.planId);
        span.setAttribute("customer_id", data.customerId);

        const idempotencyKey = data.idempotencyKey || `subscription_${Date.now()}_${Math.random()}`;
        
        logger.info('Creating Square subscription', {
          planId: data.planId,
          customerId: data.customerId,
          locationId: data.locationId,
          idempotencyKey
        });

        const requestBody = {
          idempotencyKey,
          locationId: data.locationId || process.env.SQUARE_LOCATION_ID!,
          planId: data.planId,
          customerId: data.customerId,
        };

        const response = await subscriptionsApi.createSubscription(requestBody);

        if (response.result && response.result.subscription) {
          const subscription = response.result.subscription;
          
          logger.info('Square subscription created successfully', {
            subscriptionId: subscription.id,
            status: subscription.status,
            planId: subscription.planId
          });

          span.setAttribute("subscription_id", subscription.id || "unknown");
          span.setAttribute("status", subscription.status || "unknown");

          return NextResponse.json({
            success: true,
            subscription: {
              id: subscription.id,
              status: subscription.status,
              planId: subscription.planId,
              customerId: subscription.customerId,
              startDate: subscription.startDate,
              chargedThroughDate: subscription.chargedThroughDate,
            },
          });
        } else {
          throw new Error('Invalid response from Square Subscriptions API');
        }
      } catch (error) {
        logger.error('Square subscription creation failed', {
          error: error instanceof Error ? error.message : error,
          planId: data.planId,
          customerId: data.customerId
        });
        
        Sentry.captureException(error);
        span.setAttribute("error", true);
        
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }
    }
  );
}
