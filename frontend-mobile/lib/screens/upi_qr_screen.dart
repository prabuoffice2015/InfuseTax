import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class UpiQrScreen extends StatefulWidget {
  const UpiQrScreen({super.key});

  @override
  State<UpiQrScreen> createState() => _UpiQrScreenState();
}

class _UpiQrScreenState extends State<UpiQrScreen> {
  double _selectedAmount = 5000.0;
  final TextEditingController _amountController = TextEditingController(text: "5000");
  String _txnRef = "TXN908123";

  @override
  void initState() {
    super.initState();
    _txnRef = "TXN${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}";
  }

  String get _upiPayload {
    const vpa = "infusetax.retail@icici";
    const name = "InfuseTax Technologies";
    return "upi://pay?pa=$vpa&pn=${Uri.encodeComponent(name)}&am=$_selectedAmount&cu=INR&tr=$_txnRef&tn=${Uri.encodeComponent('Mobile Wallet TopUp $_txnRef')}";
  }

  void _launchUpiIntent() async {
    final uri = Uri.parse(_upiPayload);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Opening UPI App (GPay / PhonePe)...")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Dynamic UPI QR Top-Up",
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Amount Selector Chips
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [1000.0, 2500.0, 5000.0, 10000.0].map((amt) {
                  final isSelected = _selectedAmount == amt;
                  return ChoiceChip(
                    label: Text("₹${amt.toInt()}"),
                    selected: isSelected,
                    selectedColor: const Color(0xFFFBBF24),
                    backgroundColor: const Color(0xFF1E293B),
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF0F172A) : Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedAmount = amt;
                          _amountController.text = amt.toInt().toString();
                        });
                      }
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // QR Code Container
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                ),
                child: Column(
                  children: [
                    const Text(
                      "Scan via Any UPI App",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      "GPay • PhonePe • Paytm • BHIM • Cred",
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 16),

                    // QR Code
                    QrImageView(
                      data: _upiPayload,
                      version: QrVersions.auto,
                      size: 200.0,
                    ),

                    const SizedBox(height: 16),
                    Text(
                      "₹${_selectedAmount.toStringAsFixed(2)}",
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "VPA: infusetax.retail@icici",
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Open in UPI App Button
              ElevatedButton.icon(
                onPressed: _launchUpiIntent,
                icon: const Icon(Icons.payment, size: 18),
                label: const Text(
                  "Pay Directly via Installed UPI App",
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E40AF),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
              ),

              const SizedBox(height: 10),

              // Simulated Webhook Credit
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context, _selectedAmount);
                },
                icon: const Icon(Icons.check_circle, size: 18, color: Color(0xFF0F172A)),
                label: const Text(
                  "I Have Paid (Instant Webhook Credit)",
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
