import type { CollectionAfterChangeHook } from 'payload'

import type { Product, Variant } from '@/payload-types'

export const generateVariants: CollectionAfterChangeHook<Product> = async ({
  doc,
  req,
  previousDoc,
  operation,
}) => {
  // If variants are disabled or no type definitions exist, delete all variants
  if (!doc.enableVariants || !doc.variantTypeDefs || doc.variantTypeDefs.length === 0) {
    const existingVariants = await req.payload.find({
      collection: 'variants',
      where: {
        product: { equals: doc.id },
      },
      limit: 1000,
      req,
    })

    if (existingVariants.docs.length > 0) {
      await Promise.all(
        existingVariants.docs.map((variant) =>
          req.payload.delete({
            collection: 'variants',
            id: variant.id,
            req,
          }),
        ),
      )
    }
    return doc
  }

  // Calculate cartesian product of all variant options
  const typeDefs = doc.variantTypeDefs
  const optionCombinations: { typeId: string; optionId: string; label: string }[][] = []

  const helper = (arr: { typeId: string; optionId: string; label: string }[], i: number) => {
    if (i === typeDefs.length) {
      optionCombinations.push([...arr])
      return
    }

    const currentType = typeDefs[i]
    if (!currentType.options || currentType.options.length === 0) {
      // If a type has no options, we skip it
      helper(arr, i + 1)
      return
    }

    for (const option of currentType.options) {
      arr.push({
        typeId: currentType.id!,
        optionId: option.id!,
        label: option.label,
      })
      helper(arr, i + 1)
      arr.pop()
    }
  }

  helper([], 0)

  // Fetch existing variants
  const existingVariantsResult = await req.payload.find({
    collection: 'variants',
    where: {
      product: { equals: doc.id },
    },
    limit: 1000,
    req,
  })
  const existingVariants = existingVariantsResult.docs

  // Process variants
  const remainingExistingIds = new Set(existingVariants.map((v) => v.id))

  for (const combo of optionCombinations) {
    const title = combo.map((c) => c.label).join(' / ')
    const optionsJson = combo.map((c) => ({ typeId: c.typeId, optionId: c.optionId, label: c.label }))

    // Find if a variant with these exact options already exists
    const existingMatch = existingVariants.find((v) => {
      const vOptions = Array.isArray(v.options) ? v.options : []
      if (vOptions.length !== optionsJson.length) return false

      // Check if every option in combo exists in vOptions
      return optionsJson.every((opt) =>
        vOptions.some((vo: any) => vo.typeId === opt.typeId && vo.optionId === opt.optionId),
      )
    })

    if (existingMatch) {
      // Update title if it changed, keep price/inventory
      remainingExistingIds.delete(existingMatch.id)

      if (existingMatch.title !== title) {
        await req.payload.update({
          collection: 'variants',
          id: existingMatch.id,
          data: {
            title,
          },
          req,
        })
      }
    } else {
      // Create new variant
      await req.payload.create({
        collection: 'variants',
        data: {
          product: doc.id,
          title,
          options: optionsJson,
          inventory: 0,
          priceInVNDEnabled: true,
          priceInVND: doc.priceInVND || 0,
          _status: doc._status,
        } as any, // Type cast to any because options field is changing to json and might complain
        req,
      })
    }
  }

  // Delete orphaned variants
  for (const orphanId of remainingExistingIds) {
    await req.payload.delete({
      collection: 'variants',
      id: orphanId,
      req,
    })
  }

  return doc
}
