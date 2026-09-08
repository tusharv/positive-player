export const CONSENT_KEY = 'pp-legal-consent'
export const CONSENT_VERSION = '2026-09-08'

let sessionGranted = false

export function hasLegalConsent(): boolean {
  if (sessionGranted) return true
  try {
    return localStorage.getItem(CONSENT_KEY) === CONSENT_VERSION
  } catch {
    return false
  }
}

export function grantLegalConsent(): void {
  sessionGranted = true
  try {
    localStorage.setItem(CONSENT_KEY, CONSENT_VERSION)
  } catch {
    /* Playback still requires the in-session agreement on the power gate. */
  }
}

export function withdrawLegalConsent(): void {
  sessionGranted = false
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* The in-session flag is already cleared. */
  }
}
