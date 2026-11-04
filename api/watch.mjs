import { serveWatchPage } from '../server/watchPage.mjs'

export default function handler(req, res) {
  return serveWatchPage(req, res)
}
