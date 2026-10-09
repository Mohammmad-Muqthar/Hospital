import {
  CalendarDays,
  CircleCheck,
  Clock,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Presentation,
  Users,
} from 'lucide-react'
import { MOCK_ACTIVITIES, MOCK_CALENDAR, MOCK_PARTNERS, MOCK_SUPPORT } from '../../../../../data/mock/mockFeatures'
import { Accent, Avatar, Chip, UiBar } from './primitives'

/* Marketing Calendar — month grid with marked occasions and an upcoming list. */
export function CalendarArt() {
  const { weekdays, startOffset, days, today, marks, events, month } = MOCK_CALENDAR
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i - startOffset + 1
    return day >= 1 && day <= days ? day : null
  })
  return (
    <div className="feat-ui feat-ui--calendar">
      <UiBar icon={CalendarDays} title={month} />
      <div className="feat-ui-cal">
        <div className="feat-ui-cal__grid">
          {weekdays.map((d, i) => (
            <span key={`wd-${i}`} className="feat-ui-cal__wd">
              {d}
            </span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={`e-${i}`} className="feat-ui-cal__day feat-ui-cal__day--empty" />
            const mark = marks[day]
            const cls = [
              'feat-ui-cal__day',
              mark ? `feat-ui-cal__day--${mark}` : '',
              day === today ? 'feat-ui-cal__day--today' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <span key={day} className={cls}>
                <span className="feat-ui-cal__num t-tabular">{day}</span>
                {mark ? <span className="feat-ui-cal__mark" /> : null}
              </span>
            )
          })}
        </div>
        <ul className="feat-ui-cal__events">
          {events.map((ev, i) => {
            const body = (
              <>
                <span className={`feat-ui-cal__date feat-ui-cal__date--${ev.id}`}>
                  <b className="t-tabular">{ev.day}</b>
                  {ev.month}
                </span>
                <span className="feat-ui-stack">
                  <strong className="feat-ui-strong">{ev.title}</strong>
                  <span className="feat-ui-muted">{ev.kind}</span>
                </span>
              </>
            )
            return (
              <li key={ev.id}>
                {i === events.length - 1 ? (
                  <Accent as="div" className="feat-ui-cal__event feat-ui-cal__event--key">
                    {body}
                  </Accent>
                ) : (
                  <div className="feat-ui-cal__event">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/* Channel Partners — affiliate / referrer markers with deal type and agreement status. */
export function PartnersArt() {
  return (
    <div className="feat-ui feat-ui--partners">
      {MOCK_PARTNERS.partners.map((p, i) => {
        const signed = p.agreement === 'Signed'
        const body = (
          <>
            <Avatar initials={p.initials} tone={i === 0 ? 'ink' : 'soft'} square />
            <span className="feat-ui-stack feat-ui-partner__text">
              <strong className="feat-ui-strong feat-ui-ellipsis">{p.name}</strong>
              <span className="feat-ui-muted feat-ui-ellipsis">{p.deal}</span>
            </span>
            <span className="feat-ui-partner__end">
              <Chip>{p.type}</Chip>
              <span className={`feat-ui-partner__status${signed ? ' is-signed' : ''}`}>
                {signed ? <CircleCheck size={12} strokeWidth={2.2} /> : <Clock size={12} strokeWidth={2.2} />}
                {p.agreement}
              </span>
            </span>
          </>
        )
        return i === 0 ? (
          <Accent key={p.name} as="div" className="feat-ui-partner">
            {body}
          </Accent>
        ) : (
          <div key={p.name} className="feat-ui-partner">
            {body}
          </div>
        )
      })}
    </div>
  )
}

const ACTIVITY_ICONS = { briefing: Presentation, meeting: Users, creative: Palette }

/* Client Activities — briefing / meeting / creative direction entries. */
export function ActivitiesArt() {
  return (
    <ul className="feat-ui feat-ui--activities">
      {MOCK_ACTIVITIES.items.map((item, i) => {
        const ItemIcon = ACTIVITY_ICONS[item.kind]
        const body = (
          <>
            <span className="feat-ui-activity__icon">
              <ItemIcon size={13} strokeWidth={2} />
            </span>
            <span className="feat-ui-stack feat-ui-activity__text">
              <span className="feat-ui-label">{item.label}</span>
              <strong className="feat-ui-strong feat-ui-ellipsis">{item.title}</strong>
            </span>
            <span className="feat-ui-muted t-tabular feat-ui-activity__meta">{item.meta}</span>
          </>
        )
        return (
          <li key={item.id} className="feat-ui-activity">
            {i === 0 ? (
              <Accent as="div" className="feat-ui-activity__inner">
                {body}
              </Accent>
            ) : (
              <div className="feat-ui-activity__inner">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

const CHANNEL_ICONS = { whatsapp: MessageCircle, call: Phone, email: Mail }

/* Customer Support — channel switcher with India · Qatar · Global routing. */
export function SupportArt() {
  const { channels, activeChannel, routeLabel, regions, activeRegion, queueLabel, tickets } = MOCK_SUPPORT
  return (
    <div className="feat-ui feat-ui--support">
      <UiBar title={MOCK_SUPPORT.title} />
      <div className="feat-ui-support">
        <div className="feat-ui-seg">
          {channels.map((c) => {
            const ChannelIcon = CHANNEL_ICONS[c.id]
            return (
              <span key={c.id} className={`feat-ui-seg__item${c.id === activeChannel ? ' is-active' : ''}`}>
                <ChannelIcon size={13} strokeWidth={2} />
                {c.label}
              </span>
            )
          })}
        </div>
        <div className="feat-ui-route">
          <span className="feat-ui-label">{routeLabel}</span>
          <span className="feat-ui-chips">
            {regions.map((r) =>
              r === activeRegion ? (
                <span key={r} className="feat-ui-chip feat-ui-chip--solid">
                  {r}
                </span>
              ) : (
                <Chip key={r}>{r}</Chip>
              ),
            )}
          </span>
        </div>
        <span className="feat-ui-label feat-ui-support__queue">{queueLabel}</span>
        <ul className="feat-ui-tickets">
          {tickets.map((t, i) => {
            const ChannelIcon = CHANNEL_ICONS[t.channel]
            const body = (
              <>
                <span className="feat-ui-ticket__icon">
                  <ChannelIcon size={13} strokeWidth={2} />
                </span>
                <span className="feat-ui-stack feat-ui-ticket__text">
                  <strong className="feat-ui-strong feat-ui-ellipsis">{t.subject}</strong>
                  <span className="feat-ui-muted t-tabular">{t.ref}</span>
                </span>
                <span className={`feat-ui-chip${t.region === activeRegion ? ' feat-ui-chip--emerald' : ''}`}>
                  {t.region}
                </span>
                <span className="feat-ui-muted t-tabular feat-ui-ticket__wait">{t.wait}</span>
              </>
            )
            return (
              <li key={t.ref} className="feat-ui-tickets__row">
                {i === 0 ? (
                  <Accent as="div" className="feat-ui-ticket">
                    {body}
                  </Accent>
                ) : (
                  <div className="feat-ui-ticket">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
