## Salon Site Setup

Next.js bilingual hair salon website with booking and ecommerce checkout (Stripe card payments).

## Getting Started

1) Install dependencies:

```bash
npm install
```

2) Copy env template and fill real credentials:

```bash
cp .env.example .env
```

Required for admin UI and protected APIs:

- `ADMIN_API_KEY` — used for `/admin/*` sign-in and `Authorization: Bearer` / `x-admin-key` on admin routes.

After schema changes, apply to your database (new fields: `Order.paymentUploadToken`, `IdempotencyRecord`, `Order.lastStatusNote`, etc.):

```bash
npm run prisma:migrate
# or: npx prisma db push
```

3) Generate Prisma client + migrate + seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4) Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stripe Webhook (Local)

Run Stripe CLI and forward webhook to the app:

```bash
stripe listen --forward-to localhost:3000/api/shop/webhook
```

Copy the returned signing secret (`whsec_...`) into `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Key webhook endpoint:

- `POST /api/shop/webhook`
- Handles `checkout.session.completed` -> updates order status to `paid`
- Handles failed/expired sessions -> updates order status accordingly

## API Quick Reference

- `POST /api/booking`
- `GET /api/booking/slots`
- `GET /api/admin/bookings`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders`
- `GET /api/shop/products`
- `POST /api/shop/checkout`
- `GET /api/shop/orders` (admin auth required; not public)
- `POST /api/shop/orders/upload-proof` (requires per-order `uploadToken` from checkout response)
- `GET /api/shop/orders/proof` — private payment screenshot (`orderId` + `uploadToken`, or admin session / Bearer)
- `POST /api/shop/webhook`
- `POST /api/auth/admin/login` — sets admin session cookie

Idempotency: send header `Idempotency-Key` (UUID) on `POST /api/booking` and `POST /api/shop/checkout` to make retries safe.

## Macau Local Payment Baseline

- Checkout supports: `MPay`, `中銀`, `UEPAY`, `銀行轉賬`, and `Visa/Mastercard (Stripe fallback)`.
- For local methods, checkout creates an order and returns payment account details.
- Customer uploads payment screenshot to `POST /api/shop/orders/upload-proof`.
- Manual review page: `/admin/orders`.
- Admin status updates can auto-send customer emails when SMTP is configured.
- When admin marks order as `paid`, the system auto-generates an e-receipt number and includes it in notification email.

## SMTP for Order Status Emails

Set these in `.env` to enable auto email notifications from admin review:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Triggered when admin changes order status to:

- `proof_submitted`
- `paid`
- `failed`
- `cancelled`
