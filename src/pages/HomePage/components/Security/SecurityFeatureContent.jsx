import { Fragment, memo } from 'react'

/** Renders a description with its `codeToken` (e.g. clinic_id) as inline code. */
function Description({ text, codeToken }) {
  if (!codeToken || !text.includes(codeToken)) return text
  const parts = text.split(codeToken)
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <code className="sec-code">{codeToken}</code>}
    </Fragment>
  ))
}

/**
 * The four security features as real semantic HTML. In the pinned desktop
 * scene they are grid-stacked and cross-faded by the master timeline
 * (inactive items stay in the accessibility tree); on smaller screens they
 * scroll by as blocks; with reduced motion they are simply listed.
 */
function SecurityFeatureContent({ features }) {
  return (
    <ul className="sec-features__list" role="list">
      {features.map((feature) => (
        <li key={feature.id} className="sec-feature" data-feature={feature.id}>
          <h3 className="sec-feature__title">{feature.title}</h3>
          <p className="sec-feature__text">
            <Description text={feature.description} codeToken={feature.codeToken} />
          </p>
        </li>
      ))}
    </ul>
  )
}

export default memo(SecurityFeatureContent)
