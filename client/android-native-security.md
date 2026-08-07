# 🛡️ NightOwl: Android Native Screenshot & Recording Blocking (`FLAG_SECURE`)

To prevent users from taking hardware screenshots, screen recordings, or seeing app previews in the Android task switcher:

### 1. File: `android/app/src/main/java/com/nightowl/afterhours/MainActivity.java`

```java
package com.nightowl.afterhours;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 🔒 HARDWARE SCREENSHOT & SCREEN RECORDING BLOCKING
        // Forces Android OS to blackout screen on any screenshot / screen recorder
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
    }
}
```

### 2. File: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nightowl.afterhours">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="NightOwl"
        android:theme="@style/AppTheme.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 3. How to Build the Google Play Bundle (`.aab`):
```bash
# 1. Build web production bundle
npm run build

# 2. Sync to Android project
npx cap sync android

# 3. Build Signed Android App Bundle in Android Studio
Build > Generate Signed Bundle / APK > Android App Bundle (.aab)
```
