<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Create Account — Enclave Tickets</title>
</svelte:head>

<form method="POST">
	<h1>Create a producer account</h1>
	{#if form?.error}<p class="error">{form.error}</p>{/if}
	<label>Name <input type="text" name="name" required /></label>
	<label>Email <input type="email" name="email" required /></label>
	<label>Password <input type="password" name="password" required minlength="8" />
		<small>Minimum 8 characters</small>
	</label>
	<button type="submit">Create account</button>
	<p><a href="/login">Already have an account? Log in</a></p>
</form>

<style>
	form { max-width: 380px; margin: 4rem auto; display: flex; flex-direction: column; gap: 1rem; }
	h1 { margin: 0 0 0.5rem; }
	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
	input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
	small { font-size: 0.78rem; color: #6b7280; font-weight: 400; }
	button { padding: 0.6rem; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
	.error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 0.75rem; border-radius: 6px; margin: 0; font-size: 0.875rem; }
	p { font-size: 0.875rem; margin: 0; }
</style>
