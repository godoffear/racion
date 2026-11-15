package com.godoffear.racion;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Вечерняя копия данных: файл в «Загрузки/Рацион» (хранятся последние 14) и, если подключено, в приватный репозиторий GitHub
 * (latest.json + history/racion_ДАТА.json). Берёт последний снимок данных, который приложение сохранило при работе.
 */
public class BackupWorker extends Worker {
    static final String DIR = "Рацион";
    static final String PREFIX = "Рацион_авто_";

    public BackupWorker(@NonNull Context c, @NonNull WorkerParameters p) { super(c, p); }

    @NonNull
    @Override
    public Result doWork() {
        Context ctx = getApplicationContext();
        SharedPreferences p = ctx.getSharedPreferences(RacionNativePlugin.PREFS, Context.MODE_PRIVATE);
        String snap = p.getString("snapshot", "");
        if (snap == null || snap.isEmpty()) return Result.success();
        boolean force = getInputData().getBoolean("force", false);
        String day = getInputData().getString("day");
        if (day == null) day = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        byte[] data = snap.getBytes(StandardCharsets.UTF_8);
        SharedPreferences.Editor e = p.edit();

        // 1) файл на телефоне
        if (force || !day.equals(p.getString("localDay", ""))) {
            try {
                saveLocal(ctx, PREFIX + day + ".json", data);
                e.putString("localDay", day).putLong("localAt", System.currentTimeMillis()).putString("localErr", "");
            } catch (Exception ex) { e.putString("localErr", String.valueOf(ex.getMessage())); }
            e.apply();
        }
        // 2) GitHub
        String token = p.getString("ghToken", ""), repo = p.getString("ghRepo", "");
        if (token != null && !token.isEmpty() && repo != null && !repo.isEmpty() && (force || !day.equals(p.getString("ghDay", "")))) {
            try {
                String content = Base64.encodeToString(data, Base64.NO_WRAP);
                String stamp = day + " " + new SimpleDateFormat("HH:mm", Locale.US).format(new Date());
                put(token, repo, "latest.json", content, "Рацион: копия " + stamp);
                put(token, repo, "history/racion_" + day + ".json", content, "Рацион: копия за " + day);
                p.edit().putString("ghDay", day).putLong("ghAt", System.currentTimeMillis()).putString("ghErr", "").apply();
            } catch (Exception ex) {
                p.edit().putString("ghErr", String.valueOf(ex.getMessage())).apply();
                return getRunAttemptCount() < 8 ? Result.retry() : Result.failure();
            }
        }
        return Result.success();
    }

    /** Пишет файл в «Загрузки/Рацион»: тот же день перезаписывается, хранятся 14 последних. */
    static void saveLocal(Context ctx, String name, byte[] data) throws Exception {
        if (Build.VERSION.SDK_INT >= 29) {
            ContentResolver cr = ctx.getContentResolver();
            String rel = Environment.DIRECTORY_DOWNLOADS + "/" + DIR + "/";
            List<Uri> mine = new ArrayList<>(); List<String> names = new ArrayList<>();
            try (Cursor c = cr.query(MediaStore.Downloads.EXTERNAL_CONTENT_URI, new String[]{MediaStore.Downloads._ID, MediaStore.Downloads.DISPLAY_NAME},
                MediaStore.Downloads.RELATIVE_PATH + "=? AND " + MediaStore.Downloads.DISPLAY_NAME + " LIKE ?", new String[]{rel, PREFIX + "%"}, MediaStore.Downloads.DISPLAY_NAME + " DESC")) {
                while (c != null && c.moveToNext()) {
                    mine.add(Uri.withAppendedPath(MediaStore.Downloads.EXTERNAL_CONTENT_URI, String.valueOf(c.getLong(0))));
                    names.add(c.getString(1));
                }
            }
            for (int i = 0; i < names.size(); i++) if (names.get(i).equals(name)) { try { cr.delete(mine.get(i), null, null); } catch (Exception ignored) {} }
            ContentValues v = new ContentValues();
            v.put(MediaStore.Downloads.DISPLAY_NAME, name);
            v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
            v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + DIR);
            Uri u = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (u == null) throw new Exception("не удалось создать файл");
            try (OutputStream os = cr.openOutputStream(u)) { os.write(data); }
            int kept = 0;
            for (int i = 0; i < names.size(); i++) { // names отсортированы по убыванию: новые первыми
                if (names.get(i).equals(name)) continue;
                if (++kept >= 14) { try { cr.delete(mine.get(i), null, null); } catch (Exception ignored) {} }
            }
        } else {
            File dir = new File(ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), DIR);
            if (!dir.exists()) dir.mkdirs();
            try (FileOutputStream os = new FileOutputStream(new File(dir, name))) { os.write(data); }
        }
    }

    private static HttpURLConnection open(String token, String repo, String path, String method) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL("https://api.github.com/repos/" + repo + "/contents/" + path).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(20000);
        c.setReadTimeout(30000);
        c.setRequestProperty("Authorization", "Bearer " + token);
        c.setRequestProperty("Accept", "application/vnd.github+json");
        c.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
        c.setRequestProperty("User-Agent", "Racion-Android");
        return c;
    }

    private static String read(InputStream in) throws Exception {
        java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[8192]; int n;
        while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
        return b.toString("UTF-8");
    }

    private static void put(String token, String repo, String path, String content, String msg) throws Exception {
        String sha = null;
        HttpURLConnection g = open(token, repo, path, "GET");
        int gc = g.getResponseCode();
        if (gc == 200) sha = new JSONObject(read(g.getInputStream())).getString("sha");
        else if (gc != 404) throw new Exception(why(gc));
        g.disconnect();
        JSONObject body = new JSONObject();
        body.put("message", msg);
        body.put("content", content);
        if (sha != null) body.put("sha", sha);
        HttpURLConnection c = open(token, repo, path, "PUT");
        c.setDoOutput(true);
        c.setRequestProperty("Content-Type", "application/json");
        try (OutputStream os = c.getOutputStream()) { os.write(body.toString().getBytes(StandardCharsets.UTF_8)); }
        int code = c.getResponseCode();
        c.disconnect();
        if (code != 200 && code != 201) throw new Exception(why(code));
    }

    private static String why(int s) {
        return s == 401 || s == 403 ? "нет доступа: проверь токен и право Contents: Read and write" : s == 404 ? "репозиторий не найден" : s == 409 || s == 422 ? "конфликт записи" : "GitHub ответил " + s;
    }
}
