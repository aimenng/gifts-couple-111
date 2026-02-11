# 手机 App 制作与发布指南

> 目标：将当前 Vite + React 项目封装为 Android/iOS App，并保持一套代码。

## 1) 已完成的基础能力

- Web 端已添加 PWA manifest 与 service worker，可安装到手机桌面。
- UI 已包含安全区（safe area）与移动端底部导航。
- 根目录新增 `capacitor.config.ts`，可直接用于 Capacitor 工程同步。

## 2) 本地开发联调

```bash
npm install
npm run dev:full
```

## 3) 打包 Web 资源

```bash
npm run build
```

## 4) 初始化 Capacitor（首次）

> 说明：如果公司网络策略限制 npm registry，请在可访问 npm registry 的环境执行。

```bash
npm i -D @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

## 5) 每次发布前同步

```bash
npm run build
npx cap sync
```

## 6) 生成安装包

### Android

```bash
npx cap open android
```

- 在 Android Studio 中执行 `Build > Generate Signed Bundle / APK`。
- 产物建议优先 `AAB`（Google Play）。

### iOS

```bash
npx cap open ios
```

- 在 Xcode 设置 Team、Bundle Identifier、Signing。
- 使用 Archive 上传 App Store Connect。

## 7) 后端地址配置

- Web/PWA：通过 `.env.local` 的 `VITE_API_BASE_URL` 指向正式后端地址（建议 HTTPS）。
- 原生 App：可通过 `CAPACITOR_SERVER_URL` 指向调试域名（仅调试模式建议）。

## 8) 上架前检查清单

- [ ] 320/360/375/390/414 宽度检查布局。
- [ ] 登录、注册、绑定、专注计时、时间线完整流程。
- [ ] 弱网下 API 超时提示文案。
- [ ] 首次安装与冷启动时长。
- [ ] 主题切换、深浅色一致性。
