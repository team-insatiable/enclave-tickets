import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { brand, event, ticketType } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const e = await db.query.event.findFirst({
		where: eq(event.id, params.eventId),
		with: {
			brand: true,
			ticketTypes: { orderBy: (t, { asc }) => [asc(t.sortOrder)] }
		}
	});

	if (!e || e.brand.producerId !== locals.user!.id) error(404, 'Event not found');

	return {
		event: e,
		brand: { id: e.brand.id, name: e.brand.name, slug: e.brand.slug }
	};
};

export const actions: Actions = {
	// Publish or unpublish the event
	setStatus: async ({ request, params, locals }) => {
		const e = await db.query.event.findFirst({
			where: eq(event.id, params.eventId),
			with: { brand: true }
		});
		if (!e || e.brand.producerId !== locals.user!.id) error(404);

		const data = await request.formData();
		const status = data.get('status')?.toString() as 'draft' | 'published' | 'cancelled';
		if (!['draft', 'published', 'cancelled'].includes(status)) return fail(400);

		await db.update(event).set({ status }).where(eq(event.id, params.eventId));
		return { success: true };
	},

	// Add a ticket type
	addTicketType: async ({ request, params, locals }) => {
		const e = await db.query.event.findFirst({
			where: eq(event.id, params.eventId),
			with: { brand: true }
		});
		if (!e || e.brand.producerId !== locals.user!.id) error(404);

		const data = await request.formData();
		const name = data.get('name')?.toString().trim() ?? '';
		const priceRaw = data.get('price')?.toString() ?? '0';
		const quantity = parseInt(data.get('quantity')?.toString() ?? '0');
		const maxPerOrder = parseInt(data.get('maxPerOrder')?.toString() ?? '1');
		const description = data.get('description')?.toString().trim() ?? '';
		const categoryTag = data.get('categoryTag')?.toString().trim() ?? '';
		const requiresApproval = data.get('requiresApproval') === 'on';
		const visible = data.get('visible') !== 'off';
		const saleStartsAt = data.get('saleStartsAt')?.toString() ?? '';
		const saleEndsAt = data.get('saleEndsAt')?.toString() ?? '';

		if (!name || isNaN(quantity) || quantity < 1) {
			return fail(400, { addError: 'Name and quantity are required.' });
		}

		const priceInCents = Math.round(parseFloat(priceRaw) * 100);
		if (isNaN(priceInCents) || priceInCents < 0) {
			return fail(400, { addError: 'Invalid price.' });
		}

		// Determine sort order (append to end)
		const existing = await db.query.ticketType.findMany({
			where: eq(ticketType.eventId, params.eventId)
		});

		await db.insert(ticketType).values({
			eventId: params.eventId,
			name,
			description: description || null,
			price: priceInCents,
			quantity,
			maxPerOrder: maxPerOrder || 1,
			categoryTag: categoryTag || null,
			requiresApproval,
			visible,
			saleStartsAt: saleStartsAt ? new Date(saleStartsAt) : null,
			saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
			sortOrder: existing.length
		});

		return { addSuccess: true };
	},

	// Delete a ticket type (only if no tickets sold)
	deleteTicketType: async ({ request, params, locals }) => {
		const e = await db.query.event.findFirst({
			where: eq(event.id, params.eventId),
			with: { brand: true }
		});
		if (!e || e.brand.producerId !== locals.user!.id) error(404);

		const data = await request.formData();
		const typeId = data.get('typeId')?.toString() ?? '';

		const tt = await db.query.ticketType.findFirst({
			where: and(eq(ticketType.id, typeId), eq(ticketType.eventId, params.eventId)),
			with: { tickets: { limit: 1 } }
		});
		if (!tt) return fail(404, { deleteError: 'Ticket type not found.' });
		if (tt.tickets.length > 0) {
			return fail(400, { deleteError: 'Cannot delete a ticket type that has issued tickets.' });
		}

		await db.delete(ticketType).where(eq(ticketType.id, typeId));
		return { deleteSuccess: true };
	}
};
