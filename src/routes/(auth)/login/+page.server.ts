import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		// Use event.fetch so SvelteKit automatically forwards the Set-Cookie headers
		// from Better Auth's response to the browser — no manual cookie parsing needed.
		const response = await event.fetch('/api/auth/sign-in/email', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			return fail(400, { error: (body as any).message ?? 'Invalid email or password.' });
		}

		redirect(302, '/dashboard');
	}
};
