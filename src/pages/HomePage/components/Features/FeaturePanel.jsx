import { memo } from 'react'
import { motion } from 'motion/react'
import Icon from '../../../../components/ui/Icon'
import { FADE, SPRING } from '../../../../lib/motion'

/*
 * Motion owns the INNER card (hover lift, shadow layer, icon tint and the
 * mini-UI accents via variant propagation). GSAP owns the outer <article>
 * transforms on the 3D stage — the two never touch the same element.
 */
const CARD_VARIANTS = { rest: { y: 0 }, hover: { y: -4 } }
const LIFT_VARIANTS = { rest: { opacity: 0 }, hover: { opacity: 1 } }
const ICON_VARIANTS = {
  rest: { backgroundColor: 'rgba(230, 243, 237, 1)', color: 'rgba(8, 107, 86, 1)' },
  hover: { backgroundColor: 'rgba(8, 107, 86, 1)', color: 'rgba(255, 255, 255, 1)' },
}

const ICON_SIZE = { hero: 22, wide: 20, tall: 20, split: 20, small: 18, flip: 18 }

/**
 * One feature on the stage: real <article> / <h3> / <p> copy plus a
 * decorative product illustration (aria-hidden).
 */
function FeaturePanel({ feature, Art, slot, variant, hoverEnabled }) {
  const titleId = `feat-title-${feature.id}`
  return (
    <article className={`feat-panel feat-panel--${variant}`} data-slot={slot} aria-labelledby={titleId}>
      <motion.div
        className={`feat-card feat-card--${variant}`}
        variants={CARD_VARIANTS}
        initial="rest"
        animate="rest"
        whileHover={hoverEnabled ? 'hover' : undefined}
        transition={SPRING.lift}
      >
        <motion.span className="feat-card__lift" aria-hidden="true" variants={LIFT_VARIANTS} transition={FADE.base} />
        <div className="feat-card__text">
          <motion.span className="feat-card__icon" variants={ICON_VARIANTS} transition={FADE.base}>
            <Icon name={feature.icon} size={ICON_SIZE[variant]} />
          </motion.span>
          <h3 id={titleId} className="feat-card__title">
            {feature.title}
          </h3>
          <p className="feat-card__desc">{feature.description}</p>
        </div>
        <div className="feat-card__ui" aria-hidden="true">
          <Art />
        </div>
      </motion.div>
    </article>
  )
}

export default memo(FeaturePanel)
