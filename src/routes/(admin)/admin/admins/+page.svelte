<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const roleLabels: Record<string, string> = {
		super_admin: 'Super Admin',
		support: 'Support',
		viewer: 'Viewer'
	};
</script>

<svelte:head><title>Admins — Enclave Admin</title></svelte:head>

<div class="page-header">
	<h1>Admins <span class="count">{data.admins.length}</span></h1>
	<a href="/admin/admins/new" class="btn">+ Invite admin</a>
</div>

<table class="admin-table">
	<thead>
		<tr>
			<th>Name</th>
			<th>Email</th>
			<th>Role</th>
			<th>Added</th>
		</tr>
	</thead>
	<tbody>
		{#each data.admins as a}
			<tr>
				<td class="name">{a.name}</td>
				<td class="email">{a.email}</td>
				<td><span class="role-badge role-{a.adminRole}">{roleLabels[a.adminRole ?? ''] ?? a.adminRole}</span></td>
				<td class="date">{new Date(a.createdAt).toLocaleDateString()}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
	h1 { margin: 0; font-size: 1.5rem; }
	.count { font-size: 1rem; font-weight: 400; color: #6b7280; margin-left: 0.4rem; }
	.btn { padding: 0.5rem 1rem; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.875rem; }
	.btn:hover { background: #1e293b; }
	.admin-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; font-size: 0.875rem; }
	.admin-table thead { background: #f9fafb; }
	.admin-table th { text-align: left; padding: 0.6rem 1rem; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
	.admin-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
	.admin-table tr:last-child td { border-bottom: none; }
	.name { font-weight: 500; }
	.email { color: #6b7280; }
	.date { color: #9ca3af; font-size: 0.8rem; }
	.role-badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
	.role-super_admin { background: #0f172a; color: #f8fafc; }
	.role-support { background: #dbeafe; color: #1d4ed8; }
	.role-viewer { background: #f3f4f6; color: #374151; }
</style>
