import FeaturePanel from './FeaturePanel'

/**
 * One composition of four features. Scenes are an internal motion
 * structure only — no visible chapter titles or numbering. `data-layout`
 * selects the arrangement; on the desktop stage the scenes are layered in
 * 3D space and the master timeline moves between them.
 */
export default function FeatureScene({ scene, hoverEnabled }) {
  return (
    <div className="feat-scene" data-scene={scene.id} data-layout={scene.layout}>
      {scene.panels.map((panel) => (
        <FeaturePanel
          key={panel.feature.id}
          feature={panel.feature}
          Art={panel.Art}
          slot={panel.slot}
          variant={panel.variant}
          hoverEnabled={hoverEnabled}
        />
      ))}
    </div>
  )
}
