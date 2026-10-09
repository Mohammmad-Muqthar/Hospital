import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

/**
 * Full-bleed hero background: the brand video when it is available, and a
 * refined still "cinematic" backdrop underneath it that is shown on its own
 * whenever the video is missing or fails (the production file is supplied
 * separately — see siteConfig.hero.videoSrc).
 *
 * Exposes { play(), pause() } so the Hero can stop decoding while the
 * section is out of view or covered by the light dashboard surface.
 */
const HeroBackground = forwardRef(function HeroBackground(
  { videoSrc, videoSrcWebm, posterSrc, autoPlay },
  ref,
) {
  const videoRef = useRef(null)
  const wantsPlayRef = useRef(autoPlay)
  // Failure / readiness belong to one set of sources: a new source key
  // remounts the <video> and starts from a clean state.
  const sourceKey = `${videoSrcWebm || ''}|${videoSrc || ''}`
  const hasSource = Boolean(videoSrc || videoSrcWebm)
  const [failedKey, setFailedKey] = useState(null)
  const [readyKey, setReadyKey] = useState(null)
  const showVideo = hasSource && failedKey !== sourceKey
  const ready = readyKey === sourceKey

  useImperativeHandle(
    ref,
    () => ({
      play() {
        wantsPlayRef.current = true
        const video = videoRef.current
        if (!video || !video.paused) return
        const attempt = video.play()
        if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {})
      },
      pause() {
        wantsPlayRef.current = false
        const video = videoRef.current
        if (video && !video.paused) video.pause()
      },
    }),
    [],
  )

  // Autoplay may already have started; honour a pause requested meanwhile.
  const holdIfUnwanted = (video) => {
    if (!wantsPlayRef.current && !video.paused) video.pause()
  }
  // Fast path: the `error` event fires on the LAST <source> once every
  // candidate has failed (and on the <video> for decode errors). React
  // attaches these listeners when it creates the elements, before source
  // selection can start.
  const handleFail = () => setFailedKey(sourceKey)
  const handleReady = (event) => {
    setReadyKey(sourceKey)
    holdIfUnwanted(event.currentTarget)
  }

  // Safety net. Every ScrollTrigger refresh moves the pinned hero in and out
  // of its pin spacer, and Chromium drops the <source> `error` event when
  // that happens while the source is loading, leaving the element idle
  // forever. So also read the element's state until it settles.
  //   ready:  readyState >= HAVE_CURRENT_DATA
  //   failed: NETWORK_NO_SOURCE *with* a currentSrc — every candidate was
  //           tried and the browser is waiting for new <source> children.
  //           (NETWORK_NO_SOURCE with an empty currentSrc only means source
  //           selection hasn't run yet; it is NOT a failure.)
  // A missed failure is invisible anyway (the still backdrop sits under the
  // transparent video); this only retires the dead element.
  useEffect(() => {
    if (!showVideo) return undefined
    let timer = 0
    let checks = 0
    const check = () => {
      const video = videoRef.current
      if (!video) return
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setReadyKey(sourceKey)
        holdIfUnwanted(video)
      } else if (video.error || (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && video.currentSrc)) {
        setFailedKey(sourceKey)
      } else if (++checks < 60) {
        timer = setTimeout(check, 250)
      }
    }
    timer = setTimeout(check, 250)
    return () => clearTimeout(timer)
  }, [showVideo, sourceKey])

  const sources = [
    videoSrcWebm ? { src: videoSrcWebm, type: 'video/webm' } : null,
    videoSrc ? { src: videoSrc, type: 'video/mp4' } : null,
  ].filter(Boolean)

  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg__still">
        {posterSrc ? <img className="hero-bg__poster" src={posterSrc} alt="" decoding="async" /> : null}
      </div>
      {showVideo && (
        <video
          key={sourceKey}
          ref={videoRef}
          className={`hero-bg__video ${ready ? 'is-ready' : ''}`}
          autoPlay={autoPlay}
          muted
          loop
          playsInline
          preload={autoPlay ? 'metadata' : 'auto'}
          poster={posterSrc || undefined}
          disableRemotePlayback
          tabIndex={-1}
          onError={handleFail}
          onLoadedData={handleReady}
        >
          {sources.map((s, i) => (
            <source
              key={s.src}
              src={s.src}
              type={s.type}
              onError={i === sources.length - 1 ? handleFail : undefined}
            />
          ))}
        </video>
      )}
      <div className="hero-bg__vignette" />
      <div className="hero-bg__scrim" />
    </div>
  )
})

export default HeroBackground
