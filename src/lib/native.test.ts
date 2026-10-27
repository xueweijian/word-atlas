import test from "node:test";
import assert from "node:assert/strict";
import { isNativePlatform } from "./native";

type Win = { Capacitor?: unknown };

function setWindow(capacitor: unknown) {
  (globalThis as { window?: Win }).window =
    capacitor === null ? undefined : ({ Capacitor: capacitor } as Win);
}

test.afterEach(() => {
  delete (globalThis as { window?: Win }).window;
});

test("纯浏览器（无 Capacitor 全局）→ false", () => {
  setWindow({});
  assert.equal(isNativePlatform(), false);
});

test("Capacitor.isNativePlatform()===true → true", () => {
  setWindow({ isNativePlatform: () => true });
  assert.equal(isNativePlatform(), true);
});

test("Capacitor.isNativePlatform()===false → false", () => {
  setWindow({ isNativePlatform: () => false });
  assert.equal(isNativePlatform(), false);
});

test("isNativePlatform 抛异常 → false（绝不能炸掉启动路径）", () => {
  setWindow({
    get isNativePlatform() {
      throw new Error("boom");
    },
  });
  assert.equal(isNativePlatform(), false);
});

test("Capacitor 存在但没有 isNativePlatform 方法 → false", () => {
  setWindow({ getPlatform: () => "web" });
  assert.equal(isNativePlatform(), false);
});

test("无 window（SSR/node 环境）→ false", () => {
  setWindow(null);
  assert.equal(isNativePlatform(), false);
});
