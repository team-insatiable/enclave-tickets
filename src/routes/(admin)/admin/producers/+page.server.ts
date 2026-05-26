import { db } from '$lib/db';
import { user, brand, event } from '$lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const producers = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			subscriptionTier: user.subscriptionTier,
			subscriptionStatus: user.subscriptionStatus,
			createdAt: user.createdAt
		})
		.from(user)
		.where(eq(user.role, 'producer'))
		.orderBy(desc(user.createdAt));

	const brandCounts = await db
		.select({ producerId: brand.producerId, count: count() })
		.from(brand)
		.groupBy(brand.producerId);

	const eventCounts = await db
		.select({ producerId: brand.producerId, count: count() })
		.from(event)
		.innerJoin(brand, eq(event.brandId, brand.id))
		.groupBy(brand.producerId);

	const brandMap = Object.fromEntries(brandCounts.map((r) => [r.producerId, r.count]));
	const eventMap = Object.fromEntries(eventCounts.map((r) => [r.producerId, r.count]));

	return {
		producers: producers.map((p) => ({
			...p,
			brandCount: brandMap[p.id] ?? 0,
			eventCount: eventMap[p.id] ?? 0
		}))
	};
};
