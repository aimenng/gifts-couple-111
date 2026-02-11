#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js 未安装，请先安装 Node.js 20+"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm 未安装"
  exit 1
fi

if ! command -v java >/dev/null 2>&1; then
  echo "[ERROR] Java 未安装，请先安装 JDK 17（Android Studio Ladybug+ 推荐）"
  exit 1
fi

if [ ! -d "android" ]; then
  echo "[INFO] 检测到 android 工程不存在，正在初始化 Capacitor Android..."
  if [ "${USE_NPM_MIRROR:-0}" = "1" ]; then
    echo "[INFO] 使用 npmmirror 安装 Capacitor 依赖"
    npm config set registry https://registry.npmmirror.com
  fi

  npm i -D @capacitor/core @capacitor/cli @capacitor/android
  npx cap add android
fi

echo "[INFO] 构建前端产物"
npm run build

echo "[INFO] 同步到 Android 工程"
npx cap sync android

cd "$ROOT_DIR/android"

echo "[INFO] 生成 Debug APK（可直接安装测试）"
./gradlew assembleDebug

echo "[INFO] 生成 Release APK（需签名后分发）"
./gradlew assembleRelease

echo

echo "[DONE] APK 产物路径："
echo "- Debug : android/app/build/outputs/apk/debug/app-debug.apk"
echo "- Release: android/app/build/outputs/apk/release/app-release-unsigned.apk"
echo
echo "签名后可得到可安装的 release APK。"
