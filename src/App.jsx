import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import HomePage from './pages/HomePage/HomePage'
import SiteActionsProvider from './context/SiteActionsProvider'

/**
 * `actions` lets a host app (router, analytics) intercept CTAs:
 *   <App actions={{ onTrial: (e) => { e.preventDefault(); navigate('/signup') } }} />
 */
export default function App({ actions }) {
  return (
    <SiteActionsProvider actions={actions}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <HomePage />
      </main>
      <Footer />
    </SiteActionsProvider>
  )
}
