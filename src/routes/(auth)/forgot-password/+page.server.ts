import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';

		if (!email) return fail(400, { error: 'Email is required.' });

		// Always returns 200 regardless of whether the email exists (prevents enumeration)
		await event.fetch('/api/auth/forget-password', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, redirectTo: '/reset-password' })
		});

		return { sent: true };
	}
};
