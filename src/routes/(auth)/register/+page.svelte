<script lang="ts">
	import { signUp } from '$lib/auth-client';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let done = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		error = '';
		const result = await signUp.email({
			name,
			email,
			password,
			callbackURL: '/dashboard',
			fetchOptions: {
				// Pass role=producer via custom fetch header so the server can set it
				headers: { 'x-register-role': 'producer' }
			}
		});
		if (result.error) {
			error = result.error.message ?? 'Registration failed';
		} else {
			done = true;
		}
		loading = false;
	}
</script>

<svelte:head>
	<title>Create Account — Enclave Tickets</title>
</svelte:head>

{#if done}
	<p>Check your email to verify your account.</p>
{:else}
	<form onsubmit={handleSubmit}>
		<h1>Create a producer account</h1>
		{#if error}<p class="error">{error}</p>{/if}
		<label>Name <input type="text" bind:value={name} required /></label>
		<label>Email <input type="email" bind:value={email} required /></label>
		<label>Password <input type="password" bind:value={password} required minlength="8" /></label>
		<button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
		<p><a href="/login">Already have an account?</a></p>
	</form>
{/if}
