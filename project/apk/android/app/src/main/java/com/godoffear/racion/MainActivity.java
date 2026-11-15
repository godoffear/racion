package com.godoffear.racion;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RacionNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
