import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";

// Minimal schema as requested
const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full address is required"),
  pincode: z.string().length(6, "6-digit pincode required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { cartItems, cartItemCount, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      paymentMethod: "upi",
    },
  });

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price ? parseFloat(String(item.product.price)) : 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = cartSubtotal > 1000 ? 0 : 99;
  const total = cartSubtotal + shipping;

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    form.setValue("pincode", value);

    if (value.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await response.json();
        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          form.setValue("city", postOffice.District);
          form.setValue("state", postOffice.State);
        }
      } catch (error) {
        console.error("Failed to fetch city/state", error);
      }
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    // Simulate order placement
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearCart();
    setIsDone(true);
    setIsSubmitting(false);
    window.scrollTo(0, 0);
  };

  if (isDone) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-primary mb-6" />
        <h1 className="text-3xl font-serif font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Thank you for your purchase. We've sent a confirmation email to your registered address.
          Your order will be delivered within 3-5 business days.
        </p>
        <div className="flex gap-4">
          <Link href="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
          <Link href="/dashboard/buyer">
            <Button size="lg" variant="outline">View Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-6" />
        <h2 className="text-2xl font-serif font-semibold mb-4">Your cart is empty</h2>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Progress Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/cart" className="flex items-center text-sm font-medium hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <div className="flex gap-4 text-xs font-medium tracking-widest uppercase text-muted-foreground">
            <span className="text-primary font-bold">Cart</span>
            <span>&gt;</span>
            <span className="text-primary font-bold">Address</span>
            <span>&gt;</span>
            <span className="text-primary font-bold">Payment</span>
            <span>&gt;</span>
            <span>Done</span>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </div>

      <div className="container mx-auto px-6 mt-8">
        <h1 className="text-3xl font-serif font-bold mb-8 text-center md:text-left">Secure Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Delivery Address Section */}
              <section id="address" className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                  <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" {...form.register("fullName")} placeholder="Jane Doe" />
                    {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...form.register("phone")} placeholder="9876543210" />
                    {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Full Address (Street, Building, Flat)</Label>
                    <Input id="address" {...form.register("address")} placeholder="123 Luxury Lane, Apartment 4B" />
                    {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" {...form.register("pincode")} onChange={handlePincodeChange} placeholder="110001" maxLength={6} />
                    {form.formState.errors.pincode && <p className="text-xs text-destructive">{form.formState.errors.pincode.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...form.register("city")} placeholder="New Delhi" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...form.register("state")} placeholder="Delhi" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method Section */}
              <section id="payment" className="space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                  <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Payment Method
                  </h2>
                </div>

                <RadioGroup
                  defaultValue="upi"
                  onValueChange={(val) => form.setValue("paymentMethod", val as any)}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="upi"
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <div>
                        <p className="font-semibold">UPI</p>
                        <p className="text-xs text-muted-foreground">Pay via PhonePe, GPay, etc.</p>
                      </div>
                    </div>
                    <div className="text-primary font-bold text-xs uppercase tracking-widest">Default</div>
                  </Label>

                  <Label
                    htmlFor="card"
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" id="card" />
                      <div>
                        <p className="font-semibold">Credit/Debit Card</p>
                        <p className="text-xs text-muted-foreground">All major cards supported</p>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </Label>

                  <Label
                    htmlFor="netbanking"
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <div>
                        <p className="font-semibold">Net Banking</p>
                        <p className="text-xs text-muted-foreground">Instant payment from any bank</p>
                      </div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="cod"
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <div>
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                      </div>
                    </div>
                  </Label>
                </RadioGroup>

                <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your payment details are protected by 256-bit SSL encryption. We do not store your full card details or CVV.
                  </p>
                </div>
              </section>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-14"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing Order..." : `Place Order • ₹${total.toLocaleString()}`}
              </Button>
            </form>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-12 border-t">
              <div className="text-center space-y-2">
                <ShieldCheck className="w-6 h-6 mx-auto text-primary" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Secure Payments</p>
              </div>
              <div className="text-center space-y-2">
                <RefreshCcw className="w-6 h-6 mx-auto text-primary" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Easy Returns</p>
              </div>
              <div className="text-center space-y-2">
                <Truck className="w-6 h-6 mx-auto text-primary" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Fast Delivery</p>
              </div>
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32 space-y-6">
              <Card className="border-primary/20 bg-primary/[0.02]">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Item List */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 rounded bg-secondary shrink-0 overflow-hidden">
                          {item.product?.images && (
                            <img
                              src={(JSON.parse(item.product.images as string) as any[])[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} | {item.selectedSize}
                          </p>
                          <p className="text-sm font-semibold mt-1">₹{(parseFloat(String(item.product?.price || 0)) * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Shop with Us? */}
              <div className="bg-muted/20 rounded-lg p-6 space-y-4 border border-dashed">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Exclusive Benefits</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Hand-picked premium fabrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Ethically sourced craftsmanship
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Personalized styling support
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
