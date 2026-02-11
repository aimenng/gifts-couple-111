#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUILD_TYPE="${1:-debug}" # debug | release
BUILD_TYPE="${BUILD_TYPE,,}"

if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
  echo "[ERROR] 用法: ./scripts/build-android-apk.sh [debug|release]"
  exit 1
fi

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

if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" ]]; then
  echo "[WARN] 未检测到 ANDROID_HOME / ANDROID_SDK_ROOT，若 Gradle 报 SDK 路径错误，请先设置环境变量。"
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

if [ -n "${ANDROID_HOME:-}" ] && [ ! -f "local.properties" ]; then
  echo "[INFO] 生成 android/local.properties"
  echo "sdk.dir=${ANDROID_HOME//\//\\}" > local.properties
fi

if [ "$BUILD_TYPE" = "debug" ]; then
  echo "[INFO] 生成 Debug APK（可直接安装测试）"
  ./gradlew assembleDebug
  echo
  echo "[DONE] APK 产物路径：android/app/build/outputs/apk/debug/app-debug.apk"
  exit 0
fi

echo "[INFO] 生成 Release APK"
./gradlew assembleRelease

UNSIGNED_APK="app/build/outputs/apk/release/app-release-unsigned.apk"
SIGNED_APK="app/build/outputs/apk/release/app-release-signed.apk"

if [ -n "${ANDROID_KEYSTORE_PATH:-}" ] && [ -n "${ANDROID_KEY_ALIAS:-}" ] && [ -n "${ANDROID_KEYSTORE_PASSWORD:-}" ] && [ -n "${ANDROID_KEY_PASSWORD:-}" ]; then
  if ! command -v apksigner >/dev/null 2>&1; then
    echo "[WARN] 未找到 apksigner，跳过自动签名。请在 Android Studio 里进行签名。"
  else
    echo "[INFO] 检测到签名环境变量，正在签名 Release APK"
    cp "$UNSIGNED_APK" "$SIGNED_APK"
    apksigner sign \
      --ks "$ANDROID_KEYSTORE_PATH" \
      --ks-key-alias "$ANDROID_KEY_ALIAS" \
      --ks-pass "pass:${ANDROID_KEYSTORE_PASSWORD}" \
      --key-pass "pass:${ANDROID_KEY_PASSWORD}" \
      "$SIGNED_APK"

    echo "[INFO] 验证签名"
    apksigner verify "$SIGNED_APK"
  fi
fi

echo

echo "[DONE] APK 产物路径："
echo "- Unsigned Release: android/$UNSIGNED_APK"
if [ -f "$SIGNED_APK" ]; then
  echo "- Signed Release  : android/$SIGNED_APK"
fi

echo "如需安装到手机，执行：npm run android:install -- debug"
