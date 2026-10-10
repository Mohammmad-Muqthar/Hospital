import { ChartColumn, ChevronDown, CircleCheck, FileText, Filter, Printer } from 'lucide-react'
import {
  MOCK_DAILY,
  MOCK_DASHBOARD,
  MOCK_REPORTS,
  MOCK_WEEKLY,
  SAMPLE_TAG,
} from '../../../../../data/mock/mockFeatures'
import { Accent, Avatar, Chip, UiBar } from './primitives'

/** Sparkline geometry in a 100 × 40 box (stretched to fit; strokes stay 1.5px). */
function sparkline(points) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const xy = points.map((v, i) => [
    (i / (points.length - 1)) * 100,
    36 - ((v - min) / Math.max(1, max - min)) * 30,
  ])
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  return { line, area: `${line} L100 40 L0 40 Z`, last: xy[xy.length - 1] }
}

const TREND = sparkline(MOCK_DASHBOARD.trend.points)

/* Manager Dashboard — won/lost, pipeline health, rep-level revenue bars and a trend. */
export function DashboardArt() {
  const { totals, reps, health, filters, trend } = MOCK_DASHBOARD
  return (
    <div className="feat-ui feat-ui--dash">
      <UiBar icon={ChartColumn} title={MOCK_DASHBOARD.title} meta={MOCK_DASHBOARD.period} tag={SAMPLE_TAG} />
      <div className="feat-ui-dash">
        <div className="feat-ui-chips feat-ui-dash__filters">
          {filters.map((label, i) =>
            i === 0 ? (
              <span key={label} className="feat-ui-chip feat-ui-chip--select">
                {label}
                <ChevronDown size={12} strokeWidth={2} />
              </span>
            ) : (
              <Chip key={label}>{label}</Chip>
            ),
          )}
        </div>
        <div className="feat-ui-dash__kpis">
          {totals.map((t) => (
            <div key={t.id} className={`feat-ui-kpi feat-ui-kpi--${t.tone}`}>
              <span className="feat-ui-label">{t.label}</span>
              <span className="feat-ui-kpi__value t-tabular">{t.value}</span>
              <span className="feat-ui-muted">{t.meta}</span>
            </div>
          ))}
          <div className="feat-ui-kpi feat-ui-kpi--health">
            <span className="feat-ui-label">{MOCK_DASHBOARD.healthLabel}</span>
            <span className="feat-ui-health">
              {health.map((h) => (
                <span key={h.id} className={`feat-ui-health__seg feat-ui-health__seg--${h.id}`} style={{ flexGrow: h.share }} />
              ))}
            </span>
            <span className="feat-ui-health__legend">
              {health.map((h) => (
                <span key={h.id} className={`feat-ui-legend feat-ui-legend--${h.id}`}>
                  {h.label}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="feat-ui-reps">
          <span className="feat-ui-label">{MOCK_DASHBOARD.repsLabel}</span>
          {reps.map((rep, i) => (
            <div key={rep.initials} className="feat-ui-rep">
              <Avatar initials={rep.initials} tone={i === 0 ? 'ink' : 'mint'} />
              <span className="feat-ui-rep__name">{rep.name}</span>
              <span className="feat-ui-rep__track">
                {i === 0 ? (
                  <Accent className="feat-ui-rep__bar feat-ui-rep__bar--lead">
                    <span style={{ width: `${rep.share * 100}%` }} />
                  </Accent>
                ) : (
                  <span className="feat-ui-rep__bar">
                    <span style={{ width: `${rep.share * 100}%` }} />
                  </span>
                )}
              </span>
              <span className="feat-ui-rep__value t-tabular">{rep.value}</span>
            </div>
          ))}
        </div>
        <div className="feat-ui-trend">
          <span className="feat-ui-trend__head">
            <span className="feat-ui-label">{trend.label}</span>
            <span className="feat-ui-muted">{trend.meta}</span>
          </span>
          <span className="feat-ui-trend__plot">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" focusable="false">
              <path className="feat-ui-trend__area" d={TREND.area} />
              <path className="feat-ui-trend__line" d={TREND.line} vectorEffect="non-scaling-stroke" />
            </svg>
            <span
              className="feat-ui-trend__dot"
              style={{ left: `${TREND.last[0]}%`, top: `${(TREND.last[1] / 40) * 100}%` }}
            />
          </span>
        </div>
      </div>
    </div>
  )
}

/* CRM Reports — conversion by source as a column chart, filterable and printable. */
export function ReportsArt() {
  const { sources, filters, footer, reps, repsLabel } = MOCK_REPORTS
  const max = Math.max(...sources.map((s) => s.value))
  return (
    <div className="feat-ui feat-ui--reports">
      <UiBar
        title={MOCK_REPORTS.title}
        tag={SAMPLE_TAG}
        actions={
          <>
            <Filter size={13} strokeWidth={2} />
            <Printer size={13} strokeWidth={2} />
          </>
        }
      />
      <div className="feat-ui-chips feat-ui-reports__filters">
        {filters.map((label) => (
          <span key={label} className="feat-ui-chip feat-ui-chip--select">
            {label}
            <ChevronDown size={12} strokeWidth={2} />
          </span>
        ))}
      </div>
      <div className="feat-ui-columns">
        {sources.map((s, i) => (
          <div key={s.label} className="feat-ui-columns__item">
            <span className="feat-ui-columns__value t-tabular">{s.value}%</span>
            <span className="feat-ui-columns__track">
              {i === 0 ? (
                <Accent className="feat-ui-columns__bar feat-ui-columns__bar--lead">
                  <span style={{ '--v': s.value / max }} />
                </Accent>
              ) : (
                <span className="feat-ui-columns__bar">
                  <span style={{ '--v': s.value / max }} />
                </span>
              )}
            </span>
            <span className="feat-ui-columns__label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="feat-ui-conv">
        <span className="feat-ui-label">{repsLabel}</span>
        {reps.map((rep) => (
          <span key={rep.initials} className="feat-ui-conv__row">
            <Avatar initials={rep.initials} />
            <span className="feat-ui-conv__track">
              <span style={{ width: `${rep.value * 2}%` }} />
            </span>
            <span className="feat-ui-conv__value t-tabular">{rep.value}%</span>
          </span>
        ))}
      </div>
      <div className="feat-ui-reports__footer">
        <span className="feat-ui-chip">
          <Filter size={12} strokeWidth={2} />
          {footer.filters}
        </span>
        <span className="feat-ui-btn feat-ui-btn--ghost">
          <Printer size={12} strokeWidth={2} />
          {footer.print}
        </span>
      </div>
    </div>
  )
}

/* Weekly Board — Mon–Fri activity grid per executive. */
export function WeeklyArt() {
  const { days, rows } = MOCK_WEEKLY
  return (
    <div className="feat-ui feat-ui--weekly">
      <UiBar title={MOCK_WEEKLY.title} />
      <div className="feat-ui-week">
        <span />
        {days.map((d) => (
          <span key={d} className="feat-ui-week__day">
            <span className="feat-ui-week__long">{d}</span>
            <span className="feat-ui-week__short">{d[0]}</span>
          </span>
        ))}
        {rows.map((row, r) => (
          <div key={row.initials} className="feat-ui-week__row">
            <Avatar initials={row.initials} tone={r === 0 ? 'ink' : 'mint'} />
            {row.levels.map((level, d) =>
              r === 0 && d === 0 ? (
                <Accent key={d} className={`feat-ui-week__cell feat-ui-week__cell--${level}`} />
              ) : (
                <span key={d} className={`feat-ui-week__cell feat-ui-week__cell--${level}`} />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* Daily Reports — one submitted report with activity and outcome rows. */
export function DailyArt() {
  const { rows, outcome, status, date, author } = MOCK_DAILY
  return (
    <div className="feat-ui feat-ui--daily">
      <div className="feat-ui-daily__head">
        <span className="feat-ui-daily__doc">
          <FileText size={14} strokeWidth={2} />
        </span>
        <span className="feat-ui-stack">
          <strong className="feat-ui-strong">{MOCK_DAILY.title}</strong>
          <span className="feat-ui-muted">{date}</span>
        </span>
        <Avatar initials={author} />
      </div>
      <div className="feat-ui-daily__rows">
        {rows.map((row) => (
          <span key={row.id} className="feat-ui-daily__stat">
            <span className="feat-ui-daily__value t-tabular">{row.value}</span>
            <span className="feat-ui-muted">{row.label}</span>
          </span>
        ))}
      </div>
      <div className="feat-ui-daily__outcome">
        <Accent className="feat-ui-daily__check">
          <CircleCheck size={14} strokeWidth={2} />
        </Accent>
        <span className="feat-ui-daily__text">{outcome}</span>
        <Chip tone="emerald">{status}</Chip>
      </div>
    </div>
  )
}
