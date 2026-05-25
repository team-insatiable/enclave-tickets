import { db } from '$lib/db';
import { brand, event, ticketType } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const b = await db.query.brand.findFirst({
		where: eq(brand.slug, params.brandSlug)
	});
	if (!b) error(404, 'Not found');

	const e = await db.query.event.findFirst({
		where: and(eq(event.brandId, b.id), eq(event.slug, params.eventSlug), eq(event.status, 'published'))
	});
	if (!e) error(404, 'Not found');

	const types = await db.query.ticketType.findMany({
		where: and(eq(ticketType.eventId, e.id), eq(ticketType.visible, true)),
		orderBy: (t, { asc }) => [asc(t.sortOrder)]
	});

	const now = new Date();
	const venueAddress =
		e.locationRevealEnabled && e.locationRevealAt && now >= e.locationRevealAt
			? e.venueAddress
			: null;

	return {
		event: { ...e, venueAddress },
		brand: { name: b.name, emailSenderName: b.emailSenderName },
		ticketTypes: types
	};
};
