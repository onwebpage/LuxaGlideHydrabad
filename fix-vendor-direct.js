import pg from 'pg';
const { Client } = pg;

async function fixVendorKYC() {
  const client = new Client({
    connectionString: "postgresql://postgres:kPGznDKNSYIFoCJJChmmwvfOfSrrmecA@caboose.proxy.rlwy.net:35375/railway",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check current status
    const checkResult = await client.query(
      `SELECT id, business_name, kyc_status, is_active FROM vendors WHERE business_name = $1`,
      ['Hamd_codes']
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Vendor "Hamd_codes" not found');
      return;
    }

    console.log('Current status:', checkResult.rows[0]);

    // Update to approved
    const updateResult = await client.query(
      `UPDATE vendors SET kyc_status = 'approved' WHERE business_name = $1 RETURNING id, business_name, kyc_status, is_active`,
      ['Hamd_codes']
    );

    console.log('✅ Updated status:', updateResult.rows[0]);
    console.log('\n✅ SUCCESS! Vendor KYC status is now approved.');
    console.log('👉 Tell the vendor to refresh their dashboard page.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

fixVendorKYC();
