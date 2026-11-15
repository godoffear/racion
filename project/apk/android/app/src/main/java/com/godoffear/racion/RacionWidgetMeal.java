package com.godoffear.racion;

import android.content.Context;
import android.widget.RemoteViews;

/** «Приём» 2×2: время, название и состав ближайшего приёма. */
public class RacionWidgetMeal extends BaseWidget {
    @Override RemoteViews build(Context c, WidgetData d, int w, int h) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_meal);
        WidgetData.Meal m = d.nextMeal();
        String time, name, items, foot;
        if (!d.hasToday) { time = "—"; name = "Открой Рацион"; items = "Расписание обновится при входе"; foot = ""; }
        else if (m == null) { time = "✓"; name = "На сегодня всё"; items = d.tomorrow; foot = WidgetData.num(d.k) + " ккал · Б " + WidgetData.num(d.p); }
        else { time = m.t; name = m.n; items = m.s.replace(" · ", "\n"); foot = m.kc + " ккал"; }
        v.setTextViewText(R.id.mtime, time); v.setTextColor(R.id.mtime, d.accent);
        v.setTextViewText(R.id.mname, name); v.setTextColor(R.id.mname, d.ink);
        v.setTextViewText(R.id.mitems, items); v.setTextColor(R.id.mitems, d.ink);
        v.setTextViewText(R.id.mfoot, foot); v.setTextColor(R.id.mfoot, d.muted);
        return v;
    }
}
