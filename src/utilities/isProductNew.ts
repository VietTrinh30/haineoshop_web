import type { Payload, PayloadRequest } from 'payload'

import { DEFAULT_NEW_PRODUCT_DAYS } from '@/globals/GeneralSettings'

type IsProductNewArgs = {
  createdAt: Date | string
  newProductDays: number
  now?: Date
}

type GetNewProductDaysSettingArgs = {
  payload: Payload
  req?: PayloadRequest
}

type IsProductNewBySettingsArgs = {
  payload: Payload
  createdAt: Date | string
  now?: Date
  req?: PayloadRequest
}

export function isProductNew({ createdAt, newProductDays, now = new Date() }: IsProductNewArgs): boolean {
  const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt)
  if (Number.isNaN(createdAtDate.getTime())) return false

  const thresholdInMs = newProductDays * 24 * 60 * 60 * 1000
  return now.getTime() - createdAtDate.getTime() < thresholdInMs
}

export async function getNewProductDaysSetting({
  payload,
  req,
}: GetNewProductDaysSettingArgs): Promise<number> {
  try {
    const settings = await payload.findGlobal({
      slug: 'general-settings',
      depth: 0,
      ...(req ? { req } : {}),
    })

    const days = settings?.newProductDays
    if (typeof days === 'number' && Number.isInteger(days) && days > 0) {
      return days
    }
  } catch {
    // Fall back to default when settings are unavailable.
  }

  return DEFAULT_NEW_PRODUCT_DAYS
}

export async function isProductNewBySettings({
  payload,
  createdAt,
  now,
  req,
}: IsProductNewBySettingsArgs): Promise<boolean> {
  const newProductDays = await getNewProductDaysSetting({ payload, req })
  return isProductNew({ createdAt, newProductDays, now })
}
