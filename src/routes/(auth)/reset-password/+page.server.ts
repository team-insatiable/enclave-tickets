import { fail, redirect } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) redirect(302, '/forgot-password');
	return { token };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const token = formData.get('token')?.toString() ?? '';
		const newPassword = formData.get('newPassword')?.toString() ?? '';
		const confirm = formData.get('confirm')?.toString() ?? '';

		if (!token) redirect(302, '/forgot-password');
		if (!newPassword || newPassword.length < 8) {
			return fail(400, { token, error: 'Password must be at least 8 characters.' });
		}
		if (newPassword !== confirm) {
			return fail(400, { token, error: 'Passwords do not match.' });
		}

		const response = await event.fetch('/api/auth/reset-password', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ newPassword, token })
		});

		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			return fail(400, { token, error: (body as any).message ?? 'Reset link is invalid or has expired.' });
		}

		redirect(302, '/login?reset=1');
	}
};
