# Deploy remote control for 1988.in

The website stays at **https://1988-in.vercel.app**. Remote control runs on **one continuously running Node server**, separate from Vercel Functions. Both the TV browser and the phone connect directly to that server. QR codes still open the Vercel website.

## 1. Deploy the relay

Use a host that supports an always-on Docker container and WebSocket upgrades. Build from this repository using `Dockerfile.remote`:

```sh
docker build -f Dockerfile.remote -t positive-player-remote .
```

Set these runtime variables on the container host:

| Variable | Value |
| --- | --- |
| `PUBLIC_ORIGIN` | `https://1988-in.vercel.app` (no trailing slash) |
| `PORT` | `8787`, or the port assigned by your host |
| `TRUST_PROXY` | `0` unless the host's trusted proxy overwrites/appends the actual client IP in `X-Forwarded-For` and the Node port is not publicly accessible; then `1` |

Expose the service through the host's **HTTPS** endpoint, forwarding WebSocket upgrades for `/remote-ws`. Set the health-check path to `/healthz`. Allow idle WebSocket connections for at least 60 seconds; the server sends heartbeats every 15 seconds.

Use **exactly one replica**, disable autoscaling and scale-to-zero, and enable automatic restart. Sessions are in memory. Multiple replicas are not supported. Deploying/restarting this relay requires users to pair again; ordinary website deployments do not restart it. Use a separate relay for preview environments instead of allowing arbitrary preview origins on the production relay.

For a VM with a local HTTPS reverse proxy, start the container with a private port:

```sh
docker run -d --name positive-player-remote --restart unless-stopped \
  -p 127.0.0.1:8787:8787 \
  -e PUBLIC_ORIGIN=https://1988-in.vercel.app \
  -e TRUST_PROXY=1 \
  positive-player-remote
```

Your reverse proxy must terminate TLS, forward `/remote-ws` to `http://127.0.0.1:8787`, preserve upgrade headers, and set `X-Forwarded-For` from the real peer address. Forward `/healthz` as well. Do not expose plain port 8787 to the internet with `TRUST_PROXY=1`.

The container contains only the relay and its protocol/channel definitions. It does not serve the website or need a YouTube API key.

## 2. Connect the Vercel website

Once the relay has a public HTTPS address, add this **Production** environment variable in the Vercel project:

```text
VITE_REMOTE_WS_URL=wss://YOUR-ACTUAL-RELAY-HOST/remote-ws
```

Replace the placeholder with the relay host from step 1. This is a public endpoint, not a secret. It must not point back to `1988-in.vercel.app/remote-ws`.

Redeploy the website: Vite embeds this value at build time. Both phone and TV must reload the new deployment. Vercel builds fail if the secure relay URL is missing or malformed, to avoid publishing another broken remote setup. The old `/remote-ws` Vercel function returns 503 and no longer creates process-local sessions.

If you change the website's canonical domain, also update `PUBLIC_ORIGIN` on the relay. A different origin is deliberately rejected.

## 3. Verify before launch

1. Visit `https://YOUR-ACTUAL-RELAY-HOST/healthz`; expect `{"status":"ok"}`.
2. On the Vercel website, select **Connect remote**, scan the QR, and test power, channel, volume, and mute.
3. Repeat with a second TV and phone: each phone must control only its own TV.
4. Leave both pairs connected for more than five minutes, then refresh the phone and TV separately. Pairing should resume without a new code while the relay process is running.
5. Briefly disconnect Wi-Fi and reconnect within two minutes. Controls should recover; offline button presses must not replay.

The automated server regression pairs **100 TVs and 100 phones behind one address**, reconnects all 200 devices, and checks isolated commands and state replies. This proves local relay behavior, not your hosting provider's capacity or network reliability. Run a sustained test on the chosen host before a larger event.

## Limits and recovery

- One phone per TV; up to 1,000 sessions / 2,000 live sockets per relay.
- Up to 600 upgrades and 600 pairing/resume requests per client IP per minute. This allows a 100-pair shared-Wi-Fi startup followed by reconnection, while still bounding bursts.
- Temporary handshake rate/capacity errors retain credentials and retry after a delay with jitter. Commands made while offline are never queued.
- Payload and per-socket message limits still apply. Abusive sockets can be closed.
- Pairing invitations last five minutes; a disconnected TV has two minutes to return; sessions expire after 12 hours.
