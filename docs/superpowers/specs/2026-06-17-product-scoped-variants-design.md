# Product-Scoped Variants Design Spec

## Problem

The current variant system uses **global collections** (`variantTypes`, `variantOptions`) managed by `@payloadcms/plugin-ecommerce`. All products share the same pool of variant types and options. Each product needs its **own independent** variant types and options.

## Approach: Inline Types/Options + Keep Variants Collection

Embed variant type and option definitions as inline arrays on the Product document. Keep the `variants` collection as separate documents (needed for cart/order references). Auto-generate variant combinations via hooks.

### What changes

| Before | After |
|---|---|
| `variantTypes` = global collection | Inline `variantTypeDefs` array on Product |
| `variantOptions` = global collection | Nested `options` array inside each type def |
| Product `variantTypes` = relationship field | Product `variantTypeDefs` = array field |
| Gallery `variantOption` = relationship | Gallery `variantOptionId` = text field |
| Variant `options` = relationship → variantOptions | Variant `options` = json `[{typeId, optionId}]` |

### What stays the same

- `variants` collection (separate docs with price, inventory, product ref)
- Cart/Order items reference variants by ID
- `enableVariants` checkbox on Product
- `variants` join field on Product (join by `product`)

---

## Data Model

### Product — New `variantTypeDefs` field

Replaces the `variantTypes: relationship → variantTypes` field.

```typescript
{
  name: 'variantTypeDefs',
  type: 'array',
  label: 'Variant Types',
  admin: {
    condition: ({ enableVariants }) => Boolean(enableVariants),
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      // e.g. "loại", "size", "color"
    },
    {
      name: 'options',
      type: 'array',
      label: 'Options',
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          // e.g. "DAY - Có màu", "M", "L"
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          // Optional. Typically used for first type's options
          // (e.g. product image per "loại" option)
        },
      ],
    },
  ],
}
```

Each array row auto-generates a string `id` by Payload. These IDs are used to link variants and gallery items.

### Gallery — Change `variantOption` to `variantOptionId`

```typescript
// Before
{ name: 'variantOption', type: 'relationship', relationTo: 'variantOptions' }

// After
{
  name: 'variantOptionId',
  type: 'text',
  label: 'Variant Option',
  // Stores the auto-generated id of an option from variantTypeDefs[0].options
  // Used to filter gallery images by selected variant option
  admin: {
    condition: (data) =>
      data?.enableVariants === true && data?.variantTypeDefs?.length > 0,
  },
}
```

### Variant Collection — Change `options` field

```typescript
// Before
{ name: 'options', type: 'relationship', relationTo: 'variantOptions', hasMany: true }

// After
{
  name: 'options',
  type: 'json',
  required: true,
  // Stored as: [{ typeId: "abc", optionId: "xyz" }, ...]
  // Each entry maps to a variantTypeDef and one of its options
}
```

Variant docs keep: `title`, `product`, `options` (json), `inventory`, `priceInVND`, `priceInVNDEnabled`.

### Collections Removed

- `variantTypes` — replaced by inline array
- `variantOptions` — replaced by nested inline array

---

## Auto-Generation Logic

### Hook: Product `afterChange`

When a product is saved with `enableVariants = true`:

1. **Read** `variantTypeDefs` from saved product data
2. **Compute** cartesian product of all options across all types
3. **Query** existing variants for this product
4. **Diff**:
   - Match existing variants by their `options` JSON (sorted by typeId for consistent comparison)
   - **Keep** variants that still match a valid combination (preserve price/inventory)
   - **Create** new variants for combinations that don't have a matching variant
   - **Delete** variants whose combination no longer exists
5. **Auto-title** each variant: join option labels with " / " (e.g. "DAY - Có màu / M")

### When `enableVariants` toggled off

Delete all variants for this product.

### When `variantTypeDefs` is empty

Delete all variants for this product.

### Example

```
Types: [
  { id: "t1", label: "loại", options: [
    { id: "o1", label: "DAY - Có màu", image: media_123 },
    { id: "o2", label: "NIGHT - Ko màu", image: media_456 }
  ]},
  { id: "t2", label: "size", options: [
    { id: "o3", label: "M" },
    { id: "o4", label: "L" }
  ]}
]

Cartesian product → 4 variant docs:
1. options: [{typeId:"t1", optionId:"o1"}, {typeId:"t2", optionId:"o3"}] → "DAY - Có màu / M"
2. options: [{typeId:"t1", optionId:"o1"}, {typeId:"t2", optionId:"o4"}] → "DAY - Có màu / L"
3. options: [{typeId:"t1", optionId:"o2"}, {typeId:"t2", optionId:"o3"}] → "NIGHT - Ko màu / M"
4. options: [{typeId:"t1", optionId:"o2"}, {typeId:"t2", optionId:"o4"}] → "NIGHT - Ko màu / L"
```

---

## Grouping & Images

Variants are grouped by the **first variant type's option** for display purposes:

- `variant.options[0].optionId` → look up in `product.variantTypeDefs[0].options`
- The matching option's `image` field provides the group image
- Frontend/admin can group and display variants accordingly

---

## Plugin Configuration Changes

### `ecommercePlugin` config in `src/plugins/index.ts`

The `products.variants` option needs a `variantsCollectionOverride` to:
- Change `options` field from relationship to json
- Replace the `validateOptions` hook
- Replace the `beforeChange` hook (auto-title generation)

The `variantTypesCollectionOverride` and `variantOptionsCollectionOverride` are not needed — we disable/ignore those collections entirely. If the plugin requires them to exist, we keep them as empty shells with `admin: { hidden: true }`.

### Product collection override in `src/collections/Products/index.ts`

- Remove `variantTypes` from `defaultPopulate`
- Add `variantTypeDefs` to `defaultPopulate`
- Replace the `variantTypes` relationship field usage with new inline field
- Add auto-generation hook

---

## Frontend Changes

### `VariantSelector.tsx`

- Read `product.variantTypeDefs` instead of `product.variantTypes`
- Each type def has inline options — no need to traverse joins
- URL params: use option `id` (string) as param value
- Match variants by comparing `variant.options` json with selected option IDs

### `Gallery.tsx`

- Match `item.variantOptionId` (text) against search params instead of `item.variantOption` (relationship)
- Simple string comparison instead of object/ID extraction

### `ProductItem/index.tsx`, `CartModal.tsx`, `CheckoutPage.tsx`

- Same pattern: gallery image matching changes from relationship to text field comparison
- Variant option label display: look up from product's `variantTypeDefs` using `typeId`/`optionId`

---

## Seed Data Changes

### `src/endpoints/seed/index.ts`

- Remove creation of `variantTypes` and `variantOptions` documents
- Define types/options inline when creating the product
- Variant creation uses json options format instead of relationship IDs

### `src/endpoints/seed/helpers.ts`

- Remove `variantTypes` and `variantOptions` from `SeedContext`

### `src/endpoints/seed/reset.ts`

- Remove `variantTypes` and `variantOptions` from deletion list
