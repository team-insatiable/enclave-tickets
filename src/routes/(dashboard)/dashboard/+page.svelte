<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ob = $derived(data.onboarding);
	const step = $derived(
		!ob ? 5
		: !ob.hasBrands ? 1
		: !ob.hasEvents ? 2
		: !ob.hasTicketTypes ? 3
		: 4
	);
	const stepsComplete = $derived(step - 1);
</script>

<svelte:head>
	<title>Dashboard — Enclave Tickets</title>
</svelte:head>

{#if ob}
	<div class="onboarding">
		<div class="ob-header">
			<span class="ob-title">Get started</span>
			<span class="ob-progress">{stepsComplete} of 4 steps complete</span>
		</div>

		<div class="steps">
			<!-- Step 1 -->
			<div class="step" class:done={ob.hasBrands} class:active={step === 1}>
				<div class="marker">{ob.hasBrands ? '✓' : '1'}</div>
				<div class="step-body">
					<div class="step-label">Create a brand</div>
					{#if step === 1}
						<p class="step-desc">A brand is the identity attendees see on ticket pages and emails — your company name, URL, and contact details.</p>
						<a href="/dashboard/brands/new" class="step-btn">Create your first brand →</a>
					{/if}
				</div>
			</div>

			<!-- Step 2 -->
			<div class="step" class:done={ob.hasEvents} class:active={step === 2} class:future={step < 2}>
				<div class="marker">{ob.hasEvents ? '✓' : '2'}</div>
				<div class="step-body">
					<div class="step-label">Create your first event</div>
					{#if step === 2}
						<p class="step-desc">Set the date, venue, and basic details. You can keep it as a draft until you're ready.</p>
						<a href="/dashboard/events/new{ob.firstBrandId ? `?brand=${ob.firstBrandId}` : ''}" class="step-btn">Create an event →</a>
					{/if}
				</div>
			</div>

			<!-- Step 3 -->
			<div class="step" class:done={ob.hasTicketTypes} class:active={step === 3} class:future={step < 3}>
				<div class="marker">{ob.hasTicketTypes ? '✓' : '3'}</div>
				<div class="step-body">
					<div class="step-label">Add ticket types</div>
					{#if step === 3}
						<p class="step-desc">Define what's available — general admission, VIP, couples, whatever fits your event. Set prices and quantities.</p>
						{#if ob.eventNeedingTickets}
							<a href="/dashboard/events/{ob.eventNeedingTickets}" class="step-btn">Add ticket types →</a>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Step 4 -->
			<div class="step" class:active={step === 4} class:future={step < 4}>
				<div class="marker">4</div>
				<div class="step-body">
					<div class="step-label">Publish your event</div>
					{#if step === 4}
						<p class="step-desc">Once published, your ticket page goes live and buyers can purchase. Your Stripe keys need to be set if you're charging for tickets.</p>
						{#if ob.eventReadyToPublish}
							<a href="/dashboard/events/{ob.eventReadyToPublish}" class="step-btn">Go to event →</a>
						{:else if ob.firstEventId}
							<a href="/dashboard/events/{ob.firstEventId}" class="step-btn">Go to event →</a>
						{/if}
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="dash-header">
	<h1>Dashboard</h1>
	<a href="/dashboard/brands/new" class="btn">+ New brand</a>
</div>

{#if data.brands.length === 0}
	{#if !ob}
		<p class="empty-text">No brands yet. <a href="/dashboard/brands/new">Create one →</a></p>
	{/if}
{:else}
	<div class="brand-grid">
		{#each data.brands as brand}
			<a href="/dashboard/brands/{brand.id}" class="brand-card">
				<div class="brand-name">{brand.name}</div>
				<div class="brand-meta">{brand.events.length} event{brand.events.length !== 1 ? 's' : ''}</div>
			</a>
		{/each}
	</div>
{/if}

<style>
	/* Onboarding checklist */
	.onboarding {
		background: #fff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
		margin-bottom: 2rem;
	}
	.ob-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}
	.ob-title { font-weight: 600; font-size: 0.95rem; }
	.ob-progress { font-size: 0.8rem; color: #6b7280; }

	.steps { display: flex; flex-direction: column; gap: 0; }

	.step {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 0;
		border-top: 1px solid #f3f4f6;
		align-items: flex-start;
	}
	.step:first-child { border-top: none; }

	.marker {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8rem;
		font-weight: 700;
		flex-shrink: 0;
		margin-top: 1px;
		background: #f3f4f6;
		color: #9ca3af;
	}
	.step.done .marker { background: #d1fae5; color: #065f46; }
	.step.active .marker { background: #111; color: #fff; }

	.step-body { flex: 1; }
	.step-label { font-size: 0.9rem; font-weight: 500; line-height: 1.6; }
	.step.done .step-label { color: #9ca3af; text-decoration: line-through; }
	.step.future .step-label { color: #9ca3af; }
	.step-desc { font-size: 0.85rem; color: #6b7280; margin: 0.35rem 0 0.75rem; line-height: 1.5; }
	.step-btn {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #111;
		color: #fff;
		border-radius: 6px;
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
	}
	.step-btn:hover { background: #333; }

	/* Dashboard header + grid */
	.dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	h1 { margin: 0; }
	.btn { padding: 0.5rem 1rem; background: #111; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.875rem; }
	.empty-text { color: #6b7280; font-size: 0.9rem; }
	.brand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
	.brand-card { display: flex; flex-direction: column; gap: 0.25rem; padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 10px; text-decoration: none; color: inherit; }
	.brand-card:hover { background: #f9fafb; }
	.brand-name { font-weight: 600; }
	.brand-meta { font-size: 0.85rem; color: #6b7280; }
</style>
