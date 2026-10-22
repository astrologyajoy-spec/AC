'use client';

export default function PublicHomePage() {
  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-100">
      
      {/* ⚠️ নেভবার বা হেডার এখান থেকে বাদ দেওয়া হয়েছে, কারণ এটি এখন layout.js থেকে আসছে */}

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-20 px-6 md:px-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wide uppercase">
            ⚡ Next-Gen Ledger System
          </span>
          <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight md:leading-none text-white">
            Automate Your Shop <br />
            <span className="bg-gradient-to-r bg-clip-text text-transparent from-blue-400 via-indigo-400 to-purple-400">
              Accounting Instantly
            </span>
          </h2>
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Ditch the old handwritten logs. Track metrics, manage product catalogs, and generate compliance-ready receipts effortlessly.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 text-base">
              Deploy Free Sandbox
            </button>
            <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-base">
              Book Architecture Demo
            </button>
          </div>
        </div>
      </section>

      {/* 3. Core Enterprise Architecture Metrics */}
      <section id="metrics" className="py-12 px-6 md:px-16 border-y border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl md:text-5xl font-black text-white bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">99.99%</h3>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">API Uptime Matrix</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-black text-white bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">&lt; 45ms</h3>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Database Queries</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-black text-white bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">14M+</h3>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Batched Statements</p>
          </div>
          <div>
            <h3 className="text-3xl md:text-5xl font-black text-white bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">$2.4B</h3>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Processed Vol</p>
          </div>
        </div>
      </section>

      {/* 4. Comprehensive Features */}
      <section id="features" className="py-24 px-6 md:px-16 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Engineered for High-Velocity Retail
            </h2>
            <p className="text-slate-400 font-medium text-base md:text-lg">
              Explore the core architectural building blocks engineered to maintain flawless record states across thousands of concurrent operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Box 1 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-bold text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                💳
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Distributed Double-Entry Layer</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every credit mutation maps to a definitive debit entry instantaneously, maintaining strict isolation levels to thwart discrepancies.
              </p>
            </div>

            {/* Feature Box 2 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                📈
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">Unified Tax Compliance Engines</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Compute balance sheets, income statements, and systemic tax audit maps automatically without parsing complex sheets.
              </p>
            </div>

            {/* Feature Box 3 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-2xl mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                📦
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Real-Time Inventory Cubes</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track SKU shifts, multi-location storage data, and receive interactive drop alerts instantly before pipelines halt.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ⚠️ ফুটার এখান থেকে বাদ দেওয়া হয়েছে, কারণ এটি এখন layout.js থেকে আসছে */}

    </div>
  );
}