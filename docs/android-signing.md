# Android 签名（可选，但建议配）

Debug 包（每次 push 自动出，Actions Artifacts 里下载）不需要任何密钥，
装上就能用。

打 `v*` tag 发 GitHub Release 时：

- 如果配了下面 4 个 Secrets → 出**正式签名包**（`wordatlas-vX.Y.apk`）；
- 如果没配 → 自动退回 debug 签名包（`wordatlas-vX.Y-debug.apk`），
  照样能装，只是换签名要卸载重装。所以建议正式发布前配好。

## 生成 keystore（只需一次）

```bash
keytool -genkeypair -v \
  -keystore wordatlas-release.jks \
  -alias wordatlas \
  -keyalg RSA -keysize 2048 -validity 9125 \
  -storepass '换成你自己的强密码' \
  -keypass '换成你自己的强密码' \
  -dname "CN=word-atlas-fork"
```

> 别名、密码、文件名随意，但 Secrets 里的四个值必须和这里一致。
> **jks 文件千万别进 git**，只留一份在你自己手里 + 一份 base64 进 Secrets。

## 写入 Secrets

仓库页面 → Settings → Secrets and variables → Actions → New repository secret：

| Name | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 wordatlas-release.jks` 的输出（一长串，无换行；macOS 用 `base64 -b0`） |
| `KEYSTORE_PASSWORD` | 上面的 storepass |
| `KEY_ALIAS` | 上面的 alias（例 `wordatlas`） |
| `KEY_PASSWORD` | 上面的 keypass |

## 验证

```bash
git tag v0.1.0 && git push origin v0.1.0
```

去 Actions 看 `android-apk` 跑完，Release 页应出现正式签名包。

## 换电脑/丢了怎么办

keystore 丢了 = 以后所有正式包都要换签名，用户要卸载重装。所以：
原始 jks 存至少两个地方（本机 + 网盘/加密 U 盘各一份）。
