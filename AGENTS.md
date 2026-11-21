# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a small Node/Express POS, Khata ledger, and GST-invoicing app. `server.js` mounts the API routers and serves `public/`. Put endpoint handlers in `routes/` (`orders.js`, `customers.js`, `products.js`, `reports.js`) and reusable business logic in `lib/`. Keep runtime settings, GST slabs, and coupons in `config.js`. The JSON datastore is `data/db.json`; treat it as business data, not a fixture. The browser UI is plain HTML, CSS, and JavaScript under `public/`. `docs/` holds repository documentation and diagrams.

## Build, Test, and Development Commands

- `npm start` runs `node server.js` and serves the app on `PORT` or `3000`.
- `npm test` currently exits with “no test specified”; it is a placeholder, not a validation suite.

There is no build step, linter, formatter, or automated test framework configured. Before submitting changes, manually exercise the affected API/UI path and check order totals, inventory, Khata balances, and printable invoices where relevant.

## Coding Style & Naming Conventions

Use the existing CommonJS style: `var` declarations, `require(...)`, and `module.exports`. Indent with two spaces; use semicolons and single-quoted strings. Name route and library files in lowercase (`routes/orders.js`, `lib/pricing.js`). Export descriptive functions such as `computeTotals`, `recordSettlement`, and `getGstReconciliation`. Preserve the server-side product lookup in order creation—do not trust client-supplied prices or tax values.

## Testing Guidelines

Add focused automated tests when introducing a framework, especially for `lib/pricing.js`, `lib/tax.js`, `lib/coupons.js`, and `lib/invoice.js`. Cover GST-slab selection, coupon caps and minimums, rounding, stock boundaries, cancellations, and Khata credit limits. Name tests after behavior, for example: `pricing computes GST after a prorated coupon discount`.

## Commits & Pull Requests

Recent commits use short, lowercase, imperative-style summaries, for example `support hsn gst slabs and coupon maxDiscount caps`. Keep commits scoped to one concern. PRs should explain the affected workflow, list manual verification, link the relevant issue, and include UI screenshots for `public/` changes. Call out any `data/db.json` migration or invoice/tax impact explicitly.

## Security & Data Handling

Do not commit real customer data, credentials, or new secrets. Keep configuration changes reviewable, validate request data at routes, and avoid logging sensitive customer details in audit messages.
