<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let ageAcknowledged = $state(false);
	let selectedTypes: Record<string, number> = $state({});
	let submitting = $state(false);
	let error = $state('');

	function formatPrice(cents: number) {
		if (cents === 0) return 'Free';
		return `$${(cents / 100).toFixed(2)}`;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!ageAcknowledged) {
			error = 'You must confirm you are 18 or older.';
			return;
		}
		submitting = true;
		error = '';
		const res = await fetch(`/t/${data.event.slug}/checkout`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ firstName, lastName, email, phone, ageAcknowledged, selectedTypes })
		});
		const json = await res.json();
		if (!res.ok) {
			error = json.message ?? 'Checkout failed. Please try again.';
			submitting = false;
			return;
		}
		window.location.href = json.checkoutUrl;
	}
</script>

<svelte:head>
	<title>{data.event.name}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main>
	{#if data.event.coverImage}
		<img src="/api/storage/{data.event.coverImage}" alt="" />
	{/if}

	<h1>{data.event.name}</h1>
	<p>{new Date(data.event.startAt).toLocaleString()}</p>
	<p>{data.event.venueName}</p>

	{#if data.event.venueAddress}
		<p>{data.event.venueAddress}</p>
	{:else if data.event.locationRevealEnabled}
		<p><em>Exact address revealed closer to the event.</em></p>
	{/if}

	{#if data.event.description}
		<p>{data.event.description}</p>
	{/if}

	<form onsubmit={handleSubmit}>
		<h2>Get tickets</h2>

		{#if error}<p class="error">{error}</p>{/if}

		<fieldset>
			<legend>Your info</legend>
			<label>First name <input type="text" bind:value={firstName} required /></label>
			<label>Last name <input type="text" bind:value={lastName} required /></label>
			<label>Email <input type="email" bind:value={email} required /></label>
			<label>Phone <input type="tel" bind:value={phone} /></label>
		</fieldset>

		<fieldset>
			<legend>Tickets</legend>
			{#each data.ticketTypes as tt}
				{#if tt.status === 'active'}
					<div>
						<span>{tt.name}</span>
						{#if tt.description}<span>{tt.description}</span>{/if}
						<span>{formatPrice(tt.price)}</span>
						<select bind:value={selectedTypes[tt.id]}>
							{#each Array.from({ length: tt.maxPerOrder + 1 }, (_, i) => i) as n}
								<option value={n}>{n}</option>
							{/each}
						</select>
					</div>
				{:else}
					<div><span>{tt.name}</span> <span>Sold out</span></div>
				{/if}
			{/each}
		</fieldset>

		<label>
			<input type="checkbox" bind:checked={ageAcknowledged} required />
			I confirm that I am 18 years of age or older.
		</label>

		<button type="submit" disabled={submitting}>
			{submitting ? 'Redirecting…' : 'Continue to payment'}
		</button>
	</form>
</main>
