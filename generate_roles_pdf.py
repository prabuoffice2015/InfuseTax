import os
import base64
import subprocess

# Read logo as base64
logo_path = "/home/prabhu/Learning/Infusetax/InfuseTax_Brand_Kit Logo/web/infusetax_logo_600x200.png"
with open(logo_path, "rb") as f:
    logo_b64 = base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>InfuseTax - 4-Tier Roles & Hierarchy Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  @page {{
    size: A4;
    margin: 12mm 14mm 12mm 14mm;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.45;
    font-size: 11px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }}

  .logo-img {{
    height: 42px;
    object-fit: contain;
  }}

  .header-meta {{
    text-align: right;
  }}

  .header-title-badge {{
    display: inline-block;
    background: #eef2ff;
    color: #4338ca;
    font-weight: 700;
    font-size: 9px;
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }}

  .doc-date {{
    font-size: 9.5px;
    color: #64748b;
  }}

  .hero {{
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 8px;
    margin-bottom: 12px;
  }}

  .hero h1 {{
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
    color: #ffffff;
  }}

  .hero p {{
    font-size: 10.5px;
    color: #cbd5e1;
    max-width: 95%;
    line-height: 1.4;
  }}

  /* HIERARCHY FLOW PIPELINE */
  .pipeline {{
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }}

  .pipeline-step {{
    flex: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
    position: relative;
    border-top: 3px solid #64748b;
  }}

  .pipeline-step.t1 {{ border-top-color: #4f46e5; }}
  .pipeline-step.t2 {{ border-top-color: #0284c7; }}
  .pipeline-step.t3 {{ border-top-color: #059669; }}
  .pipeline-step.t4 {{ border-top-color: #d97706; }}

  .step-label {{
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }}

  .step-label.t1 {{ color: #4f46e5; }}
  .step-label.t2 {{ color: #0284c7; }}
  .step-label.t3 {{ color: #059669; }}
  .step-label.t4 {{ color: #d97706; }}

  .step-title {{
    font-size: 10.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }}

  .step-desc {{
    font-size: 9px;
    color: #64748b;
    line-height: 1.3;
  }}

  /* ROLE CARDS */
  .roles-grid {{
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  }}

  .role-card {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 9px 13px;
    page-break-inside: avoid;
  }}

  .role-card-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    padding-bottom: 5px;
    border-bottom: 1px dashed #e2e8f0;
  }}

  .role-header-left {{
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  .badge {{
    font-size: 8.5px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}

  .badge-t1 {{ background: #e0e7ff; color: #3730a3; }}
  .badge-t2 {{ background: #e0f2fe; color: #0369a1; }}
  .badge-t3 {{ background: #d1fae5; color: #065f46; }}
  .badge-t4 {{ background: #fef3c7; color: #92400e; }}

  .role-name {{
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
  }}

  .role-target {{
    font-size: 9.5px;
    font-weight: 600;
    color: #64748b;
  }}

  .role-grid-details {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }}

  .detail-block h4 {{
    font-size: 9.5px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 3px;
  }}

  .detail-block ul {{
    list-style: none;
    padding-left: 0;
  }}

  .detail-block ul li {{
    position: relative;
    padding-left: 11px;
    margin-bottom: 2px;
    font-size: 9.5px;
    color: #475569;
    line-height: 1.35;
  }}

  .detail-block ul li::before {{
    content: "•";
    position: absolute;
    left: 0;
    color: #6366f1;
    font-weight: bold;
    font-size: 11px;
  }}

  .guardrail-li::before {{
    color: #ef4444 !important;
  }}

  /* PAGE BREAK */
  .page-break {{
    page-break-before: always;
  }}

  /* COMPARISON TABLE */
  .section-title {{
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 7px;
  }}

  table.matrix-table {{
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 9px;
    background: #ffffff;
  }}

  table.matrix-table th {{
    background: #f1f5f9;
    color: #1e293b;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
  }}

  table.matrix-table td {{
    padding: 5px 8px;
    border: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: middle;
  }}

  table.matrix-table tr:nth-child(even) {{
    background: #f8fafc;
  }}

  .check-icon {{
    color: #059669;
    font-weight: 800;
    font-size: 10.5px;
  }}

  .cross-icon {{
    color: #94a3b8;
    font-weight: 700;
  }}

  /* HIGHLIGHT CALLOUT BOX */
  .callout {{
    background: #f8fafc;
    border-left: 4px solid #4f46e5;
    border-radius: 4px;
    padding: 9px 13px;
    margin-bottom: 12px;
  }}

  .callout h4 {{
    font-size: 10.5px;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 3px;
  }}

  .callout p {{
    font-size: 9.5px;
    color: #475569;
    line-height: 1.4;
  }}

  /* FOOTER */
  .footer {{
    border-top: 1px solid #e2e8f0;
    padding-top: 7px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #94a3b8;
    font-size: 8.5px;
    margin-top: auto;
  }}

  .footer-brand {{
    font-weight: 700;
    color: #64748b;
  }}
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <img src="data:image/png;base64,{logo_b64}" class="logo-img" alt="InfuseTax Enterprise">
    <div class="header-meta">
      <div class="header-title-badge">Client Reference Specification</div>
      <div class="doc-date">Platform Version 2.0 • Architecture & Governance Matrix</div>
    </div>
  </div>

  <!-- HERO TITLE -->
  <div class="hero">
    <h1>4-Tier Organizational Hierarchy & Operational Governance</h1>
    <p>A comprehensive architectural reference detailing user tiers, role permissions, automated wallet float lifecycles, and institutional fraud protection guardrails across the InfuseTax ecosystem.</p>
  </div>

  <!-- PIPELINE OVERVIEW -->
  <div class="pipeline">
    <div class="pipeline-step t1">
      <div class="step-label t1">Tier 1: Master</div>
      <div class="step-title">Super Admin</div>
      <div class="step-desc">Company HQ governing master catalog, base pricing & bank ledger approvals.</div>
    </div>
    <div class="pipeline-step t2">
      <div class="step-label t2">Tier 2: Regional</div>
      <div class="step-title">Master Distributor</div>
      <div class="step-desc">Zonal enterprise distributing wallet float and earning network commissions.</div>
    </div>
    <div class="pipeline-step t3">
      <div class="step-label t3">Tier 3: Retail</div>
      <div class="step-title">Retailer Outlet</div>
      <div class="step-desc">Physical tax/CSC outlet managing store inventory, margins & staff.</div>
    </div>
    <div class="pipeline-step t4">
      <div class="step-label t4">Tier 4: Frontline</div>
      <div class="step-title">Counter Operator</div>
      <div class="step-desc">Front-desk clerk executing client filings via AI OCR & printing receipts.</div>
    </div>
  </div>

  <!-- ROLE DETAILS: TIER 1 & TIER 2 -->
  <div class="roles-grid">
    
    <!-- TIER 1 -->
    <div class="role-card">
      <div class="role-card-header">
        <div class="role-header-left">
          <span class="badge badge-t1">Tier 1: Executive</span>
          <span class="role-name">Super Admin (Company / Brand Headquarters)</span>
        </div>
        <span class="role-target">Target: Platform Owners, C-Suite & Compliance Head</span>
      </div>
      <div class="role-grid-details">
        <div class="detail-block">
          <h4>Core Operational Powers</h4>
          <ul>
            <li><strong>Master Pricing Matrix:</strong> Controls wholesale service prices, MRP ceilings, and minimum retailer margins for GST, ITR, PAN & Certificates.</li>
            <li><strong>Bank UTR Verification:</strong> Reviews and approves/rejects distributor NEFT/RTGS/IMPS/UPI deposit proofs to fund master wallets.</li>
            <li><strong>Tenant & System Governance:</strong> Oversees tenant white-labeling, WhatsApp Cloud API keys, and multi-region database rules.</li>
          </ul>
        </div>
        <div class="detail-block">
          <h4>Security & Fraud Controls</h4>
          <ul>
            <li><strong>Double-Entry Ledger Audit:</strong> Access to immutably hashed financial ledger records with actor tracking.</li>
            <li><strong>Account Safeguards:</strong> Can suspend, activate, or reassign rogue distributor/outlet branches instantly.</li>
            <li class="guardrail-li"><strong>Isolation:</strong> Strictly holds sovereign administrative authority over company finances.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- TIER 2 -->
    <div class="role-card">
      <div class="role-card-header">
        <div class="role-header-left">
          <span class="badge badge-t2">Tier 2: Enterprise</span>
          <span class="role-name">Master Distributor (Regional Network Partner)</span>
        </div>
        <span class="role-target">Target: District Business Heads & FinTech Master Franchises</span>
      </div>
      <div class="role-grid-details">
        <div class="detail-block">
          <h4>Core Operational Powers</h4>
          <ul>
            <li><strong>Downline Network Expansion:</strong> Onboards, verifies, and activates new Tier 3 Retailer Outlets within designated territories.</li>
            <li><strong>Float Allocation Engine:</strong> Purchases bulk liquidity from HQ and dispatches instant wallet top-ups to subordinate retail outlets.</li>
            <li><strong>Automated Commission Split:</strong> Earns passive wholesale commission overrides credited instantly upon every downline filing.</li>
          </ul>
        </div>
        <div class="detail-block">
          <h4>Security & Fraud Controls</h4>
          <ul>
            <li><strong>Territory Confinement:</strong> Strictly restricted to viewing downline stores; zero visibility into peer distributors or parent HQ settings.</li>
            <li><strong>Credit Guard:</strong> Cannot extend float beyond available prepaid balance, preventing unsecured company credit exposure.</li>
            <li class="guardrail-li"><strong>Approval Chain:</strong> Can request top-up from HQ but cannot self-approve deposits.</li>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <!-- FOOTER PAGE 1 -->
  <div class="footer">
    <span class="footer-brand">InfuseTax™ Technologies Private Limited • Confidential Client Specification</span>
    <span>Page 1 of 2</span>
  </div>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- HEADER PAGE 2 -->
  <div class="header">
    <img src="data:image/png;base64,{logo_b64}" class="logo-img" alt="InfuseTax Enterprise">
    <div class="header-meta">
      <div class="header-title-badge">Client Reference Specification</div>
      <div class="doc-date">Platform Version 2.0 • Architecture & Governance Matrix</div>
    </div>
  </div>

  <!-- ROLE DETAILS: TIER 3 & TIER 4 -->
  <div class="roles-grid">
    
    <!-- TIER 3 -->
    <div class="role-card">
      <div class="role-card-header">
        <div class="role-header-left">
          <span class="badge badge-t3">Tier 3: Commercial</span>
          <span class="role-name">Retailer Outlet (Store Owner / Point of Sale Center)</span>
        </div>
        <span class="role-target">Target: Local Tax Consultancies, CSC Desks & Retail Outlets</span>
      </div>
      <div class="role-grid-details">
        <div class="detail-block">
          <h4>Core Operational Powers</h4>
          <ul>
            <li><strong>Counter Staff Management:</strong> Creates, monitors, and provisions login credentials for store clerks (Tier 4 Operators).</li>
            <li><strong>Store Liquidity Management:</strong> Submits Float Top-Up requests to their parent Distributor; monitors store opening & closing balance.</li>
            <li><strong>Store Revenue Retention:</strong> Retains direct retail margin (Customer Fee minus Wholesale Base) on every completed filing.</li>
          </ul>
        </div>
        <div class="detail-block">
          <h4>Security & Fraud Controls</h4>
          <ul>
            <li><strong>Data Isolation:</strong> Store owner cannot view client data, orders, or revenues of neighboring competitor retailers.</li>
            <li><strong>Staff Surveillance:</strong> Real-time visibility into every filing submitted and float spent by counter clerks.</li>
            <li class="guardrail-li"><strong>No Upstream Access:</strong> Strictly blocked from distributor or super-admin dashboards.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- TIER 4 -->
    <div class="role-card">
      <div class="role-card-header">
        <div class="role-header-left">
          <span class="badge badge-t4">Tier 4: Frontline</span>
          <span class="role-name">Counter Operator (Store Employee / Filing Clerk)</span>
        </div>
        <span class="role-target">Target: Service Desk Staff, Data Entry Clerks & Cashiers</span>
      </div>
      <div class="role-grid-details">
        <div class="detail-block">
          <h4>Core Operational Powers</h4>
          <ul>
            <li><strong>Customer Intake & Filing:</strong> Gathers client documents, files GST returns (GSTR-1/3B), ITR (1/2/4), and PAN applications.</li>
            <li><strong>AI-Assisted Copilot:</strong> Uses AI OCR to auto-read Aadhaar, PAN, and Form 16 without manual typing errors.</li>
            <li><strong>Cash Collection & Invoicing:</strong> Receives customer payment over counter and generates official printed tax receipts with QR validation.</li>
          </ul>
        </div>
        <div class="detail-block">
          <h4>Strict Frontline Guardrails</h4>
          <ul>
            <li class="guardrail-li"><strong>Hidden Financials:</strong> <u>Zero visibility</u> into store profit margins, distributor commissions, or wholesale pricing.</li>
            <li class="guardrail-li"><strong>No Withdrawal Authority:</strong> Cannot transfer wallet funds outside or alter service pricing.</li>
            <li class="guardrail-li"><strong>Shift Confinement:</strong> Tied strictly to the store wallet assigned by their store manager.</li>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <!-- COMPARISON MATRIX TABLE -->
  <div class="section-title">Institutional Permission & Governance Matrix</div>
  
  <table class="matrix-table">
    <thead>
      <tr>
        <th style="width: 32%;">Operational Capability</th>
        <th style="width: 17%;">Tier 1: Super Admin</th>
        <th style="width: 17%;">Tier 2: Master Distr.</th>
        <th style="width: 17%;">Tier 3: Retail Store</th>
        <th style="width: 17%;">Tier 4: Operator</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Manage Platform Branding, Tenant & Domain</strong></td>
        <td><span class="check-icon">✓ Full Control</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
      </tr>
      <tr>
        <td><strong>Set Wholesale Rates & Customer MRP Ceilings</strong></td>
        <td><span class="check-icon">✓ Full Control</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
      </tr>
      <tr>
        <td><strong>Approve Bank UTR / NEFT Float Deposits</strong></td>
        <td><span class="check-icon">✓ Master Approver</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
      </tr>
      <tr>
        <td><strong>Onboard & Manage Downline Entities</strong></td>
        <td><span class="check-icon">✓ Distributors & Outlets</span></td>
        <td><span class="check-icon">✓ Retail Outlets Only</span></td>
        <td><span class="check-icon">✓ Counter Clerks</span></td>
        <td><span class="cross-icon">— Restricted</span></td>
      </tr>
      <tr>
        <td><strong>Transfer Wallet Float Downstream</strong></td>
        <td><span class="check-icon">✓ To Master Wallets</span></td>
        <td><span class="check-icon">✓ To Retail Outlets</span></td>
        <td><span class="cross-icon">— Request Only</span></td>
        <td><span class="cross-icon">— Request Only</span></td>
      </tr>
      <tr>
        <td><strong>View Network-Wide Commission Logs</strong></td>
        <td><span class="check-icon">✓ Global System</span></td>
        <td><span class="check-icon">✓ Downline Network</span></td>
        <td><span class="cross-icon">— Store Margins</span></td>
        <td><span class="cross-icon">— Hidden</span></td>
      </tr>
      <tr>
        <td><strong>Execute GST / ITR Tax Filings & KYC Desks</strong></td>
        <td><span class="check-icon">✓ Audit / Support</span></td>
        <td><span class="check-icon">✓ Audit / Support</span></td>
        <td><span class="check-icon">✓ Operational</span></td>
        <td><span class="check-icon">✓ Daily Frontline</span></td>
      </tr>
      <tr>
        <td><strong>Generate Official Branded Client Receipts</strong></td>
        <td><span class="check-icon">✓ Allowed</span></td>
        <td><span class="check-icon">✓ Allowed</span></td>
        <td><span class="check-icon">✓ Allowed</span></td>
        <td><span class="check-icon">✓ Allowed</span></td>
      </tr>
    </tbody>
  </table>

  <!-- BUSINESS VALUE SUMMARY -->
  <div class="callout">
    <h4>Why Enterprise Clients Adopt This 4-Tier Governance Model:</h4>
    <p><strong>1. Zero Revenue Leakage:</strong> Double-entry ACID wallet verification deducts fees and credits commissions instantaneously with zero reconciliation delay.<br>
    <strong>2. Employee Proof Security:</strong> Frontline operators (Tier 4) can process high-volume tax filings efficiently using AI OCR, but are completely air-gapped from store profit data and cannot misappropriate funds.<br>
    <strong>3. Scalable Distribution:</strong> Master distributors operate as autonomous regional hubs, allowing the platform to scale to thousands of retail stores across India without administrative bottlenecks.</p>
  </div>

  <!-- FOOTER PAGE 2 -->
  <div class="footer">
    <span class="footer-brand">InfuseTax™ Technologies Private Limited • Confidential Client Specification</span>
    <span>Page 2 of 2</span>
  </div>

</body>
</html>
"""

html_path = "/home/prabhu/Learning/Infusetax/InfuseTax_4_Tier_Roles_Guide.html"
pdf_path = "/home/prabhu/Learning/Infusetax/InfuseTax_4_Tier_Roles_and_Responsibilities_Guide.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated HTML at: {html_path}")

cmd = [
    "/usr/bin/google-chrome",
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res.returncode == 0:
    print(f"SUCCESS: Generated PDF at: {pdf_path}")
    print(f"PDF File Size: {os.path.getsize(pdf_path)} bytes")
else:
    print(f"ERROR: {res.stderr}")
