// src/app/admin/settings/ledger-setup/page.jsx
'use client';

import { useState } from 'react';
import { GLOBAL_ACCOUNTS_TEMPLATE } from '@/constants/globalAccounts';

export default function LedgerSetup() {
  // Company Base Data States
  const [companyName, setCompanyName] = useState('');
  const [financialYear, setFinancialYear] = useState('2026-2027');

  // Unified state to track modifications and hidden status
  const [ledgerSettings, setLedgerSettings] = useState({});

  // Modification handler for names/aliases
  const handleNameChange = (code, value) => {
    setLedgerSettings(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        custom_name: value
      }
    }));
  };

  // Toggle handler for Inactive/Hide status
  const handleHideToggle = (code, isChecked) => {
    setLedgerSettings(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        is_hidden: isChecked
      }
    }));
  };

  // Process and save configurations
  const handleSaveSetup = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert("Please enter a valid Company/Shop Name.");
      return;
    }

    // 🛠️ আপনার আগের ফিল্টারিং লজিক ঠিক রেখে শুধু default_name যুক্ত করা হয়েছে
    const configurationPayload = Object.keys(ledgerSettings)
      .map(code => {
        // GLOBAL_ACCOUNTS_TEMPLATE থেকে এই কোডের অরিজিনাল ডাটা খুঁজে বের করা হচ্ছে
        const originalAccount = GLOBAL_ACCOUNTS_TEMPLATE.find(acc => acc.code === code);
        return {
          code,
          custom_name: ledgerSettings[code]?.custom_name || '',
          default_name: originalAccount?.default_name || '', // ওরিজিনাল নাম ব্যাকএন্ডে পাঠানো হচ্ছে
          is_hidden: ledgerSettings[code]?.is_hidden || false
        };
      })
      .filter(item => item.custom_name.trim() !== '' || item.is_hidden === true);

    const finalSubmissionData = {
      company_name: companyName,
      financial_year: financialYear,
      customizations: configurationPayload
    };

    console.log("Saving Consolidated Configuration Profile:", finalSubmissionData);

    // ==================== 🛠️ ডাটাবেজে ডাটা পাঠানোর নতুন লজিক ====================
    try {
      const response = await fetch('/api/admin/settings/ledger-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalSubmissionData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Company formation profile and chart of accounts updated successfully in Database!");
      } else {
        alert(`Failed to save: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving ledger configurations:", error);
      alert("An error occurred while connecting to the server.");
    }
    // ==============================================================================
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6 border border-gray-100">
      
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">🏢 Chart of Accounts Mapping & Formation</h2>
        <p className="text-sm text-gray-500">
          The underlying accounting codes remain immutable across the platform. You can personalize display aliases, manage active/inactive visibility, and deploy new accounts through custom slots.
        </p>
      </div>

      <form onSubmit={handleSaveSetup}>
        
        {/* Company Meta Setup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-5 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company / Shop Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. S S Enterprise"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium text-sm placeholder-gray-400 shadow-sm"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Financial Year</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium text-sm shadow-sm"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
            >
              <option value="2026-2027">2026 - 2027</option>
              <option value="2027-2028">2027 - 2028</option>
            </select>
          </div>
        </div>

        {/* Ledger Control Center Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-200 tracking-wider">
                <th className="p-3.5 w-24 text-center">Hide Head</th>
                <th className="p-3.5 w-28">Code</th>
                <th className="p-3.5 w-32">Account Type</th>
                <th className="p-3.5">System Blueprint Status</th>
                <th className="p-3.5">Custom Alias / Add New Head</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
              {GLOBAL_ACCOUNTS_TEMPLATE.map((account) => {
                const isHidden = ledgerSettings[account.code]?.is_hidden || false;

                return (
                  <tr 
                    key={account.code} 
                    className={`transition-colors ${isHidden ? 'bg-red-50/50 hover:bg-red-50/70' : 'hover:bg-gray-50/70'}`}
                  >
                    {/* Hide Checkbox Column */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        checked={isHidden}
                        onChange={(e) => handleHideToggle(account.code, e.target.checked)}
                        title="Mark head as Inactive/Hidden"
                      />
                    </td>

                    {/* Code Column */}
                    <td className="p-3.5 font-mono font-bold text-blue-600 tracking-wide">{account.code}</td>

                    {/* Account Type Badges */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase ${
                        account.type === 'Asset' ? 'bg-green-50 text-green-700 border border-green-200' :
                        account.type === 'Liability' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        account.type === 'Equity' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        account.type === 'Income' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {account.type}
                      </span>
                    </td>

                    {/* System Label / Empty Slot Identifier */}
                    <td className="p-3.5 font-medium">
                      {account.is_custom_slot ? (
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded font-semibold italic">
                          ➕ Empty Slot (Ready to Add)
                        </span>
                      ) : (
                        <span className={isHidden ? 'line-through text-gray-400' : 'text-gray-500'}>
                          {account.default_name}
                        </span>
                      )}
                    </td>

                    {/* Input Field for Customization/Adding */}
                    <td className="p-3.5">
                      <input
                        type="text"
                        disabled={isHidden}
                        placeholder={account.is_custom_slot ? "Type here to ADD a new head..." : "Modify default name..."}
                        className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none transition-all ${
                          isHidden ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' :
                          account.is_custom_slot ? 'border-blue-300 bg-blue-50/5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 font-medium' :
                          'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 font-medium'
                        }`}
                        value={ledgerSettings[account.code]?.custom_name || ''}
                        onChange={(e) => handleNameChange(account.code, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Button Area */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-sm transition-colors text-sm tracking-wide"
          >
            Create Company & Deploy Blueprint
          </button>
        </div>

      </form>
    </div>
  );
}