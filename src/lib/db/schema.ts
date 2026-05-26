import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	real,
	uuid,
	pgEnum,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'trialing',
	'past_due',
	'cancelled',
	'comped'
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
	'free',
	'starter',
	'pro',
	'unlimited',
	'comped'
]);

export const paymentProviderEnum = pgEnum('payment_provider', ['stripe', 'square', 'paypal']);

export const dbblActionEnum = pgEnum('dbbl_action', ['flag', 'block']);

export const eventStatusEnum = pgEnum('event_status', [
	'draft',
	'published',
	'cancelled',
	'completed'
]);

export const ticketTypeStatusEnum = pgEnum('ticket_type_status', ['active', 'paused', 'sold_out']);

export const orderStatusEnum = pgEnum('order_status', [
	'pending',
	'completed',
	'failed',
	'refunded'
]);

export const ticketStatusEnum = pgEnum('ticket_status', [
	'active',
	'checked_in',
	'cancelled',
	'refunded'
]);

export const dbblActionTakenEnum = pgEnum('dbbl_action_taken', ['passed', 'flagged', 'blocked']);

export const adminRoleEnum = pgEnum('admin_role', ['super_admin', 'support', 'viewer']);

// ─── Better Auth core tables (required) ───────────────────────────────────────

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	role: text('role').notNull().default('attendee'),
	adminRole: adminRoleEnum('admin_role'),
	// Producer subscription fields
	stripeCustomerId: text('stripe_customer_id'),
	subscriptionStatus: subscriptionStatusEnum('subscription_status').default('active'),
	subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
	subscriptionPeriodEnd: timestamp('subscription_period_end'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// ─── Brand ────────────────────────────────────────────────────────────────────

export const brand = pgTable(
	'brand',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		producerId: text('producer_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		logo: text('logo'),
		chargeDescriptor: text('charge_descriptor').notNull(),
		emailSenderName: text('email_sender_name').notNull(),
		emailReplyTo: text('email_reply_to').notNull(),
		paymentProvider: paymentProviderEnum('payment_provider').notNull().default('stripe'),
		// All three Stripe fields encrypted at rest using ENCRYPTION_KEY
		stripePublishableKey: text('stripe_publishable_key'),
		stripeSecretKey: text('stripe_secret_key'),
		stripeWebhookSecret: text('stripe_webhook_secret'),
		dbblEnabled: boolean('dbbl_enabled').notNull().default(true),
		dbblThreshold: real('dbbl_threshold').notNull().default(0.7),
		dbblAction: dbblActionEnum('dbbl_action').notNull().default('flag'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(t) => [uniqueIndex('brand_slug_idx').on(t.slug), index('brand_producer_idx').on(t.producerId)]
);

// ─── Event ────────────────────────────────────────────────────────────────────

export const event = pgTable(
	'event',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		brandId: uuid('brand_id')
			.notNull()
			.references(() => brand.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		startAt: timestamp('start_at').notNull(),
		endAt: timestamp('end_at'),
		timezone: text('timezone').notNull().default('America/New_York'),
		venueName: text('venue_name').notNull(),
		venueAddress: text('venue_address'),
		locationRevealEnabled: boolean('location_reveal_enabled').notNull().default(false),
		locationRevealAt: timestamp('location_reveal_at'),
		coverImage: text('cover_image'),
		status: eventStatusEnum('status').notNull().default('draft'),
		capacity: integer('capacity'),
		slug: text('slug').notNull(),
		noindex: boolean('noindex').notNull().default(true),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(t) => [uniqueIndex('event_slug_idx').on(t.slug), index('event_brand_idx').on(t.brandId)]
);

// ─── Ticket Type ──────────────────────────────────────────────────────────────

export const ticketType = pgTable(
	'ticket_type',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		eventId: uuid('event_id')
			.notNull()
			.references(() => event.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		description: text('description'),
		// Price in cents
		price: integer('price').notNull().default(0),
		quantity: integer('quantity').notNull(),
		maxPerOrder: integer('max_per_order').notNull().default(1),
		saleStartsAt: timestamp('sale_starts_at'),
		saleEndsAt: timestamp('sale_ends_at'),
		status: ticketTypeStatusEnum('status').notNull().default('active'),
		categoryTag: text('category_tag'),
		requiresApproval: boolean('requires_approval').notNull().default(false),
		visible: boolean('visible').notNull().default(true),
		sortOrder: integer('sort_order').notNull().default(0)
	},
	(t) => [index('ticket_type_event_idx').on(t.eventId)]
);

// ─── Attendee ─────────────────────────────────────────────────────────────────

export const attendee = pgTable('attendee', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Optional link to a Better Auth user (attendee role)
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	// SHA-256 + HASH_PEPPER — used for DBBL queries, never plaintext
	emailHash: text('email_hash').notNull(),
	phoneHash: text('phone_hash'),
	ageAcknowledged: boolean('age_acknowledged').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// ─── Order ────────────────────────────────────────────────────────────────────

export const order = pgTable(
	'order',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		eventId: uuid('event_id')
			.notNull()
			.references(() => event.id, { onDelete: 'restrict' }),
		attendeeId: uuid('attendee_id')
			.notNull()
			.references(() => attendee.id, { onDelete: 'restrict' }),
		status: orderStatusEnum('status').notNull().default('pending'),
		subtotalCents: integer('subtotal_cents').notNull().default(0),
		totalCents: integer('total_cents').notNull().default(0),
		paymentProvider: paymentProviderEnum('payment_provider').notNull().default('stripe'),
		paymentProviderSessionId: text('payment_provider_session_id'),
		ipAddress: text('ip_address'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		completedAt: timestamp('completed_at')
	},
	(t) => [index('order_event_idx').on(t.eventId), index('order_attendee_idx').on(t.attendeeId)]
);

// ─── Ticket ───────────────────────────────────────────────────────────────────

export const ticket = pgTable(
	'ticket',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		orderId: uuid('order_id')
			.notNull()
			.references(() => order.id, { onDelete: 'restrict' }),
		ticketTypeId: uuid('ticket_type_id')
			.notNull()
			.references(() => ticketType.id, { onDelete: 'restrict' }),
		// Cryptographically random token for QR code
		qrToken: text('qr_token').notNull().unique(),
		status: ticketStatusEnum('status').notNull().default('active'),
		checkedInAt: timestamp('checked_in_at'),
		checkedInBy: text('checked_in_by').references(() => user.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(t) => [index('ticket_order_idx').on(t.orderId)]
);

// ─── DBBL Protocol Check ──────────────────────────────────────────────────────

export const dbblCheck = pgTable(
	'dbbl_check',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		orderId: uuid('order_id')
			.notNull()
			.references(() => order.id, { onDelete: 'cascade' }),
		phoneHash: text('phone_hash'),
		emailHash: text('email_hash').notNull(),
		riskScore: real('risk_score'),
		matchConfidence: text('match_confidence'),
		actionTaken: dbblActionTakenEnum('action_taken').notNull(),
		checkedAt: timestamp('checked_at').notNull().defaultNow()
	},
	(t) => [index('dbbl_check_order_idx').on(t.orderId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
	brands: many(brand),
	sessions: many(session),
	accounts: many(account)
}));

export const brandRelations = relations(brand, ({ one, many }) => ({
	producer: one(user, { fields: [brand.producerId], references: [user.id] }),
	events: many(event)
}));

export const eventRelations = relations(event, ({ one, many }) => ({
	brand: one(brand, { fields: [event.brandId], references: [brand.id] }),
	ticketTypes: many(ticketType),
	orders: many(order)
}));

export const ticketTypeRelations = relations(ticketType, ({ one, many }) => ({
	event: one(event, { fields: [ticketType.eventId], references: [event.id] }),
	tickets: many(ticket)
}));

export const attendeeRelations = relations(attendee, ({ one, many }) => ({
	user: one(user, { fields: [attendee.userId], references: [user.id] }),
	orders: many(order)
}));

export const orderRelations = relations(order, ({ one, many }) => ({
	event: one(event, { fields: [order.eventId], references: [event.id] }),
	attendee: one(attendee, { fields: [order.attendeeId], references: [attendee.id] }),
	tickets: many(ticket),
	dbblCheck: one(dbblCheck, { fields: [order.id], references: [dbblCheck.orderId] })
}));

export const ticketRelations = relations(ticket, ({ one }) => ({
	order: one(order, { fields: [ticket.orderId], references: [order.id] }),
	ticketType: one(ticketType, { fields: [ticket.ticketTypeId], references: [ticketType.id] })
}));

export const dbblCheckRelations = relations(dbblCheck, ({ one }) => ({
	order: one(order, { fields: [dbblCheck.orderId], references: [order.id] })
}));

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Brand = typeof brand.$inferSelect;
export type NewBrand = typeof brand.$inferInsert;
export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;
export type TicketType = typeof ticketType.$inferSelect;
export type NewTicketType = typeof ticketType.$inferInsert;
export type Attendee = typeof attendee.$inferSelect;
export type NewAttendee = typeof attendee.$inferInsert;
export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;
export type Ticket = typeof ticket.$inferSelect;
export type NewTicket = typeof ticket.$inferInsert;
export type DbblCheck = typeof dbblCheck.$inferSelect;
export type NewDbblCheck = typeof dbblCheck.$inferInsert;
