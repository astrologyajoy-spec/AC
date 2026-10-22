'use client';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ১. কার্ড সেকশন (টাকার হিসাবের কার্ডগুলো) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">Total Balance</p>
          <h3 className="text-3xl font-bold text-white mt-2">৳ 1,25,000</h3>
        </div>
        
        {/* Monthly Income */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">Monthly Income</p>
          <h3 className="text-3xl font-bold text-emerald-500 mt-2">+ ৳ 45,000</h3>
        </div>
        
        {/* Monthly Expense */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-400">Monthly Expense</p>
          <h3 className="text-3xl font-bold text-red-500 mt-2">- ৳ 20,000</h3>
        </div>
      </div>

      {/* ২. সাম্প্রতিক লেনদেন টেবিল */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h4 className="text-lg font-bold text-white mb-4">সাম্প্রতিক লেনদেন</h4>
        <p className="text-sm text-slate-400">কোনো সাম্প্রতিক লেনদেন পাওয়া যায়নি।</p>
      </div>
    </div>
  );
}