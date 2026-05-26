<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let name = $state('');
	let slug = $state('');
	let slugEdited = $state(false);
	let locationReveal = $state(false);

	function onNameInput(e: Event) {
		name = (e.target as HTMLInputElement).value;
		if (!slugEdited) {
			slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
		}
	}
</script>

<svelte:head><title>New Event — Enclave Tickets</title></svelte:head>

<div class="page">
	<a href="/dashboard/brands/{data.brand.id}">← {data.brand.name}</a>
	<h1>New event</h1>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form method="POST" use:enhance>
		<input type="hidden" name="brandId" value={data.brand.id} />

		<section>
			<h2>Details</h2>
			<label>
				Event name <span class="req">*</span>
				<input type="text" name="name" value={form?.values?.name ?? ''} oninput={onNameInput} required />
			</label>
			<label>
				URL slug <span class="req">*</span>
				<div class="slug-row">
					<span class="slug-prefix">…/{data.brand.id}/</span>
					<input type="text" name="slug" bind:value={slug} oninput={() => (slugEdited = true)} pattern="[a-z0-9\-]+" required />
				</div>
			</label>
			<label>
				Description
				<textarea name="description" rows="3">{form?.values?.description ?? ''}</textarea>
			</label>
		</section>

		<section>
			<h2>Date & time</h2>
			<div class="row">
				<label>
					Starts <span class="req">*</span>
					<input type="datetime-local" name="startAt" value={form?.values?.startAt ?? ''} required />
				</label>
				<label>
					Ends
					<input type="datetime-local" name="endAt" value={form?.values?.endAt ?? ''} />
				</label>
			</div>
			<label>
				Timezone
				<select name="timezone">
					<option value="America/New_York">Eastern (ET)</option>
					<option value="America/Chicago">Central (CT)</option>
					<option value="America/Denver">Mountain (MT)</option>
					<option value="America/Los_Angeles">Pacific (PT)</option>
					<option value="America/Phoenix">Arizona (no DST)</option>
					<option value="Pacific/Honolulu">Hawaii (HT)</option>
					<option value="America/Anchorage">Alaska (AKT)</option>
					<option value="Europe/London">London (GMT/BST)</option>
					<option value="Europe/Berlin">Berlin (CET/CEST)</option>
					<option value="UTC">UTC</option>
				</select>
			</label>
		</section>

		<section>
			<h2>Venue</h2>
			<label>
				Venue name <span class="req">*</span>
				<input type="text" name="venueName" value={form?.values?.venueName ?? ''} required placeholder="The venue name is always shown to buyers" />
			</label>
			<label>
				Full address
				<input type="text" name="venueAddress" value={form?.values?.venueAddress ?? ''} placeholder="Shown based on reveal settings below" />
			</label>
			<label class="checkbox-label">
				<input type="checkbox" name="locationRevealEnabled" bind:checked={locationReveal} />
				Hide address until a set time before the event
			</label>
			{#if locationReveal}
				<label>
					Reveal address at
					<input type="datetime-local" name="locationRevealAt" value={form?.values?.locationRevealAt ?? ''} />
					<small>Buyers see "Exact address revealed closer to the event" until this time.</small>
				</label>
			{/if}
		</section>

		<section>
			<h2>Capacity</h2>
			<label>
				Overall capacity (optional)
				<input type="number" name="capacity" value={form?.values?.capacity ?? ''} min="1" placeholder="Leave blank for no cap" />
				<small>Total tickets across all ticket types. Individual ticket type quantities also apply.</small>
			</label>
		</section>

		<div class="actions">
			<button type="submit">Create event</button>
			<small>You'll add ticket types and publish on the next screen.</small>
		</div>
	</form>
</div>

<style>
	.page { max-width: 640px; }
	h1 { margin: 0.5rem 0 1.5rem; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; }
	section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f3f4f6; }
	section h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500; color: #374151; }
	label.checkbox-label { flex-direction: row; align-items: center; gap: 0.5rem; font-weight: 400; }
	input[type="text"], input[type="number"], input[type="datetime-local"], select, textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
	textarea { resize: vertical; font-family: inherit; }
	.row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.slug-row { display: flex; align-items: center; }
	.slug-prefix { background: #f9fafb; border: 1px solid #d1d5db; border-right: none; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #6b7280; border-radius: 6px 0 0 6px; white-space: nowrap; }
	.slug-row input { border-radius: 0 6px 6px 0; flex: 1; }
	.req { color: #dc2626; }
	small { font-size: 0.8rem; color: #6b7280; font-weight: 400; }
	.actions { display: flex; align-items: center; gap: 1rem; }
	.actions button { padding: 0.6rem 1.25rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
</style>
