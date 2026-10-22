import { NextResponse } from 'next/server';

export async function GET(request) {
  // ১. লগআউটের পর ইউজারকে যে হোম পেজে পাঠাতে চান তার URL তৈরি করা হচ্ছে (যেমন: / বা /shop_admin/login)
  const homeUrl = new URL('/shop_admin/login', request.url); 
  
  // ২. JSON রেসপন্সের বদলে সরাসরি রিডাইরেক্ট রেসপন্স তৈরি করা হলো
  const response = NextResponse.redirect(homeUrl);
  
  // ৩. কুকি ক্লিয়ার বা ডিলিট করা
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  return response;
}