# Backend/CMS Plan (Finalized To Your Scope)

## Objective

Update Payload CMS/backend so the new homepage UI can be fully data-driven with your exact constraints.

## Decisions Applied

- Product: no optional badge text field.
- Flash sale:
  - No CTA action.
  - Use the first active flash-sale event for homepage.
  - Countdown uses that event's `endsAt`.
  - No `maxItems`; support right/left navigation in UI layer.
  - No source mode field.
- Header/Footer: create one centralized `general` settings area in CMS for contact, address, social links.
- Blog: remove homepage blog data support.

## Workstream 1: Product Schema (Minimal Merchandising Only)

Update `/Users/viettrinh/Projects/outsources/daisy-flower-main/src/collections/Products/index.ts`

- Add only homepage merchandising flags/order metadata needed for section queries:
  - `isNewProduct` (boolean)
  - `isTopSelling` (boolean)
  - `newProductsOrder` (number)
  - `topSellingOrder` (number)
- Do not add badge text fields.

## Workstream 2: Flash Sale Data Contract

Update sale-home block/data behavior around:

- `/Users/viettrinh/Projects/outsources/daisy-flower-main/src/blocks/SaleOffer/config.ts`
- `/Users/viettrinh/Projects/outsources/daisy-flower-main/src/blocks/SaleOffer/Component.tsx`

Backend behavior:

- Query first active `sale-events` campaign (status/time-window aware).
- Resolve campaign items to product cards for homepage flash sale section.
- Provide countdown target = campaign `endsAt`.
- No CTA-specific fields in CMS.
- Keep per-item product links to product detail route.

## Workstream 3: Consolidated General Settings Global

Create a new global, e.g. `/Users/viettrinh/Projects/outsources/daisy-flower-main/src/globals/GeneralSettings.ts`

- Fields:
  - `contact` (phone, email)
  - `address` (line1/line2/city/country or simple textarea)
  - `socialLinks` array (platform + url)
- Register global in Payload config and expose to frontend fetch helpers.

Then align header/footer globals/components to consume centralized general data where needed.

## Workstream 4: Remove Homepage Blog CMS Support

- Remove `blogBento` from homepage seed composition and homepage layout usage for the new design flow.
- Keep block in codebase only if still needed on other pages; otherwise deprecate from homepage authoring path.

Target files:

- `/Users/viettrinh/Projects/outsources/daisy-flower-main/src/endpoints/seed/home.ts`
- `/Users/viettrinh/Projects/outsources/daisy-flower-main/src/collections/Pages/index.ts` (only if you want to prevent editors from adding blog block to homepage content model)

## Workstream 5: Seed/Data Alignment

Update seed data so fresh environment has:

- New product merchandising fields populated.
- At least one active `sale-events` campaign with multiple items.
- General settings populated with realistic contact/address/social links.
- Homepage layout without blog block.

## Workstream 6: Type/Schema Validation

After schema changes:

- Run Payload type generation.
- Regenerate import map if needed.
- Run `tsc --noEmit` to verify backend/CMS integrity.

## Deliverables

- CMS schema and globals aligned with your final homepage requirements.
- Flash sale backend data flow driven by first active campaign and countdown from campaign expiry.
- Homepage seed content updated with no blog section and centralized general settings.
