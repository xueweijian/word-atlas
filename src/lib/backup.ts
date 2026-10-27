import { isNativePlatform } from "./native";

/**
 * Export the learning backup.
 * - Web/PWA: browser download via blob link (unchanged behavior).
 * - Native APK: write into app-private cache with @capacitor/filesystem,
 *   then open the system share sheet with @capacitor/share so the user can
 *   save it anywhere (file manager, chat apps, cloud drive...).
 *
 * Both native plugins are lazy-imported so the web build never bundles them.
 */
export async function downloadBackup(filename: string, json: string): Promise<void> {
  if (!isNativePlatform()) {
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return;
  }
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);
  const ret = await Filesystem.writeFile({
    path: filename,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  await Share.share({
    title: "导出学习备份",
    text: "词光学习备份",
    url: ret.uri,
    dialogTitle: "保存备份到…",
  });
}
