import { db } from '$lib/db';
import { brand, event } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const brands = await db.query.brand.findMany({
		where: eq(brand.producerId, locals.user!.id),
		with: {
			events: {
				orderBy: [desc(event.startAt)],
				with: { ticketTypes: true }
			}
		}
	});

	const allEvents = brands.flatMap((b) => b.events);
	const hasBrands = brands.length > 0;
	const hasEvents = allEvents.length > 0;
	const hasTicketTypes = allEvents.some((e) => e.ticketTypes.length > 0);
	const hasPublished = allEvents.some((e) => e.status === 'published');

	// Find the most relevant event to link to for each step
	const firstBrandId = brands[0]?.id;
	const firstEventId = allEvents[0]?.id;
	const eventNeedingTickets = allEvents.find((e) => e.ticketTypes.length === 0)?.id ?? firstEventId;
	const eventReadyToPublish = allEvents.find(
		(e) => e.ticketTypes.length > 0 && e.status === 'draft'
	)?.id;

	return {
		brands,
		// null once the producer has published their first event — checklist goes away
		onboarding: hasPublished
			? null
			: {
					hasBrands,
					hasEvents,
					hasTicketTypes,
					hasPublished,
					firstBrandId,
					firstEventId,
					eventNeedingTickets,
					eventReadyToPublish
				}
	};
};
