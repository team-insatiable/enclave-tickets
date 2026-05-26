<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const navLinks = $derived([
		{ href: '/admin', label: 'Overview' },
		{ href: '/admin/producers', label: 'Producers' },
		...(data.adminRole === 'super_admin' ? [{ href: '/admin/admins', label: 'Admins' }] : [])
	]);
</script>

<div class="admin-shell">
	<nav class="topnav">
		<span class="wordmark">Enclave <strong>Admin</strong></span>
		<div class="nav-links">
			{#each navLinks as link}
				<a
					href={link.href}
					class:active={$page.url.pathname === link.href ||
						($page.url.pathname.startsWith(link.href + '/') && link.href !== '/admin')}
				>
					{link.label}
				</a>
			{/each}
		</div>
		<a href="/dashboard" class="back-link">← Producer dashboard</a>
	</nav>
	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	:global(body) { margin: 0; font-family: system-ui, sans-serif; }
	.admin-shell { min-height: 100vh; background: #f9fafb; }
	.topnav {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 0 2rem;
		height: 52px;
		background: #0f172a;
		color: #fff;
	}
	.wordmark { font-size: 0.95rem; color: #94a3b8; white-space: nowrap; }
	.wordmark strong { color: #fff; }
	.nav-links { display: flex; gap: 0.25rem; flex: 1; }
	.nav-links a {
		padding: 0.35rem 0.75rem;
		color: #94a3b8;
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.875rem;
	}
	.nav-links a:hover { color: #fff; background: #1e293b; }
	.nav-links a.active { color: #fff; background: #1e293b; }
	.back-link { color: #64748b; font-size: 0.8rem; text-decoration: none; white-space: nowrap; }
	.back-link:hover { color: #94a3b8; }
	.admin-main { max-width: 1100px; margin: 0 auto; padding: 2rem; }
</style>
