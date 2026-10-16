Java.perform(function () {
    var SmsManager = Java.use("android.telephony.SmsManager");
    SmsManager.sendTextMessage.overload(
        'java.lang.String', 'java.lang.String', 'java.lang.String',
        'android.app.PendingIntent', 'android.app.PendingIntent'
    ).implementation = function (dest, sc, text, sentIntent, deliveryIntent) {
        send({type: "sms_send_intercepted", destination: dest, body: text});
        return this.sendTextMessage(dest, sc, text, sentIntent, deliveryIntent);
    };
});
