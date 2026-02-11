<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GIFTS Couple Connection

情侣关系记录与专注陪伴应用，当前支持：
- Web（开发与部署）
- PWA（可安装到手机桌面）
- Capacitor 原生壳（Android / iOS）

## 1. 本地开发

**Prerequisites:** Node.js 20+

1. 安装依赖
   ```bash
   npm install
   ```
2. 配置环境变量（创建 `.env.local`）
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_API_BASE_URL=http://localhost:8787/api
   ```
3. 启动前后端
   ```bash
   npm run dev:full
   ```

## 2. 打包 Web/PWA

```bash
npm run build
```

构建产物在 `dist/`，并包含 PWA manifest 与 service worker。

## 3. 打包成手机 App（Capacitor）

### 3.1 初始化原生工程（首次）

```bash
npx cap add android
npx cap add ios
```

### 3.2 每次代码更新后同步

```bash
npm run build:app
```

### 3.3 打开原生 IDE

```bash
npm run cap:open:android
npm run cap:open:ios
```

在 Android Studio / Xcode 内完成签名、打包、上架。

## 4. 手机适配说明

项目已启用：
- `viewport-fit=cover`（刘海屏支持）
- Safe area 间距（顶部/底部）
- 底部主导航固定布局
- PWA 安装提示

建议发布前至少在 320/360/375/390/414 宽度实机检查。


## 5. Android APK 一键打包（可安装到手机）

```bash
npm run android:apk
```

如果你在国内网络环境遇到 npm 源访问问题：

```bash
USE_NPM_MIRROR=1 npm run android:apk
```

APK 产物默认输出：
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-unsigned.apk`

> 完整流程和小米/华为适配建议请看：`ANDROID_APK_RELEASE.md`。


### 5.1 构建 Release APK（用于分发）

```bash
npm run android:apk:release
```

### 5.2 USB 直装到手机（小米/华为等）

```bash
npm run android:install -- debug
```

如果要安装 release 包：

```bash
npm run android:install -- release
```
