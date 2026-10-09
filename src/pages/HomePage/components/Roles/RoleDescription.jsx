import { motion } from 'motion/react'
import Icon from '../../../../components/ui/Icon'
import { MOTION_EASE } from '../../../../lib/motion'

/**
 * The active role's title + description. All four panels are grid-stacked
 * so the column height never changes. Pinned mode: the GSAP timeline
 * cross-fades the outer panels. Tab mode: Motion animates the inner content.
 */
export default function RoleDescription({ roles, activeIndex, tabs, reduce, idPrefix }) {
  return (
    <div className="roles-desc">
      {roles.map((role, i) => {
        const active = i === activeIndex
        const target = tabs && !active ? (reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 10 }) : { opacity: 1, y: 0 }
        return (
          <div
            key={role.id}
            className="roles-desc__panel"
            data-index={i}
            id={`${idPrefix}-panel-${role.id}`}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tab-${role.id}`}
            aria-hidden={active ? undefined : true}
            inert={!active}
            tabIndex={active ? 0 : -1}
          >
            <motion.div
              className="roles-desc__inner"
              initial={false}
              animate={target}
              transition={{
                duration: reduce ? 0.2 : 0.45,
                ease: MOTION_EASE,
                delay: tabs && active && !reduce ? 0.1 : 0,
              }}
            >
              <span className="roles-desc__icon">
                <Icon name={role.icon} size={20} strokeWidth={1.8} />
              </span>
              <h3 className="roles-desc__title">{role.title}</h3>
              <p className="roles-desc__text">{role.description}</p>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
