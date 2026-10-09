import { memo, useLayoutEffect, useRef } from 'react'
import { Check, Clock3, KeyRound } from 'lucide-react'
import {
  ACCESS_REQUEST,
  ACTIVE_CHAMBER_ID,
  CHAMBER,
  CHAMBERS,
  DATA_LAYERS,
  PLATFORM,
  ROUTED_REGION_INDEX,
  SUPPORT_TOKEN,
} from '../../../../data/mock/mockSecurity'
import { SCENE, chamberRest, regionRest } from './securityGeometry'
import './SecurityArchitecture.css'

/**
 * A true CSS-3D box: top + the two side faces the camera can see
 * (front = +y edge, left = −x edge). The box is a preserve-3d container so
 * GSAP can move it (x / y / z) while the faces keep their static CSS
 * orientation.
 */
function Box({ className = '', w, d, h, x = 0, y = 0, z = 0, children, top = null }) {
  return (
    <div
      className={`sx-box ${className}`}
      style={{ '--w': `${w}px`, '--d': `${d}px`, '--h': `${h}px`, '--z': `${z}px`, left: x, top: y }}
    >
      <div className="sx-face sx-face--left" />
      <div className="sx-face sx-face--front" />
      <div className="sx-face sx-face--top">{top}</div>
      {children}
    </div>
  )
}

/**
 * Billboard: an anchor point in the scene whose content is counter-rotated
 * against the camera, so mock labels always face the viewer and stay
 * readable. The CSS rest state counter-rotates against the composed final
 * camera; while the camera moves, the master timeline tweens each anchor's
 * own rotation in step with it (data-bz holds the anchor's lift), so no
 * inherited custom property is animated across the 3D tree.
 */
function Billboard({ className = '', x, y, z, center = false, children }) {
  return (
    <div className={`sx-bb ${className}`} style={{ left: x, top: y, '--bz': `${z}px` }} data-bz={z}>
      <div className="sx-bb__face">{center ? <div className="sx-bb__center">{children}</div> : children}</div>
    </div>
  )
}

/** Translucent containment walls around one chamber (+ an optional gate). */
function Walls({ gate }) {
  return (
    <div className="sx-walls">
      <div className="sx-wall sx-wall--back" />
      <div className="sx-wall sx-wall--right" />
      <div className="sx-wall sx-wall--left" />
      {gate ? (
        <>
          <div className="sx-wall sx-wall--front sx-wall--front-a" />
          <div className="sx-wall sx-wall--front sx-wall--front-c" />
          <div className="sx-gate">
            <div className="sx-wall sx-wall--gate" />
          </div>
        </>
      ) : (
        <div className="sx-wall sx-wall--front" />
      )}
    </div>
  )
}

function Chamber({ chamber }) {
  const rest = chamberRest(chamber)
  const isActive = chamber.id === ACTIVE_CHAMBER_ID
  return (
    <div
      className={`sx-slot sx-slot--${chamber.id}${isActive ? ' is-active' : ''}${chamber.focus ? ' is-focus' : ''}`}
      data-col={chamber.col}
      data-row={chamber.row}
      style={{ left: rest.x, top: rest.y, width: CHAMBER.w, height: CHAMBER.d }}
    >
      <div className="sx-ao" />
      <div className="sx-chamber">
        <Box
          className="sx-chamber__body"
          w={CHAMBER.w}
          d={CHAMBER.d}
          h={CHAMBER.h}
          top={
            <span className="sx-roof">
              <span className="sx-roof__mark" />
            </span>
          }
        />
        <div className="sx-slabs">
          {DATA_LAYERS.map((layer, i) => (
            <Box
              key={layer}
              className={`sx-slab sx-slab--${i}`}
              w={SCENE.slab.w}
              d={SCENE.slab.d}
              h={SCENE.slab.h}
              x={(CHAMBER.w - SCENE.slab.w) / 2}
              y={(CHAMBER.d - SCENE.slab.d) / 2}
              z={SCENE.slabZ[i]}
            />
          ))}
        </div>
        <Billboard className="sx-name-bb" x={CHAMBER.w / 2} y={CHAMBER.d / 2} z={CHAMBER.h + 10} center>
          <span className="sx-name">
            <span className="sx-name__title">{chamber.name}</span>
            <span className="sx-name__sub">{chamber.branch}</span>
          </span>
        </Billboard>
        {isActive && (
          <div className="sx-layer-labels">
            {DATA_LAYERS.map((layer, i) => (
              <Billboard
                key={layer}
                className={`sx-tag-bb sx-tag-bb--${i}`}
                x={(CHAMBER.w - SCENE.slab.w) / 2 - 12}
                y={(CHAMBER.d - SCENE.slab.d) / 2 + SCENE.slab.d * SCENE.tagAlong[i]}
                z={SCENE.slabZ[i] + SCENE.slab.h / 2}
              >
                <span className="sx-tag">{layer}</span>
              </Billboard>
            ))}
          </div>
        )}
      </div>
      <Walls gate={chamber.focus} />
      {chamber.focus && (
        <Billboard
          className="sx-panel-bb"
          x={CHAMBER.w + SCENE.wallInset}
          y={-SCENE.wallInset}
          z={SCENE.wallH + 4}
        >
          <div className="sx-panel">
            <div className="sx-panel__head">
              <span className="sx-panel__icon">
                <KeyRound size={13} strokeWidth={2} />
              </span>
              <span className="sx-panel__titles">
                <span className="sx-panel__title">{ACCESS_REQUEST.title}</span>
                <span className="sx-panel__sub">{ACCESS_REQUEST.requester}</span>
              </span>
            </div>
            <div className="sx-panel__status">
              <span className="sx-status sx-status--pending">
                <span className="sx-status__dot" />
                {ACCESS_REQUEST.pending}
              </span>
              <span className="sx-status sx-status--approved">
                <span className="sx-status__check">
                  <Check size={10} strokeWidth={3} />
                </span>
                {ACCESS_REQUEST.approved}
              </span>
            </div>
            <div className="sx-panel__time">
              <Clock3 size={12} strokeWidth={2} />
              {ACCESS_REQUEST.timeBound}
            </div>
          </div>
        </Billboard>
      )}
    </div>
  )
}

function Region({ label, index }) {
  const rest = regionRest(index)
  const routed = index === ROUTED_REGION_INDEX
  return (
    <div
      className={`sx-region sx-region--${index}${routed ? ' is-routed' : ''}`}
      style={{ left: rest.x, top: rest.y, width: SCENE.region.w, height: SCENE.region.d }}
    >
      <div className="sx-region__ao" />
      <div className="sx-region__lift">
        <Box
          className="sx-region__body"
          w={SCENE.region.w}
          d={SCENE.region.d}
          h={SCENE.region.h}
          top={<span className="sx-region__glow" />}
        />
        <Billboard
          className="sx-region-bb"
          x={SCENE.region.w / 2}
          y={SCENE.region.d / 2}
          z={SCENE.region.h + 4}
          center
        >
          <span className="sx-region__label">{label}</span>
        </Billboard>
      </div>
    </div>
  )
}

/** Tray rects are deck-relative; the plate starts `inset` above the deck. */
const onPlate = (rect) => ({ ...rect, top: rect.top + PLATFORM.plate.inset })

/**
 * Decorative 3D architecture for the Security section: one hospital-group
 * platform, four isolated clinic chambers, a consent-gated access request
 * and three regional support desks. Purely presentational (aria-hidden);
 * every state is driven by the section's master timeline.
 */
function SecurityArchitecture({ regions }) {
  const rootRef = useRef(null)
  const viewportRef = useRef(null)

  // Fit the fixed-size reference scene into whatever box the layout gives it.
  useLayoutEffect(() => {
    const root = rootRef.current
    const viewport = viewportRef.current
    if (!root || !viewport) return undefined
    const apply = () => {
      const { width, height } = root.getBoundingClientRect()
      if (!width || !height) return
      // Mock labels are counter-scaled when the scene shrinks so they stay legible.
      const labelScaleFor = (fit) => Math.min(Math.max(SCENE.labelFit / fit, 1), SCENE.maxLabelScale)
      const firstFit = Math.min(width / SCENE.frame.w, height / SCENE.frame.h, SCENE.maxFit)
      // Enlarged labels (the access panel above all) need headroom the
      // reference frame doesn't include: reserve it, so on short stages they
      // stay inside the visual instead of rising under the navbar.
      const frameH = SCENE.frame.h + SCENE.labelHeadroom * (labelScaleFor(firstFit) - 1)
      const fit = Math.min(width / SCENE.frame.w, height / frameH, SCENE.maxFit)
      viewport.style.setProperty('--fit', fit.toFixed(4))
      viewport.style.setProperty('--label-scale', labelScaleFor(fit).toFixed(4))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(root)
    return () => ro.disconnect()
  }, [])

  const plate = PLATFORM.plate
  const base = PLATFORM.base
  const routed = regions[ROUTED_REGION_INDEX]

  return (
    <div
      className="sx"
      ref={rootRef}
      aria-hidden="true"
      style={{ '--wh': `${SCENE.wallH}px`, '--sx-wall-inset': `${SCENE.wallInset}px` }}
    >
      <div
        className="sx-viewport"
        ref={viewportRef}
        style={{ width: SCENE.frame.w, height: SCENE.frame.h }}
      >
        <div className="sx-emerge">
          <div className="sx-rig">
            {/* Camera: tilt (rotateX) on the scene, turn (rotateZ) on the plane. */}
            <div className="sx-scene" style={{ '--scene-w': `${base.w}px`, '--scene-d': `${base.d}px` }}>
              <div className="sx-plane">
                <div className="sx-ground" />
                <Box className="sx-plinth" w={base.w} d={base.d} h={base.h} />
                {/* The plate is inset from the plinth only on the two edges the
                    camera sees (left, front). On the back edges it is flush, so
                    the raised plate never leaves a sliver of the dark plinth top
                    showing behind it as a hairline. */}
                <Box
                  className="sx-plate"
                  w={base.w - plate.inset}
                  d={base.d - plate.inset}
                  h={plate.h}
                  x={plate.inset}
                  y={0}
                  z={base.h}
                  top={
                    <>
                      <span className="sx-tray" style={onPlate(SCENE.trays.grid)} />
                      <span className="sx-tray sx-tray--desk" style={onPlate(SCENE.trays.desks)} />
                    </>
                  }
                />
                <div
                  className="sx-deck"
                  style={{
                    left: plate.inset,
                    top: plate.inset,
                    width: base.w - plate.inset * 2,
                    height: base.d - plate.inset * 2,
                    '--deck-z': `${base.h + plate.h}px`,
                  }}
                >
                  {CHAMBERS.map((chamber) => (
                    <Chamber key={chamber.id} chamber={chamber} />
                  ))}
                  {regions.map((label, index) => (
                    <Region key={label} label={label} index={index} />
                  ))}
                  <div
                    className="sx-token"
                    style={{
                      left: regionRest(ROUTED_REGION_INDEX).x + (SCENE.region.w - SCENE.token.w) / 2,
                      top: regionRest(ROUTED_REGION_INDEX).y + (SCENE.region.d - SCENE.token.d) / 2,
                      width: SCENE.token.w,
                      height: SCENE.token.d,
                    }}
                  >
                    <div className="sx-token__ao" />
                    <div className="sx-token__body">
                      <Box className="sx-puck" w={SCENE.token.w} d={SCENE.token.d} h={SCENE.token.h} />
                      <Billboard
                        className="sx-chip-bb"
                        x={SCENE.token.w / 2}
                        y={SCENE.token.d / 2}
                        z={SCENE.token.h + 20}
                        center
                      >
                        <span className="sx-chip">
                          <span className="sx-chip__dot" />
                          <span className="sx-chip__text">
                            <span className="sx-chip__title">{SUPPORT_TOKEN.label}</span>
                            <span className="sx-chip__sub">{routed}</span>
                          </span>
                        </span>
                      </Billboard>
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

export default memo(SecurityArchitecture)
