import { NextResponse } from 'next/server';
import pool from '@/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_super_secret_jwt_key_123';

export async function POST(request) {
  try {
    // ১. কুকি থেকে লগইন থাকা শp অ্যাডমিনের টোকেন চেক করা
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized! Please login first.' }, { status: 401 });
    }

    // ২. টোকেন ডিকোড করে শপ অ্যাডমিনের আইডি বের করা
    const decoded = jwt.verify(token, JWT_SECRET);
    const shopAdminId = decoded.id; // লগইন থাকা অ্যাডমিনের ID

    // ৩. ফ্রন্টএন্ড ফর্ম থেকে অপারেটরের ডেটা নেওয়া
    const { operatorName, mobile, username, password } = await request.json();

    if (!operatorName || !mobile || !username || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // ৪. অপারেটরের ইউজারনেম অলরেডি আছে কিনা চেক করা
    const [existingOperator] = await pool.query(
      'SELECT * FROM operators WHERE username = ?',
      [username]
    );

    if (existingOperator.length > 0) {
      return NextResponse.json({ message: 'Operator username already exists!' }, { status: 400 });
    }

    // ৫. ডেটাবেসে লগইন থাকা অ্যাডমিনের IDs সহ অপারেটর ইনসার্ট করা
    await pool.query(
      'INSERT INTO operators (shop_admin_id, operator_name, mobile, username, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [shopAdminId, operatorName, mobile, username, password, 'operator']
    );

    return NextResponse.json({ success: true, message: 'Operator created successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Operator Creation Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}