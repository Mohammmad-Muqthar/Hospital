import { useCallback, useEffect, useRef } from 'react'
import { gsap, useGSAP, MQ } from '../../../../lib/gsap'
import { scrollToTimelineLabel } from '../../../../lib/scroll'
import { SECTION_IDS, siteConfig } from '../../../../config/site'
import { HERO } from '../../../../data/siteContent'
import Button from '../../../../components/ui/Button'
import usePrefersReducedMotion from '../../../../hooks/usePrefersReducedMotion'
import HeroBackground from './HeroBackground'
import HeroHeadline from './HeroHeadline'
import HeroDashboard from './HeroDashboard'
import HeroStatCard from './HeroStatCard'
import { buildHeroTimeline, CINEMA_MQ } from './heroTimeline'
import './Hero.css'

const SLICE_INDEXES = [0, 1, 2, 3]

/**
 * Phase 1 — cinematic hero.
 *
 * One pinned stage driven by one scrubbed master timeline (see heroTimeline.js):
 * full-bleed video → camera pull-back through the headline → copy + CTAs →
 * 3D dashboard rise onto the light page surface → the dashboard splits into
 * four pieces (strips on desktop, quadrants for the 2×2 layouts) that turn
 * over into the stat cards. With reduced motion (or very short screens) the same
 * markup renders as a calm static layout with no pinning.
 */
export default function Hero({
  videoSrc = siteConfig.hero.videoSrc,
  videoSrcWebm = siteConfig.hero.videoSrcWebm,
  posterSrc = siteConfig.hero.posterSrc,
  trialHref,
  pricingHref,
  onTrial,
  onPricing,
}) {
  const rootRef = useRef(null)
  const bgRef = useRef(null)
  const timelineRef = useRef(null)
  const playbackRef = useRef({ inView: true, covered: false })
  const reducedMotion = usePrefersReducedMotion()
  const reducedRef = useRef(reducedMotion)

  /* Play the background only while it can actually be seen (never with reduced motion). */
  const syncPlayback = useCallback(() => {
    const bgApi = bgRef.current
    if (!bgApi) return
    const { inView, covered } = playbackRef.current
    if (inView && !covered && !reducedRef.current) bgApi.play()
    else bgApi.pause()
  }, [])

  useEffect(() => {
    reducedRef.current = reducedMotion
    syncPlayback()
  }, [reducedMotion, syncPlayback])

  useGSAP(
    () => {
      const root = rootRef.current
      // Visibility is tracked with ScrollTrigger rather than an
      // IntersectionObserver: the stage is position:fixed while pinned, and IO
      // does not reliably re-evaluate fixed targets (it can stay "hidden").
      const setInView = (self) => {
        playbackRef.current.inView = self.isActive
        syncPlayback()
      }
      const mm = gsap.matchMedia()
      mm.add(
        {
          cinematic: CINEMA_MQ,
          reduce: MQ.reduceMotion,
          desktop: MQ.desktop,
          tablet: MQ.tablet,
          mobile: MQ.mobile,
        },
        (ctx) => {
          if (!ctx.conditions.cinematic) {
            // Reduced motion / very short screens: static layout, no pin, nothing hidden.
            playbackRef.current.covered = false
            // Attached to an (empty) timeline so its first refresh is deferred:
            // a bare ScrollTrigger created inside a matchMedia branch refreshes
            // immediately and wipes GSAP's remembered scroll position, which
            // sends the page to the top on every breakpoint change.
            gsap.timeline({
              scrollTrigger: {
                trigger: root,
                start: 'top bottom',
                end: 'bottom top',
                onToggle: setInView,
                onRefresh: setInView,
              },
            })
            return undefined
          }

          const tl = buildHeroTimeline(root, ctx.conditions, {
            onCoveredChange: (covered) => {
              playbackRef.current.covered = covered
              syncPlayback()
            },
          })
          timelineRef.current = tl
          // Visible from the top of the page until the released section has
          // scrolled a full viewport past the end of its pin.
          // Timeline-attached for the same deferred-refresh reason as above.
          gsap.timeline({
            scrollTrigger: {
              start: -1,
              end: () => tl.scrollTrigger.end + window.innerHeight,
              refreshPriority: -1, // measured after the pinned master trigger
              onToggle: setInView,
              onRefresh: setInView,
            },
          })

          return () => {
            timelineRef.current = null
            playbackRef.current.covered = false
          }
        },
      )
    },
    { scope: rootRef },
  )

  /* Keyboard users who tab into the CTAs while they are still hidden in the
     scroll story are taken straight to the readable copy state. */
  const handleCtaFocus = useCallback(() => {
    const tl = timelineRef.current
    const st = tl?.scrollTrigger
    if (!st) return
    const visibleFrom = tl.labels.hold / tl.duration()
    const visibleTo = tl.labels.dashboard / tl.duration()
    if (st.progress < visibleFrom - 0.01 || st.progress > visibleTo + 0.01) {
      scrollToTimelineLabel(tl, 'hold', { smooth: false })
    }
  }, [])

  return (
    <section ref={rootRef} id={SECTION_IDS.top} className="hero" aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__intro">
          <HeroBackground
            ref={bgRef}
            videoSrc={videoSrc}
            videoSrcWebm={videoSrcWebm}
            posterSrc={posterSrc}
            autoPlay={!reducedMotion}
          />

          <div className="hero__copy">
            <HeroHeadline id="hero-title" />
            <p className="hero__lead">{HERO.paragraph}</p>
            <div className="hero__ctas" onFocus={handleCtaFocus}>
              <span className="hero__cta">
                <Button to="trial" href={trialHref} onClick={onTrial} variant="primary" size="lg">
                  {HERO.primaryCta}
                </Button>
              </span>
              <span className="hero__cta">
                <Button
                  to="pricing"
                  href={pricingHref}
                  onClick={onPricing}
                  variant="secondary"
                  size="lg"
                  arrow={false}
                  className="hero__btn-secondary"
                >
                  {HERO.secondaryCta}
                </Button>
              </span>
            </div>
          </div>
        </div>

        <div className="hero__light" aria-hidden="true" />

        <div className="hero__dash-layer">
          <div
            className="hero__dash-frame"
            role="img"
            aria-label="Sample CRM dashboard preview with illustrative data"
          >
            <div className="hero__dash-shadow" aria-hidden="true" />
            <HeroDashboard className="hero__dash-whole" />
            <div className="hero__slices" aria-hidden="true">
              {SLICE_INDEXES.map((i) => (
                <div
                  key={i}
                  className="hero__slice"
                  style={{ '--i': i, '--col': i % 2, '--row': Math.floor(i / 2) }}
                >
                  <div className="hero__slice-front">
                    <HeroDashboard className="hero__slice-dash" />
                  </div>
                  <div className="hero__slice-edge" />
                  <div className="hero__slice-back">
                    <HeroStatCard card={HERO.splitCards[i]} decorative />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="hero__cards" role="list">
            {HERO.splitCards.map((card) => (
              <HeroStatCard key={card.label} card={card} as="li" />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
