import { DBBL_API_URL, DBBL_API_KEY, DBBL_ENABLED } from '$env/static/private';

export interface DbblResult {
	riskScore: number;
	matchConfidence: string;
	skipped: boolean;
}

export async function queryDbbl(opts: {
	emailHash: string;
	phoneHash?: string;
	brandEnabled: boolean;
}): Promise<DbblResult> {
	const globallyEnabled = DBBL_ENABLED === 'true';

	if (!globallyEnabled || !opts.brandEnabled) {
		return { riskScore: 0, matchConfidence: 'skipped', skipped: true };
	}

	const params = new URLSearchParams({ email_hash: opts.emailHash });
	if (opts.phoneHash) params.set('phone_hash', opts.phoneHash);

	const res = await fetch(`${DBBL_API_URL}/reputation?${params}`, {
		headers: { Authorization: `Bearer ${DBBL_API_KEY}` }
	});

	if (!res.ok) {
		// Fail open — don't block purchases if DBBL is unreachable
		console.error(`DBBL query failed: ${res.status}`);
		return { riskScore: 0, matchConfidence: 'error', skipped: true };
	}

	const data = await res.json();
	return {
		riskScore: data.risk_score ?? 0,
		matchConfidence: data.match_confidence ?? 'unknown',
		skipped: false
	};
}
