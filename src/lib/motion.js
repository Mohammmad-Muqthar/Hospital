/**
 * Shared timing for Motion (motion/react) micro-interactions so hover and
 * state transitions feel identical across Navbar, Roles, Pricing and Footer.
 *
 * Ownership rule: Motion only animates elements GSAP does not touch. When a
 * GSAP-animated element also needs hover feedback, put the Motion animation
 * on a nested child element.
 */
export const MOTION_EASE = [0.22, 1, 0.36, 1]

export const SPRING = {
  /** Default UI spring: quick, no visible overshoot. */
  ui: { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 },
  /** Card hover lift. */
  lift: { type: 'spring', stiffness: 300, damping: 28, mass: 0.9 },
  /** Shared-layout indicators (active tab, currency toggle). */
  indicator: { type: 'spring', stiffness: 520, damping: 42 },
}

export const FADE = {
  fast: { duration: 0.18, ease: MOTION_EASE },
  base: { duration: 0.32, ease: MOTION_EASE },
  slow: { duration: 0.5, ease: MOTION_EASE },
}
