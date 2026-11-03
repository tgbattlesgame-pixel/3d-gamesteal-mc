# Roadmap

## Admin panel + UPI payment flow — DONE
- [x] Enable email/password auth, create private `payment-proofs` bucket, copy UPI QR
- [x] Database: orders, order_messages, user_roles (admin), storage RLS, first-account-becomes-admin trigger
- [x] Server functions: createOrder (recomputes total server-side), getOrderByCode, submitProof, buyer chat; admin list/status/proof-url/chat/grant
- [x] Pages: /auth (sign in/up), /checkout (QR + UPI ID + screenshot upload + order code), /chat (buyer support chat by order code), /admin (orders, chat, admins)
- [x] Tests for order validation + totals, run suite (19 passing)
- [x] Verified end-to-end in preview (order → proof → admin verify → chat); test order + test account removed after the check

## Backlog / blocked
- Vercel deploy: blocked on user fixing Vercel Build & Output settings (code + vercel.json ready)
- Sign-up requires email confirmation (Supabase default) — owner should confirm their email from their inbox on first signup
