package com.godoffear.racion;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import java.util.Calendar;

/** Ставит будильник на ближайшие 23:59. Каждое срабатывание ставит следующий. */
final class BackupScheduler {
    static final String ACTION = "com.godoffear.racion.NIGHT_BACKUP";

    static PendingIntent pending(Context c) {
        Intent i = new Intent(c, BackupAlarmReceiver.class).setAction(ACTION);
        return PendingIntent.getBroadcast(c, 11, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void scheduleNext(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Calendar t = Calendar.getInstance();
        t.set(Calendar.HOUR_OF_DAY, 23); t.set(Calendar.MINUTE, 59); t.set(Calendar.SECOND, 0); t.set(Calendar.MILLISECOND, 0);
        if (t.getTimeInMillis() <= System.currentTimeMillis() + 5000) t.add(Calendar.DAY_OF_YEAR, 1);
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), pending(c));
            else am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), pending(c));
        } catch (SecurityException e) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), pending(c));
        }
    }

    static void cancel(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(pending(c));
    }
}
