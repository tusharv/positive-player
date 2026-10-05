/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string
  /** Google Tag Manager container ID, for example GTM-XXXX. Empty omits the tag. */
  readonly VITE_GTM_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  dataLayer?: Array<Record<string, unknown>>
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] }

  YT?: {
    Player: new (element: HTMLElement | string, options: Record<string, unknown>) => unknown
    PlayerState: { ENDED: number; PLAYING: number }
  }
  onYouTubeIframeAPIReady?: () => void
}
