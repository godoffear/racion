package com.godoffear.racion;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.widget.RemoteViews;

/** Общая часть виджетов: обновление, тап по виджету открывает приложение, рисование полосок и кольца. */
public abstract class BaseWidget extends AppWidgetProvider {
    static final String TICK = "com.godoffear.racion.WIDGET_TICK";
    static final Class<?>[] ALL = {RacionWidget.class, RacionWidgetLine.class, RacionWidgetRing.class, RacionWidgetMeal.class};

    abstract RemoteViews build(Context c, WidgetData d, int widthDp, int heightDp);

    @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) update(c, m, id);
        schedule(c);
    }
    @Override public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, android.os.Bundle o) { update(c, m, id); }
    @Override public void onEnabled(Context c) { schedule(c); }
    @Override public void onDisabled(Context c) { if (count(c) == 0) cancelTick(c); }

    void update(Context c, AppWidgetManager m, int id) {
        WidgetData d = WidgetData.load(c);
        android.os.Bundle o = m.getAppWidgetOptions(id);
        RemoteViews v = build(c, d, o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250), o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110));
        Intent open = new Intent(c, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        v.setOnClickPendingIntent(R.id.wroot, PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        v.setInt(R.id.wbg, "setColorFilter", d.bg);
        m.updateAppWidget(id, v);
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        for (Class<?> cls : ALL) {
            int[] ids = m.getAppWidgetIds(new ComponentName(c, cls));
            if (ids.length == 0) continue;
            try {
                BaseWidget p = (BaseWidget) cls.getDeclaredConstructor().newInstance();
                for (int id : ids) p.update(c, m, id);
            } catch (Exception ignored) {}
        }
    }
    static int count(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int n = 0;
        for (Class<?> cls : ALL) n += m.getAppWidgetIds(new ComponentName(c, cls)).length;
        return n;
    }

    static PendingIntent tickIntent(Context c) {
        Intent i = new Intent(c, RacionTick.class).setAction(TICK);
        return PendingIntent.getBroadcast(c, 7, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.setInexactRepeating(AlarmManager.RTC, System.currentTimeMillis() + 15 * 60000L, 15 * 60000L, tickIntent(c));
    }
    static void cancelTick(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(tickIntent(c));
    }

    /** Две тонкие полоски: калории и белок. */
    static Bitmap bars(double a, double b, int acc, int alt, int track) {
        int W = 640, H = 26;
        Bitmap bm = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(bm);
        Paint pt = new Paint(Paint.ANTI_ALIAS_FLAG);
        double[] vals = {a, b};
        int[] cols = {acc, alt};
        for (int i = 0; i < 2; i++) {
            float top = i * 14f, h = 10f;
            pt.setColor(track);
            cv.drawRoundRect(new RectF(0, top, W, top + h), h / 2, h / 2, pt);
            pt.setColor(cols[i]);
            float w = (float) (W * Math.max(0, Math.min(1, vals[i])));
            if (w > 0) cv.drawRoundRect(new RectF(0, top, Math.max(w, h), top + h), h / 2, h / 2, pt);
        }
        return bm;
    }

    /** Кольцо: внешнее — калории, внутреннее — белок; в центре число калорий. */
    static Bitmap ring(WidgetData d) {
        int S = 400;
        Bitmap bm = Bitmap.createBitmap(S, S, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(bm);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeCap(Paint.Cap.ROUND);
        float c = S / 2f;
        float r1 = c - 26, r2 = r1 - 40;
        double kf = Math.max(0, Math.min(1, d.k / Math.max(1, d.kt))), pf = Math.max(0, Math.min(1, d.p / Math.max(1, d.pt)));
        p.setStrokeWidth(30); p.setColor(d.line);
        cv.drawCircle(c, c, r1, p);
        p.setStrokeWidth(22);
        cv.drawCircle(c, c, r2, p);
        p.setStrokeWidth(30); p.setColor(d.accent);
        if (kf > 0) cv.drawArc(new RectF(c - r1, c - r1, c + r1, c + r1), -90, (float) Math.max(4, 360 * kf), false, p);
        p.setStrokeWidth(22); p.setColor(d.alt);
        if (pf > 0) cv.drawArc(new RectF(c - r2, c - r2, c + r2, c + r2), -90, (float) Math.max(4, 360 * pf), false, p);
        Paint t = new Paint(Paint.ANTI_ALIAS_FLAG);
        t.setTextAlign(Paint.Align.CENTER);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setColor(d.ink); t.setTextSize(78);
        cv.drawText(WidgetData.num(d.k), c, c + 14, t);
        t.setTypeface(Typeface.DEFAULT); t.setColor(d.muted); t.setTextSize(30);
        cv.drawText("из " + WidgetData.num(d.kt) + " ккал", c, c + 52, t);
        t.setTextSize(28);
        cv.drawText("белок " + WidgetData.num(d.p), c, c - 60, t);
        return bm;
    }
}
