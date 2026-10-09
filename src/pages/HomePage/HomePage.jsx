import useScrollTriggerSetup from '../../hooks/useScrollTriggerSetup'
import Hero from './components/Hero/Hero'
import Features from './components/Features/Features'
import HowItWorks from './components/HowItWorks/HowItWorks'
import Roles from './components/Roles/Roles'
import Security from './components/Security/Security'
import Pricing from './components/Pricing/Pricing'
import './HomePage.css'

/**
 * Homepage composition. Section order matters: each section creates its
 * ScrollTriggers in a layout effect, so React mounts them top-to-bottom and
 * pinned scenes are measured in page order.
 */
export default function HomePage() {
  useScrollTriggerSetup()

  return (
    <div className="home">
      <Hero />
      <Features />
      <HowItWorks />
      <Roles />
      <Security />
      <Pricing />
    </div>
  )
}
