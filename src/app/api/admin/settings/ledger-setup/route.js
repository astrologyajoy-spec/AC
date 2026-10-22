// src/app/api/admin/settings/ledger-setup/route.js
import pool from '@/db'; 
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_super_secret_jwt_key_123';

export async function POST(request) {
  try {
    // ১. কুকি থেকে লগইন করা ইউজারের shop_id নেওয়া
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

    // ২. ফ্রন্টএন্ড থেকে আসা ডাটা রিসিভ করা
    const { company_name, customizations } = await request.json();

    if (!company_name) {
      return NextResponse.json({ success: false, message: "Company name is required" }, { status: 400 });
    }

    // ৩. শপের নাম আপডেট করা
    await pool.execute(
      'UPDATE shops SET shop_name = ? WHERE id = ?',
      [company_name, shopId]
    );

    // ৪. কাস্টমাইজড এবং ডিফল্ট লেজারগুলো ডাটাবেসে এন্ট্রি করা
    if (customizations && customizations.length > 0) {
      for (const item of customizations) {
        const currentCode = item.code.toString().toUpperCase();
        
        // 🛠️ আপনার ডাটাবেস কোড (A01.01, L01.01) এর ওপর ভিত্তি করে নিখুঁত গ্রুপ সিলেকশন
        let ledgerGroup = 'Expense';
        if (currentCode.startsWith('A')) ledgerGroup = 'Asset';
        else if (currentCode.startsWith('L')) ledgerGroup = 'Liability';
        else if (currentCode.startsWith('Q')) ledgerGroup = 'Capital/Fund';
        else if (currentCode.startsWith('I')) ledgerGroup = 'Income';
        else if (currentCode.startsWith('E')) ledgerGroup = 'Expense';

        // ইউজার নাম দিলে সেটা ঢুকবে, অন্যথায় ওরিজিনাল ডিফল্ট নামটা ঢুকবে
        const finalLedgerName = item.custom_name.trim() !== '' ? item.custom_name.trim() : item.default_name;

        try {
          // চেক করা হচ্ছে লেজার কোড ও শপ আইডি অলরেডি আছে কিনা
          const [existing] = await pool.execute(
            'SELECT id FROM account_ledgers WHERE ledger_code = ? AND shop_id = ?', 
            [currentCode, shopId]
          );

          if (existing.length > 0) {
            // যদি থাকে তবে নাম ও গ্রুপ আপডেট করা হচ্ছে
            await pool.execute(
              'UPDATE account_ledgers SET ledger_name = ?, ledger_group = ? WHERE id = ?',
              [finalLedgerName, ledgerGroup, existing[0].id]
            );
          } else {
            // না থাকলে নতুন এন্ট্রি ইনসার্ট হচ্ছে
            await pool.execute(
              'INSERT INTO account_ledgers (shop_id, ledger_code, ledger_name, ledger_group, ledger_type, balance) VALUES (?, ?, ?, ?, "Indirect", 0.00)',
              [shopId, currentCode, finalLedgerName, ledgerGroup]
            );
          }
        } catch (dbErr) {
          console.warn("Fallback query executing due to schema mismatch:", dbErr.message);
          
          // ব্যাকআপ কোয়েরি: যদি কোনো কারণে ledger_code কাজ না করে তবে নামের ওপর ম্যাচ করে গ্রুপ আপডেট করবে
          const [existingOld] = await pool.execute(
            'SELECT id FROM account_ledgers WHERE ledger_name = ? AND shop_id = ?', 
            [finalLedgerName, shopId]
          );

          if (existingOld.length > 0) {
            await pool.execute(
              'UPDATE account_ledgers SET ledger_group = ? WHERE id = ?',
              [ledgerGroup, existingOld[0].id]
            );
          } else {
            await pool.execute(
              'INSERT INTO account_ledgers (shop_id, ledger_name, ledger_group, ledger_type, balance) VALUES (?, ?, ?, "Indirect", 0.00)',
              [shopId, finalLedgerName, ledgerGroup]
            );
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Ledger blueprint deployed successfully with all items intact!" 
    }, { status: 200 });

  } catch (error) {
    console.error("Ledger Setup Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}