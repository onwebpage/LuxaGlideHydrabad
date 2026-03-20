import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Phone } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "phone" | "otp">("credentials");
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: "Username and password required", variant: "destructive" });
      return;
    }
    setStep("phone");
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description: "Please enter your mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/admin-send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpId(data.otpId);
        setStep("otp");
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndLogin = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const verifyResponse = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, otp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        toast({
          title: "Error",
          description: verifyData.message || "Invalid OTP",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const loginResponse = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, otpId }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminAuthTime", Date.now().toString());
        localStorage.setItem("adminToken", loginData.token);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel",
        });
        setLocation("/dashboard/admin");
      } else {
        toast({
          title: "Login Failed",
          description: loginData.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <Card className="w-full max-w-md mx-4" data-testid="card-admin-login">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
            <CardDescription>
            {step === "credentials" && "Enter your admin credentials"}
            {step === "phone" && "Enter your phone number for OTP verification"}
            {step === "otp" && "Enter the OTP sent to your phone"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          )}

          {step === "phone" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <Phone className="w-5 h-5 mt-2.5 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <Button onClick={handleSendOTP} className="w-full" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("credentials")}>
                Back
              </Button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerifyAndLogin} className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("phone")}>
                Resend OTP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
