import { useId } from 'react'
import { MANAGER_VIEW } from '../../../../../data/mock/mockRoles'
import { Avatar, Card, Meter, Tag } from './parts'

/** Deterministic SVG area chart for the "New leads" report preview. */
function TrendChart({ series, labels }) {
  const gradientId = `rw-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const W = 220
  const H = 86
  const padTop = 10
  const padBottom = 16
  const max = Math.max(...series) * 1.1
  const step = W / (series.length - 1)
  const pts = series.map((v, i) => [i * step, padTop + (1 - v / max) * (H - padTop - padBottom)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${W} ${H - padBottom} L0 ${H - padBottom} Z`
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg className="rw-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34b994" stopOpacity="0.22" />
          <stop offset="1" stopColor="#34b994" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1="0"
          x2={W}
          y1={padTop + f * (H - padTop - padBottom)}
          y2={padTop + f * (H - padTop - padBottom)}
          className="rw-chart__grid"
        />
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} className="rw-chart__line" />
      <circle cx={lx - 0.5} cy={ly} r="3.2" className="rw-chart__dot" />
      {labels.map((l, i) =>
        i % 2 === 1 ? (
          <text key={l} x={i * step} y={H - 3} className="rw-chart__label" textAnchor="middle">
            {l}
          </text>
        ) : null,
      )}
    </svg>
  )
}

function Team({ reps }) {
  const { team } = MANAGER_VIEW
  return (
    <Card title={team.title} meta={team.meta} depth={1} area="team">
      <div className="rw-reps">
        {reps.map((r) => (
          <div className="rw-rep" key={r.name}>
            <span className="rw-person">
              <Avatar initials={r.initials} size="sm" />
              <span className="rw-person__name">{r.name}</span>
            </span>
            <Meter value={r.done / r.target} />
            <span className="rw-num rw-rep__count">
              {r.done}
              <span className="rw-dim">/{r.target}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Pipeline() {
  const { pipeline } = MANAGER_VIEW
  const max = pipeline.stages[0].value
  return (
    <Card title={pipeline.title} meta={pipeline.meta} depth={2} area="pipe">
      <div className="rw-stages">
        {pipeline.stages.map((s, i) => (
          <div className="rw-stage" key={s.label}>
            <span className="rw-stage__label">{s.label}</span>
            <span className="rw-stage__track">
              <span
                className={`rw-stage__bar${i === pipeline.stages.length - 1 ? ' is-won' : ''}`}
                style={{ width: `${Math.max(8, (s.value / max) * 100)}%` }}
              />
            </span>
            <span className="rw-num rw-stage__value">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function ManagerView({ variant }) {
  const { activity, report, board, team } = MANAGER_VIEW

  if (variant === 'compact') {
    return (
      <div className="rw-grid rw-grid--manager-c">
        <Team reps={team.reps} />
        <Pipeline />
      </div>
    )
  }

  return (
    <div className="rw-grid rw-grid--manager">
      <div className="rw-mod rw-kpis" data-depth="1" style={{ '--a': 'kpi' }}>
        {activity.map((k) => (
          <div className="rw-card rw-kpi" key={k.label}>
            <span className="rw-kpi__label">{k.label}</span>
            <span className="rw-kpi__row">
              <span className="rw-num rw-kpi__value">{k.value}</span>
              <Tag tone="mint">{k.delta}</Tag>
            </span>
          </div>
        ))}
      </div>

      <Team reps={team.reps} />
      <Pipeline />

      <Card title={board.title} depth={3} area="board" className="rw-board">
        <div className="rw-board__grid">
          {board.days.map((d) => (
            <div className="rw-board__day" key={d.day}>
              <span className="rw-board__name">{d.day}</span>
              {d.items.map((it) => (
                <span className={`rw-chip rw-chip--${it.tone}`} key={it.label}>
                  {it.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card title={report.title} meta={report.meta} depth={2} area="report" className="rw-report">
        <div className="rw-report__value">
          <span className="rw-num">{report.current}</span>
          <Tag tone="mint">{report.delta}</Tag>
        </div>
        <TrendChart series={report.series} labels={report.labels} />
      </Card>
    </div>
  )
}
