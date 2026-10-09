import { useRef } from 'react'
import { SECTION_IDS } from '../../../../config/site'
import { HOW_IT_WORKS } from '../../../../data/siteContent'
import PhoneMockup from './PhoneMockup'
import useHowItWorksChoreography from './useHowItWorksChoreography'
import './HowItWorks.css'

/** Typographic only (same words): keep the em dash on the line of the word before it. */
const TITLE = HOW_IT_WORKS.title.replace(/ —/g, ' —')

/**
 * Phase 4 — How It Works.
 *
 * One realistic 3D phone in a deep-teal environment demonstrates the four
 * steps: notifications arrive inside the phone while the matching step copy
 * (real HTML, an ordered list) changes beside it.
 *
 * - Desktop / tablet / tall phones (motion allowed): the section pins and a
 *   single scrubbed master timeline runs intro → phone → step1…step4 → final.
 * - Short screens: no pin; the composed layout settles in with a short scrub.
 * - Reduced motion / no JS: the same content as a static composition — the
 *   phone shows all four notifications and the steps are listed beside it.
 */
export default function HowItWorks() {
  const rootRef = useRef(null)
  const activeStep = useHowItWorksChoreography(rootRef)

  return (
    <section ref={rootRef} id={SECTION_IDS.howItWorks} className="how" aria-labelledby="how-heading">
      <div className="how-env" aria-hidden="true" />
      <div className="how-feather" aria-hidden="true" />

      <div className="how-stage">
        <div className="how-layout container">
          <header className="how-head">
            <p className="t-eyebrow t-eyebrow--on-dark how-head__eyebrow">{HOW_IT_WORKS.eyebrow}</p>
            <h2 id="how-heading" className="how-head__title">
              {TITLE}
            </h2>
          </header>

          <div className="how-device-area">
            <div className="how-device">
              <div className="how-device__light" aria-hidden="true" />
              <div className="how-device__shadow" aria-hidden="true" />
              <div className="how-device__lens">
                <div className="how-rig">
                  <PhoneMockup />
                </div>
              </div>
            </div>
          </div>

          <ol className="how-steps" role="list">
            {HOW_IT_WORKS.steps.map((step, index) => (
              <li key={step.id} className="how-step" aria-current={activeStep === index ? 'step' : undefined}>
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__text">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
