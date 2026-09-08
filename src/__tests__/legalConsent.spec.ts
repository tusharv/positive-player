import { afterEach, expect, it, vi } from 'vitest'
import {
  CONSENT_VERSION,
  grantLegalConsent,
  hasLegalConsent,
  withdrawLegalConsent,
} from '../lib/legalConsent'

afterEach(() => {
  withdrawLegalConsent()
})

it('has no legal consent until the viewer agrees to this policy version', () => {
  expect(hasLegalConsent()).toBe(false)
  grantLegalConsent()
  expect(hasLegalConsent()).toBe(true)
  expect(localStorage.getItem('pp-legal-consent')).toBe(CONSENT_VERSION)
})

it('does not treat an older stored agreement as current consent', () => {
  localStorage.setItem('pp-legal-consent', '1999-01-01')
  expect(hasLegalConsent()).toBe(false)
})

it('keeps an in-session agreement when browser storage is blocked', () => {
  const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Storage blocked')
  })
  const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage blocked')
  })
  expect(hasLegalConsent()).toBe(false)
  expect(() => grantLegalConsent()).not.toThrow()
  expect(hasLegalConsent()).toBe(true)
  getItem.mockRestore()
  setItem.mockRestore()
})
