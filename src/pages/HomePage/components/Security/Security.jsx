import { useCallback, useRef, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { SECTION_IDS } from '../../../../config/site'
import { SECURITY } from '../../../../data/siteContent'
import { gsap, ScrollTrigger, useGSAP, MQ, EASE, SCRUB } from '../../../../lib/gsap'
import { scrollToTimelineLabel } from '../../../../lib/scroll'
import SecurityArchitecture from './SecurityArchitecture'
import SecurityFeatureContent from './SecurityFeatureContent'
import {
  BEATS,
  BEAT_SPACING,
  FEATURE_LABELS,
  FEATURE_SWITCH_TIMES,
  buildSecurityTimeline,
} from './securityTimeline'
import './Security.css'

/** Desktop pin distance, in viewport heights (spec budget ≤ 300%). */
const PIN_VH = 2.8
/** Gap (px) between the sticky stage and the line where a feature block is "read". */
const READ_GAP = 36

const REGIONS = SECURITY.features.find((f) => f.regions)?.regions ?? []

/**
 * Phase 6 — Secure by design.
 * Desktop (≥1024 × ≥600): the section pins for 280vh while one master
 * timeline transforms a single CSS-3D architecture through four states.
 * Smaller / shorter screens: no pin — the compact architecture sticks under
 * the navbar while the four feature blocks scroll by and scrub the same
 * timeline. Reduced motion: one composed static state, all features listed.
 */
export default function Security() {
  const rootRef = useRef(null)
  const timelineRef = useRef(null)
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  const syncActive = useCallback((time) => {
    const index = FEATURE_SWITCH_TIMES.reduce((n, t) => (time >= t ? n + 1 : n), 0)
    if (index !== activeRef.current) {
      activeRef.current = index
      setActive(index)
    }
  }, [])

  useGSAP(
    () => {
      const root = rootRef.current
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(
        { motionOK: MQ.motionOK, cinematic: MQ.cinematic },
        ({ conditions }) => {
          if (!conditions.motionOK) return undefined

          /* ---------------- Pinned desktop scene ---------------- */
          if (conditions.cinematic) {
            root.classList.add('is-pinned')

            // Opening: restrained editorial entrance during the approach.
            const intro = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: root,
                start: 'top 92%',
                end: 'top 6%',
                scrub: SCRUB,
                invalidateOnRefresh: true,
              },
            })
            addIntroTweens(intro, q)
            intro.from(q('.sec-features'), { opacity: 0, y: 24, duration: 0.4, ease: EASE.out }, 0.5)
            intro.from(q('.sec-nav'), { opacity: 0, duration: 0.3 }, 0.65)
            addVisualEntrance(intro, q, 0)

            const tl = buildSecurityTimeline(q, { mode: 'desktop', withText: true })
            tl.eventCallback('onUpdate', () => syncActive(tl.time()))
            ScrollTrigger.create({
              trigger: root,
              animation: tl,
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * PIN_VH)}`,
              pin: true,
              scrub: SCRUB,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            })
            timelineRef.current = tl

            return () => {
              root.classList.remove('is-pinned')
              timelineRef.current = null
              syncActive(0)
            }
          }

          /* ---------------- Scroll-by sequence (tablet / mobile / short) ---------------- */
          root.classList.add('is-scrolly')

          const intro = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start: 'top 90%',
              end: 'top 25%',
              scrub: SCRUB,
              invalidateOnRefresh: true,
            },
          })
          addIntroTweens(intro, q)

          const stage = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: q('.sec-stage')[0],
              start: 'top 100%',
              end: 'top 55%',
              scrub: SCRUB,
              invalidateOnRefresh: true,
            },
          })
          addVisualEntrance(stage, q, 0)

          const list = q('.sec-features__list')[0]
          const firstBlock = q('.sec-feature')[0]
          const stageEl = q('.sec-stage')[0]
          // px of scroll per timeline unit: each feature block owns BEAT_SPACING units.
          const unit = () => firstBlock.offsetHeight / BEAT_SPACING
          // Read line (px from the viewport top): just below the sticky stage when the
          // stage sits above the blocks; mid-viewport when it sits beside them.
          const line = () => {
            const stuckTop = parseFloat(getComputedStyle(stageEl).top) || 0
            const below = stuckTop + stageEl.offsetHeight + READ_GAP
            return Math.round(below < window.innerHeight * 0.8 ? below : window.innerHeight * 0.42)
          }
          const tl = buildSecurityTimeline(q, { mode: 'compact', withText: false })
          ScrollTrigger.create({
            trigger: list,
            animation: tl,
            // label `branch` meets the read line exactly when block 0 does, etc.
            start: () => `top-=${Math.round(BEATS.branch * unit())} ${line()}px`,
            end: () => `top+=${Math.round((BEATS.end - BEATS.branch) * unit())} ${line()}px`,
            scrub: SCRUB,
            invalidateOnRefresh: true,
          })

          return () => {
            root.classList.remove('is-scrolly')
          }
        },
      )
    },
    { scope: rootRef },
  )

  const jumpTo = useCallback((index) => {
    scrollToTimelineLabel(timelineRef.current, FEATURE_LABELS[index])
  }, [])

  return (
    <section id={SECTION_IDS.security} ref={rootRef} className="sec" aria-labelledby="security-title">
      <div className="sec-frame container">
        <header className="sec-intro">
          <p className="t-eyebrow sec-eyebrow">{SECURITY.eyebrow}</p>
          <h2 id="security-title" className="t-h2 sec-title">
            {SECURITY.titleLines.map((line) => (
              <span key={line} className="sec-title__line">
                {line}{' '}
              </span>
            ))}
          </h2>
          <p className="t-lead sec-lead">{SECURITY.paragraph}</p>
          <ul className="sec-points" role="list">
            {SECURITY.points.map((point) => (
              <li key={point} className="sec-point">
                <CircleCheck className="sec-point__icon" size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="sec-stage">
          <div className="sec-visual">
            <SecurityArchitecture regions={REGIONS} />
          </div>
          <div className="sec-nav" role="group" aria-label="Review security features">
            {SECURITY.features.map((feature, i) => (
              <button
                key={feature.id}
                type="button"
                className="sec-nav__btn"
                aria-current={active === i ? 'step' : undefined}
                onClick={() => jumpTo(i)}
              >
                {feature.title}
              </button>
            ))}
          </div>
        </div>

        <div className="sec-features">
          <SecurityFeatureContent features={SECURITY.features} />
        </div>
      </div>
    </section>
  )
}

/** Heading / paragraph / checklist entrance (y + opacity, never per letter). */
function addIntroTweens(tl, q) {
  tl.from(q('.sec-eyebrow'), { opacity: 0, y: 18, duration: 0.3, ease: EASE.out }, 0)
  tl.from(q('.sec-title__line'), { opacity: 0, y: 34, duration: 0.42, stagger: 0.07, ease: EASE.out }, 0.04)
  tl.from(q('.sec-lead'), { opacity: 0, y: 22, duration: 0.4, ease: EASE.out }, 0.22)
  tl.from(q('.sec-point'), { opacity: 0, y: 14, duration: 0.32, stagger: 0.05, ease: EASE.out }, 0.34)
}

/** The architecture emerges from depth with a subtle perspective move. */
function addVisualEntrance(tl, q, at) {
  tl.from(q('.sx'), { opacity: 0, duration: 0.45 }, at)
  tl.from(q('.sx-emerge'), { z: -260, y: 60, rotationX: 9, duration: 0.95, ease: 'power2.out' }, at)
}
