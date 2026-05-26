<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Reservation Confirmed</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main>
	<h1>You're confirmed</h1>

	{#if data.order.status === 'pending'}
		<p>Payment is processing — a confirmation will be sent to your email shortly.</p>
	{:else}
		<p>A confirmation has been sent to your email address.</p>
	{/if}

	<p>Save your check-in code(s) below:</p>

	{#each data.tickets as t}
		<div class="ticket">
			<p><strong>{t.typeName}</strong></p>
			<code>{t.qrToken}</code>
		</div>
	{/each}
</main>
