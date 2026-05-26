import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/db';
import * as schema from '$lib/db/schema';
import { BETTER_AUTH_SECRET, SMTP_HOST, SMTP_PORT } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const auth = betterAuth({
	secret: BETTER_AUTH_SECRET,
	baseURL: PUBLIC_BASE_URL,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: process.env.NODE_ENV === 'production',
		sendResetPassword: async ({ user: u, url }) => {
			const { sendEmail, buildPasswordResetEmail } = await import('$lib/email');
			const email = buildPasswordResetEmail(url);
			await sendEmail({ to: u.email, ...email });
		}
	},
	emailVerification: {
		sendVerificationEmail: async ({ user: u, url }) => {
			const { sendEmail, buildVerificationEmail } = await import('$lib/email');
			const email = buildVerificationEmail(url);
			await sendEmail({ to: u.email, ...email });
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => ({
					data: { ...user, role: 'producer' }
				})
			}
		}
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'producer',
				input: false
			},
			adminRole: { type: 'string', required: false, input: false },
			stripeCustomerId: { type: 'string', required: false, input: false },
			subscriptionStatus: { type: 'string', defaultValue: 'active', input: false },
			subscriptionTier: { type: 'string', defaultValue: 'free', input: false },
			subscriptionPeriodEnd: { type: 'date', required: false, input: false }
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5
		}
	}
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
