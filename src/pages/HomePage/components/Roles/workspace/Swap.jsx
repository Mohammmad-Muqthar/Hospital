import { motion } from 'motion/react'
import { MOTION_EASE } from '../../../../../lib/motion'

/**
 * One layer of a grid-stacked group (role views, titles, user chips).
 *
 * Ownership split (never animate the same element twice):
 *  - the outer element is the GSAP target in the pinned scroll scene
 *    (selected through `className` + `data-index`);
 *  - the inner motion element animates only in tab mode. In pinned mode it
 *    stays at its resting state so the scrubbed timeline is the only driver.
 */
export default function Swap({ index, active, tabs, reduce, className = '', lift = 6, delay = 0.08, children, ...rest }) {
  const hidden = reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: lift }
  const shown = { opacity: 1, y: 0 }
  const target = tabs && !active ? hidden : shown
  return (
    <div className={className} data-index={index} aria-hidden={active ? undefined : true} inert={!active} {...rest}>
      <motion.div
        className="rw-swap__inner"
        initial={false}
        animate={target}
        transition={{
          duration: reduce ? 0.2 : 0.42,
          ease: MOTION_EASE,
          delay: tabs && active && !reduce ? delay : 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
