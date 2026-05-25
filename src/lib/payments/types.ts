export interface CheckoutLineItem {
	name: string;
	priceInCents: number;
	quantity: number;
}

export interface CreateCheckoutParams {
	lineItems: CheckoutLineItem[];
	customerEmail: string;
	successUrl: string;
	cancelUrl: string;
	metadata?: Record<string, string>;
}

export interface CreateCheckoutResult {
	sessionId: string;
	checkoutUrl: string;
}

export interface PaymentProvider {
	createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>;
	handleWebhook(payload: string, signature: string): Promise<WebhookEvent>;
	refund(paymentIntentId: string, amountCents?: number): Promise<void>;
}

export type WebhookEventType = 'checkout.completed' | 'refund.created' | 'unknown';

export interface WebhookEvent {
	type: WebhookEventType;
	sessionId?: string;
	metadata?: Record<string, string>;
}
