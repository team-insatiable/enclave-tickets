<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const purchaseUrl = $derived(`/t/${data.brand.slug}/${data.event.slug}`);

	function formatPrice(cents: number) {
		return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
	}

	function fmtDate(d: string | Date | null) {
		if (!d) return '—';
		return new Date(d).toLocaleString();
	}
</script>

<svelte:head><title>{data.event.name} — Enclave Tickets</title></svelte:head>

<div class="page">
	<a href="/dashboard/brands/{data.brand.id}">← {data.brand.name}</a>

	<div class="header">
		<div>
			<h1>{data.event.name}</h1>
			<span class="meta">{fmtDate(data.event.startAt)} · {data.event.venueName}</span>
		</div>
		<div class="header-actions">
			{#if data.event.status === 'draft'}
				<form method="POST" action="?/setStatus" use:enhance>
					<input type="hidden" name="status" value="published" />
					<button class="btn btn-publish">Publish</button>
				</form>
			{:else if data.event.status === 'published'}
				<a href={purchaseUrl} target="_blank" class="btn btn-outline">View ticket page ↗</a>
				<form method="POST" action="?/setStatus" use:enhance>
					<input type="hidden" name="status" value="draft" />
					<button class="btn btn-outline">Unpublish</button>
				</form>
			{:else}
				<span class="badge badge-{data.event.status}">{data.event.status}</span>
			{/if}
		</div>
	</div>

	{#if data.event.status === 'draft'}
		<div class="notice">
			This event is a draft — the ticket page is not accessible to buyers until you publish it.
		</div>
	{/if}

	{#if data.event.status === 'published'}
		<div class="notice notice-success">
			Published · Ticket page: <a href={purchaseUrl} target="_blank">{purchaseUrl}</a>
		</div>
	{/if}

	<!-- Ticket types -->
	<section>
		<h2>Ticket types</h2>

		{#if form?.deleteError}
			<p class="error">{form.deleteError}</p>
		{/if}

		{#if data.event.ticketTypes.length === 0}
			<p class="empty">No ticket types yet. Add one below.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Price</th>
						<th>Qty</th>
						<th>Max/order</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each data.event.ticketTypes as tt}
						<tr class:hidden={!tt.visible}>
							<td>
								{tt.name}
								{#if !tt.visible}<span class="badge badge-draft">Hidden</span>{/if}
								{#if tt.categoryTag}<span class="tag">{tt.categoryTag}</span>{/if}
							</td>
							<td>{formatPrice(tt.price)}</td>
							<td>{tt.quantity}</td>
							<td>{tt.maxPerOrder}</td>
							<td><span class="badge badge-{tt.status}">{tt.status}</span></td>
							<td>
								<form method="POST" action="?/deleteTicketType" use:enhance>
									<input type="hidden" name="typeId" value={tt.id} />
									<button class="btn-danger" onclick={(e) => { if (!confirm('Delete this ticket type?')) e.preventDefault(); }}>Delete</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}

		<!-- Add ticket type form -->
		<details open={data.event.ticketTypes.length === 0}>
			<summary>+ Add ticket type</summary>
			{#if form?.addError}
				<p class="error">{form.addError}</p>
			{/if}
			{#if form?.addSuccess}
				<p class="success">Ticket type added.</p>
			{/if}
			<form method="POST" action="?/addTicketType" use:enhance class="add-form">
				<div class="add-row">
					<label>
						Name <span class="req">*</span>
						<input type="text" name="name" placeholder="e.g. Single, Couples, VIP" required />
					</label>
					<label>
						Price ($)
						<input type="number" name="price" value="0" min="0" step="0.01" />
					</label>
					<label>
						Quantity <span class="req">*</span>
						<input type="number" name="quantity" min="1" required />
					</label>
					<label>
						Max per order
						<input type="number" name="maxPerOrder" value="1" min="1" />
					</label>
				</div>
				<div class="add-row">
					<label>
						Description
						<input type="text" name="description" placeholder="Optional" />
					</label>
					<label>
						Category tag
						<input type="text" name="categoryTag" placeholder="e.g. vip, staff" />
					</label>
					<label>
						Sale opens
						<input type="datetime-local" name="saleStartsAt" />
					</label>
					<label>
						Sale closes
						<input type="datetime-local" name="saleEndsAt" />
					</label>
				</div>
				<div class="add-checks">
					<label class="checkbox-label">
						<input type="checkbox" name="requiresApproval" />
						Requires manual approval
					</label>
					<label class="checkbox-label">
						<input type="checkbox" name="visible" checked />
						Visible to buyers
					</label>
				</div>
				<button type="submit">Add ticket type</button>
			</form>
		</details>
	</section>

	<!-- Event details summary -->
	<section>
		<h2>Event info</h2>
		<dl>
			<dt>Starts</dt><dd>{fmtDate(data.event.startAt)}</dd>
			{#if data.event.endAt}<dt>Ends</dt><dd>{fmtDate(data.event.endAt)}</dd>{/if}
			<dt>Timezone</dt><dd>{data.event.timezone}</dd>
			<dt>Venue</dt><dd>{data.event.venueName}</dd>
			{#if data.event.venueAddress}
				<dt>Address</dt>
				<dd>
					{data.event.locationRevealEnabled
						? `Hidden until ${fmtDate(data.event.locationRevealAt)}`
						: data.event.venueAddress}
				</dd>
			{/if}
			{#if data.event.capacity}<dt>Capacity</dt><dd>{data.event.capacity}</dd>{/if}
		</dl>
	</section>
</div>

<style>
	.page { max-width: 800px; }
	.header { display: flex; align-items: flex-start; justify-content: space-between; margin: 0.5rem 0 1rem; gap: 1rem; }
	h1 { margin: 0 0 0.25rem; }
	.meta { font-size: 0.875rem; color: #6b7280; }
	.header-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
	.notice { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1.5rem; }
	.notice-success { background: #f0fdf4; border-color: #86efac; }
	.notice a { color: #059669; }
	section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #f3f4f6; }
	section h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
	.empty { color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem; }
	table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin-bottom: 1rem; }
	th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
	td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #f3f4f6; }
	tr.hidden td { opacity: 0.5; }
	.tag { background: #f3f4f6; color: #374151; font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 3px; margin-left: 0.4rem; }
	.badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
	.badge-draft { background: #f3f4f6; color: #374151; }
	.badge-published, .badge-active { background: #d1fae5; color: #065f46; }
	.badge-cancelled, .badge-sold_out { background: #fee2e2; color: #991b1b; }
	.badge-completed, .badge-paused { background: #e0e7ff; color: #3730a3; }
	details { margin-top: 1rem; }
	summary { cursor: pointer; font-size: 0.9rem; font-weight: 600; color: #374151; padding: 0.5rem 0; }
	.add-form { padding-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
	.add-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
	.add-checks { display: flex; gap: 1.5rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
	label.checkbox-label { flex-direction: row; align-items: center; gap: 0.5rem; font-weight: 400; }
	input[type="text"], input[type="number"], input[type="datetime-local"] { padding: 0.45rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; width: 100%; box-sizing: border-box; }
	.req { color: #dc2626; }
	.btn { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; cursor: pointer; text-decoration: none; border: none; }
	.btn-publish { background: #111; color: #fff; }
	.btn-outline { background: #fff; color: #374151; border: 1px solid #d1d5db; }
	.btn-danger { background: none; border: none; color: #dc2626; font-size: 0.8rem; cursor: pointer; padding: 0; }
	button[type="submit"]:not(.btn-danger):not(.btn):not(.btn-publish):not(.btn-outline) { padding: 0.5rem 1rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; align-self: flex-start; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; }
	.success { color: #065f46; background: #d1fae5; border: 1px solid #6ee7b7; padding: 0.75rem; border-radius: 6px; }
	dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.4rem 1rem; font-size: 0.9rem; }
	dt { color: #6b7280; font-weight: 500; }
</style>
