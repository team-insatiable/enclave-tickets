<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const tiers = ['free', 'starter', 'pro', 'unlimited', 'comped'];
	const activeEvents = $derived(data.eventMap['published'] ?? 0);
	const totalEvents = $derived(Object.values(data.eventMap).reduce((a, b) => a + b, 0));
</script>

<svelte:head><title>Admin — Enclave Tickets</title></svelte:head>

<h1>Overview</h1>

<div class="stat-grid">
	<div class="stat-card">
		<div class="stat-value">{data.producerCount}</div>
		<div class="stat-label">Producers</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{data.brandCount}</div>
		<div class="stat-label">Brands</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{activeEvents}</div>
		<div class="stat-label">Published events</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{totalEvents}</div>
		<div class="stat-label">Total events</div>
	</div>
</div>

<h2>Producers by tier</h2>
<div class="tier-grid">
	{#each tiers as tier}
		<div class="tier-card">
			<span class="tier-badge tier-{tier}">{tier}</span>
			<span class="tier-count">{data.tierBreakdown[tier] ?? 0}</span>
		</div>
	{/each}
</div>

<div class="quick-links">
	<a href="/admin/producers" class="btn">View all producers →</a>
</div>

<style>
	h1 { margin: 0 0 1.5rem; font-size: 1.5rem; }
	h2 { margin: 2rem 0 1rem; font-size: 1rem; font-weight: 600; color: #374151; }
	.stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
	.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem 1.5rem; }
	.stat-value { font-size: 2rem; font-weight: 700; line-height: 1; margin-bottom: 0.35rem; }
	.stat-label { font-size: 0.8rem; color: #6b7280; }
	.tier-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; }
	.tier-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; }
	.tier-count { font-size: 1.25rem; font-weight: 700; }
	.tier-badge { padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
	.tier-free { background: #f3f4f6; color: #374151; }
	.tier-starter { background: #dbeafe; color: #1d4ed8; }
	.tier-pro { background: #ede9fe; color: #6d28d9; }
	.tier-unlimited { background: #d1fae5; color: #065f46; }
	.tier-comped { background: #fef3c7; color: #92400e; }
	.quick-links { margin-top: 2rem; }
	.btn { display: inline-block; padding: 0.55rem 1.1rem; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.875rem; }
	.btn:hover { background: #1e293b; }
</style>
