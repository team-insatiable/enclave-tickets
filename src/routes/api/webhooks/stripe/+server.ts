import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { db } from '$lib/db';
import { order, brand, event, ticket, attendee } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '$lib/encrypt';
import { sendEmail, buildTicketConfirmationEmail } from '$lib/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) return json({ error: 'Missing signature' }, { status: 400 });

	// Parse unverified payload only to extract orderId for brand lookup
	let unverified: Stripe.Event;
	try {
		unverified = JSON.parse(rawBody) as Stripe.Event;
	} catch {
		return json({ error: 'Invalid payload' }, { status: 400 });
	}

	// We only care about checkout.session.completed at this stage
	if (unverified.type !== 'checkout.session.completed') {
		return json({ received: true });
	}

	const session = unverified.data.object as Stripe.Checkout.Session;
	const orderId = session.metadata?.orderId;
	if (!orderId) return json({ error: 'Missing orderId in metadata' }, { status: 400 });

	// Look up order → event → brand to get the webhook secret
	const o = await db.query.order.findFirst({
		where: eq(order.id, orderId),
		with: {
			event: {
				with: { brand: true }
			},
			attendee: true,
			tickets: {
				with: { ticketType: true }
			}
		}
	});

	if (!o) return json({ error: 'Order not found' }, { status: 404 });
	if (o.status === 'completed') return json({ received: true }); // idempotent

	const b = o.event.brand;
	if (!b.stripeWebhookSecret) return json({ error: 'Webhook secret not configured' }, { status: 500 });

	// Now verify the signature with the brand's actual webhook secret
	const stripe = new Stripe(decrypt(b.stripeSecretKey!));
	let verifiedEvent: Stripe.Event;
	try {
		verifiedEvent = stripe.webhooks.constructEvent(rawBody, signature, decrypt(b.stripeWebhookSecret));
	} catch {
		return json({ error: 'Signature verification failed' }, { status: 400 });
	}

	const verifiedSession = verifiedEvent.data.object as Stripe.Checkout.Session;
	if (verifiedSession.payment_status !== 'paid') {
		return json({ received: true });
	}

	// Mark order complete
	await db
		.update(order)
		.set({ status: 'completed', completedAt: new Date() })
		.where(eq(order.id, orderId));

	// Send one confirmation email with the first ticket's QR token
	// (multi-ticket emails are a second-wave feature)
	if (o.tickets.length > 0 && o.attendee) {
		const emailContent = buildTicketConfirmationEmail({
			senderName: b.emailSenderName,
			replyTo: b.emailReplyTo,
			eventName: o.event.name,
			qrToken: o.tickets[0].qrToken
		});
		await sendEmail({
			to: o.attendee.email,
			...emailContent,
			from: emailContent.from
		}).catch((err) => console.error('Confirmation email failed:', err));
	}

	return json({ received: true });
};
