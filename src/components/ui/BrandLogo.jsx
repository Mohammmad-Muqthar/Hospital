import { useState } from 'react'
import { siteConfig } from '../../config/site'
import './BrandLogo.css'

/**
 * The official Trionix Hospital logo, loaded from siteConfig.logo.src.
 *
 * The artwork is never redrawn in code. If the file is missing, a plain
 * accessible text label is shown in its place and a development warning
 * names the missing asset so it can be added to /public.
 */
export default function BrandLogo({ height = 40, className = '', loading = 'eager' }) {
  const { src, alt, aspectRatio } = siteConfig.logo
  const [missing, setMissing] = useState(false)

  if (missing) {
    return (
      <span
        className={`brand-logo brand-logo--missing ${className}`}
        style={{ '--logo-h': `${height}px` }}
        data-missing-asset={src}
      >
        {alt}
      </span>
    )
  }

  return (
    <img
      className={`brand-logo ${className}`}
      src={src}
      alt={alt}
      height={height}
      width={Math.round(height * aspectRatio)}
      style={{ '--logo-h': `${height}px`, '--logo-ratio': aspectRatio }}
      loading={loading}
      decoding="async"
      draggable="false"
      onError={() => {
        if (import.meta.env.DEV) {
          console.warn(
            `[BrandLogo] Official logo not found at "${src}". Add the original Trionix Hospital logo file to /public${src}.`,
          )
        }
        setMissing(true)
      }}
    />
  )
}
