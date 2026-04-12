'use client'

import { cn } from '@/utilities/cn'
import React, { useEffect, useState } from 'react'

export type FlashSaleTimerProps = {
  endDate: string | Date
  className?: string
}

interface FlashTimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const segmentClass =
  'rounded bg-primary px-2 py-1 text-sm font-bold ' +
  'text-primary-foreground tabular-nums min-w-[2ch] text-center'

/**
 * Flash-sale style countdown: primary-filled segments for days, hours, minutes,
 * and seconds until endDate (same expiry copy as CountdownTimer).
 */
export const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({
  endDate,
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState<FlashTimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const tick = () => {
      const difference = +new Date(endDate) - +new Date()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((difference / (1000 * 60)) % 60)
        const seconds = Math.floor((difference / 1000) % 60)
        setTimeLeft({ days, hours, minutes, seconds })
        setIsExpired(false)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsExpired(true)
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (isExpired) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        Sale ended
      </div>
    )
  }

  const d =
    timeLeft.days < 100 ? pad2(timeLeft.days) : String(timeLeft.days)

  const ariaLabel =
    `${timeLeft.days} days, ${timeLeft.hours} hours, ` +
    `${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="timer"
      aria-label={ariaLabel}
    >
      <span className={segmentClass} aria-hidden>
        {d}
      </span>
      <span className="font-bold text-primary" aria-hidden>
        :
      </span>
      <span className={segmentClass} aria-hidden>
        {pad2(timeLeft.hours)}
      </span>
      <span className="font-bold text-primary" aria-hidden>
        :
      </span>
      <span className={segmentClass} aria-hidden>
        {pad2(timeLeft.minutes)}
      </span>
      <span className="font-bold text-primary" aria-hidden>
        :
      </span>
      <span className={segmentClass} aria-hidden>
        {pad2(timeLeft.seconds)}
      </span>
    </div>
  )
}
