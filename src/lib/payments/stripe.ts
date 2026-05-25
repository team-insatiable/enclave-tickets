import Stripe from 'stripe';
import type {
	PaymentProvider,
	CreateCheckoutParams,
	CreateCheckoutResult,
	WebhookEvent
} from './types';

export function createStripeProvider(secretKey: string, webhookSecret: string): PaymentProvider {
	const stripe = new Stripe(secretKey);

	return {
		async createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				customer_email: params.customerEmail,
				line_items: params.lineItems.map((item) => ({
					price_data: {
						currency: 'usd',
						unit_amount: item.priceInCents,
						product_data: { name: item.name }
					},
					quantity: item.quantity
				})),
				success_url: params.successUrl,
				cancel_url: params.cancelUrl,
				metadata: params.metadata ?? {}
			});

			return {
				sessionId: session.id,
				checkoutUrl: session.url!
			};
		},

		async handleWebhook(payload: string, signature: string): Promise<WebhookEvent> {
			const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

			if (event.type === 'checkout.session.completed') {
				const session = event.data.object as Stripe.Checkout.Session;
				return {
					type: 'checkout.completed',
					sessionId: session.id,
					metadata: (session.metadata as Record<string, string>) ?? {}
				};
			}

			return { type: 'unknown' };
		},

		async refund(paymentIntentId: string, amountCents?: number): Promise<void> {
			await stripe.refunds.create({
				payment_intent: paymentIntentId,
				...(amountCents ? { amount: amountCents } : {})
			});
		}
	};
}
