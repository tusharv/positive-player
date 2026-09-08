/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  YT?: {
    Player: new (element: HTMLElement | string, options: Record<string, unknown>) => unknown
    PlayerState: { ENDED: number; PLAYING: number }
  }
  onYouTubeIframeAPIReady?: () => void
}
