import { useCallback, useId, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { SECTION_IDS } from '../../../../config/site'
import { ROLES, ROLES_INTRO } from '../../../../data/siteContent'
import { scrollToTimelineLabel, scrollToY } from '../../../../lib/scroll'
import useMediaQuery from '../../../../hooks/useMediaQuery'
import usePrefersReducedMotion from '../../../../hooks/usePrefersReducedMotion'
import RoleSelector from './RoleSelector'
import RoleDescription from './RoleDescription'
import CRMWorkspace from './CRMWorkspace'
import useRolesScene, { COLUMNS_QUERY, PINNED_QUERY } from './useRolesScene'
import { ROLE_LABELS } from './rolesScene'
import './Roles.css'

/**
 * Phase 5 — Roles: one CRM workspace, four perspectives.
 *
 * Desktop (PINNED_QUERY: ≥1200 × ≥600, motion OK): the section pins and one
 * scrubbed master timeline walks Admin → Sales Manager → Sales Executive →
 * Receptionist; the tablist mirrors the timeline and clicking a role scrolls
 * to its timeline label. Everywhere else (tablets incl. landscape, mobile,
 * very short screens, reduced motion): no pin, the tablist sets state and
 * Motion animates the swap.
 */
export default function Roles() {
  const rootRef = useRef(null)
  const idPrefix = `roles-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [activeIndex, setActiveIndex] = useState(0)

  const pinned = useMediaQuery(PINNED_QUERY)
  // The selector is a vertical list wherever the stage has side columns
  // (≥ 1200, Roles.css); a row above the workspace below that.
  const vertical = useMediaQuery(COLUMNS_QUERY)
  const reduce = usePrefersReducedMotion()

  const { timelineRef, activeRef } = useRolesScene(rootRef, ROLES, setActiveIndex)

  const handleSelect = useCallback(
    (index) => {
      const tl = timelineRef.current
      if (tl?.scrollTrigger && scrollToTimelineLabel(tl, ROLE_LABELS[index])) return
      activeRef.current = index
      setActiveIndex(index)
    },
    [timelineRef, activeRef],
  )

  // Keyboard focus arriving in the selector or description while the scene
  // is still revealing (the copy is in the Tab order from the start, but may
  // be faded): bring the reader to a settled, fully visible state.
  const handleStageFocus = useCallback(
    (event) => {
      if (reduce || !event.target.matches?.(':focus-visible')) return
      const tl = timelineRef.current
      if (tl?.scrollTrigger) {
        if (window.scrollY < tl.scrollTrigger.start - 1) {
          scrollToTimelineLabel(tl, ROLE_LABELS[activeRef.current])
        }
        return
      }
      const rect = event.target.getBoundingClientRect()
      if (rect.bottom > window.innerHeight * 0.8) {
        scrollToY(window.scrollY + rect.top - window.innerHeight * 0.45)
      }
    },
    [reduce, timelineRef, activeRef],
  )

  const tabs = !pinned

  return (
    <section
      id={SECTION_IDS.roles}
      ref={rootRef}
      className="roles"
      aria-labelledby={`${idPrefix}-title`}
    >
      <div className="roles__bg" aria-hidden="true">
        <div className="roles__light" />
        <div className="roles__veil" />
      </div>

      {/* Reduced motion is handled explicitly by every animation in this
          section (via `reduce`), so Motion's own automatic mode is off. */}
      <MotionConfig reducedMotion="never">
      <div className="roles__inner container">
        <header className="roles__head">
          <div className="roles__head-main">
            <p className="t-eyebrow roles__eyebrow">{ROLES_INTRO.eyebrow}</p>
            <h2 id={`${idPrefix}-title`} className="t-h2 roles__title">
              {ROLES_INTRO.title}
            </h2>
          </div>
          <p className="t-lead roles__lead">{ROLES_INTRO.paragraph}</p>
        </header>

        <div className="roles__stage" onFocus={handleStageFocus}>
          <div className="roles__sel-col">
            <RoleSelector
              roles={ROLES}
              activeIndex={activeIndex}
              orientation={vertical ? 'vertical' : 'horizontal'}
              onSelect={handleSelect}
              idPrefix={idPrefix}
              reduce={reduce}
            />
          </div>

          <div className="roles__ws-col">
            <CRMWorkspace roles={ROLES} activeIndex={activeIndex} tabs={tabs} reduce={reduce} />
          </div>

          <div className="roles__desc-col">
            <RoleDescription roles={ROLES} activeIndex={activeIndex} tabs={tabs} reduce={reduce} idPrefix={idPrefix} />
          </div>
        </div>
      </div>
      </MotionConfig>
    </section>
  )
}
