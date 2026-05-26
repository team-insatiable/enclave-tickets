<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const statusLabels: Record<string, string> = {
		draft: 'Draft', published: 'Published', cancelled: 'Cancelled', completed: 'Completed'
	};

	const totalEvents = $derived(data.brands.reduce((n, b) => n + b.events.length, 0));
</script>

<svelte:head><title>{data.producer.name} — Enclave Admin</title></svelte:head>

<a href="/admin/producers" class="back">← Producers</a>

<div class="page-header">
	<div>
		<h1>{data.producer.name}</h1>
		<div class="email">{data.producer.email}</div>
	</div>
	<span class="tier-badge tier-{data.producer.subscriptionTier}">{data.producer.subscriptionTier}</span>
</div>

<div class="meta-row">
	<div class="meta-item"><span class="meta-label">Joined</span> {new Date(data.producer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
	<div class="meta-item"><span class="meta-label">Status</span> {data.producer.subscriptionStatus}</div>
	<div class="meta-item"><span class="meta-label">Brands</span> {data.brands.length}</div>
	<div class="meta-item"><span class="meta-label">Events</span> {totalEvents}</div>
</div>

<!-- Subscription editor -->
<section class="card">
	<h2>Subscription</h2>
	{#if form?.error}<p class="error">{form.error}</p>{/if}
	{#if form?.success}<p class="success">Subscription updated.</p>{/if}
	<form method="POST" action="?/updateSubscription" use:enhance>
		<div class="field-row">
			<label>
				Tier
				<select name="subscriptionTier">
					{#each ['free', 'starter', 'pro', 'unlimited', 'comped'] as tier}
						<option value={tier} selected={data.producer.subscriptionTier === tier}>{tier}</option>
					{/each}
				</select>
			</label>
			<label>
				Status
				<select name="subscriptionStatus">
					{#each ['active', 'trialing', 'past_due', 'cancelled', 'comped'] as s}
						<option value={s} selected={data.producer.subscriptionStatus === s}>{s}</option>
					{/each}
				</select>
			</label>
			<button type="submit" class="btn">Save</button>
		</div>
	</form>
</section>

<!-- Brands & Events -->
<section>
	<h2>Brands & events</h2>
	{#if data.brands.length === 0}
		<p class="empty">No brands yet.</p>
	{:else}
		{#each data.brands as b}
			<div class="brand-block">
				<div class="brand-header">
					<span class="brand-name">{b.name}</span>
					<span class="brand-slug">/{b.slug}</span>
					{#if !b.hasStripeKeys}<span class="no-stripe">no stripe keys</span>{/if}
				</div>
				{#if b.events.length === 0}
					<p class="no-events">No events</p>
				{:else}
					<ul class="event-list">
						{#each b.events as ev}
							<li>
								<span class="ev-name">{ev.name}</span>
								<span class="ev-date">{new Date(ev.startAt).toLocaleDateString()}</span>
								<span class="badge badge-{ev.status}">{statusLabels[ev.status]}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	{/if}
</section>

<style>
	.back { color: #6b7280; font-size: 0.875rem; text-decoration: none; display: inline-block; margin-bottom: 1.25rem; }
	.back:hover { color: #374151; }
	.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
	h1 { margin: 0 0 0.2rem; font-size: 1.5rem; }
	.email { color: #6b7280; font-size: 0.9rem; }
	.meta-row { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; padding: 1rem 0; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; }
	.meta-item { font-size: 0.875rem; }
	.meta-label { font-weight: 600; color: #374151; margin-right: 0.4rem; }
	.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; }
	h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
	.field-row { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
	label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
	select { padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; background: #fff; }
	.btn { padding: 0.5rem 1.1rem; background: #0f172a; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; align-self: flex-end; }
	.btn:hover { background: #1e293b; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 0.75rem; }
	.success { color: #065f46; background: #d1fae5; border: 1px solid #6ee7b7; padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.875rem; margin-bottom: 0.75rem; }
	.brand-block { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem; overflow: hidden; }
	.brand-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
	.brand-name { font-weight: 600; }
	.brand-slug { color: #6b7280; }
	.no-stripe { font-size: 0.72rem; background: #fef3c7; color: #92400e; padding: 0.15rem 0.45rem; border-radius: 4px; }
	.no-events { color: #9ca3af; font-size: 0.85rem; padding: 0.75rem 1rem; margin: 0; }
	.event-list { list-style: none; padding: 0; margin: 0; }
	.event-list li { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1rem; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; }
	.event-list li:last-child { border-bottom: none; }
	.ev-name { flex: 1; font-weight: 500; }
	.ev-date { color: #9ca3af; font-size: 0.8rem; white-space: nowrap; }
	.empty { color: #6b7280; font-size: 0.9rem; }
	.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
	.badge-draft { background: #f3f4f6; color: #374151; }
	.badge-published { background: #d1fae5; color: #065f46; }
	.badge-cancelled { background: #fee2e2; color: #991b1b; }
	.badge-completed { background: #e0e7ff; color: #3730a3; }
	.tier-badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
	.tier-free { background: #f3f4f6; color: #374151; }
	.tier-starter { background: #dbeafe; color: #1d4ed8; }
	.tier-pro { background: #ede9fe; color: #6d28d9; }
	.tier-unlimited { background: #d1fae5; color: #065f46; }
	.tier-comped { background: #fef3c7; color: #92400e; }
</style>
