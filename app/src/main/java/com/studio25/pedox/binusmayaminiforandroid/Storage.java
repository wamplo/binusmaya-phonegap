package com.studio25.pedox.binusmayaminiforandroid;

import android.content.Context;
import android.content.SharedPreferences;
import android.support.v7.app.ActionBarActivity;

/**
 * Created by pedox on 12/12/14.
 */
public class Storage {

    public static final String PREFS_NAME = "PrefsBinus";

    public void setData(Context context, String key, String data) {
        SharedPreferences settings = context.getSharedPreferences(PREFS_NAME, 0);
        SharedPreferences.Editor editor = settings.edit();
        editor.putString(key, data);
        editor.commit();
    }

    public String getData(Context context, String key) {
        SharedPreferences settings = context.getSharedPreferences(PREFS_NAME, 0);
        return settings.getString(key, "0");
    }
}