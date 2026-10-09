import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion } from 'motion/react'
import { Bell, Command, Search } from 'lucide-react'
import { NAV_ITEMS, ROLE_SESSIONS, WORKSPACE } from '../../../../data/mock/mockRoles'
import { MQ } from '../../../../lib/gsap'
import { MOTION_EASE, SPRING } from '../../../../lib/motion'
import { Avatar } from './workspace/parts'
import { measureFit } from './workspace/fit'
import { NAV_ICONS } from './workspace/navIcons'
import Swap from './workspace/Swap'
import AdminView from './workspace/AdminView'
import ManagerView from './workspace/ManagerView'
import ExecutiveView from './workspace/ExecutiveView'
import ReceptionistView from './workspace/ReceptionistView'
import { NAV_ORDER, NAV_SLOT, getNavLayout } from './rolesScene'
import './CRMWorkspace.css'

const VIEWS = {
  admin: AdminView,
  'sales-manager': ManagerView,
  'sales-executive': ExecutiveView,
  receptionist: ReceptionistView,
}

/**
 * Design-size breakpoints of the window (CRMWorkspace.css): the phone window
 * (≤ 767), the tablet window with an icon rail (768–879), and the short
 * pinned window (≤ 660px tall).
 */
const DESIGN_QUERIES = [
  MQ.mobile,
  '(min-width: 768px) and (max-width: 879px)',
  `(min-width: 1200px) and (min-height: 600px) and (max-height: 660px) and ${MQ.motionOK}`,
]

/**
 * Sets --rw-s on the fit box so the window fills it (contain) — no React
 * state. Re-applied when the box resizes and when the design size switches
 * between the phone, tablet and desktop windows (CSS breakpoints).
 */
function useFitScale(ref) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const apply = () => {
      const fit = measureFit(el)
      if (fit) el.style.setProperty('--rw-s', String(fit.s))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    const mqls = DESIGN_QUERIES.map((q) => window.matchMedia(q))
    mqls.forEach((mql) => mql.addEventListener('change', apply))
    return () => {
      ro.disconnect()
      mqls.forEach((mql) => mql.removeEventListener('change', apply))
    }
  }, [ref])
}

function NavItem({ id, roleId, layout, tabs, reduce }) {
  const { label, icon } = NAV_ITEMS[id]
  const NavIcon = NAV_ICONS[icon]
  const y = layout.slot * NAV_SLOT
  // In tab mode an item that stays visible across a role change glides to
  // its new slot; one that (re)appears jumps to its slot and fades in. A
  // switch between tab and pinned mode always snaps (the outer element is
  // GSAP's then). (Adjusting state while rendering when a prop changes.)
  const [track, setTrack] = useState({ roleId, tabs, visible: layout.visible, glide: false })
  if (track.roleId !== roleId || track.tabs !== tabs) {
    setTrack({
      roleId,
      tabs,
      visible: layout.visible,
      glide: track.roleId !== roleId && track.tabs === tabs && track.visible && layout.visible,
    })
  }
  const { glide } = track
  const target = !tabs ? { y: 0, opacity: 1 } : layout.visible ? { y, opacity: 1 } : { opacity: 0 }
  return (
    <div className="rw-nav__item" data-nav={id}>
      <motion.div
        className={`rw-nav__inner${layout.active ? ' is-active' : ''}`}
        initial={false}
        animate={target}
        transition={{
          y: glide && !reduce ? SPRING.ui : { duration: 0 },
          opacity: { duration: reduce ? 0.15 : 0.3, ease: MOTION_EASE, delay: layout.visible && !glide && !reduce ? 0.12 : 0 },
        }}
      >
        <NavIcon size={15} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </motion.div>
    </div>
  )
}

function Sidebar({ roles, activeIndex, tabs, reduce }) {
  const roleId = roles[activeIndex].id
  const layout = getNavLayout(roleId)
  const activeSlot = layout[ROLE_SESSIONS[roleId].activeNav].slot
  return (
    <div className="rw-side rw-x-full">
      <div className="rw-clinic">
        <span className="rw-clinic__mark">{WORKSPACE.clinic.initials}</span>
        <span className="rw-clinic__text">
          <span className="rw-clinic__name">{WORKSPACE.clinic.name}</span>
          <span className="rw-clinic__branch">{WORKSPACE.clinic.branch}</span>
        </span>
      </div>

      <div className="rw-nav">
        <div className="rw-nav__hl">
          <motion.span
            className="rw-nav__hl-inner"
            initial={false}
            animate={{ y: tabs ? activeSlot * NAV_SLOT : 0 }}
            transition={reduce ? { duration: 0 } : SPRING.ui}
          />
        </div>
        {NAV_ORDER.map((id) => (
          <NavItem key={id} id={id} roleId={roleId} layout={layout[id]} tabs={tabs} reduce={reduce} />
        ))}
      </div>

      <div className="rw-user rw-stack">
        {roles.map((r, i) => {
          const { user } = ROLE_SESSIONS[r.id]
          return (
            <Swap key={r.id} index={i} active={i === activeIndex} tabs={tabs} reduce={reduce} className="rw-user__layer" lift={4}>
              <Avatar initials={user.initials} tone="light" />
              <span className="rw-user__text">
                <span className="rw-user__name">{user.name}</span>
                <span className="rw-user__role">{r.title}</span>
              </span>
            </Swap>
          )
        })}
      </div>
    </div>
  )
}

function TitleStack({ roles, activeIndex, tabs, reduce }) {
  return (
    <div className="rw-title rw-stack">
      {roles.map((r, i) => {
        const { page } = ROLE_SESSIONS[r.id]
        return (
          <Swap key={r.id} index={i} active={i === activeIndex} tabs={tabs} reduce={reduce} className="rw-title__layer">
            <span className="rw-title__text">{page.title}</span>
            <span className="rw-title__crumb">{page.crumb}</span>
          </Swap>
        )
      })}
    </div>
  )
}

/**
 * The single CRM app window. The frame (chrome, sidebar, top bar) is
 * continuous; the four role views are stacked in the content area and only
 * one is shown at a time — by the scrubbed GSAP timeline in pinned mode, or
 * by Motion in tab mode. Purely illustrative, so it is aria-hidden.
 *
 * The markup is the same at every breakpoint: the phone window (a narrower
 * design without the sidebar and the secondary modules) is produced by CSS
 * alone (.rw-x-full / .rw-x-compact). So the DOM GSAP builds the pinned
 * scene from never depends on React having re-rendered after a breakpoint
 * change (gsap.matchMedia rebuilds inside the media-query change event,
 * before React commits).
 */
export default function CRMWorkspace({ roles, activeIndex, tabs, reduce }) {
  const fitRef = useRef(null)
  useFitScale(fitRef)

  // Tab mode: a brief, subtle perspective sway when the role changes
  // (Motion owns .rw-sway; GSAP never touches it).
  const swayRef = useRef(null)
  const lastIndex = useRef(activeIndex)
  useEffect(() => {
    if (lastIndex.current === activeIndex) return undefined
    const dir = activeIndex > lastIndex.current ? 1 : -1
    lastIndex.current = activeIndex
    if (!tabs || reduce || !swayRef.current) return undefined
    const amp = window.matchMedia(MQ.mobile).matches ? 2.2 : 4
    const controls = animate(
      swayRef.current,
      { rotateY: [0, -amp * dir, 0], rotateX: [0, amp * 0.45, 0], scale: [1, 0.985, 1] },
      { duration: 0.8, ease: MOTION_EASE },
    )
    return () => controls.stop()
  }, [activeIndex, tabs, reduce])

  return (
    <div className="rw" aria-hidden="true">
      <div className="rw-fit" ref={fitRef}>
        <div className="rw-approach">
          <div className="rw-floor" />
          <div className="rw-tilt">
            <div className="rw-sway" ref={swayRef}>
              <div className="rw-window">
                <div className="rw-chrome">
                  <span className="rw-chrome__dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="rw-chrome__title rw-x-full">{WORKSPACE.windowTitle}</span>
                  <span className="rw-chrome__sample">{WORKSPACE.sampleLabel}</span>
                </div>

                <div className="rw-body">
                  <Sidebar roles={roles} activeIndex={activeIndex} tabs={tabs} reduce={reduce} />

                  <div className="rw-main">
                    <div className="rw-top">
                      <span className="rw-clinic__mark rw-clinic__mark--top rw-x-compact">{WORKSPACE.clinic.initials}</span>
                      <TitleStack roles={roles} activeIndex={activeIndex} tabs={tabs} reduce={reduce} />
                      <div className="rw-top__avatar rw-stack rw-x-compact">
                        {roles.map((r, i) => (
                          <Swap key={r.id} index={i} active={i === activeIndex} tabs={tabs} reduce={reduce} className="rw-user__layer" lift={4}>
                            <span className="rw-top__role">{r.title}</span>
                            <Avatar initials={ROLE_SESSIONS[r.id].user.initials} size="sm" />
                          </Swap>
                        ))}
                      </div>
                      <div className="rw-top__tools rw-x-full">
                        <span className="rw-search">
                          <Search size={13} strokeWidth={1.9} />
                          <span>{WORKSPACE.searchPlaceholder}</span>
                          <span className="rw-kbd">
                            <Command size={10} strokeWidth={2} />K
                          </span>
                        </span>
                        <span className="rw-iconbtn">
                          <Bell size={14} strokeWidth={1.8} />
                          <i className="rw-iconbtn__dot" />
                        </span>
                      </div>
                    </div>

                    <div className="rw-content rw-stack">
                      {roles.map((r, i) => {
                        const View = VIEWS[r.id]
                        return (
                          <Swap
                            key={r.id}
                            index={i}
                            active={i === activeIndex}
                            tabs={tabs}
                            reduce={reduce}
                            className="rw-view"
                            lift={10}
                            delay={0.14}
                          >
                            <View />
                          </Swap>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
