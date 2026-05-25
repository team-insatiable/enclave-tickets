<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — Enclave Tickets</title>
</svelte:head>

<h1>Dashboard</h1>

{#if data.brands.length === 0}
	<p>No brands yet. <a href="/dashboard/brands/new">Create your first brand</a> to get started.</p>
{:else}
	{#each data.brands as brand}
		<section>
			<h2><a href="/dashboard/brands/{brand.id}">{brand.name}</a></h2>
			<p>{brand.events.length} active event(s)</p>
		</section>
	{/each}
{/if}
