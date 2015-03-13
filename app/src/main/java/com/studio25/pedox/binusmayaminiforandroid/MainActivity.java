package com.studio25.pedox.binusmayaminiforandroid;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import org.apache.cordova.DroidGap;


public class MainActivity extends DroidGap {
    Storage storage = new Storage();

    public static int deviceVersion = android.os.Build.VERSION.SDK_INT;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        Context context = getApplicationContext();

        Window window = getActivity().getWindow();

        TelephonyManager tm = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
        String device_id = tm.getDeviceId();

        Log.d("DeviceIMEI",device_id);

        if(deviceVersion >= 21 ) {
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.setStatusBarColor(Color.parseColor("#0E3855"));
            //WebView.setWebContentsDebuggingEnabled(true);
        }

        if(device_id.equals("353918053497000"))
        {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        storage.setData(context, "token", "0");
        storage.setData(context, "tempLogin", "0");


        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/new.html");
    }

}
