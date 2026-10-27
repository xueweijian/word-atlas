import test from "node:test";
import assert from "node:assert/strict";
import { downloadBackup, type BackupDeps } from "./backup";

const DATA = JSON.stringify({ app: "word-atlas", version: 2, cards: { a: 1 } });

function fakeDeps(over: Partial<BackupDeps> = {}) {
  const calls: string[] = [];
  const deps: BackupDeps = {
    isNative: () => false,
    writeFile: async (path, data) => {
      calls.push(`write:${path}:${data.length}`);
      return { uri: `file://cache/${path}` };
    },
    share: async (o) => {
      calls.push(`share:${o.url}`);
    },
    webDownload: (filename, json) => {
      calls.push(`web:${filename}:${json.length}`);
    },
    ...over,
  };
  return { deps, calls };
}

test("web 分支：走 blob 下载，绝不碰原生插件", async () => {
  const { deps, calls } = fakeDeps();
  await downloadBackup("backup.json", DATA, deps);
  assert.deepEqual(calls, [`web:backup.json:${DATA.length}`]);
});

test("原生分支：先写缓存，再把返回的 uri 交给分享面板", async () => {
  const { deps, calls } = fakeDeps({ isNative: () => true });
  await downloadBackup("backup.json", DATA, deps);
  assert.deepEqual(calls, [`write:backup.json:${DATA.length}`, "share:file://cache/backup.json"]);
});

test("原生分支：文件名原样透传（带日期后缀）", async () => {
  const { deps, calls } = fakeDeps({ isNative: () => true });
  await downloadBackup("word-atlas-backup-2026-10-27.json", DATA, deps);
  assert.match(calls[0], /^write:word-atlas-backup-2026-10-27\.json:/);
});

test("写入失败要向上抛（Me 页 toast 用）", async () => {
  const { deps } = fakeDeps({
    isNative: () => true,
    writeFile: async () => {
      throw new Error("disk full");
    },
  });
  await assert.rejects(() => downloadBackup("b.json", DATA, deps), /disk full/);
});

test("分享取消/失败也要向上抛", async () => {
  const { deps } = fakeDeps({
    isNative: () => true,
    share: async () => {
      throw new Error("share canceled");
    },
  });
  await assert.rejects(() => downloadBackup("b.json", DATA, deps), /share canceled/);
});
