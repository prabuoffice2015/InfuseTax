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
<title>InfuseTax - Cloud Infrastructure Quotation & Scalability Proposal</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  @page {{
    size: A4;
    margin: 11mm 13mm 11mm 13mm;
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
    line-height: 1.42;
    font-size: 10.5px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 9px;
    margin-bottom: 11px;
  }}

  .logo-img {{
    height: 40px;
    object-fit: contain;
  }}

  .header-meta {{
    text-align: right;
  }}

  .header-badge {{
    display: inline-block;
    background: #eef2ff;
    color: #4338ca;
    font-weight: 700;
    font-size: 8.5px;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }}

  .doc-date {{
    font-size: 9px;
    color: #64748b;
  }}

  .hero {{
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    color: #ffffff;
    padding: 13px 18px;
    border-radius: 7px;
    margin-bottom: 12px;
  }}

  .hero h1 {{
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.3px;
    margin-bottom: 3px;
    color: #ffffff;
  }}

  .hero p {{
    font-size: 10px;
    color: #cbd5e1;
    max-width: 95%;
    line-height: 1.4;
  }}

  .section-title {{
    font-size: 12px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    gap: 5px;
  }}

  .section-title::before {{
    content: "";
    display: inline-block;
    width: 4px;
    height: 13px;
    background: #4f46e5;
    border-radius: 2px;
  }}

  /* QUOTATION CARDS */
  .quote-cards {{
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-bottom: 11px;
  }}

  .quote-card {{
    border: 1px solid #cbd5e1;
    border-radius: 7px;
    padding: 10px 13px;
    background: #ffffff;
    page-break-inside: avoid;
  }}

  .quote-card.recommended {{
    border: 2px solid #4f46e5;
    background: #faf5ff;
  }}

  .quote-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e2e8f0;
  }}

  .provider-title {{
    display: flex;
    align-items: center;
    gap: 7px;
  }}

  .provider-name {{
    font-size: 12.5px;
    font-weight: 800;
    color: #0f172a;
  }}

  .provider-badge {{
    font-size: 8px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }}

  .badge-best-value {{ background: #dcfce7; color: #166534; }}
  .badge-dev {{ background: #e0f2fe; color: #075985; }}
  .badge-enterprise {{ background: #fef3c7; color: #92400e; }}

  .quote-cost {{
    text-align: right;
  }}

  .cost-main {{
    font-size: 14px;
    font-weight: 800;
    color: #4f46e5;
  }}

  .cost-sub {{
    font-size: 8.5px;
    color: #64748b;
  }}

  .specs-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 7px;
    background: #ffffff;
    padding: 7px 10px;
    border-radius: 5px;
    border: 1px solid #e2e8f0;
  }}

  .spec-item {{
    display: flex;
    flex-direction: column;
  }}

  .spec-label {{
    font-size: 8px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
  }}

  .spec-val {{
    font-size: 10px;
    color: #1e293b;
    font-weight: 700;
  }}

  .quote-details-list {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 9px;
    color: #475569;
  }}

  .quote-details-list ul {{
    list-style: none;
    padding: 0;
  }}

  .quote-details-list li {{
    position: relative;
    padding-left: 10px;
    margin-bottom: 2px;
    line-height: 1.35;
  }}

  .quote-details-list li::before {{
    content: "✓";
    position: absolute;
    left: 0;
    color: #059669;
    font-weight: 800;
  }}

  /* TABLES */
  table.compare-table {{
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 11px;
    font-size: 8.5px;
    background: #ffffff;
  }}

  table.compare-table th {{
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 5px 7px;
    border: 1px solid #cbd5e1;
  }}

  table.compare-table td {{
    padding: 5px 7px;
    border: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: middle;
  }}

  table.compare-table tr:nth-child(even) {{
    background: #f8fafc;
  }}

  .page-break {{
    page-break-before: always;
  }}

  /* CALLOUT BOX */
  .callout {{
    background: #f8fafc;
    border-left: 3px solid #4f46e5;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 11px;
  }}

  .callout h4 {{
    font-size: 10px;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 2px;
  }}

  .callout p {{
    font-size: 9px;
    color: #475569;
    line-height: 1.35;
  }}

  /* SIGN OFF BOX */
  .sign-box {{
    border: 1px dashed #94a3b8;
    border-radius: 6px;
    padding: 10px 14px;
    background: #f8fafc;
    margin-top: 10px;
  }}

  .sign-title {{
    font-size: 10px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .sign-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
    font-size: 8.5px;
    color: #475569;
  }}

  .sign-line {{
    margin-top: 24px;
    border-top: 1px solid #64748b;
    padding-top: 3px;
    font-weight: 600;
  }}

  /* FOOTER */
  .footer {{
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #94a3b8;
    font-size: 8px;
    margin-top: auto;
  }}

  .footer-brand {{
    font-weight: 700;
    color: #64748b;
  }}
</style>
</head>
<body>

  <!-- HEADER PAGE 1 -->
  <div class="header">
    <img src="data:image/png;base64,{logo_b64}" class="logo-img" alt="InfuseTax Enterprise">
    <div class="header-meta">
      <div class="header-badge">Commercial Quotation Proposal</div>
      <div class="doc-date">Project: InfuseTax Multi-Tenant FinTech & Tax Compliance Suite</div>
    </div>
  </div>

  <!-- HERO TITLE -->
  <div class="hero">
    <h1>Cloud Server Quotations & High-Volume Scaling Matrix</h1>
    <p>Comprehensive commercial quotation for deploying InfuseTax across three premier cloud infrastructure providers in India (Mumbai Data Centers), including domain setup, subdomains, big S3 storage, and progressive scalability tiers for high-volume transactions.</p>
  </div>

  <!-- SECTION 1: THE 3 PROVIDER QUOTATIONS -->
  <div class="section-title">Comparative Infrastructure Quotations (Mumbai Data Centers)</div>

  <div class="quote-cards">

    <!-- OPTION 1: HOSTINGER INDIA -->
    <div class="quote-card recommended">
      <div class="quote-header">
        <div class="provider-title">
          <span class="provider-name">Option 1: Hostinger Cloud VPS India</span>
          <span class="provider-badge badge-best-value">★ Recommended: Lowest Cost & High RAM</span>
        </div>
        <div class="quote-cost">
          <div class="cost-main">₹449 / month</div>
          <div class="cost-sub">Est. ₹5,388 / year + Domain</div>
        </div>
      </div>
      
      <div class="specs-grid">
        <div class="spec-item"><span class="spec-label">Data Center</span><span class="spec-val">Mumbai, India 🇮🇳 (&lt;15ms)</span></div>
        <div class="spec-item"><span class="spec-label">Compute</span><span class="spec-val">2 vCPU Cores / 4 GB RAM</span></div>
        <div class="spec-item"><span class="spec-label">Fast SSD</span><span class="spec-val">50 GB NVMe Disk</span></div>
        <div class="spec-item"><span class="spec-label">S3 Storage</span><span class="spec-val">Cloudflare R2 (10GB Free S3)</span></div>
      </div>

      <div class="quote-details-list">
        <ul>
          <li><strong>Domain & Subdomains:</strong> `.in` (~₹399/yr) or `.com` (~₹799/yr); Unlimited subdomains (`api.`, `portal.`, `admin.`, `*.`) included free.</li>
          <li><strong>All-in-One Docker Stack:</strong> Runs Nginx Gateway, Next.js Frontend, PHP 8.3 Backend, PostgreSQL 16 DB & Redis 7 smoothly.</li>
        </ul>
        <ul>
          <li><strong>Big S3 Storage Vault:</strong> Cloudflare R2 provides 10 GB free S3 storage with <strong>₹0.00 download egress fees</strong>.</li>
          <li><strong>Payment & Invoicing:</strong> Direct payment via <strong>UPI, GPay, PhonePe, Paytm, or NetBanking</strong> with Indian GST Tax invoice.</li>
        </ul>
      </div>
    </div>

    <!-- OPTION 2: DIGITALOCEAN INDIA -->
    <div class="quote-card">
      <div class="quote-header">
        <div class="provider-title">
          <span class="provider-name">Option 2: DigitalOcean / Linode Cloud</span>
          <span class="provider-badge badge-dev">Developer Standard</span>
        </div>
        <div class="quote-cost">
          <div class="cost-main">₹950 / month</div>
          <div class="cost-sub">($11 USD / month)</div>
        </div>
      </div>
      
      <div class="specs-grid">
        <div class="spec-item"><span class="spec-label">Data Center</span><span class="spec-val">Bangalore / Mumbai 🇮🇳</span></div>
        <div class="spec-item"><span class="spec-label">Compute</span><span class="spec-val">1 vCPU Core / 2 GB RAM</span></div>
        <div class="spec-item"><span class="spec-label">Fast SSD</span><span class="spec-val">50 GB NVMe SSD</span></div>
        <div class="spec-item"><span class="spec-label">S3 Storage</span><span class="spec-val">DO Spaces (250GB S3 included)</span></div>
      </div>

      <div class="quote-details-list">
        <ul>
          <li><strong>Compute Droplet:</strong> $6/mo (~₹500/mo) for 2GB RAM Linux VPS + $5/mo (~₹420/mo) for 250GB S3 Object Storage bucket.</li>
          <li><strong>Reliability:</strong> 99.99% SLA uptime, automated snapshot backups, and dedicated Indian IPv4.</li>
        </ul>
        <ul>
          <li><strong>Subdomains & DNS:</strong> DigitalOcean DNS provides free unlimited subdomains with Cloudflare integration.</li>
          <li><strong>Payment:</strong> Requires Credit Card / International Debit Card (billed in USD).</li>
        </ul>
      </div>
    </div>

    <!-- OPTION 3: AWS AMAZON WEB SERVICES -->
    <div class="quote-card">
      <div class="quote-header">
        <div class="provider-title">
          <span class="provider-name">Option 3: Amazon Web Services (AWS Lightsail + S3)</span>
          <span class="provider-badge badge-enterprise">Enterprise Tier</span>
        </div>
        <div class="quote-cost">
          <div class="cost-main">₹1,150 / month</div>
          <div class="cost-sub">First 3 Months VPS FREE ($0/mo)</div>
        </div>
      </div>
      
      <div class="specs-grid">
        <div class="spec-item"><span class="spec-label">Data Center</span><span class="spec-val">Mumbai (ap-south-1) 🇮🇳</span></div>
        <div class="spec-item"><span class="spec-label">Compute</span><span class="spec-val">2 vCPU Cores / 2 GB RAM</span></div>
        <div class="spec-item"><span class="spec-label">Fast SSD</span><span class="spec-val">60 GB SSD + 3TB Bandwidth</span></div>
        <div class="spec-item"><span class="spec-label">S3 Storage</span><span class="spec-val">AWS S3 Bucket (Mumbai)</span></div>
      </div>

      <div class="quote-details-list">
        <ul>
          <li><strong>Compute (Lightsail):</strong> $5/mo (~₹420/mo) with <strong>3 MONTHS 100% FREE</strong> trial.</li>
          <li><strong>Enterprise S3 Vault:</strong> Native AWS S3 in Mumbai (5GB Free Tier for 12 months, then ₹1.8/GB/mo).</li>
        </ul>
        <ul>
          <li><strong>Route 53 DNS & Domain:</strong> Domain registration ($13/yr) + Route 53 DNS ($0.50/mo) for unlimited subdomains.</li>
          <li><strong>Compliance:</strong> ISO 27001, SOC 2, and RBI Indian Financial Data Localization compliant.</li>
        </ul>
      </div>
    </div>

  </div>

  <!-- FOOTER PAGE 1 -->
  <div class="footer">
    <span class="footer-brand">InfuseTax™ Technologies Private Limited • Infrastructure Quotation</span>
    <span>Page 1 of 2</span>
  </div>

  <!-- PAGE BREAK -->
  <div class="page-break"></div>

  <!-- HEADER PAGE 2 -->
  <div class="header">
    <img src="data:image/png;base64,{logo_b64}" class="logo-img" alt="InfuseTax Enterprise">
    <div class="header-meta">
      <div class="header-badge">High-Volume Scalability Matrix</div>
      <div class="doc-date">Growth Forecasting & Auto-Upgrade Path</div>
    </div>
  </div>

  <!-- SECTION 2: HIGH USAGE UPGRADE PATH -->
  <div class="section-title">High-Volume Usage & Scale-Up Roadmap ("When Usage Count Grows High")</div>

  <p style="font-size: 9.5px; color: #475569; margin-bottom: 9px;">
    As your retailer outlets, counter operators, and daily GST/ITR filings increase, the platform scales gracefully without rewriting code. The table below details server specifications and estimated budgets across each growth milestone:
  </p>

  <table class="compare-table">
    <thead>
      <tr>
        <th style="width: 17%;">Usage Tier</th>
        <th style="width: 21%;">Retailers & Monthly Volume</th>
        <th style="width: 22%;">Server Hardware Specs</th>
        <th style="width: 22%;">S3 Document Storage</th>
        <th style="width: 18%;">Estimated Budget</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Tier A: Launch Stage</strong><br><span style="color:#059669; font-weight:700;">(Current Start)</span></td>
        <td>• 10 – 50 Retail Outlets<br>• Up to 2,500 filings / month<br>• 100 concurrent counter staff</td>
        <td>• <strong>2 vCPU Cores</strong><br>• <strong>4 GB RAM</strong><br>• 50 GB NVMe Disk</td>
        <td>• <strong>10 GB – 25 GB S3</strong><br>• ~15,000 PDF receipts<br>• Free Tier Covered</td>
        <td><strong>₹449 – ₹750</strong><br>/ month</td>
      </tr>
      <tr>
        <td><strong>Tier B: Regional Growth</strong><br><span style="color:#2563eb; font-weight:700;">(District Scale)</span></td>
        <td>• 50 – 250 Retail Outlets<br>• 10,000 – 25,000 filings / mo<br>• 500 concurrent operators</td>
        <td>• <strong>4 vCPU Cores</strong><br>• <strong>8 GB – 16 GB RAM</strong><br>• 100 GB NVMe Disk</td>
        <td>• <strong>100 GB S3 Vault</strong><br>• ~150,000 documents<br>• Cost: ~₹120/mo</td>
        <td><strong>₹1,200 – ₹1,800</strong><br>/ month</td>
      </tr>
      <tr>
        <td><strong>Tier C: State Scale</strong><br><span style="color:#7c3aed; font-weight:700;">(Zonal Enterprise)</span></td>
        <td>• 250 – 1,000 Outlets<br>• 50,000 – 100,000 filings / mo<br>• 2,000 concurrent operators</td>
        <td>• <strong>8 vCPU Cores</strong><br>• <strong>32 GB RAM</strong><br>• 250 GB NVMe Disk</td>
        <td>• <strong>500 GB S3 Vault</strong><br>• ~750,000 documents<br>• Cost: ~₹550/mo</td>
        <td><strong>₹3,200 – ₹4,500</strong><br>/ month</td>
      </tr>
      <tr>
        <td><strong>Tier D: National Scale</strong><br><span style="color:#dc2626; font-weight:700;">(Mega FinTech)</span></td>
        <td>• 1,000+ Outlets (All India)<br>• 250,000+ filings / month<br>• High-volume tax season spikes</td>
        <td>• <strong>Load Balanced Cluster</strong><br>• 2x App Servers (16GB)<br>• Dedicated DB Server (32GB)</td>
        <td>• <strong>2 TB+ Scalable S3</strong><br>• Multi-region auto replication<br>• Cost: ~₹2,200/mo</td>
        <td><strong>₹8,500 – ₹12,000</strong><br>/ month</td>
      </tr>
    </tbody>
  </table>

  <!-- SIDE-BY-SIDE SUMMARY -->
  <div class="section-title">Commercial Summary Table (Starting Tier)</div>

  <table class="compare-table">
    <thead>
      <tr>
        <th>Feature / Parameter</th>
        <th>Option 1: Hostinger VPS India</th>
        <th>Option 2: DigitalOcean India</th>
        <th>Option 3: AWS Mumbai</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Server Location</strong></td>
        <td><strong>Mumbai, India 🇮🇳</strong></td>
        <td>Bangalore / Mumbai 🇮🇳</td>
        <td><strong>Mumbai (ap-south-1) 🇮🇳</strong></td>
      </tr>
      <tr>
        <td><strong>Memory (RAM) Included</strong></td>
        <td><strong>4 GB RAM (Highest Value)</strong></td>
        <td>2 GB RAM</td>
        <td>2 GB RAM</td>
      </tr>
      <tr>
        <td><strong>NVMe SSD Storage</strong></td>
        <td>50 GB NVMe</td>
        <td>50 GB SSD</td>
        <td>60 GB SSD</td>
      </tr>
      <tr>
        <td><strong>Big S3 Object Storage</strong></td>
        <td>10 GB Free (Cloudflare R2 S3)</td>
        <td>250 GB Included (DO Spaces)</td>
        <td>5 GB Free (AWS S3 Bucket)</td>
      </tr>
      <tr>
        <td><strong>Subdomains Supported</strong></td>
        <td>Unlimited (`api.`, `portal.`, `*`)</td>
        <td>Unlimited</td>
        <td>Unlimited</td>
      </tr>
      <tr>
        <td><strong>Payment Methods</strong></td>
        <td><strong>UPI, GPay, Paytm, Cards, NetBanking</strong></td>
        <td>Credit Card (USD)</td>
        <td>Credit / Debit Card</td>
      </tr>
      <tr>
        <td><strong>GST Tax Invoice</strong></td>
        <td><strong>Yes (18% Input Credit)</strong></td>
        <td>No Indian GST Invoice</td>
        <td>Yes (Amazon Internet Services)</td>
      </tr>
      <tr>
        <td><strong>Monthly Cost (INR)</strong></td>
        <td><strong style="color:#059669; font-size:10px;">₹449 / month</strong></td>
        <td>₹950 / month</td>
        <td>₹1,150 / mo (3 Mos Free)</td>
      </tr>
    </tbody>
  </table>

  <!-- STRATEGIC RECOMMENDATION & SIGN-OFF -->
  <div class="callout">
    <h4>Executive Recommendation for Initial Launch:</h4>
    <p>
      • <strong>Best Immediate Value:</strong> Start with <strong>Option 1 (Hostinger Mumbai @ ₹449/mo)</strong>. It provides <strong>4 GB RAM</strong> at less than half the price of AWS, operates directly inside Mumbai for sub-15ms Indian speeds, accepts instant <strong>UPI/GPay payments</strong>, and handles up to 50 retail outlets with zero lag.<br>
      • <strong>Seamless Upgrade:</strong> When transaction counts reach 20,000/month (Tier B), you can upgrade CPU & RAM with <strong>1 click</strong> from the control panel in 60 seconds without data loss.
    </p>
  </div>

  <!-- CLIENT APPROVAL BOX -->
  <div class="sign-box">
    <div class="sign-title">Client Infrastructure Selection & Authorization</div>
    <div class="sign-grid">
      <div>
        <label><strong>Approved Provider:</strong></label><br>
        [ &nbsp; ] Option 1: Hostinger Mumbai (₹449/mo)<br>
        [ &nbsp; ] Option 2: DigitalOcean (₹950/mo)<br>
        [ &nbsp; ] Option 3: AWS Mumbai (₹1,150/mo)
      </div>
      <div>
        <div class="sign-line">Authorized Signatory Name & Designation</div>
      </div>
      <div>
        <div class="sign-line">Date & Official Company Seal</div>
      </div>
    </div>
  </div>

  <!-- FOOTER PAGE 2 -->
  <div class="footer">
    <span class="footer-brand">InfuseTax™ Technologies Private Limited • Confidential Commercial Proposal</span>
    <span>Page 2 of 2</span>
  </div>

</body>
</html>
"""

html_path = "/home/prabhu/Learning/Infusetax/InfuseTax_Server_Quotations_and_Scaling_Matrix.html"
pdf_path = "/home/prabhu/Learning/Infusetax/InfuseTax_Server_Quotations_and_Scaling_Matrix.pdf"

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
