'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupBusiness() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const router = useRouter();

  const handleNextStep = () => {
    if (!selectedTemplate) {
      alert('Please select a business type to proceed!');
      return;
    }
    // কাস্টমাইজেশন সাব-রাউটে পাঠানো হচ্ছে কোয়েরি প্যারামিটার সহ
    router.push(`/shop_admin/setup-business/customize?type=${selectedTemplate}`);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-black text-white mb-2">Choose Your Business Structure</h2>
      <p className="text-sm text-slate-400 mb-10 text-center">
        Select a template structure. You will be able to add, remove, or customize individual accounting ledgers on the next page.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Trading Card */}
        <div 
          onClick={() => setSelectedTemplate('trading')}
          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
            selectedTemplate === 'trading' ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <div className="text-3xl mb-4">🛒</div>
          <h3 className="font-bold text-white text-xl">Trading / Retail</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">For wholesale and retail merchants buying and selling finished goods directly.</p>
        </div>

        {/* Manufacturing Card */}
        <div 
          onClick={() => setSelectedTemplate('manufacturing')}
          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
            selectedTemplate === 'manufacturing' ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <div className="text-3xl mb-4">🏭</div>
          <h3 className="font-bold text-white text-xl">Manufacturing</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">For production setups processing raw materials into specialized final merchandise.</p>
        </div>

        {/* Non-Profit Card */}
        <div 
          onClick={() => setSelectedTemplate('non_profit')}
          className={`p-6 rounded-2xl border cursor-pointer transition-all ${
            selectedTemplate === 'non_profit' ? 'border-teal-500 bg-teal-950/20 shadow-lg shadow-teal-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <div className="text-3xl mb-4">🤝</div>
          <h3 className="font-bold text-white text-xl">Non-Profit Org</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">For associations, service entities, and social tracking clubs using funds and grants.</p>
        </div>
      </div>

      <button 
        onClick={handleNextStep}
        className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-4 rounded-xl font-bold text-sm text-white shadow-lg shadow-emerald-600/20 hover:opacity-90 active:scale-95 transition-all"
      >
        Customize Ledger Headings →
      </button>
    </div>
  );
}