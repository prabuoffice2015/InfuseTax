import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/printer_service.dart';
import 'upi_qr_screen.dart';
import 'login_screen.dart';

class RetailerPosScreen extends StatefulWidget {
  final String userRole;
  const RetailerPosScreen({super.key, this.userRole = "retailer"});

  @override
  State<RetailerPosScreen> createState() => _RetailerPosScreenState();
}

class _RetailerPosScreenState extends State<RetailerPosScreen> {
  double _walletBalance = 47550.0;
  bool _isLoading = false;
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹');

  final List<Map<String, dynamic>> _recentFilings = [
    {
      "id": "AA3308268288952Z",
      "client": "Murugan Tex & Silks",
      "service": "GST Registration (Proprietorship)",
      "amount": 1500.0,
      "comm": 300.0,
      "date": "23 Aug 2026, 15:05",
      "status": "ARN GENERATED",
    },
    {
      "id": "ITR2026-9081",
      "client": "Dr. Ananya Sharma",
      "service": "ITR-1 Salaried (AI Form 16)",
      "amount": 800.0,
      "comm": 250.0,
      "date": "23 Aug 2026, 12:30",
      "status": "ITR-V FILED",
    },
    {
      "id": "PAN49A-771",
      "client": "K. Selvam",
      "service": "New Physical PAN (Form 49A)",
      "amount": 110.0,
      "comm": 25.0,
      "date": "22 Aug 2026, 17:15",
      "status": "ACK DISPATCHED",
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchLiveStats();
  }

  void _fetchLiveStats() async {
    final res = await ApiService.getDashboardStats();
    if (res['status'] == 'success' && mounted) {
      final bal = res['stats']?['retailer_wallet_inr'];
      if (bal != null) {
        setState(() {
          _walletBalance = (bal as num).toDouble();
        });
      }
    }
  }

  void _showGstWizardDialog() {
    final tradeController = TextEditingController(text: "Sri Krishna Traders");
    final legalController = TextEditingController(text: "K. Krishna Kumar");
    final panController = TextEditingController(text: "ABCDE1234F");
    String entityType = "Proprietorship";
    String state = "Tamil Nadu";

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.receipt_long, color: Color(0xFF1E40AF), size: 20),
              ),
              const SizedBox(width: 10),
              const Text("New GST Registration", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Business Trade Name", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 4),
                TextField(
                  controller: tradeController,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 10),

                const Text("Applicant Legal Name", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 4),
                TextField(
                  controller: legalController,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 10),

                const Text("Applicant PAN Number", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                const SizedBox(height: 4),
                TextField(
                  controller: panController,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),

                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text("Portal Fee: ₹1,200", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                      Text("Your Margin: +₹300", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E40AF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final res = await ApiService.submitGstRegistration(
                  tradeName: tradeController.text,
                  legalName: legalController.text,
                  entityType: entityType,
                  pan: panController.text,
                  state: state,
                );

                setState(() {
                  _walletBalance -= 1200.0;
                  _recentFilings.insert(0, {
                    "id": res['arn'] ?? "AA33082699812Z",
                    "client": tradeController.text,
                    "service": "GST Registration (Proprietorship)",
                    "amount": 1500.0,
                    "comm": 300.0,
                    "date": "Just now",
                    "status": "ARN GENERATED",
                  });
                });

                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: const Color(0xFF047857),
                      content: Text("✓ GST Registered! ARN: ${res['arn']} (+₹300 Margin)"),
                    ),
                  );
                }
              },
              child: const Text("Submit & Debit ₹1,200"),
            ),
          ],
        ),
      ),
    );
  }

  void _showForm16OcrDialog() {
    final salaryController = TextEditingController(text: "1250000");
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: const [
            Icon(Icons.auto_awesome, color: Color(0xFFD97706), size: 22),
            SizedBox(width: 8),
            Text("AI Form 16 OCR & Tax Optimizer", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Gross Salary from Form 16 (₹)", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            TextField(
              controller: salaryController,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              decoration: InputDecoration(
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "Budget 2025-26 New Regime: ₹75,000 Standard Deduction will be automatically applied.",
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD97706),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final salary = double.tryParse(salaryController.text) ?? 1250000.0;
              final res = await ApiService.parseForm16Ocr(grossSalary: salary);

              if (mounted) {
                showDialog(
                  context: context,
                  builder: (ctx2) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    title: const Text("AI Tax Optimization Result", style: TextStyle(fontWeight: FontWeight.bold)),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Recommended: ${res['optimal_regime']}", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF047857))),
                        const SizedBox(height: 8),
                        Text("Annual Tax Saved: ₹${res['annual_tax_saved']}", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        Text("Estimated Refund Due: ₹${res['net_refund_due']}", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Text("ITR-V Ack: ${res['ack_number']}", style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.grey)),
                      ],
                    ),
                    actions: [
                      ElevatedButton(
                        onPressed: () => Navigator.pop(ctx2),
                        child: const Text("Done"),
                      ),
                    ],
                  ),
                );
              }
            },
            child: const Text("Calculate & Optimize"),
          ),
        ],
      ),
    );
  }

  void _printReceipt(Map<String, dynamic> item) async {
    await ThermalPrinterService.printCustomerReceipt(
      txnId: item['id'],
      clientName: item['client'],
      serviceName: item['service'],
      amount: item['amount'],
      date: item['date'],
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF1E40AF),
          content: Text("🖨️ 80mm Customer Receipt Sent to Bluetooth Thermal POS!"),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1E40AF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text("IT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            ),
            const SizedBox(width: 10),
            const Text(
              "InfuseTax Mobile POS",
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: _fetchLiveStats,
            title: "Refresh Live PostgreSQL Balance",
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFFDA4AF)),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => _fetchLiveStats(),
          child: ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Wallet Card with UPI Top-Up Trigger
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E40AF), Color(0xFF1E293B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1E40AF).withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "POSTGRESQL WALLET POOL",
                          style: TextStyle(
                            color: Color(0xFF93C5FD),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF065F46),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            "● PG-16 LIVE",
                            style: TextStyle(color: Color(0xFF6EE7B7), fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _currencyFormat.format(_walletBalance),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const UpiQrScreen()),
                              );
                              if (result != null && result is double) {
                                setState(() {
                                  _walletBalance += result;
                                });
                              }
                            },
                            icon: const Icon(Icons.qr_code, size: 16, color: Color(0xFF0F172A)),
                            label: const Text(
                              "+ Instant Dynamic UPI Top-Up",
                              style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFBBF24),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 0,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
              const Text(
                "COMPLIANCE & E-GOVERNANCE SERVICE DESKS",
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 12),

              // Service Desks Grid
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.25,
                children: [
                  _buildServiceCard(
                    title: "GST Registration",
                    subtitle: "Proprietorship & Pvt Ltd",
                    margin: "+₹300 Margin",
                    icon: Icons.receipt_long,
                    color: const Color(0xFF1E40AF),
                    onTap: _showGstWizardDialog,
                  ),
                  _buildServiceCard(
                    title: "Form 16 AI ITR",
                    subtitle: "Old vs New Optimizer",
                    margin: "+₹250 Margin",
                    icon: Icons.auto_awesome,
                    color: const Color(0xFFD97706),
                    onTap: _showForm16OcrDialog,
                  ),
                  _buildServiceCard(
                    title: "PAN Card 49A",
                    subtitle: "Physical + e-PAN",
                    margin: "+₹25 Margin",
                    icon: Icons.credit_card,
                    color: const Color(0xFF059669),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("PAN 49A Service Desk Loaded!")),
                      );
                    },
                  ),
                  _buildServiceCard(
                    title: "Passport Seva",
                    subtitle: "Normal & Tatkaal",
                    margin: "+₹350 Margin",
                    icon: Icons.flight_takeoff,
                    color: const Color(0xFF7C3AED),
                    onTap: () {},
                  ),
                ],
              ),

              const SizedBox(height: 24),
              const Text(
                "RECENT COUNTER FILINGS & RECEIPT PRINTER",
                style: TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 10),

              // Recent Filings List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _recentFilings.length,
                itemBuilder: (context, index) {
                  final item = _recentFilings[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['client'],
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item['service'],
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item['id'],
                              style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF1E40AF)),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              _currencyFormat.format(item['amount']),
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 4),
                            IconButton(
                              constraints: const BoxConstraints(),
                              padding: EdgeInsets.zero,
                              icon: const Icon(Icons.print, size: 20, color: Color(0xFF1E40AF)),
                              onPressed: () => _printReceipt(item),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServiceCard({
    required String title,
    required String subtitle,
    required String margin,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                Text(subtitle, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
              ],
            ),
            Text(margin, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
