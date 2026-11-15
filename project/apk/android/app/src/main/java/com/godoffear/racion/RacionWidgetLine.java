package com.godoffear.racion;

import android.content.Context;
import android.widget.RemoteViews;

/** «Сводка» 3×2: ближайший приём со списком продуктов + калории и белок за день. */
public class RacionWidgetLine extends BaseWidget {
    @Override RemoteViews build(Context c, WidgetData d, int w, int h) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_line);
        WidgetData.Meal m = d.nextMeal();
        String title, items, meal = "";
        if (!d.hasToday) { title = "Открой Рацион"; items = "Расписание обновится при входе"; }
        else if (m == null) { title = "На сегодня всё ✓"; items = d.tomorrow; }
        else { title = m.t + " · " + m.n; items = m.s.replace(" · ", "\n"); meal = m.kc + " ккал"; }
        v.setTextViewText(R.id.ltitle, title); v.setTextColor(R.id.ltitle, d.ink);
        v.setTextViewText(R.id.lmeal, meal); v.setTextColor(R.id.lmeal, d.muted);
        v.setTextViewText(R.id.litems, items); v.setTextColor(R.id.litems, d.ink);
        v.setTextViewText(R.id.lsum, WidgetData.num(d.k) + " / " + WidgetData.num(d.kt) + " ккал"); v.setTextColor(R.id.lsum, d.ink);
        v.setTextViewText(R.id.lsub, "белок " + WidgetData.num(d.p) + " / " + WidgetData.num(d.pt) + " г"); v.setTextColor(R.id.lsub, d.muted);
        v.setImageViewBitmap(R.id.wbars, bars(d.k / Math.max(1, d.kt), d.p / Math.max(1, d.pt), d.accent, d.alt, d.line));
        return v;
    }
}
