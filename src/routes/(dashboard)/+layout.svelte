<script lang="ts">
	import type { LayoutData } from './$types';
	import { signOut } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { data, children }: { data: LayoutData; children: any } = $props();

	async function handleSignOut() {
		await signOut();
		goto('/login');
	}
</script>

<div class="shell">
	<nav>
		<a href="/dashboard" class="wordmark">Enclave Tickets</a>
		<div class="nav-links">
			<a href="/dashboard">Dashboard</a>
			<a href="/dashboard/settings">Settings</a>
		</div>
		<div class="nav-end">
			<span class="email">{data.user?.email}</span>
			<button onclick={handleSignOut}>Sign out</button>
		</div>
	</nav>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #fff;
	}
	.wordmark {
		font-weight: 700;
		text-decoration: none;
		color: #111;
		margin-right: auto;
	}
	.nav-links {
		display: flex;
		gap: 1rem;
	}
	.nav-links a {
		color: #374151;
		text-decoration: none;
		font-size: 0.9rem;
	}
	.nav-links a:hover {
		color: #111;
	}
	.nav-end {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-left: 1.5rem;
	}
	.email {
		font-size: 0.85rem;
		color: #6b7280;
	}
	button {
		font-size: 0.85rem;
		cursor: pointer;
	}
	main {
		flex: 1;
		padding: 2rem 1.5rem;
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
	}
</style>
