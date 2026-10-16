class ReportTemplates:
    ANALYST = """
    <html>
    <head>
        <style>
            body { font-family: monospace; background: #0c0f1d; color: #a5b4fc; padding: 40px; }
            h1 { color: #3b82f6; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; }
            .section { margin-bottom: 30px; background: #111827; padding: 20px; border-radius: 8px; border: 1px solid #374151; }
            .header { text-align: right; font-size: 12px; color: #4b5563; }
        </style>
    </head>
    <body>
        <div class="header">{{ branding.bank_name }} // {{ confidentiality_label }}</div>
        <h1>SOC ANALYST FORENSIC REPORT</h1>
        <p>Generated At: {{ generated_at }}</p>
        <p>Case Reference: {{ case_id }}</p>
        
        <div class="section">
            <h2>Threat Objective & Narratives</h2>
            <p>{{ investigation_data.threat_narrative }}</p>
        </div>
        
        <div class="section">
            <h2>Timeline Summary</h2>
            <ul>
            {% for item in investigation_data.timeline %}
                <li><strong>[{{ item.source.upper() }}]</strong>: {{ item.description }}</li>
            {% endfor %}
            </ul>
        </div>
        
        <div class="section">
            <h2>Evidence Integrity Signature</h2>
            <p>SHA-256: {{ integrity_hash }}</p>
        </div>
    </body>
    </html>
    """
    
    EXECUTIVE = """
    <html>
    <body>
        <h1>EXECUTIVE RISK BRIEFING</h1>
        <p>Case ID: {{ case_id }}</p>
        <p>Branding Partner: {{ branding.bank_name }}</p>
        <h3>Attack Summary:</h3>
        <p>A threat agent targeting client banking credentials was identified. Financial risk has been classified.</p>
    </body>
    </html>
    """

    COMPLIANCE = """
    <html>
    <body>
        <h1>REGULATORY COMPLIANCE REVIEW</h1>
        <p>Obligations under DPDP Act and RBI Guidelines have been audited.</p>
    </body>
    </html>
    """

    CUSTOMER = """
    <html>
    <body>
        <h1>CUSTOMER SECURITY ADVISORY</h1>
        <p>Safe usage tips for mobile banking applications.</p>
    </body>
    </html>
    """
