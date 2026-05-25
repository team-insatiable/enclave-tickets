import type { Brand } from '$lib/db/schema';
import { decrypt } from '$lib/encrypt';
import { createStripeProvider } from './stripe';
import type { PaymentProvider } from './types';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';

export function getPaymentProvider(brand: Pick<Brand, 'paymentProvider' | 'stripeSecretKey'>): PaymentProvider {
	switch (brand.paymentProvider) {
		case 'stripe': {
			if (!brand.stripeSecretKey) throw new Error('Stripe secret key not configured for brand');
			const secretKey = decrypt(brand.stripeSecretKey);
			return createStripeProvider(secretKey, STRIPE_WEBHOOK_SECRET);
		}
		default:
			throw new Error(`Unsupported payment provider: ${brand.paymentProvider}`);
	}
}

export type { PaymentProvider, CreateCheckoutParams, CreateCheckoutResult, WebhookEvent } from './types';
