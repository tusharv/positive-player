// Keep these playlist/retry fixtures independent of the curated channel lineup.
vi.mock('../data/curatedPrograms', () => ({ CURATED_PROGRAMS: {} }))

import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import router from '../router'
import DebugPage from '../views/DebugPage.vue'
import { CHANNELS } from '../data/channels'

let wrapper: ReturnType<typeof mount> | undefined
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('1970-01-01T00:00:05Z'))
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test-key')
})
afterEach(() => {
  wrapper?.unmount()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
async function openPage() {
  const testRouter = createRouter({ history: createMemoryHistory(), routes: router.options.routes })
  await testRouter.push('/debug')
  wrapper = mount(DebugPage, { global: { plugins: [testRouter] } })
  return wrapper
}
function cache(items: unknown[]) {
  const channel = CHANNELS[0]!
  localStorage.setItem(
    `pp-catalog-1-playlist-${encodeURIComponent(channel.playlistId!)}`,
    JSON.stringify({ items, fetchedAt: Date.now() }),
  )
}

it('shows cached schedules, advances across programme boundaries, and filters channels', async () => {
  cache([
    { videoId: 'first', durationSeconds: 60 },
    { videoId: 'second', durationSeconds: 120 },
  ])
  const page = await openPage()
  expect(page.get('.video-link').attributes('href')).toBe(
    'https://www.youtube.com/watch?v=first&t=5s',
  )
  expect(page.text()).toContain('Scheduled, not confirmed playback')
  await vi.advanceTimersByTimeAsync(55000)
  expect(page.get('.video-link').attributes('href')).toBe(
    'https://www.youtube.com/watch?v=second&t=0s',
  )
  await page.get('input[type="search"]').setValue('Bollywood')
  expect(page.findAll('tbody tr')).toHaveLength(1)
  await page.get('input[type="search"]').setValue('not-a-channel')
  expect(page.text()).toContain('No channels match')
})

it('loads a channel and displays its title without loading other channels', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const url = new URL(input)
      return new Response(
        JSON.stringify(
          url.pathname.endsWith('/playlistItems')
            ? { items: [{ contentDetails: { videoId: 'song' } }] }
            : {
                items: [
                  {
                    id: 'song',
                    snippet: { title: 'A familiar song' },
                    status: { embeddable: true },
                    contentDetails: { duration: 'PT3M' },
                  },
                ],
              },
        ),
      )
    }),
  )
  localStorage.setItem('pp-channel', '7')
  sessionStorage.setItem('existing-session', 'keep')
  const beforeLocal = { ...localStorage }
  const beforeSession = { ...sessionStorage }
  const page = await openPage()
  await page.get('button[aria-label="Load Bollywood catalog"]').trigger('click')
  await flushPromises()
  expect({ ...localStorage }).toEqual(beforeLocal)
  expect({ ...sessionStorage }).toEqual(beforeSession)
  expect(page.get('tbody tr').text()).toContain('A familiar song')
  expect(page.get('tbody tr').text()).toContain('1 video')
  expect(page.findAll('tbody tr')[1]!.text()).toContain('Not loaded')
})

it('shows missing-key and network failures without losing cached schedules', async () => {
  vi.stubEnv('VITE_YOUTUBE_API_KEY', '')
  cache([{ videoId: 'cached', durationSeconds: 180 }])
  const page = await openPage()
  await page.get('button[aria-label="Load Bollywood catalog"]').trigger('click')
  await flushPromises()
  expect(page.get('tbody tr').text()).toContain('API key is missing')
  expect(page.get('.video-link').attributes('href')).toBe(
    'https://www.youtube.com/watch?v=cached&t=5s',
  )
  vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test-key')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  await page.get('button[aria-label="Load Cricket catalog"]').trigger('click')
  await flushPromises()
  expect(page.findAll('tbody tr')[1]!.text()).toContain('Network request failed')
})

it('loads all channels even when one fails and distinguishes empty catalogs', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      if (new URL(input).searchParams.get('playlistId') === CHANNELS[0]!.playlistId) {
        return new Response('{}', { status: 403 })
      }
      return new Response(JSON.stringify({ items: [] }))
    }),
  )
  const page = await openPage()
  await page.get('.toolbar button').trigger('click')
  for (
    let round = 0;
    round < 150 && page.get('.toolbar button').attributes('disabled') !== undefined;
    round++
  ) {
    await flushPromises()
  }
  expect(page.get('tbody tr').text()).toContain('Catalog request failed (HTTP 403)')
  expect(page.findAll('tbody tr')[CHANNELS.length - 1]!.text()).toContain('No playable videos')
  expect(page.get('.toolbar button').attributes('disabled')).toBeUndefined()
})

it('aborts pending requests and clears the clock when leaving the page', async () => {
  let signal: AbortSignal | null | undefined
  vi.stubGlobal(
    'fetch',
    vi.fn((_input: string, init: RequestInit) => {
      signal = init.signal
      return new Promise((_resolve, reject) =>
        signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
      )
    }),
  )
  const page = await openPage()
  await page.get('button[aria-label="Load Bollywood catalog"]').trigger('click')
  page.unmount()
  wrapper = undefined
  await flushPromises()
  expect(signal?.aborted).toBe(true)
  expect(vi.getTimerCount()).toBe(0)
})

it('does not persist quota cooldowns while debugging', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('{}', { status: 429 })),
  )
  const page = await openPage()
  await page.get('button[aria-label="Load Bollywood catalog"]').trigger('click')
  await flushPromises()
  expect(page.get('tbody tr').text()).toContain('YouTube quota exceeded')
  expect(localStorage.length).toBe(0)
  expect(sessionStorage.length).toBe(0)
})
