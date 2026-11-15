#!/bin/bash
# Готовит файлы релиза: ./tools/make_release.sh 6.2 "Что нового" [native-номер]
# Кладёт в release/v6.2/: Racion-6.2.apk, app.html (обновление без APK), notes.txt (текст релиза).
# Если в этой версии появился новый нативный код — подними NATIVE_API в src/native.js и передай номер третьим аргументом.
set -e
cd "$(dirname "$0")/.."
VER="$1"; NOTES="$2"; NAT="${3:-1}"
[ -z "$VER" ] && { echo "версия?"; exit 1; }
sed -i '' "s/const APP_VERSION='[^']*'/const APP_VERSION='$VER'/" src/app.js
CODE=$(( $(grep -o 'versionCode [0-9]*' apk/android/app/build.gradle | grep -o '[0-9]*') + 1 ))
sed -i '' -E "s/versionCode [0-9]+/versionCode $CODE/; s/versionName \"[^\"]*\"/versionName \"$VER\"/" apk/android/app/build.gradle
./tools/build_apk.sh "$(cat apk/.icon)" 2>&1 | tail -3
D="release/v$VER"; mkdir -p "$D"
cp "out/Racion-$VER.apk" "$D/"; cp index.html "$D/app.html"
printf 'native:%s\n%s\n' "$NAT" "$NOTES" > "$D/notes.txt"
echo "Готово: $D"; ls -l "$D"
