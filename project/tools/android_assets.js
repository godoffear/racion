// node tools/android_assets.js <номер иконки 1-10>
// Рисует значки Android (обычные, круглые, адаптивные слои, монохромный, заставка) и иконки PWA из design/icons.
const sharp = require('sharp'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const n = String(process.argv[2] || 1).padStart(2, '0');
const SET = process.argv[3] || 'icons2';
const SPLASHES = {icons: {'01':'#14503F','02':'#0F4A38','03':'#0B2F25','04':'#0F1A16','05':'#F6EFDF','06':'#C2512B','07':'#0F1114','08':'#FFD65A','09':'#0E4C54','10':'#3C2A86'},
  icons2: {'01':'#1F7A62','02':'#12453A','03':'#F4ECD6','04':'#E4782F','05':'#10201A','06':'#1B7F82','07':'#0E3B3F','08':'#F3E9D2','09':'#F7A94A','10':'#F6EFDB'}};
const SPLASH = SPLASHES[SET];
const icons = path.join(root, 'design', SET);
const full = fs.readdirSync(icons).find(f => f.startsWith(n + '_') && f.endsWith('.svg') && !/_(fg|bg)\.svg$/.test(f));
const res = path.join(root, 'apk/android/app/src/main/res');
const png = (svgFile, size, out) => sharp(fs.readFileSync(path.join(icons, svgFile)), {density: 400}).resize(size, size).png().toFile(out);
const dens = {mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4};
(async () => {
  for (const [d, k] of Object.entries(dens)) {
    const dir = path.join(res, 'mipmap-' + d);
    await png(full, Math.round(48 * k), path.join(dir, 'ic_launcher.png'));
    // круглая: тот же значок, обрезанный кругом
    const s = Math.round(48 * k);
    const circle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><circle cx="${s/2}" cy="${s/2}" r="${s/2}"/></svg>`);
    await sharp(fs.readFileSync(path.join(icons, full)), {density: 400}).resize(s, s).composite([{input: circle, blend: 'dest-in'}]).png().toFile(path.join(dir, 'ic_launcher_round.png'));
    await png(n + '_fg.svg', Math.round(108 * k), path.join(dir, 'ic_launcher_foreground.png'));
  }
  const nodpi = path.join(res, 'drawable-nodpi'); fs.mkdirSync(nodpi, {recursive: true});
  await png(n + '_bg.svg', 432, path.join(nodpi, 'ic_launcher_bg_img.png'));
  // монохромный слой для тематических иконок Android 13+
  const fgp = await sharp(fs.readFileSync(path.join(icons, n + '_fg.svg')), {density: 400}).resize(432, 432).png().toBuffer();
  const alpha = await sharp(fgp).ensureAlpha().extractChannel(3).toBuffer();
  await sharp({create: {width: 432, height: 432, channels: 3, background: '#ffffff'}}).joinChannel(alpha).png().toFile(path.join(nodpi, 'ic_launcher_mono.png'));
  for (const f of ['ic_launcher.xml', 'ic_launcher_round.xml'])
    fs.writeFileSync(path.join(res, 'mipmap-anydpi-v26', f), `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_bg_img"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@drawable/ic_launcher_mono"/>
</adaptive-icon>
`);
  fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${SPLASH[n]}</color>
</resources>
`);
  // заставка Android 12+
  fs.writeFileSync(path.join(res, 'values/styles.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/ic_launcher_background</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`);
  // PWA
  for (const [f, s] of [['icon-192.png', 192], ['icon-512.png', 512]]) await png(full, s, path.join(root, f));
  const bgp = await sharp(fs.readFileSync(path.join(icons, n + '_bg.svg')), {density: 400}).resize(512, 512).png().toBuffer();
  const fg2 = await sharp(fs.readFileSync(path.join(icons, n + '_fg.svg')), {density: 400}).resize(512, 512).png().toBuffer();
  await sharp(bgp).composite([{input: fg2}]).png().toFile(path.join(root, 'icon-maskable-512.png'));
  console.log('icon', n, full);
})();
