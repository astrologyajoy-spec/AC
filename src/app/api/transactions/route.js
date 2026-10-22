import pool from '../../../db.js';
import { NextResponse } from 'next/server';

// ১. ডাটাবেজ থেকে সব লেনদেনের তথ্য তুলে আনার জন্য (GET Request)
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM transactions ORDER BY date DESC, id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ২. নতুন লেনদেনের তথ্য ডাটাবেজে সেভ করার জন্য (POST Request)
export async function POST(request) {
  try {
    const { date, description, type, amount } = await request.json();
    if (!date || !description || !type || !amount) {
      return NextResponse.json({ error: 'সবগুলো ঘর সঠিকভাবে পূরণ করুন।' }, { status: 400 });
    }
    const [result] = await pool.query(
      'INSERT INTO transactions (date, description, type, amount) VALUES (?, ?, ?, ?)',
      [date, description, type, amount]
    );
    return NextResponse.json({ message: 'লেনদেনটি সফলভাবে সেভ হয়েছে।', id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}