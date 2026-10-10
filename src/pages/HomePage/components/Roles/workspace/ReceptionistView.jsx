import { Check, ChevronDown, PhoneIncoming, UserPlus } from 'lucide-react'
import { RECEPTIONIST_VIEW } from '../../../../../data/mock/mockRoles'
import { Card, Tag } from './parts'

const SOURCE_TONE = { 'Walk-in': 'mint', Call: 'neutral', Campaign: 'amber' }

function CaptureForm() {
  const { tabs, fields, saveLabel } = RECEPTIONIST_VIEW
  return (
    <Card depth={1} area="form" className="rw-form">
      <div className="rw-seg rw-seg--tabs">
        {tabs.map((t, i) => (
          <span className={`rw-seg__item${i === 0 ? ' is-active' : ''}`} key={t}>
            {i === 0 ? <UserPlus size={13} strokeWidth={1.9} /> : <PhoneIncoming size={13} strokeWidth={1.9} />}
            {t}
          </span>
        ))}
      </div>

      <div className="rw-field">
        <span className="rw-field__label">{fields.name.label}</span>
        <span className="rw-input is-focused">
          <span className="rw-caret" />
          <span className="rw-placeholder">{fields.name.placeholder}</span>
        </span>
      </div>

      <div className="rw-form__pair">
        <div className="rw-field">
          <span className="rw-field__label">{fields.phone.label}</span>
          <span className="rw-input rw-num">{fields.phone.value}</span>
        </div>
        <div className="rw-field">
          <span className="rw-field__label">
            <span className="rw-x-full">{fields.department.label}</span>
            <span className="rw-x-compact">{fields.department.shortLabel}</span>
          </span>
          <span className="rw-input rw-select">
            {fields.department.value}
            <ChevronDown size={13} strokeWidth={1.9} />
          </span>
        </div>
      </div>

      <div className="rw-field">
        <span className="rw-field__label">{fields.source.label}</span>
        <span className="rw-seg">
          {fields.source.options.map((o, i) => (
            <span className={`rw-seg__item${i === fields.source.selected ? ' is-active' : ''}`} key={o}>
              {i === fields.source.selected && <Check size={12} strokeWidth={2.2} />}
              {o}
            </span>
          ))}
        </span>
      </div>

      <div className="rw-field rw-x-full">
        <span className="rw-field__label">{fields.notes.label}</span>
        <span className="rw-input rw-textarea">{fields.notes.value}</span>
      </div>

      <div className="rw-form__actions">
        <span className="rw-btn">{saveLabel}</span>
      </div>
    </Card>
  )
}

/**
 * Receptionist lead capture. The phone window (CSS hides .rw-x-full) keeps
 * the capture form only, without the notes field.
 */
export default function ReceptionistView() {
  const { recent, today } = RECEPTIONIST_VIEW

  return (
    <div className="rw-grid rw-grid--recep">
      <CaptureForm />
      <Card title={recent.title} meta={recent.meta} depth={2} area="recent" className="rw-recent rw-x-full">
        <div className="rw-recent__list">
          {recent.items.map((c) => (
            <div className="rw-recent__item" key={c.id}>
              <span className="rw-recent__text">
                <span className="rw-recent__name">{c.name}</span>
                <span className="rw-recent__sub">{c.department}</span>
              </span>
              <span className="rw-recent__meta">
                <Tag tone={SOURCE_TONE[c.source]}>{c.source}</Tag>
                <span className="rw-num rw-recent__time">{c.time}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card title={today.title} depth={3} area="today" className="rw-today rw-x-full">
        <div className="rw-today__grid">
          {today.items.map((t) => (
            <span className="rw-today__cell" key={t.label}>
              <span className="rw-num rw-today__value">{t.value}</span>
              <span className="rw-today__label">{t.label}</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}
