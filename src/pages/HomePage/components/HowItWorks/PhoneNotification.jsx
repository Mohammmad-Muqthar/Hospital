import { BadgeCheck, CalendarClock, ChartNoAxesColumnIncreasing, UserPlus } from 'lucide-react'

const STATUS_ICONS = {
  userPlus: UserPlus,
  calendarClock: CalendarClock,
  badgeCheck: BadgeCheck,
  chart: ChartNoAxesColumnIncreasing,
}

/** Simplified Trionix CRM app glyph for the mock-up (an emerald tile with a plus — not the official logo). */
export function AppGlyph({ className }) {
  return (
    <span className={className}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M8 4.2v7.6M4.2 8h7.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/**
 * One lock-screen notification inside the phone mock-up.
 * Purely presentational: the How It Works master timeline moves this element
 * (y / scale / opacity); nothing else animates it.
 */
export default function PhoneNotification({ notification, index, appName, timestamp }) {
  const StatusIcon = STATUS_ICONS[notification.icon] ?? UserPlus

  return (
    <div className={`how-notif how-notif--${notification.tone}`} data-notif={index}>
      <div className="how-notif__media">
        <span className="how-notif__status">
          <StatusIcon strokeWidth={1.85} aria-hidden="true" focusable="false" />
        </span>
        <AppGlyph className="how-notif__badge" />
      </div>
      <div className="how-notif__content">
        <p className="how-notif__meta">
          <span>{appName}</span>
          <span>{timestamp}</span>
        </p>
        <p className="how-notif__title">{notification.title}</p>
        <p className="how-notif__body">{notification.body}</p>
      </div>
    </div>
  )
}
