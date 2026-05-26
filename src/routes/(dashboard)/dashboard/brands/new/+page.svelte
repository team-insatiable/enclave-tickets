<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let name = $state('');
	let slug = $state('');
	let slugEdited = $state(false);

	function onNameInput(e: Event) {
		name = (e.target as HTMLInputElement).value;
		if (!slugEdited) {
			slug = name
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}
	}
</script>

<svelte:head><title>New Brand — Enclave Tickets</title></svelte:head>

<div class="page">
	<a href="/dashboard">← Dashboard</a>
	<h1>Create a brand</h1>
	<p class="hint">A brand is the identity attendees see on purchase pages and emails.</p>

	<div class="prereqs">
		<strong>Before you start, have ready:</strong>
		<ul>
			<li>The name and URL slug for this brand (e.g. "Capital Events" → <code>capital-events</code>)</li>
			<li>A neutral charge descriptor for bank statements (22 chars max, e.g. "CAPITAL EVENTS LLC")</li>
			<li>An email address buyers can reply to for support</li>
			<li>Your Stripe publishable key, secret key, and webhook secret — <em>optional now, required before charging for tickets</em></li>
		</ul>
	</div>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<p class="required-note"><span class="req">*</span> Required</p>

	<form method="POST" use:enhance>
		<section>
			<h2>Identity</h2>
			<label>
				Brand name <span class="req">*</span>
				<input type="text" name="name" value={form?.values?.name ?? ''} oninput={onNameInput} required />
			</label>
			<label>
				URL slug <span class="req">*</span>
				<div class="slug-row">
					<span class="slug-prefix">enclavetickets.com/t/</span>
					<input
						type="text"
						name="slug"
						bind:value={slug}
						oninput={() => (slugEdited = true)}
						pattern="[a-z0-9\-]+"
						required
					/>
				</div>
				<small>Only lowercase letters, numbers, and hyphens.</small>
			</label>
		</section>

		<section>
			<h2>Email & billing</h2>
			<label>
				Charge descriptor <span class="req">*</span>
				<input type="text" name="chargeDescriptor" value={form?.values?.chargeDescriptor ?? ''} required maxlength="22" />
				<small>Neutral text shown on the buyer's bank statement. Never reveal the event name here.</small>
			</label>
			<label>
				Email sender name <span class="req">*</span>
				<input type="text" name="emailSenderName" value={form?.values?.emailSenderName ?? ''} required />
				<small>The "From" name on confirmation emails, e.g. "Capital Events".</small>
			</label>
			<label>
				Reply-to address <span class="req">*</span>
				<input type="email" name="emailReplyTo" value={form?.values?.emailReplyTo ?? ''} required />
			</label>
		</section>

		<section>
			<h2>Stripe keys <span class="optional">optional — can add later</span></h2>
			<p class="hint">Your own Stripe account keys. Ticket revenue goes directly to you — Enclave never touches it. Keys are encrypted at rest. You can skip this and add them before your first paid event.</p>
			<label>
				Publishable key
				<input type="text" name="stripePublishableKey" placeholder="pk_live_…" />
			</label>
			<label>
				Secret key
				<input type="password" name="stripeSecretKey" placeholder="sk_live_…" autocomplete="off" />
			</label>
			<label>
				Webhook secret
				<input type="password" name="stripeWebhookSecret" placeholder="whsec_…" autocomplete="off" />
				<small>Set up a webhook in your Stripe dashboard pointing to <code>https://enclavetickets.com/api/webhooks/stripe</code>.</small>
			</label>
		</section>

		<section>
			<h2>DBBL Protocol <span class="optional">optional</span></h2>
			<label class="checkbox-label">
				<input type="checkbox" name="dbblEnabled" checked />
				Enable DBBL reputation check at checkout
			</label>
			<label>
				Block threshold (0.0 – 1.0)
				<input type="number" name="dbblThreshold" value="0.7" min="0" max="1" step="0.05" />
				<small>Risk scores at or above this value trigger the action below.</small>
			</label>
			<label>
				Action when threshold exceeded
				<select name="dbblAction">
					<option value="flag">Flag — complete the order and notify you</option>
					<option value="block">Block — reject the checkout silently</option>
				</select>
			</label>
		</section>

		<div class="actions">
			<button type="submit">Create brand</button>
			<a href="/dashboard">Cancel</a>
		</div>
	</form>
</div>

<style>
	.page { max-width: 640px; }
	h1 { margin: 0.5rem 0 0.25rem; }
	.hint { color: #6b7280; margin: 0 0 1.5rem; font-size: 0.9rem; }
	.prereqs { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.875rem; color: #0c4a6e; }
	.prereqs strong { display: block; margin-bottom: 0.5rem; }
	.prereqs ul { margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem; }
	.prereqs code { background: #e0f2fe; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
	.required-note { font-size: 0.8rem; color: #6b7280; margin: 0 0 1.25rem; }
	.optional { font-size: 0.75rem; font-weight: 400; color: #6b7280; margin-left: 0.4rem; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
	section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f3f4f6; }
	section h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500; color: #374151; }
	label.checkbox-label { flex-direction: row; align-items: center; gap: 0.5rem; font-weight: 400; }
	input[type="text"], input[type="email"], input[type="password"], input[type="number"], select {
		padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem;
	}
	.slug-row { display: flex; align-items: center; gap: 0; }
	.slug-prefix { background: #f9fafb; border: 1px solid #d1d5db; border-right: none; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #6b7280; border-radius: 6px 0 0 6px; white-space: nowrap; }
	.slug-row input { border-radius: 0 6px 6px 0; flex: 1; }
	small { font-size: 0.8rem; color: #6b7280; font-weight: 400; }
	.req { color: #dc2626; }
	.actions { display: flex; align-items: center; gap: 1rem; }
	.actions button { padding: 0.6rem 1.25rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.actions a { color: #6b7280; font-size: 0.9rem; text-decoration: none; }
</style>
