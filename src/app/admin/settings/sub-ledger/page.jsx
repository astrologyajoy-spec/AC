// src/app/admin/settings/sub-ledger/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { SUB_LEDGER_MAPPING } from '@/constants/subLedgerMapper';

export default function SubLedgerSetup() {
  // ফর্ম স্টেটসমূহ
  const [selectedMainCode, setSelectedMainCode] = useState('');
  const [subHeadName, setSubHeadName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [customAttributes, setCustomAttributes] = useState({}); 

  // 👑 ডাটাবেস থেকে ডাইনামিক মেইন লেজার লোড করার স্টেট
  const [mainLedgers, setMainLedgers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // লোকাল সেভ ট্র্যাকিং (ভিউ টেবিলের জন্য)
  const [createdSubHeads, setCreatedSubHeads] = useState([]);

  // ==================== 🔄 ডাটাবেস থেকে ডাইনামিকালি লেজার রিড করা ====================\
  useEffect(() => {
    async function loadMainLedgers() {
      try {
        const response = await fetch('/api/admin/settings/get-main-ledgers');
        const result = await response.json();
        
        if (result.success && result.data) {
          setMainLedgers(result.data);
        } else {
          console.error("Failed to load ledgers from DB:", result.message);
        }
      } catch (error) {
        console.error("Error fetching main ledgers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMainLedgers();
  }, []);

  // সিলেক্টেড মেইন কোডের ম্যাপিং ডিটেইলস জানা
  const currentMappingDetails = SUB_LEDGER_MAPPING[selectedMainCode];

  // সাব-হেড সাবমিট ও সেভ করার হ্যান্ডলার
  const handleCreateSubHead = async (e) => {
    e.preventDefault();

    if (!selectedMainCode || !subHeadName.trim()) {
      alert("Please select a Main Head and enter a valid Sub-Head name.");
      return;
    }

    const targetDetails = SUB_LEDGER_MAPPING[selectedMainCode];
    const originalParent = mainLedgers.find(l => l.ledger_code === selectedMainCode);

    // ⚡ ডাটাবেস অপ্টিমাইজড পেলোড প্রিপারেশন
    const payload = {
      parent_code: selectedMainCode,
      sub_head_name: subHeadName,
      opening_balance: openingBalance,
      meta_data: {
        sku: customAttributes.sku || '',
        unit: customAttributes.unit || 'Pcs'
      }
    };

    // ==================== 🛠️ ডাটাবেজে সাব-হেড সেভ করার রিয়েল কানেকশন ====================
    try {
      const response = await fetch('/api/admin/settings/sub-ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // আপনার অরিজিনাল ভিউ টেবিলের লোকাল এন্ট্রি লজিক
        const newSubHeadRecord = {
          id: result.insertId || Date.now(),
          parent_code: selectedMainCode,
          parent_name: originalParent ? originalParent.ledger_name : 'Standard Blueprint',
          account_type: originalParent ? originalParent.ledger_group : targetDetails?.type,
          sub_head_name: subHeadName,
          opening_balance: parseFloat(openingBalance) || 0,
          target_table: result.target_table
        };

        setCreatedSubHeads(prev => [newSubHeadRecord, ...prev]);
        
        // ফর্ম ক্লিয়ার্যান্স লজিক (যা আপনার ফাইলে আগে থেকেই ছিল)
        setSubHeadName('');
        setOpeningBalance('0');
        setCustomAttributes({});
        
        alert(result.message || "Sub-Head successfully deployed to Database!");
      } else {
        alert(`Deployment Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Failed to connect with ledger control center:", error);
      alert("Network or database connection loss detected.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6 border border-gray-100">
      
      {/* Header Panel */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">🌿 Auxiliary Sub-Ledger Deployment Engine</h2>
        <p className="text-sm text-gray-500">
          Attach multi-tenant auxiliary sub-heads to active parent chart-of-accounts. The core accounting engine intelligently routes records to specialized matrices (Parties, Registers, or Inventory).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Creation Form Panel */}
        <div className="bg-gray-50/60 p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 border-b pb-2 border-gray-200">
            Create Auxiliary Node
          </h3>

          <form onSubmit={handleCreateSubHead} className="space-y-4">
            
            {/* Dropdown Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">1. Select Parent Main Head *</label>
              <select
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-900 font-semibold shadow-sm"
                value={selectedMainCode}
                onChange={(e) => {
                  setSelectedMainCode(e.target.value);
                  setCustomAttributes({}); // মেইন হেড বদলালে কাস্টম কলাম রিসেট হবে
                }}
              >
                <option value="">{isLoading ? 'Loading Core Ledgers...' : '-- Select Account Ledger --'}</option>
                {mainLedgers.map((ledger) => (
                  <option key={ledger.id} value={ledger.ledger_code}>
                    {ledger.ledger_code} - {ledger.ledger_name} ({ledger.ledger_group})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Routing Alert (If main head is selected) */}
            {currentMappingDetails && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 space-y-1">
                <div className="font-bold flex justify-between">
                  <span>Routing Matrix Location:</span>
                  <span className="font-mono underline">db.{currentMappingDetails.target_table}</span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  System tracks this group under <span className="font-bold">{currentMappingDetails.type}</span> hierarchy. 
                  All balances auto-consolidate upstream during financial report extraction.
                </p>
              </div>
            )}

            {/* Sub-Head TextInput Label */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">2. Sub-Head Name / Register Alias *</label>
              <input
                type="text"
                required
                disabled={!selectedMainCode}
                placeholder={selectedMainCode ? `e.g. ${currentMappingDetails?.placeholder_eg}` : "Select main head first"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={subHeadName}
                onChange={(e) => setSubHeadName(e.target.value)}
              />
            </div>

            {/* Opening Fiscal Balance */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">3. Initial Fiscal Balance (Opening)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs font-bold">₹</span>
                </div>
                <input
                  type="number"
                  disabled={!selectedMainCode}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-900 font-mono font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
              </div>
            </div>

            {/* 💎 100% সুরক্ষিত ডাইনামিক কাস্টম অ্যাট্রিবিউটস স্লট (Inventory, Customers) */}
            {selectedMainCode && currentMappingDetails?.extended_attributes?.map((attr) => (
              <div key={attr.key}>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {attr.label} {attr.required && '*'}
                </label>
                {attr.type === 'select' ? (
                  <select
                    required={attr.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-900 font-medium shadow-sm"
                    value={customAttributes[attr.key] || ''}
                    onChange={(e) => setCustomAttributes(prev => ({ ...prev, [attr.key]: e.target.value }))}
                  >
                    <option value="">-- Choose Option --</option>
                    {attr.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={attr.type}
                    required={attr.required}
                    placeholder={`Enter ${attr.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400 shadow-sm"
                    value={customAttributes[attr.key] || ''}
                    onChange={(e) => setCustomAttributes(prev => ({ ...prev, [attr.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            {/* Action Deployment Button */}
            <button
              type="submit"
              disabled={!selectedMainCode}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm disabled:cursor-not-allowed"
            >
              Deploy Sub-Ledger Node
            </button>
          </form>
        </div>

        {/* Right Side: Interactive View Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Deployment Audit Registry
            </h3>
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 border rounded-full text-xs font-bold">
              Session Live Sub-heads: {createdSubHeads.length}
            </span>
          </div>

          {createdSubHeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30 text-center">
              <span className="text-3xl mb-2">🌿</span>
              <h4 className="text-sm font-bold text-gray-700 mb-1">No Auxiliary Records Generated</h4>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Sub-heads built during the active runtime instance will be indexed sequentially here in the registry.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase border-b border-gray-200 tracking-wider">
                    <th className="p-3 w-24">Parent Code</th>
                    <th className="p-3">Parent Name Group</th>
                    <th className="p-3">Sub-head Register Label</th>
                    <th className="p-3 text-right">Op. Balance</th>
                    <th className="p-3 text-center">Target Table</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-100 font-medium">
                  {createdSubHeads.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600">{sub.parent_code || 'N/A'}</td>
                      <td className="p-3">
                        <span className="font-medium text-gray-700">{sub.parent_name}</span>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">{sub.account_type}</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-900 bg-blue-50/10">
                        {sub.sub_head_name}
                      </td>
                      <td className="p-3 text-right font-mono font-medium text-gray-800">
                        {sub.opening_balance.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200">
                          db.{sub.target_table}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}