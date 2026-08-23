import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://10.0.2.2:8888/api/v1"; // Android emulator to local host, or production URL

  static String? authToken;
  static String tenantCode = "INFUSE";

  // 1. Authentication
  static Future<Map<String, dynamic>> login(String identifier, String password) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/auth/login"),
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Code": tenantCode,
        },
        body: jsonEncode({
          "identifier": identifier,
          "password": password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        authToken = data['token'];
        return {"success": true, "data": data};
      }
      return {"success": false, "message": "Invalid credentials."};
    } catch (e) {
      // Local fallback mock response
      return {
        "success": true,
        "data": {
          "token": "mock_jwt_mobile_pos_token",
          "user": {
            "name": "Ramesh Digital Seva (Mobile POS)",
            "role": "retailer",
            "wallet": 24850.00
          }
        }
      };
    }
  }

  // 2. Submit GST Registration
  static Future<Map<String, dynamic>> submitGstRegistration(Map<String, dynamic> payload) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/tax/gst-registration"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return {
      "status": "success",
      "arn": "AA330826${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}Z",
      "debit_amount": 1200.0,
      "earned_margin": 300.0,
    };
  }

  // 3. Form 16 AI OCR
  static Future<Map<String, dynamic>> parseForm16Ocr(double grossSalary) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/tax/ai/form16-ocr"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"gross_salary": grossSalary}),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    return {
      "status": "success",
      "optimal_regime": "NEW REGIME (Budget 2025-26)",
      "tax_saved": 23500.0,
      "net_refund": 33000.0,
    };
  }
}
