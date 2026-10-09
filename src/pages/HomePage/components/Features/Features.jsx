import { useRef } from 'react'
import { SECTION_IDS } from '../../../../config/site'
import { FEATURES_INTRO } from '../../../../data/siteContent'
import useMediaQuery from '../../../../hooks/useMediaQuery'
import usePrefersReducedMotion from '../../../../hooks/usePrefersReducedMotion'
import { MQ } from '../../../../lib/gsap'
import FeatureScene from './FeatureScene'
import { SCENES } from './sceneConfig'
import useFeaturesChoreography from './useFeaturesChoreography'
import './Features.css'
import './FeatureArt.css'

/**
 * Phase 3 — Features.
 *
 * Desktop (≥1024 × ≥600, motion allowed): the <section> pins and a single
 * scrubbed master timeline carries the heading back into depth and moves a
 * 3D stage through three compositions of four features each.
 * Tablet / mobile / short screens: a calm, non-pinned flow where every panel
 * settles in with a short scrubbed 3D move. Reduced motion: the same
 * composed layout, fully static. All twelve features are always in the DOM.
 */
export default function Features() {
  const rootRef = useRef(null)
  useFeaturesChoreography(rootRef)

  const finePointer = useMediaQuery(MQ.finePointer)
  const reducedMotion = usePrefersReducedMotion()
  const hoverEnabled = finePointer && !reducedMotion

  return (
    <section ref={rootRef} id={SECTION_IDS.features} className="feat" aria-labelledby="feat-heading">
      <div className="feat-frame">
        <div className="feat-stage">
          <header className="feat-intro">
            <div className="feat-intro__inner">
              <p className="t-eyebrow feat-intro__part">{FEATURES_INTRO.eyebrow}</p>
              <h2 id="feat-heading" className="t-h2 feat-intro__title feat-intro__part">
                {FEATURES_INTRO.title}
              </h2>
              <p className="t-lead feat-intro__lead feat-intro__part">{FEATURES_INTRO.paragraph}</p>
            </div>
          </header>
          <div className="feat-camera">
            {SCENES.map((scene) => (
              <FeatureScene key={scene.id} scene={scene} hoverEnabled={hoverEnabled} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
