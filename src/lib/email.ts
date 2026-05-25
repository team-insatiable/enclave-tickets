import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT } from '$env/static/private';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: Number(SMTP_PORT) === 465
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
