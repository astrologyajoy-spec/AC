// src/app/api/admin/settings/get-main-ledgers/route.js
import pool from '@/db'; 
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_super_secret_jwt_key_123';

export async function GET(request) {
  try {
    // ১. কুকি থেকে লগইন করা ইউজারের shop_id বের করা
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

    // ২. ডাটাবেসের 'account_ledgers' টেবিল থেকে এই শপের এবং জেনারেল সমস্ত মেইন লেজার তুলে আনা
    // নিশ্চিত করা হচ্ছে যেন আপনার তৈরি করা কোনো কাস্টম হেড বাদ না পড়ে
    const [rows] = await pool.execute(
      'SELECT id, ledger_code, ledger_name, ledger_group FROM account_ledgers WHERE shop_id = ? OR shop_id = 1 ORDER BY ledger_code ASC, id DESC',
      [shopId]
    );

    return NextResponse.json({ 
      success: true, 
      data: rows 
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Main Ledgers API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}