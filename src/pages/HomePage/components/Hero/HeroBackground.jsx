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
  const hasSource = Boolean(videoSrc || videoSrcWebm)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const showVideo = hasSource && !failed

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

  // Detect a missing / unsupported source. The `error` event fires on the
  // last <source> when every candidate failed; networkState covers the case
  // where that happened before this effect subscribed.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const sources = video.querySelectorAll('source')
    const lastSource = sources[sources.length - 1]
    const onFail = () => setFailed(true)
    const onReady = () => {
      setReady(true)
      if (!wantsPlayRef.current && !video.paused) video.pause()
    }

    lastSource?.addEventListener('error', onFail)
    video.addEventListener('error', onFail)
    video.addEventListener('loadeddata', onReady)
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) onFail()
    else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onReady()

    return () => {
      lastSource?.removeEventListener('error', onFail)
      video.removeEventListener('error', onFail)
      video.removeEventListener('loadeddata', onReady)
    }
  }, [videoSrc, videoSrcWebm])

  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg__still">
        {posterSrc ? <img className="hero-bg__poster" src={posterSrc} alt="" decoding="async" /> : null}
      </div>
      {showVideo && (
        <video
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
        >
          {videoSrcWebm ? <source src={videoSrcWebm} type="video/webm" /> : null}
          {videoSrc ? <source src={videoSrc} type="video/mp4" /> : null}
        </video>
      )}
      <div className="hero-bg__vignette" />
      <div className="hero-bg__scrim" />
    </div>
  )
})

export default HeroBackground
