import pool from '../../../../db'; 
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // 👈 JWT Token decode করার জন্য যুক্ত করা হলো

const JWT_SECRET = 'your_super_secret_jwt_key_123'; // আপনার আসল সিক্রেট কি (Secret Key)

// ==================== NEW CODE: FETCH PROFILE DATA (GET) ====================\
export async function GET(request) {
  try {
    // ডাইনামিক আইডি হ্যান্ডেল করার লজিক:
    // ১. ইউআরএল প্যারামিটার থেকে চেক করা (যেমন: /api/shop/profile?shop_id=2)
    const { searchParams } = new URL(request.url);
    let shopId = searchParams.get('shop_id');

    // ২. যদি ইউআরএল-এ না থাকে, তবে কুকি (Cookie) টোকেন থেকে আইডি নেওয়া হবে
    if (!shopId) {
      const token = request.cookies.get('token')?.value;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          shopId = decoded.shop_id; // 👑 লগইন করা ইউজারের আসল শপ আইডি সেট হলো
        } catch (jwtError) {
          console.error("JWT Verification Error inside profile API:", jwtError);
        }
      }
    }

    // ৩. যদি কোনোভাবে টোকেন বা ইউআরএল কোথাও আইডি না পাওয়া যায়, তবেই কেবল ১ ধরবে (Fallback)
    if (!shopId) {
      shopId = 1; 
    }

    // ডাইনামিক কুয়েরি চালানো হচ্ছে (id = ? এর জায়গায় ডাইনামিক shopId পাস হচ্ছে)
    const [rows] = await pool.execute('SELECT * FROM shops WHERE id = ?', [shopId]);
    
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Shop profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Database GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ==================== AGER CODE: UPDATE PROFILE DATA (PUT) ====================\
export async function PUT(request) {
  try {
    const formData = await request.json();
    // এখানে অলরেডি ডাইনামিক আইডি নেওয়া আছে
    const shopId = formData.id || 1; 

    // shops-er 31ti column er ager exact sequence
    const query = `
      UPDATE shops 
      SET 
        shop_name = ?, legal_name = ?, owner_name = ?, gstin = ?, pan = ?, 
        trade_license = ?, udyam_msme = ?, fssai_no = ?, cin = ?, iec_code = ?, 
        phone = ?, alt_phone = ?, email = ?, website = ?, address = ?, 
        dispatch_address = ?, state = ?, state_code = ?, pincode = ?, 
        account_holder_name = ?, bank_name = ?, branch_name = ?, account_no = ?, 
        ifsc_code = ?, micr_code = ?, upi_id = ?, logo_url = ?, signature_url = ?, 
        invoice_prefix = ?, invoice_terms = ?
      WHERE id = ?
    `;

    const values = [
      formData.shop_name || 'Sarkar Enterprise',
      formData.legal_name || null,
      formData.owner_name || null,
      formData.gstin || null,
      formData.pan || null,
      formData.trade_license || null,
      formData.udyam_msme || null,
      formData.fssai_no || null,
      formData.cin || null,
      formData.iec_code || null,
      formData.phone || null,
      formData.alt_phone || null,
      formData.email || null,
      formData.website || null,
      formData.address || null,
      formData.dispatch_address || null,
      formData.state || 'West Bengal',
      formData.state_code || 19,
      formData.pincode || null,
      formData.account_holder_name || null,
      formData.bank_name || null,
      formData.branch_name || null,
      formData.account_no || null,
      formData.ifsc_code || null,
      formData.micr_code || null,
      formData.upi_id || null,
      formData.logo_url || null,
      formData.signature_url || null,
      formData.invoice_prefix || null,
      formData.invoice_terms || null,
      shopId
    ];

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "No shop profile updated" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile Updated Successfully!" });
  } catch (error) {
    console.error("Database PUT Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}