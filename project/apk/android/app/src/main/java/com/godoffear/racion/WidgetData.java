package com.godoffear.racion;

import android.content.Context;
import android.graphics.Color;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/** Данные для всех виджетов: разбирает JSON, который сохранило приложение. */
final class WidgetData {
    static final class Meal { String t = "", n = "", s = ""; int kc, d; }

    int bg = Color.WHITE, ink = Color.parseColor("#16241F"), muted = Color.parseColor("#5C6C65"),
        accent = Color.parseColor("#1E6B55"), line = Color.parseColor("#D3DCD5"), alt = Color.parseColor("#C98E12");
    String head = "Рацион";
    final List<Meal> meals = new ArrayList<>();
    int next = -1;                    // номер ближайшего несъеденного приёма (или -1, если всё закрыто)
    double k, kt = 1950, p, pt = 195;
    String tomorrow = "";
    boolean hasToday;

    private static int col(JSONObject o, String key, int def) {
        try { return Color.parseColor(o.optString(key, "")); } catch (Exception e) { return def; }
    }
    private static int mins(String t) {
        try { String[] a = t.split(":"); return Integer.parseInt(a[0]) * 60 + Integer.parseInt(a[1]); } catch (Exception e) { return 0; }
    }

    static WidgetData load(Context c) {
        WidgetData w = new WidgetData();
        String raw = c.getSharedPreferences(RacionNativePlugin.PREFS, Context.MODE_PRIVATE).getString("widget", "");
        try {
            JSONObject o = new JSONObject(raw);
            w.bg = col(o, "bg", w.bg); w.ink = col(o, "ink", w.ink); w.muted = col(o, "muted", w.muted);
            w.accent = col(o, "accent", w.accent); w.line = col(o, "line", w.line); w.alt = col(o, "alt", w.alt);
            Calendar now = Calendar.getInstance();
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            Calendar tm = (Calendar) now.clone(); tm.add(Calendar.DAY_OF_YEAR, 1);
            String tomorrowKey = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(tm.getTime());
            JSONObject days = o.getJSONObject("days");
            JSONObject d = days.optJSONObject(today);
            if (d != null) {
                w.hasToday = true;
                w.head = d.optString("lbl", "сегодня");
                w.k = d.optDouble("k", 0); w.kt = d.optDouble("kt", 1950); w.p = d.optDouble("p", 0); w.pt = d.optDouble("pt", 195);
                JSONArray ms = d.getJSONArray("meals");
                for (int i = 0; i < ms.length(); i++) {
                    JSONObject m = ms.getJSONObject(i);
                    Meal x = new Meal();
                    x.t = m.optString("t"); x.n = m.optString("n"); x.s = m.optString("s"); x.kc = m.optInt("kc", 0); x.d = m.optInt("d", 0);
                    w.meals.add(x);
                }
                int nowMin = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE);
                for (int i = 0; i < w.meals.size(); i++) {
                    Meal m = w.meals.get(i);
                    if (m.d == 0 && mins(m.t) >= nowMin - 45) { w.next = i; break; }
                }
                if (w.next < 0) for (int i = 0; i < w.meals.size(); i++) if (w.meals.get(i).d == 0) { w.next = i; break; }
                JSONObject nd = days.optJSONObject(tomorrowKey);
                if (nd != null && nd.getJSONArray("meals").length() > 0) {
                    JSONObject f = nd.getJSONArray("meals").getJSONObject(0);
                    w.tomorrow = "Завтра в " + f.optString("t") + " · " + f.optString("n");
                }
            }
        } catch (Exception ignored) {}
        return w;
    }

    Meal nextMeal() { return next >= 0 ? meals.get(next) : null; }
    static String num(double v) { return String.valueOf(Math.round(v)); }
}
