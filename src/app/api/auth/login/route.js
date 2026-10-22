import { NextResponse } from 'next/server';
import pool from '@/db'; 
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'your_super_secret_jwt_key_123'; 

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Table theke user check kora holo
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid Username or Password' }, { status: 401 });
    }

    const user = rows[0];

    // Bcryptjs diye hash password compare kora holo
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid Username or Password' }, { status: 401 });
    }

    // ✅ পরিবর্তন ১: JWT Token-এর ভেতরে ডাটাবেস থেকে আসা আসল shop_id ঢুকানো হলো
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        shop_id: user.shop_id // 👈 এটি ডাইনামিক সেশন ট্র্যাকিং নিশ্চিত করবে
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // SQL Table onushare exact column data pathano hocche
    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: { 
        id: user.id, 
        username: user.username, 
        full_name: user.full_name, 
        role: user.role,
        shop_id: user.shop_id // 👈 পরিবর্তন ২: রেসপন্সেও পাঠানো হলো যাতে ফ্রন্টএন্ড রিড করতে পারে
      }
    }, { status: 200 });

    // Cookies set kora holo
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}