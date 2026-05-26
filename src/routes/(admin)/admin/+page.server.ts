import { db } from '$lib/db';
import { user, brand, event } from '$lib/db/schema';
import { eq, count } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [producerCountRow] = await db
		.select({ count: count() })
		.from(user)
		.where(eq(user.role, 'producer'));

	const tierRows = await db
		.select({ tier: user.subscriptionTier, count: count() })
		.from(user)
		.where(eq(user.role, 'producer'))
		.groupBy(user.subscriptionTier);

	const [brandCountRow] = await db.select({ count: count() }).from(brand);

	const eventStatusRows = await db
		.select({ status: event.status, count: count() })
		.from(event)
		.groupBy(event.status);

	const tierMap: Record<string, number> = {};
	for (const row of tierRows) {
		if (row.tier) tierMap[row.tier] = row.count;
	}

	const eventMap: Record<string, number> = {};
	for (const row of eventStatusRows) {
		eventMap[row.status] = row.count;
	}

	return {
		producerCount: producerCountRow.count,
		tierBreakdown: tierMap,
		brandCount: brandCountRow.count,
		eventMap
	};
};
