import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { brand } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { slugify } from '$lib/slug';
import { encrypt } from '$lib/encrypt';
import { canCreateBrand } from '$lib/tiers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const existingBrands = await db.query.brand.findMany({
		where: eq(brand.producerId, locals.user!.id)
	});
	const tier = (locals.user as any).subscriptionTier ?? 'free';
	if (!canCreateBrand(tier, existingBrands.length)) {
		redirect(302, '/dashboard?upgrade=brands');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();

		const name = data.get('name')?.toString().trim() ?? '';
		const customSlug = data.get('slug')?.toString().trim() ?? '';
		const chargeDescriptor = data.get('chargeDescriptor')?.toString().trim() ?? '';
		const emailSenderName = data.get('emailSenderName')?.toString().trim() ?? '';
		const emailReplyTo = data.get('emailReplyTo')?.toString().trim() ?? '';
		const stripePublishableKey = data.get('stripePublishableKey')?.toString().trim() ?? '';
		const stripeSecretKey = data.get('stripeSecretKey')?.toString().trim() ?? '';
		const stripeWebhookSecret = data.get('stripeWebhookSecret')?.toString().trim() ?? '';
		const dbblEnabled = data.get('dbblEnabled') === 'on';
		const dbblThreshold = parseFloat(data.get('dbblThreshold')?.toString() ?? '0.7');
		const dbblAction = (data.get('dbblAction')?.toString() ?? 'flag') as 'flag' | 'block';

		if (!name || !chargeDescriptor || !emailSenderName || !emailReplyTo) {
			return fail(400, {
				error: 'Name, charge descriptor, and email fields are required.',
				values: { name, chargeDescriptor, emailSenderName, emailReplyTo } as Record<string, string>
			});
		}

		const slug = customSlug || slugify(name);
		if (!slug) return fail(400, { error: 'Could not generate a valid URL slug from that name.', values: {} as Record<string, string> });

		const existing = await db.query.brand.findFirst({ where: eq(brand.slug, slug) });
		if (existing) {
			return fail(400, {
				error: 'That URL slug is already taken. Try a different name or edit the slug.',
				values: { name, chargeDescriptor, emailSenderName, emailReplyTo, slug } as Record<string, string>
			});
		}

		const [newBrand] = await db
			.insert(brand)
			.values({
				producerId: locals.user!.id,
				name,
				slug,
				chargeDescriptor,
				emailSenderName,
				emailReplyTo,
				stripePublishableKey: stripePublishableKey ? encrypt(stripePublishableKey) : null,
				stripeSecretKey: stripeSecretKey ? encrypt(stripeSecretKey) : null,
				stripeWebhookSecret: stripeWebhookSecret ? encrypt(stripeWebhookSecret) : null,
				dbblEnabled,
				dbblThreshold: isNaN(dbblThreshold) ? 0.7 : dbblThreshold,
				dbblAction
			})
			.returning();

		redirect(302, `/dashboard/brands/${newBrand.id}`);
	}
};
