<script lang="ts">
	import { page } from '$app/stores';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	const notice = $derived(
		$page.url.searchParams.get('verified') === '1' ? 'Email verified — you can now log in.' :
		$page.url.searchParams.get('reset') === '1' ? 'Password updated — log in with your new password.' :
		null
	);
</script>

<svelte:head>
	<title>Log in — Enclave Tickets</title>
</svelte:head>

<form method="POST">
	<h1>Log in</h1>
	{#if notice}<p class="notice">{notice}</p>{/if}
	{#if form?.error}<p class="error">{form.error}</p>{/if}
	<label>Email <input type="email" name="email" required /></label>
	<label>Password <input type="password" name="password" required /></label>
	<button type="submit">Log in</button>
	<div class="links">
		<a href="/forgot-password">Forgot password?</a>
		<a href="/register">Create a producer account</a>
	</div>
</form>

<style>
	form { max-width: 380px; margin: 4rem auto; display: flex; flex-direction: column; gap: 1rem; }
	h1 { margin: 0 0 0.5rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
	input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
	button { padding: 0.6rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.notice { color: #065f46; background: #d1fae5; border: 1px solid #6ee7b7; padding: 0.75rem; border-radius: 6px; margin: 0; font-size: 0.875rem; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin: 0; font-size: 0.875rem; }
	.links { display: flex; justify-content: space-between; font-size: 0.875rem; }
	.links a { color: #374151; }
</style>
