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
      <Card className="max-w-4xl mx-auto border-none shadow-lg bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-4 pb-8 border-b">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            {icon}
          </div>
          <CardTitle className="text-3xl font-serif">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 prose prose-slate max-w-none">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" icon={<ShieldCheck className="w-8 h-8" />}>
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">1. Data Collection</h3>
          <p>
            At LX INDIA, we respect your privacy. We collect information necessary to facilitate your store management,
            order processing, and to provide the "10x Sales Boost" our platform promises. This includes vendor details,
            product listings, and customer contact information.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold">2. Brand Visibility and Marketing</h3>
          <p>
            We use collected data to "boost your brand visibility" by showing your products to the right audience at the right time.
            Branding via an established platform like LX INDIA increases brand authenticity and trust among thousands of genuine customers.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold">3. Information Sharing</h3>
          <p>
            We do not sell your personal data. Information is shared only with necessary partners (like shipping providers
            if chosen) to ensure your "brands and products reach the right people."
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}

export function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service" icon={<FileText className="w-8 h-8" />}>
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">1. Lifetime Free Hosting</h3>
          <p>
            "Host your store completely free for lifetime!" Our STARTER PLAN allows you to maintain your presence on LX INDIA
            at no monthly cost. You only pay for "Xtra" features if you choose to upgrade.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold">2. Seller Eligibility</h3>
          <p>
            By registering, you agree to our "100-4-100" promotion if applicable (first 100 sellers get 100 products added for free).
            Sellers must provide accurate product details to maintain brand authenticity.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold">3. Commission and Fees</h3>
          <p>
            In this competitive market, we assure "low commission rates" so you can profit more from sales. "We always charge fairly!"
            Marketing costs are fully covered by LX INDIA under our standard agreement.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}

export function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy" icon={<RefreshCcw className="w-8 h-8" />}>
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">1. 7-Day Hassle-Free Returns</h3>
          <p>
            We offer "total customer support coverage." If a customer is unsatisfied, they can avail our 7-day easy return policy.
            We handle the customers from marketing to fulfillment inquiries.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold">2. Refund Processing</h3>
          <p>
            Refunds are processed back to the original payment method. As we "charge fairly" and maintain "low commission rates,"
            we ensure that both buyers and sellers are treated equitably during the return process.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}

export function ShippingPolicy() {
  return (
    <PolicyLayout title="Shipping Policy" icon={<Truck className="w-8 h-8" />}>
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">1. You Ship, We Manage</h3>
          <p>
            We believe you are the best people to ship your own products. Sellers have the option for "self shipping" via their
            preferred partners. Simply convey the shipping details to us, and we handle the rest of the customer interaction.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold">2. Delivery Expectations</h3>
          <p>
            Sellers are expected to ship orders promptly to maintain the "Brand Visibility" and trust associated with the LX INDIA platform.
            While you manage the physical movement, we "Support" the entire process as it's our job.
          </p>
        </div>
      </section>
    </PolicyLayout>
  );
}
