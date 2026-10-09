import Icon from '../../../../components/ui/Icon'

/**
 * One of the four hero stat cards ("14 days · Free trial" …).
 * The same markup renders the accessible card grid and the decorative back
 * faces of the split slices, so both are pixel-identical for the final swap.
 */
export default function HeroStatCard({ card, as: Tag = 'div', decorative = false, className = '' }) {
  const hasSrValue = Boolean(card.srValue)

  return (
    <Tag className={`hero-card ${className}`} aria-hidden={decorative || undefined}>
      <span className="hero-card__icon" aria-hidden="true">
        <Icon name={card.icon} size={22} strokeWidth={1.8} />
      </span>
      <span className="hero-card__text">
        <span className={`hero-card__value ${hasSrValue ? 'hero-card__value--symbol' : ''}`}>
          {hasSrValue ? (
            <>
              <span aria-hidden="true">{card.value}</span>
              {!decorative && <span className="sr-only">{card.srValue}</span>}
            </>
          ) : (
            card.value
          )}
        </span>
        <span className="hero-card__label">{card.label}</span>
      </span>
    </Tag>
  )
}
