import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function VendorPrivacy() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <Link href="/vendor-register">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Registration
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-serif">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
              <p className="mb-3">When you register as a vendor on mahanaari, we collect the following information:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Personal information (name, email, phone number)</li>
                <li>Business information (business name, GST number, tax IDs)</li>
                <li>Bank account details for payment processing</li>
                <li>Product information and inventory data</li>
                <li>Transaction and order history</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Process and manage your vendor account</li>
                <li>Facilitate transactions and payments</li>
                <li>Communicate with you about orders, updates, and platform changes</li>
                <li>Ensure compliance with legal and regulatory requirements</li>
                <li>Improve our platform and services</li>
                <li>Prevent fraud and maintain platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal and business information. Your data is encrypted during transmission and stored securely on our servers. We regularly update our security protocols to ensure the highest level of protection.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Information Sharing</h2>
              <p className="mb-3">We may share your information with:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Customers who purchase your products (limited to necessary shipping and contact information)</li>
                <li>Payment processors for transaction handling</li>
                <li>Legal authorities when required by law</li>
                <li>Service providers who assist in platform operations (under strict confidentiality agreements)</li>
              </ul>
              <p className="mt-3">We will never sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-3">As a vendor, you have the right to:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
              <p>We retain your information for as long as your vendor account is active. After account closure, we may retain certain information for legal, tax, and audit purposes as required by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your experience on our platform, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Changes to Privacy Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any significant changes via email or through the vendor dashboard. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p>If you have any questions or concerns about this privacy policy or how we handle your data, please contact us at:</p>
              <p className="mt-2">Email: privacy@mahanaari.com</p>
              <p>Phone: +91-94926 34166</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
