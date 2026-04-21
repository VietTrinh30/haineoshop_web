'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'

type Props = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export function QuantityStepper({ value, onChange, min = 1, max, disabled }: Props) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden h-10">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-full min-w-[36px] items-center justify-center px-2 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium select-none">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        className="flex h-full min-w-[36px] items-center justify-center px-2 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
