// Remote sessions must live on the persistent relay, never a Vercel instance.
// Keep the old route explicit so stale clients fail without creating lost sessions.
export default function handler(_request, response) {
  response.statusCode = 503
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify({ error: 'Configure VITE_REMOTE_WS_URL and rebuild the website.' }))
}
