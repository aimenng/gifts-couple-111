# Android APK 打包与主流机型适配（小米/华为/OPPO/vivo）

本文档目标：让当前项目可以稳定产出 APK 并安装到主流安卓手机。

## 1. 环境准备

- Node.js 20+
- Android Studio（建议最新稳定版）
- JDK 17
- Android SDK Platform 34+

## 2. 一键打包（推荐）

仓库已提供脚本：

```bash
npm run android:apk
```

脚本会自动执行：
1) 初始化 Capacitor Android（若尚未初始化）
2) 构建 Web 产物
3) 同步到 Android 工程
4) 生成 Debug/Release APK

产物位置：
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-unsigned.apk`

> 国内网络如无法访问 npm 官方源，可使用：

```bash
USE_NPM_MIRROR=1 npm run android:apk
```


### 2.1 直接构建 Release APK

```bash
npm run android:apk:release
```

## 3. Release 签名（必须）

未签名 release 包无法直接分发安装。请在 `android/` 下执行：

```bash
keytool -genkeypair -v -keystore gifts-release.keystore -alias gifts -keyalg RSA -keysize 2048 -validity 10000
```

在 Android Studio 中：
- Build → Generate Signed Bundle / APK
- 选择 APK
- 选择上述 keystore
- 生成 signed release APK


### 3.1 可选：命令行自动签名

脚本支持读取以下环境变量自动签名：

- `ANDROID_KEYSTORE_PATH`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`

示例：

```bash
ANDROID_KEYSTORE_PATH=/path/gifts-release.keystore ANDROID_KEY_ALIAS=gifts ANDROID_KEYSTORE_PASSWORD=*** ANDROID_KEY_PASSWORD=*** npm run android:apk:release
```

## 4. 小米/华为等机型适配要点

### 4.1 系统版本与 WebView
- 建议 `minSdkVersion >= 24`，`targetSdkVersion` 使用最新稳定（当前建议 34/35）。
- 真机测试至少覆盖 Android 10、12、13、14。
- 核查系统 Android System WebView 版本（较旧版本可能影响动画与输入框行为）。

### 4.2 电池/后台策略（小米/华为常见）
如果后续接入推送、计时提醒、前后台任务：
- 小米：在“省电策略/自启动管理”允许自启动与后台运行。
- 华为：在“启动管理/电池优化”关闭对该 App 的限制。
- 引导用户在 App 首次启动时完成这些系统设置。

### 4.3 安装与权限
- 调试安装时需开启“允许安装未知应用”。
- 所有敏感权限都要在首次使用时再申请（最小权限原则）。

### 4.4 屏幕适配检查清单
- 分辨率：`360x800`、`393x852`、`412x915`
- 检查刘海屏/手势导航下的顶部与底部安全区
- 登录、注册、时间线、专注页完整流程
- 横竖屏切换（如不支持横屏，需锁定方向）

## 5. 上架建议

- 国内分发：可先通过企业内测渠道发 APK。
- Google Play：优先上传 AAB；APK 用于内测分发。
- 在每次发版时记录：版本号、构建时间、commit hash、测试机型列表。


## 6. 安装到小米/华为等手机

```bash
npm run android:install -- debug
```

若要安装 release 包：

```bash
npm run android:install -- release
```

安装前请确认：
- 已开启开发者模式和 USB 调试
- 已在手机弹窗中允许当前电脑调试授权
- 小米/华为系统中已允许 USB 安装或未知来源安装

## 7. 常见问题

### Q1: `npm i` 拉不到 `@capacitor/*`
可能是网络或镜像策略限制。先尝试：

```bash
npm config set registry https://registry.npmmirror.com
npm i -D @capacitor/core @capacitor/cli @capacitor/android
```

### Q2: `assembleRelease` 成功但安装失败
通常是未签名或签名不一致。请重新生成 signed APK。

### Q3: 华为/小米后台被杀导致提醒失效
需要引导用户关闭系统电池优化，并在系统设置中启用自启动。
