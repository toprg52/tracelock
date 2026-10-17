import os
import zipfile

def create_apk(output_path, package_name, permissions, activities, services, dex_urls):
    # Build AndroidManifest.xml string representation
    perm_xml = "\n".join([f'    <uses-permission android:name="{p}" />' for p in permissions])
    act_xml = "\n".join([f'        <activity android:name="{a}" />' for a in activities])
    srv_xml = "\n".join([f'        <service android:name="{s}" />' for s in services])
    
    manifest_content = f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="{package_name}">
{perm_xml}
    <application>
{act_xml}
{srv_xml}
    </application>
</manifest>"""

    dex_content = "\n".join(dex_urls)

    # Write to zip archive
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr("AndroidManifest.xml", manifest_content.encode('utf-8'))
        z.writestr("classes.dex", dex_content.encode('utf-8'))
        z.writestr("resources.arsc", b"ARSC_HEADER_PLACEHOLDER")

def main():
    target_dir = os.path.join(os.getcwd(), "apks")
    os.makedirs(target_dir, exist_ok=True)

    apks_spec = [
        {
            "filename": "01_Official_Mobile_Banking.apk",
            "package": "com.cedarline.mobile.official",
            "permissions": ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE", "android.permission.VIBRATE"],
            "activities": ["com.cedarline.mobile.official.MainActivity", "com.cedarline.mobile.official.DashboardActivity"],
            "services": ["com.cedarline.mobile.official.NetworkSyncService"],
            "urls": ["https://api.cedarlinebank.com/v1/auth", "https://cedarlinebank.com"]
        },
        {
            "filename": "02_Clean_Calculator_Tool.apk",
            "package": "com.clean.calculator.utility",
            "permissions": ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"],
            "activities": ["com.clean.calculator.utility.MainActivity"],
            "services": [],
            "urls": ["https://calculator.utility.org"]
        },
        {
            "filename": "03_PDF_Document_Scanner.apk",
            "package": "com.doc.pdfscanner.app",
            "permissions": ["android.permission.INTERNET", "android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE", "android.permission.CAMERA"],
            "activities": ["com.doc.pdfscanner.app.MainActivity", "com.doc.pdfscanner.app.CameraActivity"],
            "services": ["com.doc.pdfscanner.app.FileProcessingService"],
            "urls": ["https://pdf-service.docscan.net"]
        },
        {
            "filename": "04_Game_Mod_Booster.apk",
            "package": "com.speed.gamebooster.mod",
            "permissions": ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE", "android.permission.WAKE_LOCK", "android.permission.RECEIVE_BOOT_COMPLETED"],
            "activities": ["com.speed.gamebooster.mod.MainActivity", "com.speed.gamebooster.mod.AdActivity"],
            "services": ["com.speed.gamebooster.mod.AdSyncService"],
            "urls": ["https://ad-network-node-12.com/ads", "https://gamebooster-cdn.net"]
        },
        {
            "filename": "05_Free_WiFi_Connect.apk",
            "package": "com.freewifi.connector.pro",
            "permissions": ["android.permission.INTERNET", "android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION", "android.permission.CHANGE_WIFI_STATE"],
            "activities": ["com.freewifi.connector.pro.MainActivity", "com.freewifi.connector.pro.MapActivity"],
            "services": ["com.freewifi.connector.pro.LocationTrackerService"],
            "urls": ["https://wifi-analytics-collector.com", "198.51.100.42"]
        },
        {
            "filename": "06_Call_Recorder_Pro.apk",
            "package": "com.call.recorder.tracker",
            "permissions": ["android.permission.INTERNET", "android.permission.RECORD_AUDIO", "android.permission.READ_CONTACTS", "android.permission.READ_PHONE_STATE", "android.permission.PROCESS_OUTGOING_CALLS"],
            "activities": ["com.call.recorder.tracker.MainActivity", "com.call.recorder.tracker.PlayerActivity"],
            "services": ["com.call.recorder.tracker.AudioRecordService"],
            "urls": ["https://call-backup-server.net/upload", "198.51.100.88"]
        },
        {
            "filename": "07_Suspicious_KYC_Verification.apk",
            "package": "com.kyc.update.secure.helper",
            "permissions": ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.READ_PHONE_STATE"],
            "activities": ["com.kyc.update.secure.helper.MainActivity", "com.kyc.update.secure.helper.FormActivity"],
            "services": ["com.kyc.update.secure.helper.SmsReceiverService"],
            "urls": ["https://kyc-verification-gateway.net/update", "91.202.17.44"]
        },
        {
            "filename": "08_Anubis_Overlay_Trojan.apk",
            "package": "com.cedarline.secure.token.anubis",
            "permissions": ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.SYSTEM_ALERT_WINDOW"],
            "activities": ["com.cedarline.secure.token.anubis.MainActivity", "com.cedarline.secure.token.anubis.OverlayActivity"],
            "services": ["com.cedarline.secure.token.anubis.AccessibilityStealerService", "com.cedarline.secure.token.anubis.SmsListenerService"],
            "urls": ["https://update-server-v3.net", "185.220.101.5"]
        },
        {
            "filename": "09_Cerberus_SMS_Interceptor.apk",
            "package": "com.cedarline.safe.verification.cerberus",
            "permissions": ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.SEND_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.SYSTEM_ALERT_WINDOW", "android.permission.REQUEST_INSTALL_PACKAGES"],
            "activities": ["com.cedarline.safe.verification.cerberus.MainActivity", "com.cedarline.safe.verification.cerberus.OverlayActivity"],
            "services": ["com.cedarline.safe.verification.cerberus.BackgroundAccessibilityService", "com.cedarline.safe.verification.cerberus.SmsRelayService"],
            "urls": ["https://cerberus-c2-panel.net/gate", "185.220.101.45"]
        },
        {
            "filename": "10_SpyNote_RAT_Injector.apk",
            "package": "com.spynote.rat.remote.access",
            "permissions": ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.SEND_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.RECORD_AUDIO", "android.permission.CAMERA", "android.permission.ACCESS_FINE_LOCATION", "android.permission.SYSTEM_ALERT_WINDOW"],
            "activities": ["com.spynote.rat.remote.access.MainActivity", "com.spynote.rat.remote.access.PayloadActivity"],
            "services": ["com.spynote.rat.remote.access.RatDaemonService", "com.spynote.rat.remote.access.KeyloggerService"],
            "urls": ["https://spynote-master-c2.net/connect", "185.220.101.99"]
        },
        {
            "filename": "Legit_Banking_App.apk",
            "package": "com.legit.cedarlinebank",
            "permissions": ["android.permission.INTERNET", "android.permission.ACCESS_NETWORK_STATE"],
            "activities": ["com.legit.cedarlinebank.MainActivity"],
            "services": ["com.legit.cedarlinebank.NetworkSyncService"],
            "urls": ["https://api.cedarlinebank.com/services", "https://cedarlinebank.com/portal"]
        },
        {
            "filename": "Suspicious_KYC_Update.apk",
            "package": "com.kyc.update.secure",
            "permissions": ["android.permission.INTERNET", "android.permission.RECEIVE_SMS", "android.permission.READ_PHONE_STATE"],
            "activities": ["com.kyc.update.secure.MainActivity"],
            "services": ["com.kyc.update.secure.SmsReceiverService"],
            "urls": ["https://kyc-verification-gateway.net/update", "91.202.17.44"]
        },
        {
            "filename": "Banking_Trojan_Sample.apk",
            "package": "com.cedarline.secure.token.trojan",
            "permissions": ["android.permission.INTERNET", "android.permission.READ_SMS", "android.permission.RECEIVE_SMS", "android.permission.BIND_ACCESSIBILITY_SERVICE", "android.permission.SYSTEM_ALERT_WINDOW"],
            "activities": ["com.cedarline.secure.token.trojan.MainActivity", "com.cedarline.secure.token.trojan.OverlayActivity"],
            "services": ["com.cedarline.secure.token.trojan.AccessibilityStealerService", "com.cedarline.secure.token.trojan.SmsReceiverService"],
            "urls": ["https://secure-banking-update.com/login", "https://otp-verification-service.net", "45.88.120.10", "91.202.17.44"]
        }
    ]

    for spec in apks_spec:
        output_file = os.path.join(target_dir, spec["filename"])
        create_apk(
            output_file,
            spec["package"],
            spec["permissions"],
            spec["activities"],
            spec["services"],
            spec["urls"]
        )
        print(f"[*] Created APK: {spec['filename']} -> Package: {spec['package']} ({len(spec['permissions'])} perms)")

if __name__ == "__main__":
    main()
