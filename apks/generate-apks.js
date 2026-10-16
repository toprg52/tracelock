const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function generateApk(filename, manifestText, dexText) {
  const zip = new JSZip();
  zip.file("AndroidManifest.xml", manifestText);
  zip.file("classes.dex", dexText);
  
  const content = await zip.generateAsync({ type: "nodebuffer" });
  const targetPath = path.join(__dirname, filename);
  fs.writeFileSync(targetPath, content);
  console.log(`Generated: ${filename} (${content.length} bytes)`);
}

async function run() {
  const apksDir = __dirname;
  if (!fs.existsSync(apksDir)) {
    fs.mkdirSync(apksDir, { recursive: true });
  }

  // 1. Legit Banking App (Expected Risk 15-25)
  const legitManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.legit.indianbank">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application>
        <activity android:name="com.legit.indianbank.MainActivity" />
        <service android:name="com.legit.indianbank.NetworkSyncService" />
    </application>
</manifest>`;
  const legitDex = `https://api.indianbank.in/services
https://indianbank.in/portal`;

  // 2. Suspicious KYC Update App (Expected Risk 60-75)
  const suspiciousManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.kyc.update.secure">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <application>
        <activity android:name="com.kyc.update.secure.MainActivity" />
        <service android:name="com.kyc.update.secure.SmsReceiverService" />
    </application>
</manifest>`;
  const suspiciousDex = `https://kyc-verification-gateway.net/update
91.202.17.44`;

  // 3. Banking Trojan Sample (Expected Risk 90-95)
  const trojanManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.sbi.secure.token.trojan">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.BIND_ACCESSIBILITY_SERVICE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <application>
        <activity android:name="com.sbi.secure.token.trojan.MainActivity" />
        <activity android:name="com.sbi.secure.token.trojan.OverlayActivity" />
        <service android:name="com.sbi.secure.token.trojan.AccessibilityStealerService" />
        <service android:name="com.sbi.secure.token.trojan.SmsReceiverService" />
    </application>
</manifest>`;
  const trojanDex = `https://secure-banking-update.com/login
https://otp-verification-service.net
45.88.120.10
91.202.17.44`;

  console.log("Generating demo APK packages...");
  await generateApk("Legit_Banking_App.apk", legitManifest, legitDex);
  await generateApk("Suspicious_KYC_Update.apk", suspiciousManifest, suspiciousDex);
  await generateApk("Banking_Trojan_Sample.apk", trojanManifest, trojanDex);
  console.log("All demo APKs successfully built and saved in the /apks/ directory!");
}

run().catch(err => {
  console.error("Failed to generate demo APKs:", err);
});
