<script lang="ts">
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const token = $derived(form?.token ?? data.token);
</script>

<svelte:head>
	<title>Reset Password — Enclave Tickets</title>
</svelte:head>

<form method="POST">
	<h1>Choose a new password</h1>
	{#if form?.error}<p class="error">{form.error}</p>{/if}
	<input type="hidden" name="token" value={token} />
	<label>New password <input type="password" name="newPassword" required minlength="8" /></label>
	<label>Confirm password <input type="password" name="confirm" required minlength="8" /></label>
	<button type="submit">Set new password</button>
</form>

<style>
	form { max-width: 380px; margin: 4rem auto; display: flex; flex-direction: column; gap: 1rem; }
	h1 { margin: 0 0 0.5rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
	input[type="password"] { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
	button { padding: 0.6rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin: 0; font-size: 0.875rem; }
</style>
