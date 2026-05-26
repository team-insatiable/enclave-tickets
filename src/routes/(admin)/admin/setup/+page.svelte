<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Admin Setup — Enclave Tickets</title></svelte:head>

<div class="setup-page">
	<div class="setup-card">
		<div class="logo">Enclave Tickets</div>
		<h1>First-time admin setup</h1>
		<p>
			No admin accounts exist yet. The logged-in account will be promoted to
			<strong>super admin</strong> and gain full access to the admin area.
		</p>

		{#if !data.loggedIn}
			<div class="warn">
				You need to be logged in first. <a href="/login">Log in →</a>
			</div>
		{:else}
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
			<form method="POST">
				<p class="confirm-note">
					This action is permanent and cannot be repeated once an admin account exists.
				</p>
				<button type="submit" class="btn">Claim super admin access</button>
			</form>
		{/if}
	</div>
</div>

<style>
	:global(body) { margin: 0; font-family: system-ui, sans-serif; background: #f1f5f9; }
	.setup-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
	.setup-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2.5rem; max-width: 440px; width: 100%; }
	.logo { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 1.5rem; }
	h1 { font-size: 1.35rem; margin: 0 0 0.75rem; }
	p { color: #475569; font-size: 0.9rem; line-height: 1.6; margin: 0 0 1rem; }
	.warn { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 0.85rem 1rem; font-size: 0.875rem; color: #9a3412; }
	.warn a { color: #9a3412; font-weight: 600; }
	.confirm-note { font-size: 0.8rem; color: #94a3b8; margin-bottom: 1.25rem; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.875rem; }
	.btn { width: 100%; padding: 0.65rem; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-size: 0.9rem; cursor: pointer; font-weight: 500; }
	.btn:hover { background: #1e293b; }
</style>
