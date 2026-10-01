import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasHardwareVideoPlane } from '../lib/hardwareVideoPlane'

const DESKTOP_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const SAMSUNG_TIZEN =
  'Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.5) AppleWebKit/537.36 (KHTML, like Gecko) 85.0.4183.93/6.5 TV Safari/537.36'
const LG_WEBOS =
  'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('hasHardwareVideoPlane', () => {
  it('is false on a desktop compositing browser', () => {
    expect(hasHardwareVideoPlane(DESKTOP_CHROME)).toBe(false)
  })

  it('is true on Samsung Tizen, where CSS overlays hide the video plane', () => {
    expect(hasHardwareVideoPlane(SAMSUNG_TIZEN)).toBe(true)
  })

  it('is true on LG webOS', () => {
    expect(hasHardwareVideoPlane(LG_WEBOS)).toBe(true)
  })

  it('is true when the Tizen API exists even without a TV user agent', () => {
    vi.stubGlobal('tizen', {})
    expect(hasHardwareVideoPlane(DESKTOP_CHROME)).toBe(true)
  })
})
