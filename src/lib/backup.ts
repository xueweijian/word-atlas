import { isNativePlatform } from "./native";

/**
 * Export the learning backup.
 * - Web/PWA: browser download via blob link (unchanged behavior).
 * - Native APK: write into app-private cache with @capacitor/filesystem,
 *   then open the system share sheet with @capacitor/share so the user can
 *   save it anywhere (file manager, chat apps, cloud drive...).
 *
 * Dependencies are injectable (see BackupDeps) so the branch contract is unit-
 * testable without a device; the defaults lazy-import the Capacitor plugins so
 * the web build never bundles them.
 */

export interface BackupDeps {
  isNative: () => boolean;
  /** Persist the JSON somewhere reachable, return a shareable uri. */
  writeFile: (path: string, data: string) => Promise<{ uri: string }>;
  share: (opts: { title: string; text: string; url: string; dialogTitle: string }) => Promise<unknown>;
  /** Web fallback: trigger a browser download. */
  webDownload: (filename: string, json: string) => void;
}

export const defaultDeps: BackupDeps = {
  isNative: isNativePlatform,
  writeFile: async (path, data) => {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    return Filesystem.writeFile({ path, data, directory: Directory.Cache, encoding: Encoding.UTF8 });
  },
  share: async (opts) => {
    const { Share } = await import("@capacitor/share");
    await Share.share(opts);
  },
  webDownload: (filename, json) => {
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
};

export async function downloadBackup(filename: string, json: string, deps: BackupDeps = defaultDeps): Promise<void> {
  if (!deps.isNative()) {
    deps.webDownload(filename, json);
    return;
  }
  const ret = await deps.writeFile(filename, json);
  await deps.share({
    title: "导出学习备份",
    text: "词光学习备份",
    url: ret.uri,
    dialogTitle: "保存备份到…",
  });
}
