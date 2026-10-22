import pool from '@/db'; 
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_super_secret_jwt_key_123';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    let shopId = 1; 

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        shopId = decoded.shop_id || 1;
      } catch (err) {
        console.error("JWT Verification error:", err);
      }
    }

    const { parent_code, sub_head_name, opening_balance, meta_data } = await request.json();

    if (!parent_code || !sub_head_name.trim()) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const cleanName = sub_head_name.trim();
    const balance = parseFloat(opening_balance) || 0.00;

    // ==================== 🧠 ডাইনামিক এবং স্কেলেবল রাউটিং লজিক ====================

    // 🔥 ১. স্টক বা ইনভেন্টরি সাব-হেড (যেমন: A02.01) -> products_inventory টেবিলে যাবে
    if (parent_code.startsWith('A02')) {
      const sku = meta_data?.sku || `SKU-${Date.now()}`;
      const unit = meta_data?.unit || 'Pcs';
      
      const [prodRes] = await pool.execute(
        'INSERT INTO products_inventory (shop_id, sku_code, product_name, unit_type, current_stock, selling_price) VALUES (?, ?, ?, ?, ?, 0.00)',
        [shopId, sku, cleanName, unit, balance]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: "Stock Sub-head successfully deployed to Product Inventory Matrix!",
        target_table: 'products_inventory',
        insertId: prodRes.insertId
      });
    }

    // 🔥 ২. কাস্টমার সাব-হেড (Sundry Debtors - যেমন: A03.01) -> parties টেবিলে যাবে
    if (parent_code === 'A03.01') {
      const partyCode = `CUST-${Date.now()}`;
      const [partyRes] = await pool.execute(
        'INSERT INTO parties (shop_id, party_code, name, party_type, opening_balance) VALUES (?, ?, ?, "customer", ?)',
        [shopId, partyCode, cleanName, balance]
      );

      return NextResponse.json({ 
        success: true, 
        message: "Customer Ledger successfully registered in Parties Module!",
        target_table: 'parties',
        insertId: partyRes.insertId
      });
    }

    // 🔥 ৩. সাপ্লায়ার সাব-হেড (Sundry Creditors - যেমন: L01.01) -> parties টেবিলে যাবে
    if (parent_code === 'L01.01') {
      const partyCode = `SUPP-${Date.now()}`;
      const [partyRes] = await pool.execute(
        'INSERT INTO parties (shop_id, party_code, name, party_type, opening_balance) VALUES (?, ?, ?, "supplier", ?)',
        [shopId, partyCode, cleanName, balance]
      );

      return NextResponse.json({ 
        success: true, 
        message: "Supplier Ledger successfully registered in Parties Module!",
        target_table: 'parties',
        insertId: partyRes.insertId
      });
    }

    // 🔥 ৪. বাকি সব জেনেরিক সাব-হেড (Cash, Bank, Expenses, Income) -> sub_ledgers টেবিলে যাবে
    const [subRes] = await pool.execute(
      'INSERT INTO sub_ledgers (shop_id, parent_code, sub_head_name, opening_balance) VALUES (?, ?, ?, ?)',
      [shopId, parent_code, cleanName, balance]
)   ;

    return NextResponse.json({ 
      success: true, 
      message: "Generic Sub-head successfully deployed to Core Sub-Ledger Registry!",
      target_table: 'sub_ledgers',
      insertId: subRes.insertId
    });

  } catch (error) {
    console.error("Sub-ledger deployment structural error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}