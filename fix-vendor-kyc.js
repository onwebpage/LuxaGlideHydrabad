import { db } from "./server/db";
import { vendors } from "./shared/schema";
import { eq } from "drizzle-orm";

async function fixVendorKYC() {
  try {
    // Find vendor with business name "Hamd_codes"
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.businessName, "Hamd_codes")
    });

    if (!vendor) {
      console.log("Vendor 'Hamd_codes' not found");
      return;
    }

    console.log("Current vendor status:", {
      id: vendor.id,
      businessName: vendor.businessName,
      kycStatus: vendor.kycStatus,
      isActive: vendor.isActive
    });

    // Update to approved
    await db.update(vendors)
      .set({ kycStatus: "approved" })
      .where(eq(vendors.id, vendor.id));

    console.log("✅ Vendor KYC status updated to 'approved'");

    // Verify the update
    const updatedVendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, vendor.id)
    });

    console.log("Updated vendor status:", {
      id: updatedVendor.id,
      businessName: updatedVendor.businessName,
      kycStatus: updatedVendor.kycStatus,
      isActive: updatedVendor.isActive
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

fixVendorKYC();
