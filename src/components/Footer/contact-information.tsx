import type { Footer } from '@/payload-types'

export type ContactInformationProps = {
  location?: string | null
  contactNumber?: string | null
  email?: string | null
  openingHours?: Footer['openingHours']
}

const FALLBACK_OPENING_HOURS: { id?: string; day: string; hours: string }[] = [
  { day: 'Mon - Fri:', hours: '9:00 AM - 6:00 PM' },
  { day: 'Saturday:', hours: '10:00 AM - 5:00 PM' },
  { day: 'Sunday:', hours: 'Closed' },
]

function ContactSvgIcon({
  name,
}: {
  name: 'location_on' | 'call' | 'mail' | 'schedule'
}) {
  const className = 'text-primary text-lg leading-none shrink-0'
  const shared = {
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    width: '1em',
    height: '1em',
    viewBox: '0 -960 960 960',
    fill: 'currentColor',
    'aria-hidden': true,
  } as const

  if (name === 'location_on') {
    return (
      <svg {...shared}>
        <path d="M536.5-503.5Q560-527 560-560t-23.5-56.5Q513-640 480-640t-56.5 23.5Q400-593 400-560t23.5 56.5Q447-480 480-480t56.5-23.5ZM480-186q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
      </svg>
    )
  }

  if (name === 'call') {
    return (
      <svg {...shared}>
        <path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" />
      </svg>
    )
  }

  if (name === 'mail') {
    return (
      <svg {...shared}>
        <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
      </svg>
    )
  }

  return (
    <svg {...shared}>
      <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
    </svg>
  )
}

export function ContactInformation({
  location,
  contactNumber,
  email,
  openingHours,
}: ContactInformationProps) {
  const hoursRows =
    openingHours && openingHours.length > 0 ? openingHours : FALLBACK_OPENING_HOURS

  const hasLocation = Boolean(location?.trim())
  const hasPhone = Boolean(contactNumber?.trim())
  const hasEmail = Boolean(email?.trim())

  return (
    <div>
      <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">
        Contact Information
      </h4>
      <ul className="space-y-4 text-sm text-slate-500">
        {hasLocation ? (
          <li className="flex items-start gap-3">
            <ContactSvgIcon name="location_on" />
            <span className="whitespace-pre-line">{location}</span>
          </li>
        ) : null}
        {hasPhone ? (
          <li className="flex items-center gap-3">
            <ContactSvgIcon name="call" />
            <span>{contactNumber}</span>
          </li>
        ) : null}
        {hasEmail ? (
          <li className="flex items-center gap-3">
            <ContactSvgIcon name="mail" />
            <span className="break-all">{email}</span>
          </li>
        ) : null}
        <li className="flex items-start gap-3">
          <ContactSvgIcon name="schedule" />
          <div>
            <span className="block font-semibold">Opening Hours</span>
            <div className="mt-1">
              {hoursRows.map((item, i) => (
                <span key={item.id ?? `hours-${i}`} className="block">
                  {item.day} {item.hours}
                </span>
              ))}
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}
