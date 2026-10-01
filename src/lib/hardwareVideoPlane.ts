const TV_VIDEO_PLANE = /Tizen|SMART-TV|SmartTV|Web0S|webOS|NetCast|BRAVIA|HbbTV/i

type TvWindow = Window & { tizen?: unknown; webOS?: unknown }

export function hasHardwareVideoPlane(
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent,
): boolean {
  if (TV_VIDEO_PLANE.test(userAgent)) return true
  if (typeof window === 'undefined') return false
  const tvWindow = window as TvWindow
  return Boolean(tvWindow.tizen || tvWindow.webOS)
}
