import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, FileText, RefreshCcw, Truck } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function PolicyLayout({ title, icon, children }: PolicyLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto border border-[#bf953f]/20 shadow-xl bg-card">
        <CardHeader className="flex flex-row items-center gap-4 pb-8 border-b border-[#bf953f]/10">
          <div className="p-3 bg-[#bf953f]/10 rounded-xl text-[#bf953f]">
            {icon}
          </div>
          <CardTitle className="text-3xl font-serif text-[#4a3700] dark:text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 prose prose-slate max-w-none dark:prose-invert prose-headings:text-[#8a6d1e] prose-p:text-muted-foreground prose-strong:text-[#4a3700] dark:prose-strong:text-foreground">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" icon={<ShieldCheck className="w-8 h-8" />}>
      <section className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4">1. Information We Collect</h3>
          <p className="text-muted-foreground leading-relaxed">
            Queen4Feet collects personal information when you register, place an order, or interact with our platform. This includes your name, email address, phone number, shipping address, and business details for vendors. We also collect technical data such as IP addresses and browsing behavior to improve our services.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">2. How We Use Your Information</h3>
          <p className="text-muted-foreground leading-relaxed">
            Your data is used to process transactions, manage your account, and provide a personalized shopping experience. For vendors, we use business information to verify KYC status and facilitate B2B connections. We also use contact details for essential service updates and marketing communications (with your consent).
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">3. Data Security</h3>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your personal information. This includes SSL encryption for all data transmissions and secure storage protocols. While we strive for absolute security, no method of electronic transmission is 100% secure.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">4. Sharing with Third Parties</h3>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell your personal data. We share information only with trusted third-party service providers (such as shipping partners and payment gateways) necessary to fulfill your orders and maintain our platform's operations.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}

export function TermsOfService() {
  return (
    <PolicyLayout title="Terms and Conditions" icon={<FileText className="w-8 h-8" />}>
      <section className="space-y-8">
        <div className="bg-[#bf953f]/5 p-4 rounded-lg border border-[#bf953f]/20 mb-8">
          <p className="text-sm font-medium italic text-[#8a6d1e]">
            Last Updated: January 2026. By accessing or using the Queen4Feet platform, you agree to be bound by these Terms and Conditions.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">1. Acceptance of Terms</h3>
          <p className="text-muted-foreground leading-relaxed">
            These Terms and Conditions govern your use of the Queen4Feet B2B marketplace. Whether you are a buyer or a verified vendor, your continued use of our services constitutes full acceptance of these terms. If you do not agree with any part of these terms, you must discontinue use immediately.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">2. Account Registration & Security</h3>
          <p className="text-muted-foreground leading-relaxed">
            Users must provide accurate, current, and complete information during the registration process. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Queen4Feet reserves the right to suspend accounts providing false information.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">3. Vendor Obligations & KYC</h3>
          <p className="text-muted-foreground leading-relaxed">
            Vendors must undergo a mandatory KYC (Know Your Customer) verification process. You agree to provide genuine business documentation, including GST details and address proof. Queen4Feet acts as a facilitator; vendors are responsible for product quality, inventory accuracy, and legal compliance of their listings.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">4. B2B Transactions & Pricing</h3>
          <p className="text-muted-foreground leading-relaxed">
            All prices are listed in Indian Rupees (INR) unless specified otherwise. As a wholesale marketplace, bulk pricing tiers and Minimum Order Quantities (MOQ) apply. Queen4Feet reserves the right to correct pricing errors and cancel orders resulting from such inaccuracies.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">5. Intellectual Property</h3>
          <p className="text-muted-foreground leading-relaxed">
            All content on the Queen4Feet platform, including logos, designs, text, and graphics, is the property of Queen4Feet or its content suppliers and is protected by intellectual property laws. Unauthorized use of any materials is strictly prohibited.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">6. Limitation of Liability</h3>
          <p className="text-muted-foreground leading-relaxed">
            Queen4Feet shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform or products purchased through it. Our total liability is limited to the amount paid for the specific transaction in question.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}

export function RefundPolicy() {
  return (
    <PolicyLayout title="Refund & Return Policy" icon={<RefreshCcw className="w-8 h-8" />}>
      <section className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4">1. Return Eligibility</h3>
          <p className="text-muted-foreground leading-relaxed">
            We offer a 2-day hassle-free return policy for most products. To be eligible for a return, the item must be unused, in its original packaging, and in the same condition as received. Specific custom-made or intimate wear items may be excluded from returns for hygiene reasons.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">2. Refund Process</h3>
          <p className="text-muted-foreground leading-relaxed">
            Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed back to the original payment method within 5-7 business days. Shipping costs are generally non-refundable unless the return is due to our error.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">3. Damaged or Incorrect Items</h3>
          <p className="text-muted-foreground leading-relaxed">
            If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with Unboxing vide evidence. We will arrange for a replacement or full refund at no additional cost to you.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}

export function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy" icon={<Truck className="w-8 h-8" />}>
      <section className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4">1. Order Processing Time</h3>
          <p className="text-muted-foreground leading-relaxed">
            All orders are typically processed within 2-4 business days. High-volume periods or custom orders may require additional time. You will receive a notification once your order has been dispatched.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">2. Shipping Methods & Delivery</h3>
          <p className="text-muted-foreground leading-relaxed">
            We partner with reliable logistics providers to ensure safe delivery across India. Estimated delivery times range from 5-10 business days depending on the destination. While vendors may handle physical shipping, Queen4Feet provides tracking support and customer coordination.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">3. Shipping Charges</h3>
          <p className="text-muted-foreground leading-relaxed">
            Shipping charges are calculated based on order weight, volume, and delivery location. These will be clearly displayed during the checkout process before you finalize your purchase.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}
