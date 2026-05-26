<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Invite Admin — Enclave Admin</title></svelte:head>

<a href="/admin/admins" class="back">← Admins</a>
<h1>Invite admin</h1>
<p class="hint">
	If the email already belongs to an existing account, that account will be promoted to admin.
	Otherwise a new account is created and a password-reset email is sent so they can set their password.
</p>

{#if form?.error}<p class="error">{form.error}</p>{/if}

<form method="POST" class="invite-form">
	<label>
		Name
		<input type="text" name="name" value={form?.name ?? ''} required />
	</label>
	<label>
		Email
		<input type="email" name="email" value={form?.email ?? ''} required />
	</label>
	<label>
		Role
		<select name="adminRole">
			<option value="viewer">Viewer — read-only</option>
			<option value="support">Support — view/edit producers and subscriptions</option>
			<option value="super_admin">Super Admin — full access including managing admins</option>
		</select>
	</label>
	<div class="actions">
		<button type="submit" class="btn">Send invite</button>
		<a href="/admin/admins" class="cancel">Cancel</a>
	</div>
</form>

<style>
	.back { color: #6b7280; font-size: 0.875rem; text-decoration: none; display: inline-block; margin-bottom: 1.25rem; }
	.back:hover { color: #374151; }
	h1 { margin: 0 0 0.5rem; font-size: 1.4rem; }
	.hint { color: #6b7280; font-size: 0.875rem; max-width: 520px; line-height: 1.6; margin: 0 0 1.5rem; }
	.invite-form { max-width: 440px; display: flex; flex-direction: column; gap: 1rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; color: #374151; }
	input, select { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; background: #fff; }
	.actions { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
	.btn { padding: 0.6rem 1.25rem; background: #0f172a; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.btn:hover { background: #1e293b; }
	.cancel { color: #6b7280; font-size: 0.9rem; text-decoration: none; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; font-size: 0.875rem; }
</style>
