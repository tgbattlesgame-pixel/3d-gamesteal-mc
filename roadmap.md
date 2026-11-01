# Roadmap

## Admin panel + UPI payment flow (in progress)
- [x] Enable email/password auth, create private `payment-proofs` bucket, copy UPI QR
- [ ] Database: orders, order_messages, user_roles (admin), storage RLS, first-account-becomes-admin trigger
- [ ] Server functions: createOrder (recomputes total server-side), getOrderByCode, submitProof, buyer chat; admin list/status/proof-url/chat/grant
- [ ] Pages: /auth (sign in/up), new /checkout (QR + UPI ID + screenshot upload + order code), /chat (buyer support chat by order code), /admin (orders, chat, admins)
- [ ] Tests for order validation + totals, run suite
- [ ] Verify end-to-end in preview (order → proof → admin verify → chat)

## Backlog / blocked
- Vercel deploy: blocked on user fixing Vercel Build & Output settings (code + vercel.json ready)
