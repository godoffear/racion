#!/bin/bash
# Сборка APK: ./tools/build_apk.sh [номер иконки 1-10] [набор: icons2 (тарелки, по умолчанию) | icons]
set -e
cd "$(dirname "$0")/.."
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ANDROID_HOME="$HOME/Library/Android/sdk"
ICON=${1:-$(cat apk/.icon 2>/dev/null || echo 1)}
echo "$ICON" > apk/.icon
python3 src/build.py
node tools/android_assets.js "$ICON" "${2:-icons2}"
cp index.html apk/www/app.html
cp tools/loader.html apk/www/index.html
echo "sdk.dir=$ANDROID_HOME" > apk/android/local.properties
(cd apk && npx cap sync android)
(cd apk/android && ./gradlew assembleDebug)
V=$(grep -o "APP_VERSION='[^']*'" src/app.js | head -1 | cut -d"'" -f2)
mkdir -p out && cp apk/android/app/build/outputs/apk/debug/app-debug.apk "out/Racion-$V.apk"
[ -d ../ready-apk ] && cp "out/Racion-$V.apk" ../ready-apk/ && echo "Копия: ../ready-apk/Racion-$V.apk"
echo "Готово: out/Racion-$V.apk"
