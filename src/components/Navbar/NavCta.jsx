import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import Button from '../ui/Button'
import useMediaQuery from '../../hooks/useMediaQuery'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import { MQ } from '../../lib/gsap'

/** Maximum tilt in degrees — enough to read as depth, never as a gimmick. */
const TILT_DEG = 3.5
/** Critically-damped-ish spring: follows the pointer softly, no wobble. */
const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.7 }

const clampHalf = (v) => Math.max(-0.5, Math.min(0.5, v))

/**
 * "Start trial" CTA with a pointer-based 3D micro-tilt (fine pointers only).
 *
 * Motion drives an outer wrapper (rotateX / rotateY / a 1px lift); the shared
 * Button inside keeps its own CSS hover (colour, shadow, 1px lift) on a
 * different element, so the two never animate the same property. Pointer
 * moves only write motion values — no React state, no re-renders. Disabled
 * for touch and reduced motion. The button never follows the cursor.
 */
export default function NavCta({ children }) {
  const finePointer = useMediaQuery(MQ.finePointer)
  const reduceMotion = usePrefersReducedMotion()
  const enabled = finePointer && !reduceMotion

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const hover = useMotionValue(0)
  const springX = useSpring(pointerX, TILT_SPRING)
  const springY = useSpring(pointerY, TILT_SPRING)
  const springHover = useSpring(hover, TILT_SPRING)

  // Pointer on the right → right edge recedes (rotateY+); top → top recedes.
  const rotateY = useTransform(springX, [-0.5, 0.5], [-TILT_DEG, TILT_DEG])
  const rotateX = useTransform(springY, [-0.5, 0.5], [TILT_DEG, -TILT_DEG])
  const y = useTransform(springHover, [0, 1], [0, -1])

  const rectRef = useRef(null)

  const handlers = enabled
    ? {
        onPointerEnter(event) {
          if (event.pointerType !== 'mouse') return
          rectRef.current = event.currentTarget.getBoundingClientRect()
          hover.set(1)
        },
        onPointerMove(event) {
          if (event.pointerType !== 'mouse') return
          const rect = rectRef.current ?? (rectRef.current = event.currentTarget.getBoundingClientRect())
          pointerX.set(clampHalf((event.clientX - rect.left) / rect.width - 0.5))
          pointerY.set(clampHalf((event.clientY - rect.top) / rect.height - 0.5))
        },
        onPointerLeave() {
          rectRef.current = null
          pointerX.set(0)
          pointerY.set(0)
          hover.set(0)
        },
      }
    : null

  return (
    <span className="nav__cta-stage" {...handlers}>
      <motion.span className="nav__cta-tilt" style={enabled ? { rotateX, rotateY, y } : undefined}>
        <Button to="trial" size="sm" arrow={false} className="nav__cta btn--on-dark">
          {children}
        </Button>
      </motion.span>
    </span>
  )
}
