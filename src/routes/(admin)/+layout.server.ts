import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { eq, count } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isSetupPage = url.pathname === '/admin/setup';

	// If no admins exist at all, funnel everyone to setup
	const [{ count: adminCount }] = await db
		.select({ count: count() })
		.from(user)
		.where(eq(user.role, 'admin'));

	if (adminCount === 0) {
		if (!isSetupPage) redirect(302, '/admin/setup');
		return {};
	}

	// Setup is locked once an admin exists
	if (isSetupPage) redirect(302, '/admin');

	if (!locals.user) redirect(302, '/login');

	const role = (locals.user as any).role;
	const adminRole = (locals.user as any).adminRole as string | null;

	if (role !== 'admin') redirect(302, '/dashboard');

	return { adminRole };
};
