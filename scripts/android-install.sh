#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUILD_TYPE="${1:-debug}" # debug | release
BUILD_TYPE="${BUILD_TYPE,,}"

if ! command -v adb >/dev/null 2>&1; then
  echo "[ERROR] adb 未安装，请先安装 Android platform-tools"
  exit 1
fi

if [[ "$BUILD_TYPE" == "debug" ]]; then
  APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
else
  APK_PATH="android/app/build/outputs/apk/release/app-release-signed.apk"
  if [ ! -f "$APK_PATH" ]; then
    APK_PATH="android/app/build/outputs/apk/release/app-release-unsigned.apk"
  fi
fi

if [ ! -f "$APK_PATH" ]; then
  echo "[ERROR] 未找到 APK: $APK_PATH"
  echo "请先执行: npm run android:apk -- $BUILD_TYPE"
  exit 1
fi

DEVICE_COUNT="$(adb devices | awk 'NR>1 && $2=="device" {count++} END{print count+0}')"
if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "[ERROR] 未检测到可用设备。请打开手机开发者模式 + USB 调试，并授权电脑。"
  exit 1
fi

echo "[INFO] 安装 APK -> $APK_PATH"
adb install -r "$APK_PATH"

echo "[DONE] 安装完成。"
echo "小米/华为若提示拦截，请在系统中允许 USB 安装/未知来源安装。"
