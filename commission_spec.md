
# Commission Calculation Spec (for Mobile App + Backend)

This spec defines the commission formula and reference implementation so an AI can implement the feature consistently across mobile (React Native / Flutter) and backend (Node/Laravel).

---

## 1) Glossary & Rules

- **price**: product selling price (per unit).
- **commission_pct**: commission percentage on price. **Database rule**: `1 = 100%`, e.g., `0.05 = 5%`.
- **C0** (base commission): `C0 = price * commission_pct * qty`.
- **provider**: the user who **posted** the product.
- **provider_pct**: percent of `C0` that provider wants to receive (0..1).
- **C_provider**: `C_provider = C0 * provider_pct` (rounded to VND).
- **C_remain**: `C_remain = C0 - C_provider` — the remainder to split by **rank** of the *seller* (booking owner).

**Rank Split by Seller's Rank**

Given the seller's current `rank_id`, get its percentages:
- `seller_pct(rank)` – to the seller (user who booked).
- `referrer_pct(rank)` – to the seller's **referrer**, if present.
- `manager_pct(rank)` – to the seller's **manager**, if present.

Then:
- `C_seller   = C_remain * seller_pct(rank)`
- `C_referrer = hasReferrer ? C_remain * referrer_pct(rank) : 0`
- `C_manager  = hasManager  ? C_remain * manager_pct(rank)  : 0`

> **Safety**
> - If `seller_pct + referrer_pct + manager_pct > 1`, normalize them so the sum becomes 1.
> - If `< 1`, the unallocated remainder goes to **system_residual**.
> - Only when booking status becomes **Completed** do we credit wallets.

---

## 2) Minimal Data Model (can be adapted)

```
users(id, rank_id, referrer_id, manager_id, ...)

ranks(id, name, seller_pct, referrer_pct, manager_pct)
  -- percentages stored as decimals: 0.85 = 85%

products(id, price, commission_pct, provider_id, provider_pct, ...)

bookings(id, product_id, user_id, qty, amount, status)
  -- status: pending | completed | canceled

wallets(id, user_id, balance)
wallet_tx(id, user_id, booking_id, type, amount, note, created_at)
  -- type: direct_seller | referral | manager | provider | system
```

**Lookup by booking_id**

```sql
SELECT
  b.id AS booking_id, b.qty, b.status,
  u.id AS seller_id, u.rank_id, u.referrer_id, u.manager_id,
  p.id AS product_id, p.price, p.commission_pct, p.provider_id, p.provider_pct
FROM bookings b
JOIN products p ON p.id = b.product_id
JOIN users u    ON u.id = b.user_id
WHERE b.id = $1;
```

---

## 3) Reference Implementation (TypeScript)

```ts
type ID = string;

type Booking = { id: ID; product_id: ID; user_id: ID; qty: number; amount: number; status: "pending"|"completed"|"canceled" };
type Product = { id: ID; price: number; commission_pct: number; provider_id: ID; provider_pct: number };
type User    = { id: ID; rank_id: ID; referrer_id?: ID|null; manager_id?: ID|null };
type RankRule= { id: ID; seller_pct: number; referrer_pct: number; manager_pct: number };

type SplitResult = {
  booking_id: ID;
  base_commission: number;
  provider: { user_id: ID; amount: number };
  seller:   { user_id: ID; amount: number } | null;
  referrer: { user_id: ID; amount: number } | null;
  manager:  { user_id: ID; amount: number } | null;
  system_residual: number;
};

const roundVND = (n: number) => Math.round(n); // or Math.floor

export async function computeCommissionByBookingId(bookingId: ID): Promise<SplitResult> {
  const booking  = await db.booking.findById(bookingId) as Booking;
  const product  = await db.product.findById(booking.product_id) as Product;
  const seller   = await db.user.findById(booking.user_id) as User;
  const provider = await db.user.findById(product.provider_id) as User;
  const rankRule = await db.rank.findById(seller.rank_id) as RankRule;

  const C0 = product.price * product.commission_pct * booking.qty;

  const C_provider = roundVND(C0 * (product.provider_pct ?? 0));
  const C_remain   = C0 - C_provider;

  const hasRef = !!seller.referrer_id;
  const hasMgr = !!seller.manager_id;

  let s = rankRule.seller_pct;
  let r = hasRef ? rankRule.referrer_pct : 0;
  let m = hasMgr ? rankRule.manager_pct  : 0;

  const sum = s + r + m;
  if (sum > 1) { s/=sum; r/=sum; m/=sum; }

  const C_seller   = roundVND(C_remain * s);
  const C_referrer = roundVND(C_remain * r);
  const C_manager  = roundVND(C_remain * m);

  const allocated = C_seller + C_referrer + C_manager;
  const system_residual = roundVND(C_remain - allocated);

  return {
    booking_id: booking.id,
    base_commission: roundVND(C0),
    provider: { user_id: provider.id, amount: C_provider },
    seller:   { user_id: seller.id,   amount: C_seller },
    referrer: hasRef ? { user_id: seller.referrer_id!, amount: C_referrer } : null,
    manager:  hasMgr ? { user_id: seller.manager_id!,  amount: C_manager }  : null,
    system_residual,
  };
}
```

**Posting to Wallets on booking completion**

```ts
export async function onBookingStatusChanged(bookingId: ID, newStatus: "pending"|"completed"|"canceled") {
  await db.booking.updateStatus(bookingId, newStatus);
  if (newStatus !== "completed") return;

  const split = await computeCommissionByBookingId(bookingId);

  // Provider
  await credit(split.provider.user_id, split.provider.amount, bookingId, "provider", "Provider share");

  // Seller
  if (split.seller && split.seller.amount) await credit(split.seller.user_id, split.seller.amount, bookingId, "direct_seller", "Seller commission");

  // Referrer
  if (split.referrer && split.referrer.amount) await credit(split.referrer.user_id, split.referrer.amount, bookingId, "referral", "Referral commission");

  // Manager
  if (split.manager && split.manager.amount) await credit(split.manager.user_id, split.manager.amount, bookingId, "manager", "Manager commission");

  // System residual (optional): book to system account
  if (split.system_residual > 0) await credit(SYSTEM_ACCOUNT_ID, split.system_residual, bookingId, "system", "Residual");
}

async function credit(userId: ID, amount: number, bookingId: ID, type: string, note: string) {
  if (amount <= 0) return;
  await db.walletTx.insert({ user_id: userId, booking_id: bookingId, type, amount, note });
  await db.wallet.increment(userId, amount);
}
```

---

## 4) Example (matches your screenshot logic)

Rank 1: `seller=0.85`, `referrer=0.10`, `manager=0.05`  
Product: `price=10,000,000`, `commission_pct=0.10`, `qty=1` → `C0=1,000,000`  
Provider wants `provider_pct=0.30` → `C_provider=300,000`, `C_remain=700,000`

Split:
- Seller: `700,000 * 0.85 = 595,000`
- Referrer: `700,000 * 0.10 = 70,000` (only if referrer exists)
- Manager: `700,000 * 0.05 = 35,000` (only if manager exists)
- System residual: `0`

---

## 5) Edge Cases

- Missing referrer/manager ⇒ their shares become 0 (no redistribution unless you want to).
- Rank percentages sum > 1 ⇒ normalize (avoid over-allocation).
- Rounding differences ⇒ book remainder to `system_residual` to keep accounting exact.
- Booking canceled/pending ⇒ do **not** post to wallets.
- provider_pct can be 0 ⇒ all commission goes to rank split.
- commission_pct can be 0 ⇒ no commission to split.

---

## 6) Mobile App Hooks (RN/Flutter)

- Show computed preview once user selects product & qty:
  - Call `/commission/preview?bookingId=...` (server uses the same function).
  - Render cards: Provider / Seller / Referrer / Manager / Residual.
- Wallet screen reads from `wallet_tx` table; balance is sum(tx).

---

## 7) Minimal API (suggestion)

```
GET  /commission/preview/:bookingId
POST /bookings/:id/status { status }  // triggers wallet postings if completed
GET  /wallets/:userId/tx
```

---

**Done.** Reuse this markdown verbatim in your prompt to AI coding tools.
