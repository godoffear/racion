package com.godoffear.racion;

import android.content.Context;
import android.widget.RemoteViews;

/** «Кольцо» 2×2: калории и белок за день в виде двух колец. */
public class RacionWidgetRing extends BaseWidget {
    @Override RemoteViews build(Context c, WidgetData d, int w, int h) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_ring);
        v.setImageViewBitmap(R.id.wring, ring(d));
        v.setContentDescription(R.id.wring, WidgetData.num(d.k) + " из " + WidgetData.num(d.kt) + " ккал, белок " + WidgetData.num(d.p) + " из " + WidgetData.num(d.pt) + " г");
        return v;
    }
}
