package com.godoffear.racion;

import android.content.Context;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;

/** «День» 4×2: все приёмы дня списком, ближайший выделен, ниже прогресс. */
public class RacionWidget extends BaseWidget {
    private static final int[] ROW = {R.id.row1, R.id.row2, R.id.row3, R.id.row4, R.id.row5, R.id.row6};
    private static final int[] L = {R.id.r1l, R.id.r2l, R.id.r3l, R.id.r4l, R.id.r5l, R.id.r6l};
    private static final int[] R_ = {R.id.r1r, R.id.r2r, R.id.r3r, R.id.r4r, R.id.r5r, R.id.r6r};

    @Override RemoteViews build(Context c, WidgetData d, int w, int h) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_day);
        v.setTextViewText(R.id.whead, d.head);
        v.setTextColor(R.id.whead, d.muted);
        v.setTextViewText(R.id.wsum, WidgetData.num(d.k) + " / " + WidgetData.num(d.kt) + " ккал · Б " + WidgetData.num(d.p));
        v.setTextColor(R.id.wsum, d.ink);
        for (int i = 0; i < ROW.length; i++) {
            if (i >= d.meals.size()) { v.setViewVisibility(ROW[i], View.GONE); continue; }
            WidgetData.Meal m = d.meals.get(i);
            boolean isNext = i == d.next;
            String mark = m.d == 1 ? "✓ " : m.d == 2 ? "– " : isNext ? "▸ " : "   ";
            v.setViewVisibility(ROW[i], View.VISIBLE);
            v.setTextViewText(L[i], mark + m.t + "  " + m.n);
            v.setTextViewText(R_[i], m.kc + "");
            int col = m.d != 0 ? d.muted : d.ink;
            v.setTextColor(L[i], isNext ? d.accent : col);
            v.setTextColor(R_[i], isNext ? d.accent : d.muted);
        }
        if (!d.hasToday) {
            v.setViewVisibility(ROW[0], View.VISIBLE);
            v.setTextViewText(L[0], "Открой Рацион — расписание обновится");
            v.setTextViewText(R_[0], "");
            v.setTextColor(L[0], d.ink);
        } else if (d.next < 0 && !d.tomorrow.isEmpty()) {
            v.setViewVisibility(ROW[5], View.VISIBLE);
            v.setTextViewText(L[5], d.tomorrow);
            v.setTextViewText(R_[5], "");
            v.setTextColor(L[5], d.accent);
        }
        v.setImageViewBitmap(R.id.wbars, bars(d.k / Math.max(1, d.kt), d.p / Math.max(1, d.pt), d.accent, d.alt, d.line));
        return v;
    }
}
