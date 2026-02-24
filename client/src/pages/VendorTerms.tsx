import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function VendorTerms() {
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
            <CardTitle className="text-3xl font-serif">Terms of Service (Vendor Agreement)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-4">Legal & Identity Declarations</h2>
              <ul className="space-y-3 list-disc pl-6">
                <li>I declare that I am the legally authorized representative of this business entity and have the authority to enter into this agreement.</li>
                <li>I certify that all business registration documents, including Tax IDs (GST/VAT/EIN), provided during signup are valid and authentic.</li>
                <li>I confirm that the bank account details provided belong to the registered business entity or the authorized proprietor.</li>
                <li>I agree to notify the marketplace immediately of any changes to my business status, ownership, or tax registration.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Product Authenticity & Intellectual Property Rights</h2>
              <ul className="space-y-3 list-disc pl-6">
                <li>I declare that all products listed by me are 100% authentic and do not infringe any third-party trademarks, copyrights, or design patents.</li>
                <li>I certify that I am either the brand owner or possess a valid Letter of Authorization or No Objection Certificate (NOC) to sell branded goods.</li>
                <li>I confirm that all product images, videos, and descriptions uploaded are my own or legally licensed for commercial use.</li>
                <li>I accept full legal and financial responsibility for any counterfeit or intellectual property infringement claims.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Fabric & Quality Standards</h2>
              <ul className="space-y-3 list-disc pl-6">
                <li>I declare that all fabric composition details and care instructions are accurate and truthful.</li>
                <li>I agree to maintain height-specific inventory as per platform business and USP requirements.</li>
                <li>I acknowledge responsibility for product listing, management, and liability similar to other Indian marketplaces.</li>
                <li>I certify that apparel meets all regional safety standards, including non-toxic dyes and flammability compliance.</li>
                <li>For children's apparel, I confirm compliance with safety standards regarding buttons, drawstrings, and choking hazards.</li>
                <li>Any mismatch between advertised material and delivered product will be my sole responsibility.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Ethical Sourcing & Labor</h2>
              <ul className="space-y-3 list-disc pl-6">
                <li>I declare that no child labor, forced labor, or human trafficking is involved in manufacturing or sourcing.</li>
                <li>I certify that suppliers comply with local labor laws, fair wages, and safe working conditions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Operational & Shipping Commitments</h2>
              <ul className="space-y-3 list-disc pl-6">
                <li>I agree to maintain real-time inventory accuracy and understand that high cancellation rates may lead to account suspension.</li>
                <li>I commit to dispatch orders within the platform's Service Level Agreement (SLA).</li>
                <li>I will pack items according to platform packaging guidelines.</li>
                <li>I agree to follow the Return & Refund policy and accept returns for defective or misrepresented items.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Prohibited Activities</h2>
              <ul className="space-y-3 list-disc pl-6">
                <li>I will not sell used or second-hand clothing unless authorized under a "Pre-loved" category.</li>
                <li>I will not insert marketing materials or personal contact details inside packages.</li>
                <li>I agree not to manipulate reviews or perform self-purchases to boost ratings.</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
