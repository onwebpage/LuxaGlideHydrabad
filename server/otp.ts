import crypto from "crypto";

interface OTPStore {
  otp: string;
  phone: string;
  expiresAt: number;
  verified: boolean;
}

const otpStore = new Map<string, OTPStore>();

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendOTP(phone: string): Promise<{ success: boolean; message: string; otpId?: string }> {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      console.error("FAST2SMS_API_KEY not configured");
      return { success: false, message: "SMS service not configured" };
    }

    const otp = generateOTP();
    const otpId = crypto.randomBytes(16).toString("hex");
    
    // Store OTP with 5 minute expiry
    otpStore.set(otpId, {
      otp,
      phone,
      expiresAt: Date.now() + 5 * 60 * 1000,
      verified: false,
    });

    // Clean up expired OTPs
    for (const [id, data] of otpStore.entries()) {
      if (Date.now() > data.expiresAt) {
        otpStore.delete(id);
      }
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: "Invalid phone number format" };
    }
    
    // Send OTP via FAST2SMS
    const url = new URL("https://www.fast2sms.com/dev/bulkV2");
    url.searchParams.append("authorization", apiKey);
    url.searchParams.append("variables_values", otp);
    url.searchParams.append("route", "otp");
    url.searchParams.append("numbers", cleanPhone);

    // Always log OTP to console for debugging
    console.log(`[OTP] Sending OTP ${otp} to ${cleanPhone} (otpId: ${otpId})`);

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    const responseText = await response.text();
    
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("FAST2SMS non-JSON response:", responseText.substring(0, 200));
      return { success: false, message: "SMS service returned an invalid response" };
    }

    console.log("FAST2SMS response:", data);

    if (data.return === true || data.status_code === 200) {
      return { success: true, message: "OTP sent successfully", otpId };
    } else {
      console.error("FAST2SMS error:", data);
      return { success: false, message: data.message || "Failed to send OTP" };
    }
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return { success: false, message: error.message || "Failed to send OTP" };
  }
}

export function verifyOTP(otpId: string, otp: string): { success: boolean; message: string; phone?: string } {
  const stored = otpStore.get(otpId);

  if (!stored) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(otpId);
    return { success: false, message: "OTP expired" };
  }

  if (stored.otp !== otp) {
    return { success: false, message: "Invalid OTP" };
  }

  stored.verified = true;
  return { success: true, message: "OTP verified successfully", phone: stored.phone };
}

export function isOTPVerified(otpId: string): boolean {
  const stored = otpStore.get(otpId);
  return stored?.verified === true && Date.now() <= stored.expiresAt;
}

export function cleanupOTP(otpId: string): void {
  otpStore.delete(otpId);
}
