import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/db';
import { user, brand, event } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const producer = await db.query.user.findFirst({
		where: and(eq(user.id, params.userId), eq(user.role, 'producer'))
	});
	if (!producer) error(404, 'Producer not found');

	const brands = await db.query.brand.findMany({
		where: eq(brand.producerId, params.userId),
		with: {
			events: { orderBy: [desc(event.startAt)] }
		},
		orderBy: [desc(brand.createdAt)]
	});

	return {
		producer,
		brands: brands.map(({ stripePublishableKey: pk, stripeSecretKey: sk, stripeWebhookSecret: ws, ...b }) => ({
			...b,
			hasStripeKeys: !!(sk && ws)
		}))
	};
};

export const actions: Actions = {
	updateSubscription: async ({ request, params }) => {
		const producer = await db.query.user.findFirst({
			where: and(eq(user.id, params.userId), eq(user.role, 'producer'))
		});
		if (!producer) error(404, 'Producer not found');

		const data = await request.formData();
		const tier = data.get('subscriptionTier')?.toString();
		const status = data.get('subscriptionStatus')?.toString();

		const validTiers = ['free', 'starter', 'pro', 'unlimited', 'comped'];
		const validStatuses = ['active', 'trialing', 'past_due', 'cancelled', 'comped'];

		if (!tier || !validTiers.includes(tier)) {
			return fail(400, { error: 'Invalid tier.' });
		}
		if (!status || !validStatuses.includes(status)) {
			return fail(400, { error: 'Invalid status.' });
		}

		await db
			.update(user)
			.set({
				subscriptionTier: tier as any,
				subscriptionStatus: status as any,
				updatedAt: new Date()
			})
			.where(eq(user.id, params.userId));

		return { success: true };
	}
};
