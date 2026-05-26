import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { brand, event } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { encrypt } from '$lib/encrypt';
import { uploadFile, deleteFile } from '$lib/storage';
import type { Actions, PageServerLoad } from './$types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB

export const load: PageServerLoad = async ({ params, locals }) => {
	const b = await db.query.brand.findFirst({
		where: and(eq(brand.id, params.brandId), eq(brand.producerId, locals.user!.id)),
		with: {
			events: { orderBy: [desc(event.startAt)] }
		}
	});
	if (!b) error(404, 'Brand not found');

	// Don't return encrypted key values to the client
	const { stripePublishableKey, stripeSecretKey, stripeWebhookSecret, ...safeBrand } = b;
	return {
		brand: {
			...safeBrand,
			hasStripeKeys: !!(stripeSecretKey && stripeWebhookSecret),
			logoUrl: safeBrand.logo ? `/api/logos/${b.id}` : null
		}
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const b = await db.query.brand.findFirst({
			where: and(eq(brand.id, params.brandId), eq(brand.producerId, locals.user!.id))
		});
		if (!b) error(404, 'Brand not found');

		const data = await request.formData();
		const chargeDescriptor = data.get('chargeDescriptor')?.toString().trim() ?? '';
		const emailSenderName = data.get('emailSenderName')?.toString().trim() ?? '';
		const emailReplyTo = data.get('emailReplyTo')?.toString().trim() ?? '';
		const stripePublishableKey = data.get('stripePublishableKey')?.toString().trim() ?? '';
		const stripeSecretKey = data.get('stripeSecretKey')?.toString().trim() ?? '';
		const stripeWebhookSecret = data.get('stripeWebhookSecret')?.toString().trim() ?? '';
		const dbblEnabled = data.get('dbblEnabled') === 'on';
		const dbblThreshold = parseFloat(data.get('dbblThreshold')?.toString() ?? '0.7');
		const dbblAction = (data.get('dbblAction')?.toString() ?? 'flag') as 'flag' | 'block';

		if (!chargeDescriptor || !emailSenderName || !emailReplyTo) {
			return fail(400, { error: 'Required fields missing.' });
		}

		await db
			.update(brand)
			.set({
				chargeDescriptor,
				emailSenderName,
				emailReplyTo,
				// Only update keys if new values were provided
				...(stripePublishableKey && { stripePublishableKey: encrypt(stripePublishableKey) }),
				...(stripeSecretKey && { stripeSecretKey: encrypt(stripeSecretKey) }),
				...(stripeWebhookSecret && { stripeWebhookSecret: encrypt(stripeWebhookSecret) }),
				dbblEnabled,
				dbblThreshold: isNaN(dbblThreshold) ? 0.7 : dbblThreshold,
				dbblAction
			})
			.where(eq(brand.id, params.brandId));

		return { success: true };
	},

	uploadLogo: async ({ request, params, locals }) => {
		const b = await db.query.brand.findFirst({
			where: and(eq(brand.id, params.brandId), eq(brand.producerId, locals.user!.id))
		});
		if (!b) error(404, 'Brand not found');

		const data = await request.formData();
		const file = data.get('logo') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { logoError: 'Please select an image file.' });
		}
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			return fail(400, { logoError: 'Only JPEG, PNG, WebP, and GIF images are supported.' });
		}
		if (file.size > MAX_LOGO_BYTES) {
			return fail(400, { logoError: 'Logo must be under 2 MB.' });
		}

		const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
		const key = `brands/${b.id}/logo.${ext}`;

		if (b.logo && b.logo !== key) {
			await deleteFile(b.logo).catch(() => {});
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			await uploadFile(key, buffer, file.type);
		} catch (e: any) {
			return fail(500, { logoError: `Upload failed: ${e?.message ?? 'storage error'}` });
		}

		await db.update(brand).set({ logo: key }).where(eq(brand.id, b.id));

		return { logoSuccess: true };
	}
};
