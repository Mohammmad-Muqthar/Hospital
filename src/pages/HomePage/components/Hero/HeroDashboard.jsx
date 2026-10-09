import { memo, useId } from 'react'
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Search,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import { mockDashboard } from '../../../../data/mock/mockDashboard'
import { seriesPaths } from './heroChart'
import './HeroDashboard.css'

const { kpis, pipeline, pipelineSummary, revenue, team, followUps } = mockDashboard

/* Geometry is computed once — the preview is fully deterministic. */
const SPARK_BOX = { width: 100, height: 32, padTop: 3, padBottom: 3 }
const SPARKS = Object.fromEntries(
  kpis.map((k) => [k.id, seriesPaths(k.trend, { ...SPARK_BOX, min: Math.min(...k.trend) * 0.92 })]),
)
const CHART_BOX = { width: 600, height: 200, max: revenue.scaleMax, padTop: 0, padBottom: 0 }
const CHART = seriesPaths(revenue.values, CHART_BOX)
const LAST_POINT = CHART.points[CHART.points.length - 1]
const PIPE_MAX = Math.max(...pipeline.map((p) => p.count))

const NAV_ICONS = [LayoutDashboard, Users, Handshake, CalendarClock, ChartColumn]

const money = (k) => (k >= 1000 ? `$${(k / 1000).toFixed(1).replace(/\.0$/, '')}M` : `$${k}k`)

function Sparkline({ id, gradientId }) {
  const { line, area } = SPARKS[id]
  return (
    <svg className="hero-dash__spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/**
 * Sample CRM dashboard used by the hero. Rendered once as the unified
 * preview and again inside each split slice, so it must be pure and
 * identical every time (the slice swap relies on pixel-identical copies).
 * Purely decorative: the parent provides role="img" + an accessible label.
 */
function HeroDashboard({ className = '' }) {
  const uid = useId().replace(/:/g, '')

  return (
    <div className={`hero-dash ${className}`} aria-hidden="true">
      <div className="hero-dash__ui">
        <header className="hero-dash__top">
          <div className="hero-dash__brand">
            <span className="hero-dash__app">
              <HeartPulse size={16} strokeWidth={2} />
            </span>
          </div>
          <div className="hero-dash__crumbs">
            <span className="hero-dash__workspace">
              {mockDashboard.workspace}
              <ChevronDown size={13} strokeWidth={2} />
            </span>
            <span className="hero-dash__slash">/</span>
            <span className="hero-dash__title">{mockDashboard.title}</span>
          </div>
          <div className="hero-dash__tools">
            <span className="hero-dash__chip hero-dash__chip--sample">
              <span className="hero-dash__dot" />
              {mockDashboard.sampleLabel}
            </span>
            <span className="hero-dash__chip hero-dash__chip--period">
              <CalendarDays size={13} strokeWidth={2} />
              {mockDashboard.period}
              <ChevronDown size={13} strokeWidth={2} />
            </span>
            <span className="hero-dash__icon-btn hero-dash__icon-btn--search">
              <Search size={15} strokeWidth={2} />
            </span>
            <span className="hero-dash__icon-btn hero-dash__icon-btn--bell">
              <Bell size={15} strokeWidth={2} />
              <span className="hero-dash__badge-dot" />
            </span>
            <span className="hero-dash__avatar">{mockDashboard.user.initials}</span>
          </div>
        </header>

        <nav className="hero-dash__side">
          {NAV_ICONS.map((NavIcon, i) => (
            <span key={i} className={`hero-dash__nav ${i === 0 ? 'is-active' : ''}`}>
              <NavIcon size={17} strokeWidth={1.9} />
            </span>
          ))}
          <span className="hero-dash__nav hero-dash__nav--end">
            <Settings size={17} strokeWidth={1.9} />
          </span>
        </nav>

        <div className="hero-dash__main">
          <div className="hero-dash__primary">
            <div className="hero-dash__kpis">
              {kpis.map((k) => (
                <div key={k.id} className={`hero-dash__card hero-dash__kpi hero-dash__kpi--${k.id}`}>
                  <div className="hero-dash__kpi-head">
                    <span className="hero-dash__label">{k.label}</span>
                    <span className="hero-dash__delta">
                      <TrendingUp size={12} strokeWidth={2.2} />
                      {k.delta}
                    </span>
                  </div>
                  <div className="hero-dash__kpi-body">
                    <span className="hero-dash__kpi-value">{k.value}</span>
                    <Sparkline id={k.id} gradientId={`${uid}-spark-${k.id}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-dash__charts">
              <section className="hero-dash__card hero-dash__revenue">
                <div className="hero-dash__panel-head">
                  <div>
                    <span className="hero-dash__panel-title">{revenue.title}</span>
                    <span className="hero-dash__panel-sub">{revenue.delta}</span>
                  </div>
                  <span className="hero-dash__legend">
                    <span className="hero-dash__legend-swatch" />
                    {revenue.months[0]} – {revenue.months[revenue.months.length - 1]}
                  </span>
                </div>
                <div className="hero-dash__chart">
                  <div className="hero-dash__grid">
                    {revenue.gridSteps
                      .slice()
                      .reverse()
                      .map((g) => (
                        <div
                          key={g}
                          className="hero-dash__gridline"
                          style={{ bottom: `${(g / revenue.scaleMax) * 100}%` }}
                        >
                          <span>{g === 0 ? '0' : money(g)}</span>
                        </div>
                      ))}
                  </div>
                  <div className="hero-dash__plot">
                    <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#0b7a62" stopOpacity="0.2" />
                          <stop offset="1" stopColor="#0b7a62" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={CHART.area} fill={`url(#${uid}-area)`} />
                      <path
                        d={CHART.line}
                        fill="none"
                        stroke="#086b56"
                        strokeWidth="2"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    <span
                      className="hero-dash__marker"
                      style={{
                        left: `${(LAST_POINT[0] / CHART_BOX.width) * 100}%`,
                        top: `${(LAST_POINT[1] / CHART_BOX.height) * 100}%`,
                      }}
                    >
                      <span className="hero-dash__marker-tip">{revenue.total}</span>
                    </span>
                  </div>
                  <div className="hero-dash__months">
                    {revenue.months.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="hero-dash__card hero-dash__pipeline">
                <div className="hero-dash__panel-head">
                  <span className="hero-dash__panel-title">Pipeline by stage</span>
                  <span className="hero-dash__panel-meta">Deals</span>
                </div>
                <ul className="hero-dash__stages">
                  {pipeline.map((p) => (
                    <li key={p.stage} className="hero-dash__stage">
                      <span className="hero-dash__stage-row">
                        <span className="hero-dash__stage-name">{p.stage}</span>
                        <span className="hero-dash__stage-count">{p.count}</span>
                      </span>
                      <span className="hero-dash__track">
                        <span
                          className="hero-dash__fill"
                          style={{ width: `${(p.count / PIPE_MAX) * 100}%` }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="hero-dash__pipe-foot">
                  <span>{pipelineSummary.label}</span>
                  <strong>{pipelineSummary.value}</strong>
                </div>
              </section>
            </div>
          </div>
          <div className="hero-dash__aside">
            <section className="hero-dash__card hero-dash__team">
              <div className="hero-dash__panel-head">
                <span className="hero-dash__panel-title">Team performance</span>
                <span className="hero-dash__panel-meta">Target</span>
              </div>
              <ul className="hero-dash__reps">
                {team.map((r) => {
                  const warn = r.status !== 'On track'
                  return (
                    <li key={r.id} className="hero-dash__rep">
                      <span className="hero-dash__rep-avatar">{r.initials}</span>
                      <span className="hero-dash__rep-info">
                        <span className="hero-dash__rep-name">
                          {r.name} <span className="hero-dash__rep-unit">· {r.unit}</span>
                        </span>
                        <span className="hero-dash__rep-bar">
                          <span
                            className={`hero-dash__rep-fill ${warn ? 'is-warn' : ''}`}
                            style={{ width: `${r.progress * 100}%` }}
                          />
                        </span>
                      </span>
                      <span className={`hero-dash__status ${warn ? 'is-warn' : ''}`}>{r.status}</span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="hero-dash__card hero-dash__follow">
              <div className="hero-dash__panel-head">
                <span className="hero-dash__panel-title">Upcoming follow-ups</span>
                <span className="hero-dash__panel-meta">Today</span>
              </div>
              <ul className="hero-dash__tasks">
                {followUps.map((f) => (
                  <li key={f.id} className="hero-dash__task">
                    <span className="hero-dash__task-time">{f.time}</span>
                    <span className="hero-dash__task-info">
                      <span className="hero-dash__task-title">{f.title}</span>
                      <span className="hero-dash__task-type">{f.type}</span>
                    </span>
                    <span className="hero-dash__task-owner">{f.owner}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(HeroDashboard)
