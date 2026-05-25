import { ENCRYPTION_KEY } from '$env/static/private';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');

export function encrypt(plaintext: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv(ALGO, KEY, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	// iv:tag:ciphertext — all hex
	return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: string): string {
	const [ivHex, tagHex, dataHex] = ciphertext.split(':');
	const iv = Buffer.from(ivHex, 'hex');
	const tag = Buffer.from(tagHex, 'hex');
	const data = Buffer.from(dataHex, 'hex');
	const decipher = createDecipheriv(ALGO, KEY, iv);
	decipher.setAuthTag(tag);
	return decipher.update(data) + decipher.final('utf8');
}
