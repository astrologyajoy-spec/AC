import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer'; // নিশ্চিত করুন Footer.js ফাইলটি এই ফোল্ডারে আছে

export default function ShopAdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ১. হেডার থাকবে সবার উপরে, ফুল-উইথ জুড়ে */}
      <div className="w-full relative z-50">
        <Header />
      </div>

      {/* ২. নিচের অংশটি ফ্লেক্স হবে যেখানে সাইডবার ও মেইন কন্টেন্ট থাকবে */}
      <div className="flex flex-1 flex-row relative">
        {/* বাম পাশে ফিক্সড সাইডবার */}
        <aside className="w-64 min-h-full flex-shrink-0 bg-[#1a2332] z-40">
          <Sidebar />
        </aside>
        
        {/* ডান পাশে মেইন কন্টেন্ট এরিয়া */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100 min-w-0">
          {children}
        </main>
      </div>

      {/* ৩. নিচে ফুটার */}
      <Footer />
    </div>
  );
}