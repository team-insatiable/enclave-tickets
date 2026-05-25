import type { AuthUser, Session } from '$lib/auth';

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			user: AuthUser | null;
		}
	}
}

export {};
