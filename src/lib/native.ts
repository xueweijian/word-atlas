/** Detect Capacitor native runtime (Android APK). Web/PWA returns false. */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return Boolean(c?.isNativePlatform?.());
  } catch {
    return false;
  }
}
