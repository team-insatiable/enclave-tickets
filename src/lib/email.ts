import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT } from '$env/static/private';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: Number(SMTP_PORT) === 465,
	// Optional auth — set SMTP_USER / SMTP_PASS for production SMTP providers
	...(process.env.SMTP_USER
		? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
		: {})
});

export interface SendEmailOptions {
	to: string;
	subject: string;
	text: string;
	html?: string;
	from?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
	await transporter.sendMail({
		from: opts.from ?? `"Enclave Tickets" <noreply@enclavetickets.com>`,
		to: opts.to,
		subject: opts.subject,
		text: opts.text,
		html: opts.html
	});
}

// ── HTML email builder ────────────────────────────────────────────────────────

function buildEmailHtml(opts: {
	heading: string;
	body: string;
	cta: { label: string; url: string };
	note?: string;
}): string {
	return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:2rem 1rem;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:10px;padding:2rem 2.5rem;border:1px solid #e5e7eb">
    <div style="font-size:0.9rem;font-weight:700;letter-spacing:0.02em;margin-bottom:2rem;color:#111">ENCLAVE TICKETS</div>
    <h1 style="font-size:1.15rem;font-weight:600;margin:0 0 0.75rem;color:#111">${opts.heading}</h1>
    <p style="margin:0 0 1.75rem;color:#374151;line-height:1.65;font-size:0.9rem">${opts.body}</p>
    <a href="${opts.cta.url}" style="display:inline-block;padding:0.7rem 1.5rem;background:#111;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:0.875rem">${opts.cta.label}</a>
    <p style="margin:1.5rem 0 0;font-size:0.78rem;color:#9ca3af;line-height:1.5">
      ${opts.note ?? 'If you didn’t request this, you can safely ignore this email.'}
    </p>
  </div>
</body>
</html>`;
}

// ── Auth email builders ───────────────────────────────────────────────────────

export function buildVerificationEmail(url: string): {
	subject: string;
	text: string;
	html: string;
} {
	return {
		subject: 'Verify your Enclave Tickets account',
		text: `Welcome to Enclave Tickets!\n\nPlease verify your email address by clicking the link below:\n\n${url}\n\nThis link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
		html: buildEmailHtml({
			heading: 'Verify your email address',
			body: 'Welcome to Enclave Tickets. Click below to verify your email and activate your producer account.',
			cta: { label: 'Verify email', url }
		})
	};
}

export function buildPasswordResetEmail(url: string): {
	subject: string;
	text: string;
	html: string;
} {
	return {
		subject: 'Reset your Enclave Tickets password',
		text: `You requested a password reset for your Enclave Tickets account.\n\nClick the link below to choose a new password:\n\n${url}\n\nThis link expires in 1 hour. If you didn't request a reset, you can ignore this email.`,
		html: buildEmailHtml({
			heading: 'Reset your password',
			body: 'We received a request to reset your Enclave Tickets password. Click below to choose a new one. This link expires in 1 hour.',
			cta: { label: 'Reset password', url },
			note: 'If you didn’t request a password reset, you can safely ignore this email — your account is not at risk.'
		})
	};
}

// ── Ticket confirmation email (sent by brands, not Enclave) ──────────────────

export function buildTicketConfirmationEmail(opts: {
	senderName: string;
	replyTo: string;
	eventName: string;
	qrToken: string;
}): { subject: string; from: string; text: string } {
	return {
		// Neutral subject — never reveals event name or platform
		subject: 'Your reservation confirmation',
		from: `"${opts.senderName}" <noreply@enclavetickets.com>`,
		text: `Your reservation is confirmed.\n\nCheck-in code: ${opts.qrToken}\n\nFor questions, reply to this email.`
	};
}
