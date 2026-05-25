import { HASH_PEPPER } from '$env/static/private';
import { createHash } from 'crypto';

export function hashSignal(value: string): string {
	return createHash('sha256')
		.update(value.toLowerCase().trim() + HASH_PEPPER)
		.digest('hex');
}
