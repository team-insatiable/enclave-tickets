import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { brand, event } from '$lib/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { slugify } from '$lib/slug';
import { canPublishEvent } from '$lib/tiers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const brandId = url.searchParams.get('brand');
	if (!brandId) redirect(302, '/dashboard');

	const b = await db.query.brand.findFirst({
		where: and(eq(brand.id, brandId), eq(brand.producerId, locals.user!.id))
	});
	if (!b) error(404, 'Brand not found');

	return { brand: { id: b.id, name: b.name } };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const brandId = data.get('brandId')?.toString() ?? '';
		const name = data.get('name')?.toString().trim() ?? '';
		const description = data.get('description')?.toString().trim() ?? '';
		const customSlug = data.get('slug')?.toString().trim() ?? '';
		const startAt = data.get('startAt')?.toString() ?? '';
		const endAt = data.get('endAt')?.toString() ?? '';
		const timezone = data.get('timezone')?.toString() ?? 'America/New_York';
		const venueName = data.get('venueName')?.toString().trim() ?? '';
		const venueAddress = data.get('venueAddress')?.toString().trim() ?? '';
		const locationRevealEnabled = data.get('locationRevealEnabled') === 'on';
		const locationRevealAt = data.get('locationRevealAt')?.toString() ?? '';
		const capacity = data.get('capacity')?.toString() ?? '';

		if (!name || !startAt || !venueName || !brandId) {
			return fail(400, { error: 'Name, start time, venue name, and brand are required.', values: Object.fromEntries(data) });
		}

		// Verify brand belongs to this producer
		const b = await db.query.brand.findFirst({
			where: and(eq(brand.id, brandId), eq(brand.producerId, locals.user!.id))
		});
		if (!b) return fail(403, { error: 'Brand not found.', values: {} as Record<string, string> });

		// Check tier active event limit
		const tier = (locals.user as any).subscriptionTier ?? 'free';
		const [{ value: activeCount }] = await db
			.select({ value: count() })
			.from(event)
			.innerJoin(brand, eq(event.brandId, brand.id))
			.where(and(eq(brand.producerId, locals.user!.id), eq(event.status, 'published')));

		if (!canPublishEvent(tier, activeCount)) {
			return fail(403, { error: 'You have reached the active event limit for your plan. Upgrade to publish more events.', values: {} as Record<string, string> });
		}

		const slug = customSlug || slugify(name);
		if (!slug) return fail(400, { error: 'Could not generate a valid URL slug.', values: {} as Record<string, string> });

		const existing = await db.query.event.findFirst({ where: eq(event.slug, slug) });
		if (existing) return fail(400, { error: 'That URL slug is already taken.', values: Object.fromEntries(data) });

		const [newEvent] = await db
			.insert(event)
			.values({
				brandId,
				name,
				description: description || null,
				slug,
				startAt: new Date(startAt),
				endAt: endAt ? new Date(endAt) : null,
				timezone,
				venueName,
				venueAddress: venueAddress || null,
				locationRevealEnabled,
				locationRevealAt: locationRevealAt ? new Date(locationRevealAt) : null,
				capacity: capacity ? parseInt(capacity) : null,
				status: 'draft',
				noindex: true
			})
			.returning();

		redirect(302, `/dashboard/events/${newEvent.id}`);
	}
};
