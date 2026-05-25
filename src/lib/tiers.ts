import type { User } from '$lib/db/schema';

export interface TierLimits {
	ticketsPerMonth: number | null;
	brands: number | null;
	activeEvents: number | null;
}

const LIMITS: Record<string, TierLimits> = {
	free: { ticketsPerMonth: 50, brands: 1, activeEvents: 1 },
	starter: { ticketsPerMonth: 200, brands: 2, activeEvents: 5 },
	pro: { ticketsPerMonth: 500, brands: 5, activeEvents: 20 },
	unlimited: { ticketsPerMonth: null, brands: null, activeEvents: null },
	comped: { ticketsPerMonth: null, brands: null, activeEvents: null }
};

export function getTierLimits(tier: string): TierLimits {
	return LIMITS[tier] ?? LIMITS.free;
}

export function canCreateBrand(tier: string, currentBrandCount: number): boolean {
	const limits = getTierLimits(tier);
	if (limits.brands === null) return true;
	return currentBrandCount < limits.brands;
}

export function canPublishEvent(tier: string, currentActiveEventCount: number): boolean {
	const limits = getTierLimits(tier);
	if (limits.activeEvents === null) return true;
	return currentActiveEventCount < limits.activeEvents;
}

export function canSellTicket(tier: string, ticketsSoldThisMonth: number): boolean {
	const limits = getTierLimits(tier);
	if (limits.ticketsPerMonth === null) return true;
	return ticketsSoldThisMonth < limits.ticketsPerMonth;
}
