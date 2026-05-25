# Enclave Tickets — CLAUDE.md

## Project
Privacy-first event ticketing for lifestyle/kink event producers. Competes with Forbidden Tickets and Eventbrite. Subscription-only monetization (no % fees). Producers use their own Stripe keys; Enclave only charges a flat monthly fee via its own Stripe account.

## Stack
- **Framework:** SvelteKit (Svelte 5 runes, SSR-first, `adapter-node`)
- **Database:** PostgreSQL + Drizzle ORM (`src/lib/db/schema.ts`)
- **Auth:** Better Auth — two roles: `producer` and `attendee`
- **Storage:** MinIO (S3-compatible; swap via `MINIO_*` env vars)
- **Payments:** Stripe (abstracted behind `src/lib/payments/` interface)
- **Package manager:** pnpm
- **Deploy:** Docker Compose (`docker-compose.yml`) — Coolify-compatible

## Dev setup
```sh
cp .env.example .env   # fill in values
docker compose up -d   # starts db + MinIO
pnpm install
pnpm dev
```

Generate an `ENCRYPTION_KEY`: `openssl rand -hex 32`

Run migrations: `pnpm drizzle-kit push` (dev) or `pnpm drizzle-kit generate && pnpm drizzle-kit migrate` (prod)

## Repo structure
```
src/
  lib/
    auth.ts           # Better Auth server config
    auth-client.ts    # Better Auth client (Svelte)
    db/
      index.ts        # Drizzle client
      schema.ts       # All 9 entities + enums
    payments/
      types.ts        # PaymentProvider interface
      stripe.ts       # Stripe implementation
      index.ts        # getPaymentProvider() factory
    dbbl.ts           # DBBL Protocol query (fail-open)
    email.ts          # nodemailer + discreet email builder
    encrypt.ts        # AES-256-GCM for Stripe keys at rest
    hash.ts           # SHA-256 + pepper for DBBL signals
    storage.ts        # S3/MinIO client
    tiers.ts          # Subscription tier limit enforcement
    tokens.ts         # QR token generator
  routes/
    (auth)/           # login, register, verify-email
    (dashboard)/      # producer dashboard — auth-gated
    api/auth/[...all] # Better Auth handler
    api/webhooks/stripe
    t/[brandSlug]/[eventSlug]  # Public ticket purchase page
```

## Key invariants
- All event pages MUST include `<meta name="robots" content="noindex, nofollow">` — events are never Google-indexable.
- Charge descriptor on buyer's bank statement comes from `Brand.chargeDescriptor` — never the event name.
- Confirmation email subject is always neutral (`"Your reservation confirmation"`), never reveals the event.
- `Brand.stripeSecretKey` and `Brand.stripePublishableKey` are always AES-256-GCM encrypted at rest.
- Phone and email are hashed (`hashSignal()`) before any DBBL query — plaintext never leaves the server.
- The **Comped** tier is internal-only. Never expose it in public-facing tier selection UI.
- Treat `subscription_tier = 'comped'` identically to `'unlimited'` in all limit checks.
- Producer cannot see attendee data across events they don't own.

## Tier limits
| Tier      | Tickets/mo | Brands | Active Events |
|-----------|-----------|--------|---------------|
| free      | 50        | 1      | 1             |
| starter   | 200       | 2      | 5             |
| pro       | 500       | 5      | 20            |
| unlimited | ∞         | ∞      | ∞             |
| comped    | ∞         | ∞      | ∞             |

Enforced via `src/lib/tiers.ts`.

## Payment flow (ticket purchase)
1. Buyer fills checkout form (name, email, phone, age ack)
2. Server hashes email + phone with `hashSignal()`
3. Query DBBL via `queryDbbl()` — fail open on error
4. If blocked → reject with generic error; if flagged → complete but notify producer
5. Create `Order` (status: pending) + `Attendee` record
6. Call `getPaymentProvider(brand).createCheckout(...)` using brand's decrypted Stripe key
7. Redirect buyer to Stripe hosted checkout
8. On `checkout.session.completed` webhook: mark order complete, generate tickets with `generateQrToken()`, send confirmation email

## Package manager
Always use **pnpm**.
