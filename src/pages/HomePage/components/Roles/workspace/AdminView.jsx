import { FileCheck2, ImagePlus } from 'lucide-react'
import { ADMIN_VIEW } from '../../../../../data/mock/mockRoles'
import { Avatar, Card, Tag, Toggle } from './parts'

const ROLE_TONE = {
  Admin: 'emerald',
  'Sales Manager': 'mint',
  'Sales Executive': 'neutral',
  Receptionist: 'amber',
}

function UsersTable() {
  const { users } = ADMIN_VIEW
  return (
    <Card title={users.title} meta={users.meta} depth={2} area="users" className="rw-users">
      <div className="rw-table__row rw-table__row--head rw-x-full">
        {users.columns.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      {users.rows.map((u) => (
        <div className="rw-table__row" key={u.name}>
          <span className="rw-person">
            <Avatar initials={u.initials} size="sm" tone={u.status === 'Invited' ? 'outline' : 'mint'} />
            <span className="rw-person__name">{u.name}</span>
          </span>
          <span>
            <Tag tone={ROLE_TONE[u.role]}>{u.role}</Tag>
          </span>
          <span className={`rw-status rw-x-full${u.status === 'Invited' ? ' is-pending' : ''}`}>{u.status}</span>
        </div>
      ))}
    </Card>
  )
}

/** The phone window shows the first two permissions only. */
const COMPACT_PERMISSIONS = 2

function Permissions() {
  const { permissions } = ADMIN_VIEW
  return (
    <Card title={permissions.title} meta={permissions.meta} depth={3} area="perms">
      <div className="rw-perms">
        {permissions.rows.map((p, i) => (
          <div className={`rw-perms__row${i >= COMPACT_PERMISSIONS ? ' rw-x-full' : ''}`} key={p.label}>
            <span>{p.label}</span>
            <Toggle on={p.on} />
          </div>
        ))}
      </div>
    </Card>
  )
}

/**
 * Admin settings workspace. The phone window (CSS hides .rw-x-full) keeps the
 * user table and the first permissions only, users first.
 */
export default function AdminView() {
  const { general, branding, terms, config } = ADMIN_VIEW

  return (
    <div className="rw-grid rw-grid--admin">
      <Card title={general.title} depth={1} area="general" className="rw-x-full">
        <div className="rw-fields">
          {general.fields.map((f) => (
            <div className="rw-field" key={f.label}>
              <span className="rw-field__label">{f.label}</span>
              <span className="rw-input">{f.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={branding.title} depth={2} area="brand" className="rw-x-full">
        <div className="rw-brand">
          <div className="rw-drop">
            <ImagePlus size={16} strokeWidth={1.75} />
            <span className="rw-drop__label">{branding.logoLabel}</span>
            <span className="rw-drop__meta">{branding.logoMeta}</span>
          </div>
          <div className="rw-swatch">
            <span className="rw-swatch__chip" />
            <span className="rw-swatch__text">
              <span className="rw-swatch__label">{branding.colourLabel}</span>
              <span className="rw-swatch__value">{branding.colourValue}</span>
            </span>
          </div>
        </div>
      </Card>

      <Permissions />
      <UsersTable />

      <div className="rw-mod rw-col rw-x-full" data-depth="3" style={{ '--a': 'side' }}>
        <div className="rw-card rw-terms">
          <div className="rw-card__head">
            <span className="rw-card__title">{terms.title}</span>
          </div>
          <div className="rw-terms__row">
            <span className="rw-terms__icon">
              <FileCheck2 size={14} strokeWidth={1.75} />
            </span>
            <span className="rw-terms__text">
              <span className="rw-terms__version">{terms.version}</span>
              <span className="rw-terms__meta">{terms.meta}</span>
            </span>
          </div>
        </div>
        <div className="rw-card rw-config">
          <div className="rw-card__head">
            <span className="rw-card__title">{config.title}</span>
          </div>
          {config.rows.map((r) => (
            <div className="rw-config__row" key={r.label}>
              <span>{r.label}</span>
              <span className="rw-num">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
