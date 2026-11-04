import { readFile } from 'node:fs/promises'

// Generated from the same channel list as the player. No catalog loading or
// image generation is needed at request time, including on Vercel cold starts.
export async function serveWatchPage(req, res, dist = new URL('../dist/', import.meta.url)) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' })
    res.end()
    return
  }
  const params = new URL(req.url, 'https://www.1988.in').searchParams
  const values = params.getAll('channel')
  const value = values.length === 1 && /^\d{1,6}$/.test(values[0]) ? Number(values[0]) : 0
  let html
  try {
    if (value > 0) {
      try {
        html = await readFile(new URL(`share-pages/${value}.html`, dist), 'utf8')
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }
    }
    html ??= await readFile(new URL('share-pages/fallback.html', dist), 'utf8')
  } catch (error) {
    console.error('Unable to read built channel sharing page:', error.message)
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
    res.end(
      req.method === 'HEAD'
        ? undefined
        : 'The player is temporarily unavailable. Please try again shortly.',
    )
    return
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(req.method === 'HEAD' ? undefined : html)
}
