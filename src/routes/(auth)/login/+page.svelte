<script lang="ts">
	import { signIn } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';
		const result = await signIn.email({ email, password, callbackURL: '/dashboard' });
		if (result.error) {
			error = result.error.message ?? 'Login failed';
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Log in — Enclave Tickets</title>
</svelte:head>

<form onsubmit={handleSubmit}>
	<h1>Log in</h1>
	{#if error}<p class="error">{error}</p>{/if}
	<label>Email <input type="email" bind:value={email} required /></label>
	<label>Password <input type="password" bind:value={password} required /></label>
	<button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
	<p><a href="/register">Create a producer account</a></p>
</form>
