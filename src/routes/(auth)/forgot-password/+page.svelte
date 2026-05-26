<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Forgot Password — Enclave Tickets</title>
</svelte:head>

<form method="POST">
	<h1>Reset your password</h1>

	{#if form?.sent}
		<p class="notice">If an account exists for that email, a reset link is on its way. Check your inbox.</p>
		<p class="back"><a href="/login">← Back to log in</a></p>
	{:else}
		<p class="hint">Enter your email and we'll send you a link to reset your password.</p>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
		<label>Email <input type="email" name="email" required /></label>
		<button type="submit">Send reset link</button>
		<p><a href="/login">← Back to log in</a></p>
	{/if}
</form>

<style>
	form { max-width: 380px; margin: 4rem auto; display: flex; flex-direction: column; gap: 1rem; }
	h1 { margin: 0 0 0.25rem; }
	.hint { color: #6b7280; font-size: 0.9rem; margin: 0; }
	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
	input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
	button { padding: 0.6rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.notice { color: #065f46; background: #d1fae5; border: 1px solid #6ee7b7; padding: 0.75rem; border-radius: 6px; font-size: 0.875rem; margin: 0; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin: 0; font-size: 0.875rem; }
	p { font-size: 0.875rem; margin: 0; }
	.back a { color: #374151; }
</style>
