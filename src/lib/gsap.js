/**
 * Single GSAP entry point for the whole site.
 *
 * Always import gsap / ScrollTrigger / useGSAP from here (never from 'gsap'
 * directly) so plugins are registered exactly once and every section shares
 * the same ScrollTrigger configuration.
 */
// Must run before gsap.matchMedia() is first used (see the file for why).
import './sharedMediaQueries'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

ScrollTrigger.config({
  // Mobile browsers resize the viewport when the address bar shows/hides.
  // Ignoring those resizes avoids pinned sections jumping mid-scroll.
  ignoreMobileResize: true,
})

/**
 * Media queries shared by every gsap.matchMedia() call, so breakpoints and
 * reduced-motion handling stay consistent across sections.
 */
export const MQ = {
  motionOK: '(prefers-reduced-motion: no-preference)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 1024px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  mobile: '(max-width: 767px)',
  /** Large enough to run the full pinned 3D choreography. */
  cinematic: '(min-width: 1024px) and (min-height: 600px)',
  finePointer: '(hover: hover) and (pointer: fine)',
}

/** Shared GSAP eases (use 'none' for linear scrub segments). */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  soft: 'sine.inOut',
  expo: 'expo.out',
  settle: 'power4.out',
}

/** Default scrub smoothing (seconds of catch-up) for pinned scenes. */
export const SCRUB = 1

export { gsap, ScrollTrigger, useGSAP }

// Expose for browser-based QA scripts in development only.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__gsap = gsap
  window.__ScrollTrigger = ScrollTrigger
}
