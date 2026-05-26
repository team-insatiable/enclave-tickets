import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { brand } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getFileContent } from '$lib/storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const b = await db.query.brand.findFirst({
		where: eq(brand.id, params.brandId)
	});

	if (!b?.logo) error(404, 'No logo');

	try {
		const { body, contentType } = await getFileContent(b.logo);
		return new Response(body.buffer as ArrayBuffer, {
			headers: {
				'content-type': contentType,
				'cache-control': 'public, max-age=3600'
			}
		});
	} catch {
		error(404, 'Logo not found');
	}
};
