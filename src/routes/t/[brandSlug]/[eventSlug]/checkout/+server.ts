import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { brand, event, ticketType, attendee, order, ticket, dbblCheck } from '$lib/db/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import { hashSignal } from '$lib/hash';
import { queryDbbl } from '$lib/dbbl';
import { getPaymentProvider } from '$lib/payments';
import { generateQrToken } from '$lib/tokens';
import { canSellTicket, getTierLimits } from '$lib/tiers';
import { sendEmail, buildTicketConfirmationEmail } from '$lib/email';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, url }) => {
	const body = await request.json().catch(() => null);
	if (!body) return json({ message: 'Invalid request.' }, { status: 400 });

	const { firstName, lastName, email: buyerEmail, phone, ageAcknowledged, selectedTypes } = body;

	if (!ageAcknowledged) {
		return json({ message: 'You must confirm you are 18 or older.' }, { status: 400 });
	}
	if (!firstName?.trim() || !lastName?.trim() || !buyerEmail?.trim()) {
		return json({ message: 'First name, last name, and email are required.' }, { status: 400 });
	}

	// ── Load brand + event ────────────────────────────────────────────────────

	const b = await db.query.brand.findFirst({
		where: eq(brand.slug, params.brandSlug),
		with: { producer: true }
	});
	if (!b) return json({ message: 'Not found.' }, { status: 404 });

	const e = await db.query.event.findFirst({
		where: and(
			eq(event.brandId, b.id),
			eq(event.slug, params.eventSlug),
			eq(event.status, 'published')
		)
	});
	if (!e) return json({ message: 'Not found.' }, { status: 404 });

	// ── Validate selections ───────────────────────────────────────────────────

	const selections: Array<[string, number]> = Object.entries(
		(selectedTypes as Record<string, number>) ?? {}
	).filter(([, qty]) => qty > 0);

	if (selections.length === 0) {
		return json({ message: 'Please select at least one ticket.' }, { status: 400 });
	}

	const typeIds = selections.map(([id]) => id);
	const types = await db.query.ticketType.findMany({
		where: and(eq(ticketType.eventId, e.id), inArray(ticketType.id, typeIds))
	});

	const now = new Date();

	for (const [typeId, qty] of selections) {
		const tt = types.find((t) => t.id === typeId);
		if (!tt || !tt.visible || tt.status !== 'active') {
			return json({ message: 'One or more selected ticket types are unavailable.' }, { status: 400 });
		}
		if (qty > tt.maxPerOrder) {
			return json(
				{ message: `Maximum ${tt.maxPerOrder} ticket(s) per order for "${tt.name}".` },
				{ status: 400 }
			);
		}
		if (tt.saleStartsAt && now < tt.saleStartsAt) {
			return json({ message: `"${tt.name}" tickets are not yet on sale.` }, { status: 400 });
		}
		if (tt.saleEndsAt && now > tt.saleEndsAt) {
			return json({ message: `"${tt.name}" tickets are no longer available.` }, { status: 400 });
		}

		// Check inventory (count tickets on non-failed orders)
		const [{ taken }] = await db
			.select({ taken: sql<string>`count(*)` })
			.from(ticket)
			.innerJoin(order, eq(ticket.orderId, order.id))
			.where(
				and(
					eq(ticket.ticketTypeId, typeId),
					or(eq(order.status, 'pending'), eq(order.status, 'completed'))
				)
			);
		if (parseInt(taken) + qty > tt.quantity) {
			return json({ message: `Not enough tickets available for "${tt.name}".` }, { status: 400 });
		}
	}

	// ── Tier limit check ──────────────────────────────────────────────────────

	const producer = b.producer;
	const tier = producer.subscriptionTier ?? 'free';
	const limits = getTierLimits(tier);
	const totalQty = selections.reduce((sum, [, qty]) => sum + qty, 0);

	if (limits.ticketsPerMonth !== null) {
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const [{ monthTotal }] = await db
			.select({ monthTotal: sql<string>`count(${ticket.id})` })
			.from(ticket)
			.innerJoin(order, eq(ticket.orderId, order.id))
			.innerJoin(event, eq(order.eventId, event.id))
			.innerJoin(brand, eq(event.brandId, brand.id))
			.where(
				and(
					eq(brand.producerId, producer.id),
					eq(order.status, 'completed'),
					sql`${order.completedAt} >= ${startOfMonth}`
				)
			);
		if (parseInt(monthTotal) + totalQty > limits.ticketsPerMonth) {
			return json(
				{ message: 'This event is temporarily unavailable. Please try again later.' },
				{ status: 503 }
			);
		}
	}

	// ── DBBL check ────────────────────────────────────────────────────────────

	const emailHash = hashSignal(buyerEmail);
	const phoneHash = phone?.trim() ? hashSignal(phone) : undefined;

	const dbblResult = await queryDbbl({
		emailHash,
		phoneHash,
		brandEnabled: b.dbblEnabled
	});

	const exceedsThreshold = !dbblResult.skipped && dbblResult.riskScore >= b.dbblThreshold;

	if (exceedsThreshold && b.dbblAction === 'block') {
		return json(
			{ message: 'We were unable to process your request at this time.' },
			{ status: 403 }
		);
	}

	// ── Create records ────────────────────────────────────────────────────────

	const totalCents = selections.reduce((sum, [typeId, qty]) => {
		const tt = types.find((t) => t.id === typeId)!;
		return sum + tt.price * qty;
	}, 0);

	const ip =
		request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
		request.headers.get('cf-connecting-ip') ??
		null;

	const [newAttendee] = await db
		.insert(attendee)
		.values({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: buyerEmail.trim().toLowerCase(),
			phone: phone?.trim() || null,
			emailHash,
			phoneHash: phoneHash ?? null,
			ageAcknowledged: true
		})
		.returning();

	const [newOrder] = await db
		.insert(order)
		.values({
			eventId: e.id,
			attendeeId: newAttendee.id,
			status: 'pending',
			subtotalCents: totalCents,
			totalCents,
			paymentProvider: b.paymentProvider,
			ipAddress: ip
		})
		.returning();

	// Create ticket records now to reserve inventory
	const ticketRows = selections.flatMap(([typeId, qty]) =>
		Array.from({ length: qty }, () => ({
			orderId: newOrder.id,
			ticketTypeId: typeId,
			qrToken: generateQrToken(),
			status: 'active' as const
		}))
	);
	const newTickets = await db.insert(ticket).values(ticketRows).returning();

	// Log DBBL result regardless of outcome
	await db.insert(dbblCheck).values({
		orderId: newOrder.id,
		emailHash,
		phoneHash: phoneHash ?? null,
		riskScore: dbblResult.skipped ? null : dbblResult.riskScore,
		matchConfidence: dbblResult.matchConfidence,
		actionTaken: exceedsThreshold ? 'flagged' : 'passed'
	});

	// ── Free order: complete immediately ──────────────────────────────────────

	if (totalCents === 0) {
		await db
			.update(order)
			.set({ status: 'completed', completedAt: new Date() })
			.where(eq(order.id, newOrder.id));

		const emailContent = buildTicketConfirmationEmail({
			senderName: b.emailSenderName,
			replyTo: b.emailReplyTo,
			eventName: e.name,
			qrToken: newTickets[0].qrToken
		});
		await sendEmail({ to: buyerEmail, ...emailContent, from: emailContent.from });

		return json({
			checkoutUrl: `${url.origin}/t/${params.brandSlug}/${params.eventSlug}/success?order=${newOrder.id}`
		});
	}

	// ── Paid order: create Stripe session ─────────────────────────────────────

	let provider;
	try {
		provider = getPaymentProvider(b);
	} catch {
		// Roll back: mark order failed so inventory releases
		await db.update(order).set({ status: 'failed' }).where(eq(order.id, newOrder.id));
		return json({ message: 'Payment is not configured for this event.' }, { status: 503 });
	}

	const lineItems = selections.map(([typeId, qty]) => {
		const tt = types.find((t) => t.id === typeId)!;
		return { name: tt.name, priceInCents: tt.price, quantity: qty };
	});

	const successUrl = `${url.origin}/t/${params.brandSlug}/${params.eventSlug}/success?order=${newOrder.id}`;
	const cancelUrl = `${url.origin}/t/${params.brandSlug}/${params.eventSlug}`;

	let checkout;
	try {
		checkout = await provider.createCheckout({
			lineItems,
			customerEmail: buyerEmail,
			successUrl,
			cancelUrl,
			metadata: { orderId: newOrder.id }
		});
	} catch {
		await db.update(order).set({ status: 'failed' }).where(eq(order.id, newOrder.id));
		return json({ message: 'Unable to create checkout session. Please try again.' }, { status: 502 });
	}

	await db
		.update(order)
		.set({ paymentProviderSessionId: checkout.sessionId })
		.where(eq(order.id, newOrder.id));

	return json({ checkoutUrl: checkout.checkoutUrl });
};
