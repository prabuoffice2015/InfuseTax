import { getAuthToken, clearAuthSession } from "./auth";

/**
 * End-to-End Cryptographic Payload Security Module
 * Uses AES-256-CBC with SHA-256 derived keys and Web Crypto API.
 */

const SECRET_KEY_SEED = "infusetax_payload_secret_key_32bytes!!";

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.digest("SHA-256", enc.encode(SECRET_KEY_SEED));
  return window.crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts an object/array into base64 encoded IV + ciphertext string compatible with PHP backend.
 */
export async function encryptPayload(data: any): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return JSON.stringify(data);
  }

  try {
    const key = await getCryptoKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(data));

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      encodedData
    );

    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);

    let binary = "";
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error("Encryption error:", e);
    return JSON.stringify(data);
  }
}

/**
 * Decrypts a base64 encoded IV + ciphertext string.
 */
export async function decryptPayload(base64Payload: string): Promise<any> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    try {
      return JSON.parse(base64Payload);
    } catch {
      return null;
    }
  }

  try {
    const binary = atob(base64Payload);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    if (bytes.length < 17) return null;

    const iv = bytes.slice(0, 16);
    const cipherData = bytes.slice(16);
    const key = await getCryptoKey();

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      cipherData
    );

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Decryption error:", e);
    return null;
  }
}

/**
 * High-Security Fetch Wrapper with automatic Auth Headers and optional AES-256 Payload Encryption.
 */
export async function secureFetch(
  url: string,
  options: RequestInit & { encrypt?: boolean } = {}
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Content-Type", "application/json");
  headers.set("X-Encrypted-Payload", "true");
  headers.set("Accept-Encrypted", "true");

  let body = options.body;

  if (options.encrypt !== false && body && typeof body === "string") {
    try {
      const parsedBody = JSON.parse(body);
      const encrypted = await encryptPayload(parsedBody);
      body = JSON.stringify({ _payload: encrypted });
    } catch (e) {
      // Fallback to standard body if parsing failed
    }
  }

  return fetch(url, {
    ...options,
    headers,
    body
  });
}

/**
 * High-Level Secure API Client that handles JSON serialization, AES-256 payload encryption, and JSON response decoding.
 */
export async function secureApiCall(
  url: string,
  options: Omit<RequestInit, "body"> & { encrypt?: boolean; body?: any } = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  headers.set("Content-Type", "application/json");
  headers.set("X-Encrypted-Payload", "true");
  headers.set("Accept-Encrypted", "true");

  let bodyStr: string | undefined = undefined;

  if (options.body !== undefined && options.body !== null) {
    if (typeof options.body === "string") {
      if (options.encrypt !== false) {
        try {
          const parsed = JSON.parse(options.body);
          const encrypted = await encryptPayload(parsed);
          bodyStr = JSON.stringify({ _payload: encrypted });
        } catch {
          bodyStr = options.body;
        }
      } else {
        bodyStr = options.body;
      }
    } else {
      if (options.encrypt !== false) {
        try {
          const encrypted = await encryptPayload(options.body);
          bodyStr = JSON.stringify({ _payload: encrypted });
        } catch (e) {
          bodyStr = JSON.stringify(options.body);
        }
      } else {
        bodyStr = JSON.stringify(options.body);
      }
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: bodyStr
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {}

    // Transparently decrypt response if encrypted
    if (data && data._encrypted && typeof data._payload === "string") {
      try {
        const decrypted = await decryptPayload(data._payload);
        if (decrypted !== null) {
          data = decrypted;
        }
      } catch (e) {
        console.error("Failed to decrypt server response:", e);
      }
    }

    if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.includes("/sign-in") && !url.includes("/api/v1/auth/login")) {
      clearAuthSession();
      window.location.href = "/sign-in";
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { message: "Network connection error." } };
  }
}
