import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { eq, count } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Lock setup if any super_admin already exists
	const [{ count: adminCount }] = await db
		.select({ count: count() })
		.from(user)
		.where(eq(user.role, 'admin'));

	if (adminCount > 0) redirect(302, '/admin');

	return { loggedIn: !!locals.user };
};

export const actions: Actions = {
	default: async ({ locals }) => {
		if (!locals.user) return fail(400, { error: 'You must be logged in to claim admin access.' });

		const [{ count: adminCount }] = await db
			.select({ count: count() })
			.from(user)
			.where(eq(user.role, 'admin'));

		if (adminCount > 0) return fail(403, { error: 'Setup has already been completed.' });

		await db
			.update(user)
			.set({ role: 'admin', adminRole: 'super_admin', updatedAt: new Date() })
			.where(eq(user.id, locals.user.id));

		redirect(302, '/admin');
	}
};
