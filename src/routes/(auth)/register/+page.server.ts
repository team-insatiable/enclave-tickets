import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from '@sveltejs/kit';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!name || !email || !password) {
			return fail(400, { error: 'All fields are required.' });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.' });
		}

		const response = await event.fetch('/api/auth/sign-up/email', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ name, email, password, callbackURL: '/login?verified=1' })
		});

		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			return fail(400, { error: (body as any).message ?? 'Registration failed. That email may already be in use.' });
		}

		const body = await response.json().catch(() => ({}));

		// In dev (requireEmailVerification=false) a session is created immediately
		if (body?.user || body?.token) {
			redirect(302, '/dashboard');
		}

		// In production, email verification is required first
		redirect(302, '/verify-email');
	}
};
