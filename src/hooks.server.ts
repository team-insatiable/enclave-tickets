import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { ensureBucket } from '$lib/storage';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

if (!building) {
	ensureBucket().catch((e) => console.error('Storage init failed:', e));
}

export const handle: Handle = async ({ event, resolve }) => {
	if (!building) {
		const session = await auth.api.getSession({ headers: event.request.headers });
		event.locals.session = session;
		event.locals.user = session?.user ?? null;
	}
	return svelteKitHandler({ event, resolve, auth, building });
};
