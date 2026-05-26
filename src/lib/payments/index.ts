import type { Brand } from '$lib/db/schema';
import { decrypt } from '$lib/encrypt';
import { createStripeProvider } from './stripe';
import type { PaymentProvider } from './types';

export function getPaymentProvider(
	brand: Pick<Brand, 'paymentProvider' | 'stripeSecretKey' | 'stripeWebhookSecret'>
): PaymentProvider {
	switch (brand.paymentProvider) {
		case 'stripe': {
			if (!brand.stripeSecretKey) throw new Error('Stripe secret key not configured for brand');
			if (!brand.stripeWebhookSecret)
				throw new Error('Stripe webhook secret not configured for brand');
			return createStripeProvider(decrypt(brand.stripeSecretKey), decrypt(brand.stripeWebhookSecret));
		}
		default:
			throw new Error(`Unsupported payment provider: ${brand.paymentProvider}`);
	}
}

export type { PaymentProvider, CreateCheckoutParams, CreateCheckoutResult, WebhookEvent } from './types';
