import { MapPin, MessageCircle, Phone } from 'lucide-react'
import { EXECUTIVE_VIEW, ROLE_SESSIONS } from '../../../../../data/mock/mockRoles'
import { LEAD_STATUS } from '../../../../../data/mock/mockLeads'
import { Avatar, Card, Meter, Tag } from './parts'

const TYPE_ICON = { call: Phone, whatsapp: MessageCircle, visit: MapPin }
const TYPE_LABEL = { call: 'Call', whatsapp: 'WhatsApp', visit: 'Visit' }

function FollowUps({ limit, compact }) {
  const { followups } = EXECUTIVE_VIEW
  const items = limit ? followups.items.slice(0, limit) : followups.items
  // The compact (phone) window drops the type word — the icon carries it —
  // so the detail fits beside the due time without truncation.
  return (
    <Card title={followups.title} meta={`${followups.items.length} due today`} depth={1} area="follow" className="rw-follow">
      <div className="rw-follow__list">
        {items.map((f) => {
          const TypeIcon = TYPE_ICON[f.type]
          return (
            <div className={`rw-follow__item${f.overdue ? ' is-overdue' : ''}`} key={f.id}>
              <span className={`rw-follow__icon rw-follow__icon--${f.type}`}>
                <TypeIcon size={14} strokeWidth={1.9} />
              </span>
              <span className="rw-follow__text">
                <span className="rw-follow__lead">{f.lead}</span>
                <span className="rw-follow__detail">{compact ? f.detail : `${TYPE_LABEL[f.type]} · ${f.detail}`}</span>
              </span>
              {f.overdue ? (
                <Tag tone="danger">Overdue · {f.due}</Tag>
              ) : (
                <span className="rw-num rw-follow__due">{f.due}</span>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Activity() {
  const { activities } = EXECUTIVE_VIEW
  return (
    <div className="rw-mod rw-card rw-activity" data-depth="2" style={{ '--a': 'act' }}>
      <span className="rw-activity__title">
        <span className="rw-card__title">{activities.title}</span>
        <span className="rw-card__meta">Good morning, {ROLE_SESSIONS['sales-executive'].user.name.split(' ')[0]}</span>
      </span>
      <span className="rw-activity__meters">
        {activities.items.map((a) => (
          <span className="rw-activity__meter" key={a.label}>
            <span className="rw-activity__row">
              <span>{a.label}</span>
              <span className="rw-num">
                {a.done}
                <span className="rw-dim">/{a.target}</span>
              </span>
            </span>
            <Meter value={a.done / a.target} />
          </span>
        ))}
      </span>
    </div>
  )
}

export default function ExecutiveView({ variant }) {
  const { leads, opportunities } = EXECUTIVE_VIEW

  if (variant === 'compact') {
    return (
      <div className="rw-grid rw-grid--exec-c">
        <Activity />
        <FollowUps limit={3} compact />
      </div>
    )
  }

  return (
    <div className="rw-grid rw-grid--exec">
      <Activity />
      <FollowUps />

      <Card title={leads.title} meta={leads.meta} depth={2} area="leads">
        <div className="rw-leads">
          {leads.items.map((l) => (
            <div className="rw-lead" key={l.id}>
              <span className="rw-person">
                <Avatar initials={l.initials} size="sm" tone="soft" />
                <span className="rw-person__text">
                  <span className="rw-person__name">{l.name}</span>
                  <span className="rw-person__sub">{l.department}</span>
                </span>
              </span>
              <Tag tone={LEAD_STATUS[l.status].tone}>{LEAD_STATUS[l.status].label}</Tag>
            </div>
          ))}
        </div>
      </Card>

      <Card title={opportunities.title} depth={3} area="opps">
        <div className="rw-opps">
          {opportunities.items.map((o) => (
            <div className="rw-opp" key={o.id}>
              <span className="rw-opp__row">
                <span className="rw-opp__name">{o.name}</span>
                <span className="rw-num rw-opp__value">{o.value}</span>
              </span>
              <span className="rw-opp__row">
                <span className="rw-opp__stage">{o.stage}</span>
                <Meter value={o.progress} tone="soft" />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
