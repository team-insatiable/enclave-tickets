<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	let search = $state('');
	let filterTier = $state('all');

	const filtered = $derived(
		data.producers.filter((p) => {
			const matchesTier = filterTier === 'all' || p.subscriptionTier === filterTier;
			const q = search.toLowerCase();
			const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
			return matchesTier && matchesSearch;
		})
	);
</script>

<svelte:head><title>Producers — Enclave Admin</title></svelte:head>

<div class="page-header">
	<h1>Producers <span class="count">{data.producers.length}</span></h1>
</div>

<div class="filters">
	<input type="search" placeholder="Search name or email…" bind:value={search} class="search-input" />
	<select bind:value={filterTier} class="tier-filter">
		<option value="all">All tiers</option>
		<option value="free">Free</option>
		<option value="starter">Starter</option>
		<option value="pro">Pro</option>
		<option value="unlimited">Unlimited</option>
		<option value="comped">Comped</option>
	</select>
</div>

{#if filtered.length === 0}
	<p class="empty">No producers match your filters.</p>
{:else}
	<table class="producer-table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Email</th>
				<th>Tier</th>
				<th>Brands</th>
				<th>Events</th>
				<th>Joined</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as p}
				<tr>
					<td class="name-cell">{p.name}</td>
					<td class="email-cell">{p.email}</td>
					<td><span class="tier-badge tier-{p.subscriptionTier}">{p.subscriptionTier}</span></td>
					<td class="num">{p.brandCount}</td>
					<td class="num">{p.eventCount}</td>
					<td class="date">{new Date(p.createdAt).toLocaleDateString()}</td>
					<td><a href="/admin/producers/{p.id}" class="view-link">View →</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.page-header { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.25rem; }
	h1 { margin: 0; font-size: 1.5rem; }
	.count { font-size: 1rem; font-weight: 400; color: #6b7280; }
	.filters { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
	.search-input { flex: 1; max-width: 320px; padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; }
	.tier-filter { padding: 0.45rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; background: #fff; }
	.empty { color: #6b7280; font-size: 0.9rem; }
	.producer-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; font-size: 0.875rem; }
	.producer-table thead { background: #f9fafb; }
	.producer-table th { text-align: left; padding: 0.6rem 1rem; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
	.producer-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
	.producer-table tr:last-child td { border-bottom: none; }
	.producer-table tr:hover td { background: #f9fafb; }
	.name-cell { font-weight: 500; }
	.email-cell { color: #6b7280; }
	.num { text-align: center; color: #374151; }
	.date { color: #9ca3af; font-size: 0.8rem; white-space: nowrap; }
	.view-link { color: #4f46e5; text-decoration: none; font-size: 0.8rem; white-space: nowrap; }
	.view-link:hover { text-decoration: underline; }
	.tier-badge { padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; white-space: nowrap; }
	.tier-free { background: #f3f4f6; color: #374151; }
	.tier-starter { background: #dbeafe; color: #1d4ed8; }
	.tier-pro { background: #ede9fe; color: #6d28d9; }
	.tier-unlimited { background: #d1fae5; color: #065f46; }
	.tier-comped { background: #fef3c7; color: #92400e; }
</style>
