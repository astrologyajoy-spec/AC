'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ১. ট্যাক্স এবং কমপ্লায়েন্স সহ সম্পূর্ণ মাস্টার টেমপ্লেট
const baseTemplates = {
  // ① TRADING / RETAIL BUSINESS
  trading: [
    // --- BALANCE SHEET - LIABILITIES & CAPITAL ---
    { name: 'Owner Capital Account / Share Capital', group: 'Liability', type: 'Direct' },
    { name: 'Owner Drawings Account (ব্যক্তিগত উত্তোলন)', group: 'Liability', type: 'Direct' },
    { name: 'Retained Earnings / General Reserves', group: 'Liability', type: 'Indirect' },
    { name: 'Secured Loans (Bank Loans / NBFC)', group: 'Liability', type: 'Indirect' },
    { name: 'Unsecured Loans (Director/Partners/Family)', group: 'Liability', type: 'Indirect' },
    { name: 'Sundry Creditors (Suppliers Outstanding)', group: 'Liability', type: 'Direct' },
    { name: 'Output CGST Account', group: 'Liability', type: 'Direct' },
    { name: 'Output SGST Account', group: 'Liability', type: 'Direct' },
    { name: 'Output IGST Account', group: 'Liability', type: 'Direct' },
    { name: 'TDS Payable Account', group: 'Liability', type: 'Indirect' },
    { name: 'Provisions for Expenses / Liabilities', group: 'Liability', type: 'Indirect' },
    { name: 'Outstanding Expenses (Rent/Salary Due)', group: 'Liability', type: 'Indirect' },
    { name: 'Advance Received from Customers', group: 'Liability', type: 'Direct' },
    
    // --- BALANCE SHEET - ASSETS ---
    { name: 'Shop / Office Land & Building', group: 'Asset', type: 'Indirect' },
    { name: 'Office Furniture & Fixtures', group: 'Asset', type: 'Indirect' },
    { name: 'Computers & Electronic Equipment', group: 'Asset', type: 'Indirect' },
    { name: 'Accumulated Depreciation (পুঞ্জীভূত অবচয়)', group: 'Asset', type: 'Indirect' },
    { name: 'Closing Stock / Inventory Value', group: 'Asset', type: 'Direct' },
    { name: 'Sundry Debtors (Customers Outstanding)', group: 'Asset', type: 'Direct' },
    { name: 'Prepaid Expenses / Advances Paid to Vendors', group: 'Asset', type: 'Indirect' },
    { name: 'Input CGST Ledger (ITC)', group: 'Asset', type: 'Direct' },
    { name: 'Input SGST Ledger (ITC)', group: 'Asset', type: 'Direct' },
    { name: 'Input IGST Ledger (ITC)', group: 'Asset', type: 'Direct' },
    { name: 'TDS/TCS Receivable Account', group: 'Asset', type: 'Indirect' },
    { name: 'Fixed Deposits & Financial Investments', group: 'Asset', type: 'Indirect' },
    { name: 'Main Bank Account', group: 'Asset', type: 'Direct' },
    { name: 'Cash in Hand', group: 'Asset', type: 'Direct' },
    { name: 'Suspense Account (অমীমাংসিত হিসাব)', group: 'Asset', type: 'Indirect' },

    // --- PROFIT & LOSS - INCOME ---
    { name: 'Sales Account (Main Revenue)', group: 'Income', type: 'Direct' },
    { name: 'Sales Return / Allowances', group: 'Income', type: 'Direct' },
    { name: 'Discount Received (From Suppliers)', group: 'Income', type: 'Indirect' },
    { name: 'Commission & Brokerage Received', group: 'Income', type: 'Indirect' },
    { name: 'Interest / Dividend Income', group: 'Income', type: 'Indirect' },
    
    // --- PROFIT & LOSS - EXPENSES ---
    { name: 'Purchase Account (Goods)', group: 'Expense', type: 'Direct' },
    { name: 'Purchase Return', group: 'Expense', type: 'Direct' },
    { name: 'Carrying Cost / Freight Inward', group: 'Expense', type: 'Direct' },
    { name: 'Loading / Unloading Labor Charges', group: 'Expense', type: 'Direct' },
    { name: 'Custom Duty & Import Taxes', group: 'Expense', type: 'Direct' },
    { name: 'Shop / Office Rent', group: 'Expense', type: 'Indirect' },
    { name: 'Staff Salaries & Bonuses', group: 'Expense', type: 'Indirect' },
    { name: 'Electricity & Utility Bills', group: 'Expense', type: 'Indirect' },
    { name: 'Internet, Mobile & Telephone Bills', group: 'Expense', type: 'Indirect' },
    { name: 'Printing, Stationery & Paperwork', group: 'Expense', type: 'Indirect' },
    { name: 'Marketing & Advertisement Expenses', group: 'Expense', type: 'Indirect' },
    { name: 'Bank Charges & Loan Processing Fees', group: 'Expense', type: 'Indirect' },
    { name: 'Repairs & Maintenance (Shop/Office)', group: 'Expense', type: 'Indirect' },
    { name: 'Bad Debts / Unrecoverable Loss', group: 'Expense', type: 'Indirect' },
    { name: 'Depreciation Expenses (Current Year)', group: 'Expense', type: 'Indirect' },
    { name: 'Round-off / Fraction Adjustments Account', group: 'Expense', type: 'Indirect' }
  ],

  // ② MANUFACTURING BUSINESS
  manufacturing: [
    // --- BALANCE SHEET - LIABILITIES & CAPITAL ---
    { name: 'Partner Capital / Share Capital Account', group: 'Liability', type: 'Direct' },
    { name: 'Partner / Owner Drawings Account', group: 'Liability', type: 'Direct' },
    { name: 'Factory Long-Term Loans / Term Loans', group: 'Liability', type: 'Indirect' },
    { name: 'Working Capital Loan / CC Account', group: 'Liability', type: 'Indirect' },
    { name: 'Sundry Creditors (Raw Material Suppliers)', group: 'Liability', type: 'Direct' },
    { name: 'Output CGST Account', group: 'Liability', type: 'Direct' },
    { name: 'Output SGST Account', group: 'Liability', type: 'Direct' },
    { name: 'Output IGST Account', group: 'Liability', type: 'Direct' },
    { name: 'Wages & Salaries Payable (Accrued)', group: 'Liability', type: 'Indirect' },
    { name: 'TDS/Professional Tax Payable', group: 'Liability', type: 'Direct' },
    { name: 'Outstanding Factory Liabilities (Power/Rent Due)', group: 'Liability', type: 'Indirect' },
    
    // --- BALANCE SHEET - ASSETS ---
    { name: 'Factory Land & Industrial Building', group: 'Asset', type: 'Indirect' },
    { name: 'Plant & Heavy Machinery', group: 'Asset', type: 'Indirect' },
    { name: 'Factory Tools & Equipment', group: 'Asset', type: 'Indirect' },
    { name: 'Commercial Delivery Vehicles', group: 'Asset', type: 'Indirect' },
    { name: 'Accumulated Depreciation (Plant/Machinery)', group: 'Asset', type: 'Indirect' },
    { name: 'Stock of Raw Materials', group: 'Asset', type: 'Direct' },
    { name: 'Stock of Work-in-Progress (WIP)', group: 'Asset', type: 'Direct' },
    { name: 'Stock of Finished Goods', group: 'Asset', type: 'Direct' },
    { name: 'Sundry Debtors (Wholesalers/Distributors)', group: 'Asset', type: 'Direct' },
    { name: 'Security Deposits (Electricity/WBSEDCL)', group: 'Asset', type: 'Indirect' },
    { name: 'Input CGST Ledger (ITC)', group: 'Asset', type: 'Direct' },
    { name: 'Input SGST Ledger (ITC)', group: 'Asset', type: 'Direct' },
    { name: 'Input IGST Ledger (ITC)', group: 'Asset', type: 'Direct' },
    { name: 'Company Bank Accounts', group: 'Asset', type: 'Direct' },
    { name: 'Factory Cash Balance', group: 'Asset', type: 'Direct' },
    { name: 'Suspense Account', group: 'Asset', type: 'Indirect' },

    // --- PROFIT & LOSS / TRADING - INCOME ---
    { name: 'Sales of Finished Goods', group: 'Income', type: 'Direct' },
    { name: 'Sale of Scrap / Wastage Materials', group: 'Income', type: 'Indirect' },
    { name: 'Job Work / Processing Charges Received', group: 'Income', type: 'Direct' },
    
    // --- PROFIT & LOSS / TRADING - EXPENSES ---
    { name: 'Raw Material Purchase Account', group: 'Expense', type: 'Direct' },
    { name: 'Factory Wages & Labor Charges', group: 'Expense', type: 'Direct' },
    { name: 'Factory Power, Fuel & Gas', group: 'Expense', type: 'Direct' },
    { name: 'Factory Rent & Building Insurance', group: 'Expense', type: 'Direct' },
    { name: 'Freight Inward & Carriage Costs', group: 'Expense', type: 'Direct' },
    { name: 'Packaging Material Costs', group: 'Expense', type: 'Direct' },
    { name: 'Consumable Stores & Spares', group: 'Expense', type: 'Direct' },
    { name: 'Office Staff Salaries & Allowances', group: 'Expense', type: 'Indirect' },
    { name: 'Machinery Repairs & Maintenance', group: 'Expense', type: 'Indirect' },
    { name: 'Depreciation on Plant & Machinery', group: 'Expense', type: 'Indirect' },
    { name: 'Depreciation on Office/Administrative Assets', group: 'Expense', type: 'Indirect' },
    { name: 'Legal, Audit & Professional Compliance Fees', group: 'Expense', type: 'Indirect' },
    { name: 'Interest Paid on Bank Loans / Overdrafts', group: 'Expense', type: 'Indirect' },
    { name: 'General Factory Administrative Expenses', group: 'Expense', type: 'Indirect' },
    { name: 'Round-off Adjustments Account', group: 'Expense', type: 'Indirect' }
  ],

  // ③ NON-PROFIT ORGANIZATION
  non_profit: [
    // --- BALANCE SHEET - CAPITAL & LIABILITIES ---
    { name: 'General Corpus Fund / Capital Fund', group: 'Capital/Fund', type: 'Direct' },
    { name: 'Specific Earmarked Project Funds', group: 'Capital/Fund', type: 'Direct' },
    { name: 'Endowment Funds', group: 'Capital/Fund', type: 'Indirect' },
    { name: 'Sundry Creditors / Vendors Outstanding', group: 'Liability', type: 'Direct' },
    { name: 'Provisions for Project Expenditures', group: 'Liability', type: 'Indirect' },
    { name: 'Audit Fees & Administrative Expenses Payable', group: 'Liability', type: 'Indirect' },
    
    // --- BALANCE SHEET - ASSETS ---
    { name: 'NGO Office Land & Trust Property', group: 'Asset', type: 'Indirect' },
    { name: 'Ambulance & Project Vehicles', group: 'Asset', type: 'Indirect' },
    { name: 'Office Furniture & Project Assets', group: 'Asset', type: 'Indirect' },
    { name: 'Books, Journals & Library Assets', group: 'Asset', type: 'Indirect' },
    { name: 'Accumulated Depreciation (NGO Assets)', group: 'Asset', type: 'Indirect' },
    { name: 'Grants Receivable / Recoverable from Govt', group: 'Asset', type: 'Direct' },
    { name: 'Loans & Advances to Staff/Volunteers', group: 'Asset', type: 'Indirect' },
    { name: 'Fixed Deposits (Trust Corpus Investments)', group: 'Asset', type: 'Indirect' },
    { name: 'NGO Savings Bank Accounts (Local)', group: 'Asset', type: 'Direct' },
    { name: 'FCRA Designated Bank Account (Foreign Fund)', group: 'Asset', type: 'Direct' },
    { name: 'Cash in Hand (Petty Expenses)', group: 'Asset', type: 'Direct' },

    // --- INCOME & EXPENDITURE - RECEIPTS ---
    { name: 'Donations Received (General)', group: 'Income', type: 'Direct' },
    { name: 'Specific Donations (Project Based)', group: 'Income', type: 'Direct' },
    { name: 'Members Monthly/Annual Subscription', group: 'Income', type: 'Direct' },
    { name: 'Admission / Enrollment Fees', group: 'Income', type: 'Direct' },
    { name: 'Government Grants & Subsidies', group: 'Income', type: 'Direct' },
    { name: 'Foreign Contributions (FCRA Receipts)', group: 'Income', type: 'Direct' },
    { name: 'Interest Received on Corpus Bank Deposits', group: 'Income', type: 'Indirect' },
    { name: 'Fundraising Event / Stall Collections', group: 'Income', type: 'Indirect' },
    
    // --- INCOME & EXPENDITURE - EXPENDITURES ---
    { name: 'Social Welfare & Field Project Expenses', group: 'Expense', type: 'Direct' },
    { name: 'Relief Camps & Charity Distributions', group: 'Expense', type: 'Direct' },
    { name: 'Scholarships & Public Education Aid', group: 'Expense', type: 'Direct' },
    { name: 'Free Medical Camps & Medicine Costs', group: 'Expense', type: 'Direct' },
    { name: 'Meeting, Seminar & Awareness Campaigns', group: 'Expense', type: 'Indirect' },
    { name: 'Honorarium & Volunteer Allowances', group: 'Expense', type: 'Indirect' },
    { name: 'Office Rent & Electricity Bills', group: 'Expense', type: 'Indirect' },
    { name: 'Staff Salaries (NGO Administration)', group: 'Expense', type: 'Indirect' },
    { name: 'Audit, Trust Renewal & Legal Fees', group: 'Expense', type: 'Indirect' },
    { name: 'Printing, Stationery & Annual Report Design', group: 'Expense', type: 'Indirect' },
    { name: 'Bank Charges & Remittance Fees', group: 'Expense', type: 'Indirect' },
    { name: 'Miscellaneous Administrative Expenses', group: 'Expense', type: 'Indirect' }
  ]
};

function CustomizeLedgerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'trading';
  const shopId = 1; 

  const [ledgers, setLedgers] = useState(() => {
    let t = 'trading';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      t = params.get('type') || 'trading';
    }
    const defaults = baseTemplates[t] || baseTemplates.trading;
    return defaults.map(item => ({ ...item, checked: true }));
  });
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemGroup, setNewItemGroup] = useState('Expense');
  const [newItemType, setNewItemType] = useState('Indirect');
  const [loading, setLoading] = useState(false);

  const toggleCheck = (index) => {
    const updated = [...ledgers];
    updated[index].checked = !updated[index].checked;
    setLedgers(updated);
  };

  const addCustomLedger = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setLedgers([...ledgers, { name: newItemName.trim(), group: newItemGroup, type: newItemType, checked: true }]);
    setNewItemName('');
  };

  const handleSave = async () => {
    const activeLedgers = ledgers.filter(l => l.checked);
    if (activeLedgers.length === 0) {
      alert('You must have at least one active account ledger.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/shop/setup-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, ledger_list: activeLedgers }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Configuration saved completely! Welcome to your custom ledger dashboard.');
        router.push('/shop_admin/dashboard');
      } else {
        alert(`Error saving configurations: ${data.message}`);
      }
    } catch (err) {
      alert('Network transmission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-black text-white mb-2">Configure Ledger Structure</h2>
        <p className="text-xs text-slate-400 mb-6">Uncheck default headings you do not require or insert custom names below.</p>

        {/* নতুন কাস্টম লেজার আইটেম অ্যাড করার ফর্ম */}
        <form onSubmit={addCustomLedger} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Custom Ledger Name</label>
            <input 
              type="text" 
              placeholder="e.g., Internet Bill, Import Customs Duty" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Accounting Group</label>
            <select value={newItemGroup} onChange={(e) => setNewItemGroup(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white">
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg py-2 text-xs font-bold hover:bg-slate-700 transition-all">
              + Add Heading
            </button>
          </div>
        </form>

        {/* ব্যালেন্স শিট ও আয়ের সম্পূর্ণ চেকলিস্ট টেবিল */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {ledgers.map((ledger, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={ledger.checked} 
                  onChange={() => toggleCheck(idx)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <span className={`text-sm ${ledger.checked ? 'text-white' : 'text-slate-500 line-through'}`}>{ledger.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">{ledger.group}</span>
                <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">{ledger.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* বটম নেভিগেশন ও সাবমিট বাটন */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
          <button onClick={() => router.push('/shop_admin/setup-business')} className="text-xs text-slate-400 hover:text-white transition-all">
            ← Change Structure Template
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 rounded-xl font-bold text-xs text-white shadow-md disabled:opacity-50"
          >
            {loading ? 'Saving Layout...' : 'Commit & Generate System Chart →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomizeLedger() {
  return (
    <Suspense fallback={<div className="bg-slate-950 min-h-screen text-slate-100 p-8 flex items-center justify-center">Loading template customization...</div>}>
      <CustomizeLedgerContent />
    </Suspense>
  );
}