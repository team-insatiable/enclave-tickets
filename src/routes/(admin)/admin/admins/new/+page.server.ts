import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { adminRole } = await parent();
	if (adminRole !== 'super_admin') redirect(302, '/admin');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals, fetch }) => {
		const adminRole = (locals.user as any)?.adminRole;
		if (adminRole !== 'super_admin') return fail(403, { error: 'Not authorized.' });

		const data = await request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase() ?? '';
		const name = data.get('name')?.toString().trim() ?? '';
		const newAdminRole = data.get('adminRole')?.toString() ?? '';

		if (!email || !name) return fail(400, { error: 'Name and email are required.', email, name });

		const validRoles = ['super_admin', 'support', 'viewer'];
		if (!validRoles.includes(newAdminRole)) return fail(400, { error: 'Invalid role.', email, name });

		const existing = await db.query.user.findFirst({ where: eq(user.email, email) });

		if (existing) {
			// Promote existing user to admin
			await db
				.update(user)
				.set({ role: 'admin', adminRole: newAdminRole as any, updatedAt: new Date() })
				.where(eq(user.id, existing.id));
		} else {
			// Create account via Better Auth, then promote and send password reset
			const res = await fetch('/api/auth/sign-up/email', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name, email, password: crypto.randomUUID() })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				return fail(400, { error: (body as any).message ?? 'Could not create account.', email, name });
			}
			const created = await db.query.user.findFirst({ where: eq(user.email, email) });
			if (created) {
				await db
					.update(user)
					.set({ role: 'admin', adminRole: newAdminRole as any, updatedAt: new Date() })
					.where(eq(user.id, created.id));
			}
			// Send password-reset email so they can set their own password
			await fetch('/api/auth/forget-password', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, redirectTo: '/reset-password' })
			});
		}

		redirect(302, '/admin/admins');
	}
};
