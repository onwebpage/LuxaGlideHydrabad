import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building, ArrowRight, Phone, Layers, Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function VendorRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    gstNumber: "",
    varietiesOfModel: "",
    varietiesOfFabric: "",
  });

  const handleSendOTP = async () => {
    if (!formData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpId(data.otpId);
        setOtpSent(true);
        setShowOTP(true);
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

  const handleVerifyOTP = async () => {
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
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verified",
          description: "Phone number verified successfully.",
        });
        // Proceed with registration
        handleSubmit(new Event("submit") as any);
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        ...formData,
        role: "vendor",
        otpId,
      });

      toast({
        title: "Vendor account created!",
        description: "Welcome to Queen4Feet! Please complete your KYC verification.",
      });
      setLocation("/dashboard/vendor");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 bg-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Become a Vendor</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Join Queen4Feet as a vendor and start selling your products
          </p>
        </div>

        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>
              Fill in your details to create a vendor account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs uppercase tracking-wider">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-fullname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91-94926 34166"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-xs uppercase tracking-wider">
                  Business Name
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Your Company Name"
                    value={formData.businessName}
                    onChange={(e) => updateFormData("businessName", e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-business-name"
                  />
                </div>
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <Label htmlFor="gstNumber" className="text-xs uppercase tracking-wider">
                  GST Number (Optional)
                </Label>
                <Input
                  id="gstNumber"
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => updateFormData("gstNumber", e.target.value)}
                  data-testid="input-gst-number"
                />
              </div>

              {/* Varieties of Model */}
              <div className="space-y-2">
                <Label htmlFor="varietiesOfModel" className="text-xs uppercase tracking-wider">
                  Varieties of Model
                </Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="varietiesOfModel"
                    type="text"
                    placeholder="e.g., Sarees, Kurtis, Lehengas"
                    value={formData.varietiesOfModel}
                    onChange={(e) => updateFormData("varietiesOfModel", e.target.value)}
                    className="pl-10"
                    data-testid="input-varieties-model"
                  />
                </div>
              </div>

              {/* Varieties of Fabric */}
              <div className="space-y-2">
                <Label htmlFor="varietiesOfFabric" className="text-xs uppercase tracking-wider">
                  Varieties of Fabric
                </Label>
                <div className="relative">
                  <Shirt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="varietiesOfFabric"
                    type="text"
                    placeholder="e.g., Cotton, Silk, Chiffon"
                    value={formData.varietiesOfFabric}
                    onChange={(e) => updateFormData("varietiesOfFabric", e.target.value)}
                    className="pl-10"
                    data-testid="input-varieties-fabric"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
              </div>

              {!showOTP ? (
                <>
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms-register" 
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms-register" className="text-sm text-muted-foreground leading-none cursor-pointer">
                      I agree to the vendor terms and conditions
                    </label>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full"
                    size="lg"
                    disabled={isLoading || !formData.phone || !agreeToTerms}
                    data-testid="button-send-otp"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP to Verify Phone"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-xs uppercase tracking-wider">
                      Enter OTP sent to {formData.phone}
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="text-center tracking-widest text-lg"
                      maxLength={6}
                      data-testid="input-otp"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="flex-1"
                      size="lg"
                      disabled={isLoading || otp.length !== 6}
                      data-testid="button-verify-otp"
                    >
                      {isLoading ? "Verifying..." : "Verify & Register"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setOtpSent(false); setShowOTP(false); setOtp(""); }}
                      size="lg"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account?</span>{" "}
              <Link href="/login">
                <a className="text-primary hover:underline font-medium" data-testid="link-login">
                  Sign in
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}