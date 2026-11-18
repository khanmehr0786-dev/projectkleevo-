# KLEEVO Netlify Store

A deployable React + TypeScript storefront scaffold for KLEEVO / S.M ENTERPRISES. It includes Supabase customer authentication, product catalogue, cart, customer order history, protected admin area, Netlify Functions for Razorpay order creation/payment verification, and SQL with Row Level Security.

## Important before launch
This is an implementation starter, not a certification that your production environment is configured. Add your real keys, run the SQL, create an admin account and test payments in Razorpay test mode before switching to live mode. Do not commit `.env` or secret keys. Razorpay payment verification must happen server-side (implemented here). For production, configure a Razorpay webhook as an additional reconciliation mechanism and test failed, delayed and duplicate payment events.

## 1. Use your existing Supabase project
In Supabase SQL Editor, run `supabase/schema.sql`. The schema creates the product/order tables, profile role, RLS policies and the initial seven products. If your existing project already has tables with these names, inspect and reconcile the SQL rather than blindly running conflicting migrations.

## 2. Configure environment variables
Copy `.env.example` to `.env` for local development. In Netlify, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` (for a webhook handler you add/configure)

The service-role key and Razorpay secret must only exist in Netlify server environment variables. Never expose them in frontend variables or source control.

## 3. Create your owner/admin account
Register through `/login` with the owner's email. Then, from Supabase SQL Editor, run:
```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_OWNER_EMAIL');
```
Use the exact owner email. Do not make a public admin-signup route. Only an existing trusted project owner should run this SQL.

## 4. Razorpay
Start with Razorpay Test Mode. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Netlify. The frontend obtains an order from `/.netlify/functions/create-razorpay-order`; after checkout, it calls `verify-razorpay-payment`. The function verifies the HMAC signature before marking an order paid. Configure the matching public Key ID in `VITE_RAZORPAY_KEY_ID` only if you decide to display it client-side; this starter instead returns the public key ID from the server-created order response.

Create a webhook endpoint separately if you need automated reconciliation for payments completed after a browser closes. Do not mark orders paid based only on a browser redirect or screenshot.

## 5. Deploy
Push this folder to a GitHub repository, import it into Netlify, and use the included `netlify.toml`. Build command: `npm run build`; publish directory: `dist`.

## 6. Product images and branding
Place the real approved KLEEVO bottle images in `public/products/` and update each product's `image_url` in Supabase. The starter uses elegant neutral product-image placeholders until you add the original bottle photos. Do not use unrelated stock images or claim certifications unless the exact approved certification wording and artwork are verified.

## Included routes
- `/` storefront
- `/login` customer sign-in/sign-up
- `/account` customer profile and order history
- `/admin/login` admin login entry
- `/admin` owner-only product/order management

## Operational checklist
- Verify Supabase Auth email settings and redirect URLs.
- Confirm RLS is enabled on every customer/order table.
- Confirm only the owner profile has `role='admin'`.
- Test customer A cannot view customer B's orders.
- Test non-admin users cannot read or modify products/orders through admin policies.
- Test Razorpay success, failure, cancellation, duplicate callback and server verification.
- Add shipping, tax, refund, privacy, terms, contact and return policies before accepting public orders.
- Configure domain, HTTPS, analytics and transactional order notifications.
