import { memo } from 'react'
import { mockNotifications, mockPhoneScreen } from '../../../../data/mock/mockNotifications'
import PhoneNotification from './PhoneNotification'
import './PhoneMockup.css'

/** Number of stacked layers that give the phone body its physical thickness in 3D. */
const EDGE_LAYERS = 9

/** Newest-first, like a real notification centre (final visual order). */
const STACK = mockNotifications.map((notification, index) => ({ notification, index })).reverse()

function StatusIcons() {
  return (
    <span className="how-phone__status-icons">
      <svg className="how-phone__signal" viewBox="0 0 18 12" aria-hidden="true" focusable="false">
        <rect x="0" y="8" width="3" height="4" rx="0.9" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="0.9" />
        <rect x="10" y="3" width="3" height="9" rx="0.9" />
        <rect x="15" y="0" width="3" height="12" rx="0.9" />
      </svg>
      <svg className="how-phone__wifi" viewBox="0 0 16 12" aria-hidden="true" focusable="false">
        <path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.6 10.6 0 0 0 8 .4 10.6 10.6 0 0 0 .5 3.4l1.2 1.3A9 9 0 0 1 8 2.2Z" />
        <path d="M8 5.6c1.5 0 2.9.6 3.9 1.5l1.2-1.3A7.2 7.2 0 0 0 8 3.8c-2 0-3.8.7-5.1 2l1.2 1.3c1-.9 2.4-1.5 3.9-1.5Z" />
        <path d="M8 9c.6 0 1.2.2 1.6.6L8 11.4 6.4 9.6C6.8 9.2 7.4 9 8 9Z" />
      </svg>
      <svg className="how-phone__battery" viewBox="0 0 27 13" aria-hidden="true" focusable="false">
        <rect x="0.6" y="0.6" width="22.8" height="11.8" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.1" />
        <rect x="2.5" y="2.5" width="16.4" height="8" rx="2" />
        <path d="M25 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1s-.6-1.8-1.5-2.1Z" fillOpacity="0.45" />
      </svg>
    </span>
  )
}

/**
 * Realistic CSS/SVG smartphone (no manufacturer branding) showing a
 * lock-screen notification centre. Decorative: the step copy lives outside
 * the phone as real text, so the whole device is hidden from assistive tech.
 * Static markup (memoised): the timeline only moves its elements.
 */
function PhoneMockup() {
  return (
    <div className="how-phone" aria-hidden="true">
      {Array.from({ length: EDGE_LAYERS }, (_, i) => (
        <span key={i} className="how-phone__edge" style={{ '--layer': i + 1 }} />
      ))}

      <div className="how-phone__frame">
        <span className="how-phone__key how-phone__key--action" />
        <span className="how-phone__key how-phone__key--vol-up" />
        <span className="how-phone__key how-phone__key--vol-down" />
        <span className="how-phone__key how-phone__key--power" />

        <div className="how-phone__bezel">
          <div className="how-phone__screen">
            <div className="how-phone__wallpaper" />

            <div className="how-phone__statusbar">
              <span className="how-phone__island" />
              <StatusIcons />
            </div>

            <div className="how-phone__ui">
              <div className="how-phone__lock">
                <p className="how-phone__date">{mockPhoneScreen.date}</p>
                <p className="how-phone__clock">{mockPhoneScreen.time}</p>
              </div>

              <div className="how-phone__stack">
                {STACK.map(({ notification, index }) => (
                  <PhoneNotification
                    key={notification.stepId}
                    notification={notification}
                    index={index}
                    appName={mockPhoneScreen.appName}
                    timestamp={mockPhoneScreen.timestamp}
                  />
                ))}
              </div>
            </div>

            <span className="how-phone__home" />
            <div className="how-phone__glass">
              <span className="how-phone__sheen" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(PhoneMockup)
