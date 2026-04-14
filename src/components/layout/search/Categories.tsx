import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import { CategoryItem } from './Categories.client'

async function CategoryList() {
  const payload = await getPayload({ config: configPromise })

  const categories = await payload.find({
    collection: 'categories',
    sort: 'title',
  })

  return (
    <div>
      <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.docs.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}

export function Categories() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className="mb-3 h-5 w-1/2 animate-pulse rounded bg-neutral-800 dark:bg-neutral-300" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-2 h-9 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"
            />
          ))}
        </div>
      }
    >
      <CategoryList />
    </Suspense>
  )
}
