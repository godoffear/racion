package com.godoffear.racion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import androidx.work.Data;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** 23:59: запускает копию и ставит следующий будильник. После перезагрузки телефона — просто ставит будильник. */
public class BackupAlarmReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        SharedPreferences p = c.getSharedPreferences(RacionNativePlugin.PREFS, Context.MODE_PRIVATE);
        if (!p.getBoolean("autoBackup", true)) return;
        BackupScheduler.scheduleNext(c);
        String action = i == null ? null : i.getAction();
        if (BackupScheduler.ACTION.equals(action)) {
            String day = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            WorkManager.getInstance(c).enqueue(new OneTimeWorkRequest.Builder(BackupWorker.class)
                .setInputData(new Data.Builder().putString("day", day).build()).build());
        }
    }
}
