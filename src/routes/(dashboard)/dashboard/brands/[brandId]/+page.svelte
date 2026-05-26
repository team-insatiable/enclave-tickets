<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const statusLabel: Record<string, string> = {
		draft: 'Draft',
		published: 'Published',
		cancelled: 'Cancelled',
		completed: 'Completed'
	};
</script>

<svelte:head><title>{data.brand.name} — Enclave Tickets</title></svelte:head>

<div class="page">
	<a href="/dashboard">← Dashboard</a>
	<div class="header">
		<div class="header-left">
			{#if data.brand.logoUrl}
				<img src={data.brand.logoUrl} alt="{data.brand.name} logo" class="brand-logo" />
			{/if}
			<div>
				<h1>{data.brand.name}</h1>
				<span class="slug">enclavetickets.com/t/{data.brand.slug}/…</span>
			</div>
		</div>
		<a href="/dashboard/events/new?brand={data.brand.id}" class="btn">+ New event</a>
	</div>

	{#if !data.brand.hasStripeKeys}
		<div class="notice">
			Stripe keys not configured — you can save all other settings now, but you'll need to add keys before selling paid tickets.
		</div>
	{/if}

	<!-- Events -->
	<section>
		<h2>Events</h2>
		{#if data.brand.events.length === 0}
			<p class="empty">No events yet. <a href="/dashboard/events/new?brand={data.brand.id}">Create your first event →</a></p>
		{:else}
			<ul class="event-list">
				{#each data.brand.events as ev}
					<li>
						<a href="/dashboard/events/{ev.id}">
							<span class="ev-name">{ev.name}</span>
							<span class="ev-meta">
								{new Date(ev.startAt).toLocaleDateString()}
								<span class="badge badge-{ev.status}">{statusLabel[ev.status]}</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- Settings -->
	<section>
		<h2>Brand settings</h2>

		<!-- Logo upload -->
		<div class="logo-section">
			<div class="logo-label">Brand logo</div>
			{#if data.brand.logoUrl}
				<img src={data.brand.logoUrl} alt="Current logo" class="logo-preview" />
			{/if}
			<form method="POST" action="?/uploadLogo" use:enhance enctype="multipart/form-data" class="logo-form">
				{#if form?.logoError}<p class="error">{form.logoError}</p>{/if}
				{#if form?.logoSuccess}<p class="success">Logo updated.</p>{/if}
				<div class="logo-row">
					<input type="file" name="logo" accept="image/jpeg,image/png,image/webp,image/gif" />
					<button type="submit">Upload</button>
				</div>
				<small>JPEG, PNG, WebP or GIF · max 2 MB</small>
			</form>
		</div>

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
		{#if form?.success}
			<p class="success">Settings saved.</p>
		{/if}

		<form method="POST" action="?/update" use:enhance>
			<label>
				Charge descriptor
				<input type="text" name="chargeDescriptor" value={data.brand.chargeDescriptor} required maxlength="22" />
				<small>Shown on buyer's bank statement — keep it neutral.</small>
			</label>
			<label>
				Email sender name
				<input type="text" name="emailSenderName" value={data.brand.emailSenderName} required />
			</label>
			<label>
				Reply-to address
				<input type="email" name="emailReplyTo" value={data.brand.emailReplyTo} required />
			</label>

			<h3>Stripe keys <small>(leave blank to keep existing)</small></h3>
			<label>
				Publishable key
				<input type="text" name="stripePublishableKey" placeholder={data.brand.hasStripeKeys ? '(saved)' : 'pk_live_…'} />
			</label>
			<label>
				Secret key
				<input type="password" name="stripeSecretKey" placeholder={data.brand.hasStripeKeys ? '(saved)' : 'sk_live_…'} autocomplete="off" />
			</label>
			<label>
				Webhook secret
				<input type="password" name="stripeWebhookSecret" placeholder={data.brand.hasStripeKeys ? '(saved)' : 'whsec_…'} autocomplete="off" />
			</label>

			<h3>DBBL Protocol</h3>
			<label class="checkbox-label">
				<input type="checkbox" name="dbblEnabled" checked={data.brand.dbblEnabled} />
				Enable reputation check at checkout
			</label>
			<label>
				Block threshold
				<input type="number" name="dbblThreshold" value={data.brand.dbblThreshold} min="0" max="1" step="0.05" />
			</label>
			<label>
				Action
				<select name="dbblAction">
					<option value="flag" selected={data.brand.dbblAction === 'flag'}>Flag — notify me, allow checkout</option>
					<option value="block" selected={data.brand.dbblAction === 'block'}>Block — reject silently</option>
				</select>
			</label>

			<button type="submit">Save settings</button>
		</form>
	</section>
</div>

<style>
	.page { max-width: 700px; }
	.header { display: flex; align-items: flex-start; justify-content: space-between; margin: 0.5rem 0 1.5rem; }
	.header-left { display: flex; align-items: center; gap: 1rem; }
	.brand-logo { width: 52px; height: 52px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; background: #f9fafb; }
	h1 { margin: 0 0 0.25rem; }
	.slug { font-size: 0.85rem; color: #6b7280; }
	.logo-section { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f3f4f6; }
	.logo-label { font-size: 0.9rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
	.logo-preview { display: block; width: 80px; height: 80px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; background: #f9fafb; margin-bottom: 0.75rem; }
	.logo-form { display: flex; flex-direction: column; gap: 0.4rem; }
	.logo-row { display: flex; align-items: center; gap: 0.75rem; }
	.logo-row button { padding: 0.45rem 0.9rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; white-space: nowrap; }
	.btn { padding: 0.5rem 1rem; background: #111; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.875rem; white-space: nowrap; }
	.notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1.5rem; }
	section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f3f4f6; }
	section h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
	h3 { font-size: 0.9rem; font-weight: 600; margin: 1.25rem 0 0.75rem; }
	.empty { color: #6b7280; font-size: 0.9rem; }
	.event-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
	.event-list li a { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: inherit; }
	.event-list li a:hover { background: #f9fafb; }
	.ev-name { font-weight: 500; }
	.ev-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: #6b7280; }
	.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
	.badge-draft { background: #f3f4f6; color: #374151; }
	.badge-published { background: #d1fae5; color: #065f46; }
	.badge-cancelled { background: #fee2e2; color: #991b1b; }
	.badge-completed { background: #e0e7ff; color: #3730a3; }
	label { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500; color: #374151; }
	label.checkbox-label { flex-direction: row; align-items: center; gap: 0.5rem; font-weight: 400; }
	input[type="text"], input[type="email"], input[type="password"], input[type="number"], select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
	small { font-size: 0.8rem; color: #6b7280; font-weight: 400; }
	button[type="submit"] { padding: 0.6rem 1.25rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; margin-top: 0.5rem; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
	.success { color: #065f46; background: #d1fae5; border: 1px solid #6ee7b7; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
</style>
