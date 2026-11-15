package com.godoffear.racion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Раз в 15 минут пересчитывает «ближайший приём» на виджетах. */
public class RacionTick extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) { BaseWidget.refreshAll(c); }
}
