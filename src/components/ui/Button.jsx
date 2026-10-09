import { forwardRef } from 'react'
import { ArrowRight } from 'lucide-react'
import useSiteLink from '../../hooks/useSiteLink'
import './Button.css'

/**
 * Shared button / link-button used by every CTA on the site.
 *
 * Props
 *  - to:       site destination key ('trial', 'pricing', 'signIn', 'roles'…)
 *              resolved through config/site.js (preferred for CTAs)
 *  - href:     explicit href (overrides `to`)
 *  - variant:  'primary' | 'secondary' | 'dark' | 'outline-light'
 *  - size:     'sm' | 'md' | 'lg'
 *  - arrow:    show the trailing arrow that nudges on hover (default true)
 *  - block:    full width
 *  - onNavigate: called after click (e.g. close a menu)
 * Without `to`/`href` it renders a native <button type="button">.
 */
const Button = forwardRef(function Button(
  {
    to,
    href,
    variant = 'primary',
    size = 'md',
    arrow = true,
    block = false,
    icon = null,
    className = '',
    children,
    onClick,
    onNavigate,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isLink = Boolean(to || href)
  const link = useSiteLink(to ?? href, { href, onClick, onNavigate })

  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && (
        <span className="btn__lead" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="btn__label">{children}</span>
      {arrow && (
        <span className="btn__icon" aria-hidden="true">
          <ArrowRight size={size === 'sm' ? 16 : 18} strokeWidth={2.1} />
        </span>
      )}
    </>
  )

  if (isLink) {
    return (
      <a ref={ref} className={classes} href={link.href} onClick={link.onClick} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button ref={ref} type={type} className={classes} onClick={onClick} {...rest}>
      {content}
    </button>
  )
})

export default Button
