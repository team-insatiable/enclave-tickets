import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { adminRole } = await parent();
	if (adminRole !== 'super_admin') redirect(302, '/admin');

	const admins = await db
		.select({ id: user.id, name: user.name, email: user.email, adminRole: user.adminRole, createdAt: user.createdAt })
		.from(user)
		.where(eq(user.role, 'admin'))
		.orderBy(desc(user.createdAt));

	return { admins };
};
