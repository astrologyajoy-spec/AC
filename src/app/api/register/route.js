import { NextResponse } from "next/server";
import db from "@/db"; // আপনার ডাটাবেজ কানেকশন ফাইল
import bcrypt from "bcryptjs"; // পাসওয়ার্ড হ্যাশ করার জন্য (ইনস্টল না থাকলে npm i bcryptjs করে নেবেন)

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    const { shop_name, mobile, email, full_name, username, password } = body;

    // ১. ডাটাবেজ পুল থেকে একটি কানেকশন নিন এবং ট্রানজেকশন শুরু করুন
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ২. প্রথমে 'shops' টেবিলে দোকান ক্রিয়েট করুন
    const [shopResult] = await connection.execute(
      "INSERT INTO `shops` (shop_name, mobile, email) VALUES (?, ?, ?)",
      [shop_name, mobile, email]
    );
    
    const newShopId = shopResult.insertId; // নতুন তৈরি হওয়া শপের আইডি

    // ৩. পাসওয়ার্ডটি সিকিউরলি হ্যাশ (Encrypt) করুন
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ৪. এবার 'users' টেবিলে এই শপের ওনারকে 'shop_admin' রোল দিয়ে সেভ করুন
    // (পুরনো 'shop_admins' টেবিলের বদলে এখন সরাসরি 'users' টেবিলে যাবে)
    await connection.execute(
      "INSERT INTO `users` (shop_id, full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [newShopId, full_name, username, email, hashedPassword, "shop_admin"]
    );

    // ৫. দুটি ইনসার্টই সফল হলে ডাটাবেজে পার্মানেন্টলি সেভ (Commit) করুন
    await connection.commit();
    connection.release();

    return NextResponse.json({ success: true, message: "দোকান এবং অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" }, { status: 201 });

  } catch (error) {
    // কোনো একটি স্টেপে এরর আসলে ডাটা রোলব্যাক হবে (ডাটাবেজে কোনো আবর্জনা জমা হবে name)
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}