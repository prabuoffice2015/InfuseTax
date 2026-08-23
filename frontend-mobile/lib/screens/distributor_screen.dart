import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'login_screen.dart';

class DistributorScreen extends StatefulWidget {
  const DistributorScreen({super.key});

  @override
  State<DistributorScreen> createState() => _DistributorScreenState();
}

class _DistributorScreenState extends State<DistributorScreen> {
  double _distributorLiquidity = 450000.0;
  final NumberFormat _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹');

  final List<Map<String, dynamic>> _downlines = [
    {"code": "RET1029", "name": "Ramesh Digital Seva", "city": "Chennai", "balance": 48750.0},
    {"code": "RET1088", "name": "Kumar Tax Point", "city": "Madurai", "balance": 12400.0},
    {"code": "RET1102", "name": "Sai E-Seva Center", "city": "Coimbatore", "balance": 5200.0},
    {"code": "RET1145", "name": "Apex CSC Tax Desk", "city": "Salem", "balance": 28900.0},
  ];

  void _disburseMoney(Map<String, dynamic> retailer) {
    final amtController = TextEditingController(text: "10000");
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text("P2P Transfer to ${retailer['name']}", style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amtController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: "Transfer Amount (₹)",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              final amt = double.tryParse(amtController.text) ?? 0.0;
              if (amt > 0) {
                setState(() {
                  _distributorLiquidity -= amt;
                  retailer['balance'] += amt;
                });
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: const Color(0xFF047857),
                    content: Text("✓ ₹$amt Disbursed to ${retailer['name']}!"),
                  ),
                );
              }
            },
            child: const Text("Disburse Now"),
          ),
        ],
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
        title: const Text("Master Distributor Network", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFFDA4AF)),
            onPressed: () {
              Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            },
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF312E81)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("DISTRIBUTOR LIQUIDITY", style: TextStyle(color: Color(0xFFDDD6FE), fontSize: 10, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(
                    _currencyFormat.format(_distributorLiquidity),
                    style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                  ),
                  const SizedBox(height: 12),
                  const Text("Ready for zero-fee instant P2P retailer disbursements.", style: TextStyle(color: Colors.white70, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text("DOWNLINE RETAILER OUTLETS", style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _downlines.length,
              itemBuilder: (ctx, i) {
                final ret = _downlines[i];
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
                          Text(ret['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text("${ret['code']} • ${ret['city']}", style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(_currencyFormat.format(ret['balance']), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 4),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFEDE9FE),
                              foregroundColor: const Color(0xFF6D28D9),
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              minimumSize: const Size(60, 26),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () => _disburseMoney(ret),
                            child: const Text("Transfer", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
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
}
