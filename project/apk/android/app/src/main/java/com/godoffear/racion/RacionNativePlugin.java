package com.godoffear.racion;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Мост JS ⇄ Android: данные для виджета, сохранение файлов в «Загрузки». Ничего не отправляется в интернет. */
@CapacitorPlugin(name = "RacionNative")
public class RacionNativePlugin extends Plugin {
    static final String PREFS = "racion";

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /** widget — JSON для виджета; snapshot — снимок данных для вечерней копии; ghToken/ghRepo — доступ к GitHub; autoBackup — вкл/выкл. */
    @PluginMethod
    public void sync(PluginCall call) {
        SharedPreferences.Editor e = prefs().edit();
        if (call.hasOption("snapshot")) e.putString("snapshot", call.getString("snapshot", ""));
        if (call.hasOption("ghToken")) e.putString("ghToken", call.getString("ghToken", ""));
        if (call.hasOption("ghRepo")) e.putString("ghRepo", call.getString("ghRepo", ""));
        if (call.hasOption("autoBackup")) e.putBoolean("autoBackup", Boolean.TRUE.equals(call.getBoolean("autoBackup", true)));
        boolean widget = call.hasOption("widget");
        if (widget) e.putString("widget", call.getString("widget", ""));
        e.apply();
        if (widget) BaseWidget.refreshAll(getContext());
        if (prefs().getBoolean("autoBackup", true)) BackupScheduler.scheduleNext(getContext()); else BackupScheduler.cancel(getContext());
        call.resolve();
    }

    @PluginMethod
    public void status(PluginCall call) {
        SharedPreferences p = prefs();
        JSObject r = new JSObject();
        r.put("widgets", BaseWidget.count(getContext()));
        r.put("sdk", Build.VERSION.SDK_INT);
        r.put("auto", p.getBoolean("autoBackup", true));
        r.put("localDay", p.getString("localDay", ""));
        r.put("localAt", p.getLong("localAt", 0));
        r.put("localErr", p.getString("localErr", ""));
        r.put("ghDay", p.getString("ghDay", ""));
        r.put("ghAt", p.getLong("ghAt", 0));
        r.put("ghErr", p.getString("ghErr", ""));
        r.put("ghOn", !p.getString("ghToken", "").isEmpty() && !p.getString("ghRepo", "").isEmpty());
        call.resolve(r);
    }

    /** Копия прямо сейчас (в файл и, если подключено, в GitHub). */
    @PluginMethod
    public void backupNow(PluginCall call) {
        androidx.work.WorkManager.getInstance(getContext()).enqueue(
            new androidx.work.OneTimeWorkRequest.Builder(BackupWorker.class)
                .setInputData(new androidx.work.Data.Builder().putBoolean("force", true).build()).build());
        call.resolve();
    }

    /** Сохраняет текст или base64 в папку «Загрузки» (не требует разрешений). */
    @PluginMethod
    public void saveFile(PluginCall call) {
        String name = call.getString("name", "racion.json");
        String mime = call.getString("mime", "application/json");
        String text = call.getString("text");
        String b64 = call.getString("base64");
        try {
            byte[] data = b64 != null ? Base64.decode(b64, Base64.DEFAULT)
                : (text == null ? new byte[0] : text.getBytes(StandardCharsets.UTF_8));
            String where;
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver cr = getContext().getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                v.put(MediaStore.Downloads.MIME_TYPE, mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri u = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (u == null) throw new Exception("не удалось создать файл");
                try (OutputStream os = cr.openOutputStream(u)) { os.write(data); }
                where = "Загрузки/" + name;
            } else {
                File dir = getContext().getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (dir != null && !dir.exists()) dir.mkdirs();
                File f = new File(dir, name);
                try (FileOutputStream os = new FileOutputStream(f)) { os.write(data); }
                where = f.getAbsolutePath();
            }
            JSObject r = new JSObject();
            r.put("where", where);
            call.resolve(r);
        } catch (Exception ex) {
            call.reject(String.valueOf(ex.getMessage()));
        }
    }

    /** Просит лаунчер поставить виджет выбранного вида (Android покажет окно подтверждения). */
    @PluginMethod
    public void pinWidget(PluginCall call) {
        JSObject r = new JSObject();
        try {
            String kind = call.getString("kind", "day");
            Class<?> cls = "line".equals(kind) ? RacionWidgetLine.class : "ring".equals(kind) ? RacionWidgetRing.class : "meal".equals(kind) ? RacionWidgetMeal.class : RacionWidget.class;
            AppWidgetManager m = AppWidgetManager.getInstance(getContext());
            boolean ok = m.isRequestPinAppWidgetSupported() && m.requestPinAppWidget(new ComponentName(getContext(), cls), null, null);
            r.put("requested", ok);
        } catch (Exception ex) { r.put("requested", false); }
        call.resolve(r);
    }

    /** Обновления берутся только из релизов этого репозитория. */
    private static final String REPO_PREFIX = "https://github.com/godoffear/racion-app/releases/download/";

    private byte[] download(String url, int maxBytes) throws Exception {
        if (url == null || !url.startsWith(REPO_PREFIX)) throw new Exception("адрес не из релизов Рациона");
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setInstanceFollowRedirects(true);
        c.setConnectTimeout(20000);
        c.setReadTimeout(60000);
        c.setRequestProperty("User-Agent", "Racion-Android");
        int code = c.getResponseCode();
        if (code != 200) throw new Exception("GitHub ответил " + code);
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[16384]; int n;
            while ((n = in.read(buf)) > 0) {
                b.write(buf, 0, n);
                if (b.size() > maxBytes) throw new Exception("файл слишком большой");
            }
            return b.toByteArray();
        }
    }

    /** Скачивает свежий app.html (без смены APK) и кладёт рядом с приложением; загрузчик запустит его, если версия выше. */
    @PluginMethod
    public void updateWeb(PluginCall call) {
        try {
            String ver = call.getString("ver", "");
            byte[] data = download(call.getString("url"), 8 * 1024 * 1024);
            String html = new String(data, StandardCharsets.UTF_8);
            if (ver.isEmpty() || !html.contains("APP_VERSION='" + ver + "'") || html.length() < 100000) throw new Exception("файл обновления не подошёл");
            File tmp = new File(getContext().getFilesDir(), "override.tmp");
            try (FileOutputStream os = new FileOutputStream(tmp)) { os.write(data); }
            File f = new File(getContext().getFilesDir(), "override.html");
            if (f.exists()) f.delete();
            if (!tmp.renameTo(f)) throw new Exception("не удалось сохранить");
            prefs().edit().putString("ovVer", ver).apply();
            call.resolve();
        } catch (Exception ex) { call.reject(String.valueOf(ex.getMessage())); }
    }

    @PluginMethod
    public void getOverride(PluginCall call) {
        File f = new File(getContext().getFilesDir(), "override.html");
        JSObject r = new JSObject();
        if (f.exists()) { r.put("path", f.getAbsolutePath()); r.put("ver", prefs().getString("ovVer", "0")); }
        call.resolve(r);
    }

    @PluginMethod
    public void clearOverride(PluginCall call) {
        new File(getContext().getFilesDir(), "override.html").delete();
        prefs().edit().remove("ovVer").apply();
        call.resolve();
    }

    /** Скачивает новый APK и открывает установщик Android (подтвердить установку нужно одним нажатием). */
    @PluginMethod
    public void installApk(PluginCall call) {
        try {
            Context ctx = getContext();
            if (Build.VERSION.SDK_INT >= 26 && !ctx.getPackageManager().canRequestPackageInstalls()) {
                Intent s = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + ctx.getPackageName()));
                s.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(s);
                JSObject r = new JSObject(); r.put("needPermission", true); call.resolve(r);
                return;
            }
            byte[] data = download(call.getString("url"), 80 * 1024 * 1024);
            File dir = new File(ctx.getCacheDir(), "updates");
            if (!dir.exists()) dir.mkdirs();
            File apk = new File(dir, "Racion.apk");
            try (FileOutputStream os = new FileOutputStream(apk)) { os.write(data); }
            Uri uri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", apk);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
            JSObject r = new JSObject(); r.put("started", true); call.resolve(r);
        } catch (Exception ex) { call.reject(String.valueOf(ex.getMessage())); }
    }

    /** Запрос к Gemini API (только этот адрес). Возвращает {status, body}. */
    @PluginMethod
    public void httpJson(PluginCall call) {
        String url = call.getString("url", "");
        if (!url.startsWith("https://generativelanguage.googleapis.com/")) { call.reject("адрес не разрешён"); return; }
        try {
            String method = call.getString("method", "POST");
            String key = call.getString("key", "");
            String body = call.getString("body", "");
            HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
            c.setRequestMethod(method);
            c.setConnectTimeout(20000);
            c.setReadTimeout(90000);
            c.setRequestProperty("x-goog-api-key", key);
            c.setRequestProperty("Content-Type", "application/json");
            c.setRequestProperty("User-Agent", "Racion-Android");
            if (!"GET".equals(method) && !body.isEmpty()) {
                c.setDoOutput(true);
                try (OutputStream os = c.getOutputStream()) { os.write(body.getBytes(StandardCharsets.UTF_8)); }
            }
            int code = c.getResponseCode();
            InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            if (in != null) { byte[] buf = new byte[16384]; int n; while ((n = in.read(buf)) > 0) { b.write(buf, 0, n); if (b.size() > 8 * 1024 * 1024) break; } }
            JSObject r = new JSObject();
            r.put("status", code);
            r.put("body", b.toString("UTF-8"));
            call.resolve(r);
        } catch (Exception ex) { call.reject(String.valueOf(ex.getMessage())); }
    }

    /** Открывает https-ссылку в браузере телефона. */
    @PluginMethod
    public void openUrl(PluginCall call) {
        try {
            String url = call.getString("url", "");
            if (!url.startsWith("https://")) { call.reject("только https"); return; }
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception ex) { call.reject(String.valueOf(ex.getMessage())); }
    }

    /** Текст из буфера обмена (работает, пока приложение на экране). */
    @PluginMethod
    public void readClip(PluginCall call) {
        JSObject r = new JSObject();
        try {
            android.content.ClipboardManager cm = (android.content.ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
            android.content.ClipData d = cm == null ? null : cm.getPrimaryClip();
            String s = "";
            if (d != null && d.getItemCount() > 0 && d.getItemAt(0).getText() != null) s = d.getItemAt(0).getText().toString();
            r.put("text", s);
        } catch (Exception ex) { r.put("text", ""); }
        call.resolve(r);
    }
}
