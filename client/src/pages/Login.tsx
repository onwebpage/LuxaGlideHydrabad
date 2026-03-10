import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Zap, Users, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case "vendor":
        return "/dashboard/vendor";
      case "admin":
        return "/dashboard/admin";
      case "buyer":
      default:
        return "/dashboard/buyer";
    }
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      setLocation(getDashboardPath(user.role));
    }
  }, [user, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password, otpId);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation(getDashboardPath(user.role));
    } catch (error: any) {
      if (error.message?.includes("Phone verification required")) {
        setShowOTP(true);
        toast({
          title: "OTP Required",
          description: "Please verify your phone number to continue.",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpId(data.otpId);
        setOtpSent(true);
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
        // Retry login with verified OTP
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

  const features = [
    {
      icon: ShieldCheck,
      title: "Secure",
      description: "Bank-level encryption"
    },
    {
      icon: Zap,
      title: "Fast",
      description: "Instant access"
    },
    {
      icon: Users,
      title: "Trusted",
      description: "10K+ users"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 sm:top-20 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 sm:bottom-20 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="space-y-8">
              <div>
                <Badge className="mb-6 px-6 py-2 text-base">Sign In</Badge>
                <h1 className="font-serif text-6xl font-bold mb-6 leading-tight">
                  Welcome Back to
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    mahanaari
                  </span>
                </h1>
                <p className="text-muted-foreground text-xl leading-relaxed mb-8">
                  Sign in to access your account and discover exquisite fashion collections.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="border-2 hover-elevate transition-all duration-500">
                      <CardContent className="p-6 text-center">
                        <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h3 className="font-bold mb-1">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                  <CardContent className="p-8">
                    <p className="text-lg italic mb-4">
                      "mahanaari has transformed how I shop for fashion. The platform is intuitive and the vendor network is exceptional."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Rajesh Kumar</p>
                        <p className="text-sm text-muted-foreground">Fashion Retailer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Mobile Header */}
            <div className="text-center mb-6 sm:mb-8 lg:hidden">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome Back</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sign in to access your account
              </p>
            </div>

            <Card className="border-2 shadow-2xl">
              <CardHeader className="space-y-2 pb-8">
                <CardTitle className="text-3xl font-serif font-bold">Sign In</CardTitle>
                <CardDescription className="text-base">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="email" className="text-xs uppercase tracking-widest font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs uppercase tracking-widest font-medium">
                        Password
                      </Label>
                      <Link href="/forgot-password">
                        <a className="text-xs text-primary hover:underline font-medium" data-testid="link-forgot-password">
                          Forgot password?
                        </a>
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        required
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {showOTP ? (
                      <div className="space-y-4">
                        {!otpSent ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              We'll send an OTP to your registered phone number.
                            </p>
                            <div className="flex items-start space-x-2 mb-4">
                              <Checkbox 
                                id="terms-login" 
                                checked={agreeToTerms}
                                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                              />
                              <label htmlFor="terms-login" className="text-sm text-muted-foreground leading-none cursor-pointer">
                                I agree to the vendor terms and conditions
                              </label>
                            </div>
                            <Button
                              type="button"
                              onClick={handleSendOTP}
                              className="w-full h-12"
                              disabled={isLoading || !agreeToTerms}
                            >
                              Send OTP
                            </Button>
                          </>
                        ) : (
                          <>
                            <Label htmlFor="otp" className="text-xs uppercase tracking-widest font-medium">
                              Enter OTP
                            </Label>
                            <Input
                              id="otp"
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="h-12 text-base text-center tracking-widest"
                              maxLength={6}
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={handleVerifyOTP}
                                className="flex-1 h-12"
                                disabled={isLoading}
                              >
                                Verify & Login
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOtpSent(false)}
                                className="h-12"
                              >
                                Resend
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold shadow-xl"
                        disabled={isLoading}
                        data-testid="button-submit"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in...
                          </span>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <span className="text-muted-foreground">Don't have an account?</span>{" "}
                  <Link href="/register">
                    <a className="text-primary hover:underline font-semibold" data-testid="link-register">
                      Sign up
                    </a>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground"
                >
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
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
