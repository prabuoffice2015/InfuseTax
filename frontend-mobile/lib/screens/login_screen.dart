import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'retailer_pos_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifierController = TextEditingController(text: "retailer@infusetax.com");
  final _passwordController = TextEditingController(text: "Retailer@1234");
  bool _isLoading = false;
  String? _errorMessage;

  void _handleLogin(String role) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await ApiService.login(_identifierController.text, _passwordController.text);

    setState(() {
      _isLoading = false;
    });

    if (res['success'] == true && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => RetailerPosScreen(userRole: role),
        ),
      );
    } else {
      setState(() {
        _errorMessage = res['message'] ?? "Login failed.";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Logo & Header
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E40AF),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1E40AF).withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      "IT",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  "InfuseTax Mobile POS",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  "AI-Powered Tax, GST & FinTech Counter Terminal",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 32),

                // Error alert
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF881337),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Input Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 25,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Email / Mobile / User ID",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _identifierController,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        decoration: InputDecoration(
                          hintText: "e.g. retailer@infusetax.com",
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      const Text(
                        "Security Password / PIN",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        decoration: InputDecoration(
                          hintText: "Enter password",
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Sign In Button
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : () => _handleLogin("retailer"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E40AF),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Text(
                                  "Sign In to Mobile POS",
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                // 1-Click Role Fillers
                const Text(
                  "QUICK TEST ACCESS",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  alignment: WrapAlignment.center,
                  children: [
                    ActionChip(
                      label: const Text("Retailer POS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: const TextStyle(color: Colors.white),
                      onPressed: () {
                        _identifierController.text = "retailer@infusetax.com";
                        _passwordController.text = "Retailer@1234";
                        _handleLogin("retailer");
                      },
                    ),
                    ActionChip(
                      label: const Text("Distributor", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: const TextStyle(color: Colors.white),
                      onPressed: () {
                        _identifierController.text = "distributor@infusetax.com";
                        _passwordController.text = "Distributor@1234";
                        _handleLogin("distributor");
                      },
                    ),
                    ActionChip(
                      label: const Text("Operator", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: const TextStyle(color: Colors.white),
                      onPressed: () {
                        _identifierController.text = "operator@infusetax.com";
                        _passwordController.text = "Operator@1234";
                        _handleLogin("operator");
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
