import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Ellipsis,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  PhoneOutgoing,
  TriangleAlert,
  UserRound,
  Users,
} from 'lucide-react'
import { MOCK_CALL, MOCK_FOLLOWUPS, MOCK_LEAD, MOCK_PIPELINE, SAMPLE_TAG } from '../../../../../data/mock/mockFeatures'
import { Accent, Avatar, Chip, ScoreMeter, UiBar } from './primitives'

/* Lead Management — lead record with status / score / source and a duplicate hint. */
export function LeadArt() {
  const { record, fields, duplicate, queue } = MOCK_LEAD
  return (
    <div className="feat-ui feat-ui--lead">
      <UiBar icon={UserRound} title={MOCK_LEAD.title} actions={<Ellipsis size={14} />} />
      <div className="feat-ui-lead">
        <div className="feat-ui-lead__id">
          <Avatar initials={record.initials} tone="ink" square />
          <span className="feat-ui-stack">
            <strong className="feat-ui-strong">{record.name}</strong>
            <span className="feat-ui-muted">{record.context}</span>
          </span>
        </div>
        <div className="feat-ui-chips">
          <Chip tone="emerald" dot>
            {record.status}
          </Chip>
          <Chip>
            <ScoreMeter value={record.score} />
            Score <b className="t-tabular">{record.score}</b>
          </Chip>
          <Chip icon={Globe}>{record.source}</Chip>
        </div>
        <div className="feat-ui-fields">
          {fields.map((f) => (
            <span key={f.label} className="feat-ui-field">
              <span className="feat-ui-label">{f.label}</span>
              <span className="feat-ui-field__value">
                {f.avatar ? <Avatar initials={f.avatar} /> : null}
                {f.value}
              </span>
            </span>
          ))}
        </div>
        <Accent as="div" className="feat-ui-dup">
          <span className="feat-ui-dup__icon">
            <TriangleAlert size={14} strokeWidth={2} />
          </span>
          <span className="feat-ui-stack">
            <strong className="feat-ui-strong">{duplicate.title}</strong>
            <span className="feat-ui-muted">{duplicate.detail}</span>
          </span>
          <span className="feat-ui-btn">{duplicate.action}</span>
        </Accent>
      </div>
      <ul className="feat-ui-queue">
        {queue.map((lead) => (
          <li key={lead.name} className="feat-ui-queue__row">
            <Avatar initials={lead.initials} tone="soft" square />
            <span className="feat-ui-strong feat-ui-queue__name">{lead.name}</span>
            <span className="feat-ui-muted feat-ui-queue__source">{lead.source}</span>
            <span className="feat-ui-queue__score t-tabular">{lead.score}</span>
            <Chip>{lead.status}</Chip>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Cold Calling — current call with outcome chips and the scheduled next step. */
export function CallArt() {
  const { contact, outcomes, activeOutcome, next } = MOCK_CALL
  return (
    <div className="feat-ui feat-ui--call">
      <div className="feat-ui-call__head">
        <span className="feat-ui-call__phone">
          <PhoneOutgoing size={14} strokeWidth={2} />
        </span>
        <span className="feat-ui-stack">
          <strong className="feat-ui-strong">{contact.name}</strong>
          <span className="feat-ui-muted feat-ui-call__meta">{contact.meta}</span>
        </span>
        <span className="feat-ui-call__time t-tabular">{contact.duration}</span>
      </div>
      <div className="feat-ui-chips feat-ui-call__outcomes">
        {outcomes.map((label, i) =>
          i === activeOutcome ? (
            <Accent key={label} className="feat-ui-chip feat-ui-chip--solid">
              <Check size={12} strokeWidth={2.4} />
              {label}
            </Accent>
          ) : (
            <Chip key={label}>{label}</Chip>
          ),
        )}
      </div>
      <div className="feat-ui-next">
        <span className="feat-ui-label">{next.label}</span>
        <span className="feat-ui-next__value">
          {next.value}
          <ArrowRight size={12} strokeWidth={2} />
        </span>
      </div>
    </div>
  )
}

/* Deal Pipeline — compact Kanban, New → Won, with value chips and a stale flag. */
export function PipelineArt() {
  return (
    <div className="feat-ui feat-ui--pipeline">
      <UiBar title={MOCK_PIPELINE.title} meta={MOCK_PIPELINE.meta} tag={SAMPLE_TAG} />
      <div className="feat-ui-kanban">
        {MOCK_PIPELINE.columns.map((col) => (
          <div key={col.id} className={`feat-ui-col${col.won ? ' feat-ui-col--won' : ''}`}>
            <div className="feat-ui-col__head">
              <span className="feat-ui-col__label">
                {col.won ? <Check size={12} strokeWidth={2.4} /> : null}
                {col.label}
              </span>
              <span className="feat-ui-col__count t-tabular">{col.deals.length}</span>
            </div>
            {col.deals.map((deal) => {
              const card = (
                <>
                  <span className="feat-ui-strong feat-ui-deal__name">{deal.name}</span>
                  <span className="feat-ui-deal__meta">
                    <span className="feat-ui-deal__value t-tabular">{deal.value}</span>
                    {deal.stale ? (
                      <Chip tone="amber" icon={Clock} className="feat-ui-deal__flag">
                        {deal.stale}
                      </Chip>
                    ) : (
                      <span className="feat-ui-muted t-tabular feat-ui-deal__close">{deal.close}</span>
                    )}
                  </span>
                </>
              )
              return col.won ? (
                <Accent key={deal.name} as="div" className="feat-ui-deal feat-ui-deal--won">
                  {card}
                </Accent>
              ) : (
                <div key={deal.name} className={`feat-ui-deal${deal.stale ? ' feat-ui-deal--stale' : ''}`}>
                  {card}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {/* Compact form for short stages: the same stages as a single flow strip. */}
      <div className="feat-ui-stages">
        {MOCK_PIPELINE.columns.map((col, i) => (
          <span key={col.id} className="feat-ui-stages__step">
            {i > 0 ? <ChevronRight size={12} strokeWidth={2} className="feat-ui-stages__arrow" /> : null}
            <span className={`feat-ui-chip${col.won ? ' feat-ui-chip--emerald' : ''}`}>
              {col.label}
              <b className="t-tabular">{col.deals.length}</b>
            </span>
          </span>
        ))}
        <Chip tone="amber" icon={Clock}>
          {MOCK_PIPELINE.staleSummary}
        </Chip>
      </div>
    </div>
  )
}

const FOLLOW_ICONS = { call: Phone, whatsapp: MessageCircle, visit: MapPin, meeting: Users }

/* Follow-Ups & Reminders — today's schedule with an overdue item first. */
export function FollowUpsArt() {
  return (
    <div className="feat-ui feat-ui--follow">
      <UiBar icon={Clock} title={MOCK_FOLLOWUPS.title} />
      <ul className="feat-ui-follow">
        {MOCK_FOLLOWUPS.items.map((item) => {
          const ItemIcon = FOLLOW_ICONS[item.id]
          const row = (
            <>
              <span className="feat-ui-follow__icon">
                <ItemIcon size={13} strokeWidth={2} />
              </span>
              <span className="feat-ui-follow__text">
                <strong className="feat-ui-strong feat-ui-follow__kind">{item.kind}</strong>
                <span className="feat-ui-muted feat-ui-follow__name">{item.name}</span>
              </span>
              {item.overdue ? (
                <span className="feat-ui-chip feat-ui-chip--danger feat-ui-follow__end">
                  {MOCK_FOLLOWUPS.overdueLabel}
                </span>
              ) : (
                <span className="feat-ui-follow__time feat-ui-follow__end t-tabular">{item.time}</span>
              )}
            </>
          )
          return item.overdue ? (
            <li key={item.id} className="feat-ui-follow__row feat-ui-follow__row--overdue">
              <Accent as="div" className="feat-ui-follow__inner">
                {row}
              </Accent>
            </li>
          ) : (
            <li key={item.id} className="feat-ui-follow__row">
              <div className="feat-ui-follow__inner">{row}</div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
