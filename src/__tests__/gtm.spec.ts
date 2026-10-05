import { describe, expect, it } from 'vitest'
import { googleTagManagerSnippets } from '../lib/gtm'

describe('googleTagManagerSnippets', () => {
  it('builds the head script and noscript iframe for a container id', () => {
    const { head, body } = googleTagManagerSnippets('GTM-NKHKJ8ZW')

    expect(head).toContain("https://www.googletagmanager.com/gtm.js?id=")
    expect(head).toContain("'GTM-NKHKJ8ZW'")
    expect(body).toContain('https://www.googletagmanager.com/ns.html?id=GTM-NKHKJ8ZW')
    expect(body).toContain('<noscript>')
  })

  it('omits both snippets when the id is missing or invalid', () => {
    expect(googleTagManagerSnippets(undefined)).toEqual({ head: '', body: '' })
    expect(googleTagManagerSnippets('')).toEqual({ head: '', body: '' })
    expect(googleTagManagerSnippets('G-XXXX')).toEqual({ head: '', body: '' })
    expect(googleTagManagerSnippets('GTM-<script>')).toEqual({ head: '', body: '' })
  })
})
