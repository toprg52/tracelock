import json, re

with open('frontend/src/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_keys = {
    'en': {
        'system_connected': 'SYSTEM CONNECTED // ONLINE',
        'node_ind': 'NODE IND: LEAP-205 // THREAT INTELLIGENCE OPERATIONS // LIVE TELEMETRY',
        'tracelock_ai': 'TRACELOCK AI INTELLIGENCE BRIEFING',
        'copilot_active': 'COPILOT ACTIVE',
        'confidence': 'CONFIDENCE',
        'potential_exposure': 'POTENTIAL EXPOSURE',
        'recommended_priority': 'RECOMMENDED PRIORITY',
        'telemetry_ok': 'TELEMETRY OK',
        'immediate_action': 'IMMEDIATE ACTION',
        'watchlist': 'WATCHLIST',
        'critical_80': 'CRITICAL: 80+',
        'intel_feed': 'INTEL FEED',
        'vulnerability': 'VULNERABILITY'
    },
    'hi': {
        'system_connected': 'सिस्टम कनेक्टेड // ऑनलाइन',
        'node_ind': 'नोड IND: LEAP-205 // खतरा खुफिया संचालन // लाइव टेलीमेट्री',
        'tracelock_ai': 'TRACELOCK AI इंटेलिजेंस ब्रीफिंग',
        'copilot_active': 'कोपायलट सक्रिय',
        'confidence': 'आत्मविश्वास',
        'potential_exposure': 'संभावित जोखिम',
        'recommended_priority': 'अनुशंसित प्राथमिकता',
        'telemetry_ok': 'टेलीमेट्री ठीक',
        'immediate_action': 'तत्काल कार्रवाई',
        'watchlist': 'निगरानी सूची',
        'critical_80': 'गंभीर: 80+',
        'intel_feed': 'खुफिया फ़ीड',
        'vulnerability': 'भेद्यता'
    },
    'kn': {
        'system_connected': 'ಸಿಸ್ಟಮ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ // ಆನ್‌ಲೈನ್',
        'node_ind': 'ನೋಡ್ IND: LEAP-205 // ಬೆದರಿಕೆ ಗುಪ್ತಚರ ಕಾರ್ಯಾಚರಣೆಗಳು // ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ',
        'tracelock_ai': 'TRACELOCK AI ಇಂಟೆಲಿಜೆನ್ಸ್ ಬ್ರೀಫಿಂಗ್',
        'copilot_active': 'ಕೋಪೈಲಟ್ ಸಕ್ರಿಯ',
        'confidence': 'ವಿಶ್ವಾಸ',
        'potential_exposure': 'ಸಂಭಾವ್ಯ ಒಡ್ಡುವಿಕೆ',
        'recommended_priority': 'ಶಿಫಾರಸು ಮಾಡಿದ ಆದ್ಯತೆ',
        'telemetry_ok': 'ಟೆಲಿಮೆಟ್ರಿ ಸರಿ',
        'immediate_action': 'ತಕ್ಷಣದ ಕ್ರಮ',
        'watchlist': 'ವೀಕ್ಷಣಾ ಪಟ್ಟಿ',
        'critical_80': 'ನಿರ್ಣಾಯಕ: 80+',
        'intel_feed': 'ಇಂಟೆಲ್ ಫೀಡ್',
        'vulnerability': 'ದುರ್ಬಲತೆ'
    },
    'ta': {
        'system_connected': 'அமைப்பு இணைக்கப்பட்டுள்ளது // ஆன்லைன்',
        'node_ind': 'முனை IND: LEAP-205 // அச்சுறுத்தல் உளவுத்துறை செயல்பாடுகள் // நேரடி டெலிமெட்ரி',
        'tracelock_ai': 'TRACELOCK AI உளவுத்துறை சுருக்கம்',
        'copilot_active': 'கோபிலட் செயலில் உள்ளது',
        'confidence': 'நம்பிக்கை',
        'potential_exposure': 'சாத்தியமான வெளிப்பாடு',
        'recommended_priority': 'பரிந்துரைக்கப்பட்ட முன்னுரிமை',
        'telemetry_ok': 'டெலிமெட்ரி சரி',
        'immediate_action': 'உடனடி நடவடிக்கை',
        'watchlist': 'கண்காணிப்பு பட்டியல்',
        'critical_80': 'சிக்கலான: 80+',
        'intel_feed': 'உளவுத்துறை ஊட்டம்',
        'vulnerability': 'பாதிப்பு'
    },
    'te': {
        'system_connected': 'సిస్టమ్ కనెక్ట్ చేయబడింది // ఆన్‌లైన్',
        'node_ind': 'నోడ్ IND: LEAP-205 // ముప్పు ఇంటెలిజెన్స్ కార్యకలాపాలు // లైవ్ టెలిమెట్రీ',
        'tracelock_ai': 'TRACELOCK AI ఇంటెలిజెన్స్ బ్రీఫింగ్',
        'copilot_active': 'కోపైలట్ యాక్టివ్',
        'confidence': 'విశ్వాసం',
        'potential_exposure': 'సంభావ్య బహిర్గతం',
        'recommended_priority': 'సిఫార్సు చేయబడిన ప్రాధాన్యత',
        'telemetry_ok': 'టెలిమెట్రీ ఓకే',
        'immediate_action': 'తక్షణ చర్య',
        'watchlist': 'వీక్షణ జాబితా',
        'critical_80': 'క్లిష్టమైన: 80+',
        'intel_feed': 'ఇంటెల్ ఫీడ్',
        'vulnerability': 'దుర్బలత్వం'
    }
}

for lang, keys in new_keys.items():
    lang_pattern = r'(\b' + lang + r'\b:\s*{\s*translation:\s*{)'
    match = re.search(lang_pattern, content)
    if match:
        insert_pos = match.end()
        insert_str = ''
        for k, v in keys.items():
            insert_str += f'\n      \"{k}\": \"{v}\",'
        content = content[:insert_pos] + insert_str + content[insert_pos:]

with open('frontend/src/i18n.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Translation strings appended successfully!')
