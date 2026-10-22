// src/app/api/admin/parties/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easy_ledger_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// কাস্টমার বা পার্টি লিস্ট ডাটাবেজ থেকে নিয়ে আসার GET মেথড
export async function GET() {
  try {
    // আপনার ডাটাবেজের টেবিলের নাম অনুযায়ী কুয়েরি (party_ledgers বা কাস্টমার টেবিল)
    // এখানে আমরা party_ledgers থেকে ডেটা তুলছি
    const [rows] = await pool.query('SELECT id, ledger_name AS name, phone, party_code FROM party_ledgers ORDER BY id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    // টেবিল না থাকলে বা কোনো এরর হলে ফাঁকা অ্যারে রিটার্ন করবে যাতে ফ্রন্টএন্ড ক্র্যাশ না করে
    return NextResponse.json({ success: true, data: [], message: error.message });
  }
}