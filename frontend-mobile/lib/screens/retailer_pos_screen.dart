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
  double _walletBalance = 24850.0;
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹');

  final List<Map<String, dynamic>> _recentFilings = [
    {
      "id": "AA3308269100924Z",
      "client": "Sri Balaji Traders",
      "service": "GST Registration (Proprietorship)",
      "amount": 1500.0,
      "comm": 300.0,
      "date": "23 Aug 2026, 14:10",
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

  void _handleQuickGstSubmit() async {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text("New GST Registration", style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text("Client: Murugan Tex & Garments", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            SizedBox(height: 4),
            Text("Type: Proprietorship | State: Tamil Nadu", style: TextStyle(color: Colors.grey, fontSize: 11)),
            SizedBox(height: 12),
            Text("Portal Fee: ₹1,500 | Your Margin: +₹300", style: TextStyle(color: Color(0xFF1E40AF), fontWeight: FontWeight.bold, fontSize: 12)),
          ],
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
              final res = await ApiService.submitGstRegistration({"trade_name": "Murugan Tex"});
              setState(() {
                _walletBalance -= 1200.0;
                _recentFilings.insert(0, {
                  "id": res['arn'] ?? "AA33082699812Z",
                  "client": "Murugan Tex",
                  "service": "GST Registration (Proprietorship)",
                  "amount": 1500.0,
                  "comm": 300.0,
                  "date": "Just now",
                  "status": "ARN GENERATED",
                });
              });

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF047857),
                  content: Text("✓ GST Registered! ARN: ${res['arn']} (+₹300 Margin)"),
                ),
              );
            },
            child: const Text("Submit & Pay ₹1,200"),
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

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("🖨️ 80mm Thermal Receipt Sent to Bluetooth Printer!"),
      ),
    );
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
                        "COUNTER WALLET BALANCE",
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
                          "● ONLINE",
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
                            "+ UPI QR Top-Up",
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
              "TAX & E-GOVERNANCE SERVICE DESKS",
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
                  onTap: _handleQuickGstSubmit,
                ),
                _buildServiceCard(
                  title: "Form 16 AI ITR",
                  subtitle: "Old vs New Optimizer",
                  margin: "+₹250 Margin",
                  icon: Icons.auto_awesome,
                  color: const Color(0xFFD97706),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("AI Form 16 Camera OCR Loaded!")),
                    );
                  },
                ),
                _buildServiceCard(
                  title: "PAN Card 49A",
                  subtitle: "Physical + e-PAN",
                  margin: "+₹25 Margin",
                  icon: Icons.credit_card,
                  color: const Color(0xFF059669),
                  onTap: () {},
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
              "RECENT STORE FILINGS & THERMAL PRINTS",
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
                            icon: const Icon(Icons.print, size: 18, color: Color(0xFF1E40AF)),
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
