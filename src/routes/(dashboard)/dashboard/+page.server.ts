import { db } from '$lib/db';
import { brand, event, type Brand, type Event } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const brands = await db.query.brand.findMany({
		where: eq(brand.producerId, locals.user!.id),
		with: {
			events: {
				where: eq(event.status, 'published'),
				orderBy: [desc(event.startAt)]
			}
		}
	});

	return { brands };
};
