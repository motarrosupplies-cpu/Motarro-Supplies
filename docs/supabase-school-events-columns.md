# School events and Supabase column naming

Production uses **mixed** Postgres identifier styles (Prisma-era quoted camelCase plus snake_case migrations). This is intentional until a single migration renames everything.

## Non-destructive rule

- Do **not** change stored **image URLs** or storage paths — only the **column names** used in `.select()` / `.insert()` / `.update()` / `.eq()` must match Postgres.
- Prefer **explicit column lists** instead of `select('*')` for school event orders so keys are predictable.

## Orders, lines, add-ons (normalized in code)

| Table | Convention | Source of truth in app |
|-------|----------------|-------------------------|
| `school_event_orders` | snake_case + quoted `"invoiceId"`, `"invoiceEmailSent"` | `lib/supabase/schoolEventDb.ts` |
| `school_event_order_items` | snake_case | same |
| `school_event_order_item_addons` | snake_case | API routes already updated |

Use `normalizeSchoolEventOrderRow` / `normalizeSchoolEventOrderItemRow` after reads so TypeScript and JSON APIs stay **camelCase**.

## Event catalog (unchanged pattern)

| Table | Typical style in this project |
|-------|------------------------------|
| `school_events` | Quoted camelCase in selects: `"startDate"`, `"endDate"`, `"isActive"` |
| `event_products` | `eventId`, `isActive`, `basePrice`, `imageUrl`, … |
| `event_product_variants` | `productId`, `additionalPrice`, `isActive`, … |
| `event_product_additional_items` | Mixed; match the working admin routes |

## Shop (`orders`, `products`, …)

Many routes already use snake_case (`order_id`, `created_at`). Do not bulk-rename without auditing each table against `information_schema`.
