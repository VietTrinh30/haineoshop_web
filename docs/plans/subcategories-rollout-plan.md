# Subcategories Rollout Plan

## Overview

Two-phase rollout for subcategories:
- Phase 1 adds backend/CMS support with no storefront behavior changes.
- Phase 2 enables storefront filters and navigation when you are ready.

---

## Phase 1: Backend/CMS-Only (No Frontend Changes)

### Goal

- Introduce subcategories data model and editorial workflow in Payload admin.
- Preserve current frontend routes, queries, and rendering behavior.

### Files

- `/src/collections/Subcategories.ts` (new)
- `/src/collections/Products/index.ts`
- `/src/collections/Categories.ts`
- `/src/payload.config.ts`
- `/src/endpoints/seed/helpers.ts`
- `/src/endpoints/seed/index.ts`
- `/src/endpoints/seed/data/subcategories.ts` (new)
- `/src/payload-types.ts` (regenerated)

### Work Items

1. Create `subcategories` collection
   - `title` (required text)
   - `slug` (`slugField`)
   - `description` (optional textarea)
   - `image` (optional upload to `media`)
   - `category` (required relationship to `categories`, single parent)
   - Access/admin behavior aligned with `categories` (`adminOnly` for create/update/delete, public read).

2. Register collection in Payload config
   - Add `Subcategories` to `collections` in `/src/payload.config.ts`.

3. Add product-level link to subcategories
   - Add optional `subcategories` relationship to products (`hasMany: true`, `relationTo: 'subcategories'`).
   - Add `filterOptions` so selectable subcategories are restricted by selected product categories.

4. Add backend integrity validation
   - In products hook (`beforeValidate` or `beforeChange`), ensure each selected subcategory belongs to one of selected categories.
   - Reject invalid combinations with clear validation errors.

5. Improve admin visibility
   - Add a `join` field on categories to show related subcategories (`collection: 'subcategories'`, `on: 'category'`).

6. Update seed flow
   - Add subcategory seed data.
   - Seed subcategories after categories.
   - Assign sample products to subcategories while keeping existing category assignments.

7. Regenerate and verify
   - Regenerate `payload-types.ts`.
   - Run type/lint checks for touched files.

### Acceptance Criteria

- Admin can create/edit subcategories and assign exactly one parent category.
- Product editor can only pick subcategories that belong to selected product categories.
- Backend rejects mismatched category/subcategory assignments.
- Existing frontend behavior remains unchanged.
- Seed command still succeeds with new taxonomy data.

---

## Phase 2: Frontend Enablement (When Ready)

### Goal

- Expose subcategory navigation and filtering in storefront UI.
- Keep category-only links backward-compatible.

### Files

- `/src/app/(app)/shop/page.tsx`
- `/src/components/Header/index.tsx`
- `/src/components/Header/index.client.tsx`
- `/src/components/layout/search/Search.tsx`
- `/src/components/layout/search/Categories.tsx`
- `/src/components/layout/search/Categories.client.tsx`
- Optional:
  - `/src/blocks/ProductListing/config.ts`
  - `/src/blocks/ProductListing/Component.tsx`

### Work Items

1. Extend shop filtering
   - Add support for `subcategory` query param.
   - Filter by `products.subcategories` while keeping current `category` and `q` behavior.

2. Update search and category controls
   - Show subcategories scoped to selected category.
   - Clear stale subcategory when category changes.
   - Keep URL params as source of truth.

3. Update header category UX
   - Support hierarchical category -> subcategory navigation.
   - Route to `/shop?category={id}&subcategory={id}` for subcategory clicks.

4. Optional ProductListing block support
   - Add `subcategories` selector in tab config.
   - Update block query logic to apply subcategory filters.
   - Keep existing category-only tabs fully functional.

### Acceptance Criteria

- Users can filter/browse by subcategory.
- Category-only flows continue to work.
- UI stays in sync with URL params.
- Existing CMS block content does not require migration.

---

## Execution Order

1. Execute Phase 1 and deploy.
2. Execute Phase 2 in a separate release when storefront updates are approved.
