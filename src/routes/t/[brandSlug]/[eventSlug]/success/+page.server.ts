import { db } from '$lib/db';
import { order, ticket, ticketType } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const orderId = url.searchParams.get('order');
	if (!orderId) error(400, 'Missing order');

	const o = await db.query.order.findFirst({
		where: eq(order.id, orderId),
		with: {
			tickets: {
				with: { ticketType: true }
			}
		}
	});

	if (!o || (o.status !== 'completed' && o.status !== 'pending')) {
		error(404, 'Order not found');
	}

	return {
		order: {
			id: o.id,
			status: o.status,
			totalCents: o.totalCents
		},
		tickets: o.tickets.map((t) => ({
			id: t.id,
			qrToken: t.qrToken,
			typeName: t.ticketType.name
		}))
	};
};
