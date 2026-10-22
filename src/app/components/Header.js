'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [currentUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const loggedInUser = JSON.parse(savedUser);
          if (loggedInUser && loggedInUser.full_name) {
            return loggedInUser.full_name;
          }
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
    return 'AJOY';
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMasterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200 shadow-sm relative z-50">
      
      {/* App Logo / Name */}
      <div className="flex items-center space-x-4">
        <Link href="/shop_admin/dashboard" className="text-2xl font-bold text-blue-600 tracking-wide">
          Easy Ledger
        </Link>
      </div>

      {/* Main Navigation links */}
      <div className="flex items-center space-x-6">
        
        <Link href="/shop_admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
          Dashboard
        </Link>
        <Link href="/shop_admin/transactions" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
          Transactions
        </Link>

        {/* ----------------- MASTER MENU DROPDOWN START ----------------- */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsMasterOpen(!isMasterOpen)}
            className="flex items-center space-x-1.5 bg-gray-50 hover:bg-gray-100 text-blue-600 font-semibold px-4 py-2 rounded-lg border border-gray-200 transition-all focus:outline-none"
          >
            <span>⚙️ Master Menu</span>
            <span 
              className="text-xs text-gray-400 transition-transform duration-200"
              style={{ transform: isMasterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              {isMasterOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* Dropdown Menu Items */}
          {isMasterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-200">
              
              <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Business Management
              </div>
              
              <Link 
                href="/admin/settings/ledger-setup" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                🏢 Company Formation
              </Link>
              
              <Link 
                href="/admin/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                ⚙️ Shop Settings
              </Link>

              <Link 
                href="/shop_admin/master/operators" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                👥 Operators & Staff
              </Link>

              <div className="border-t border-gray-100 my-2"></div>
              
              <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Operations Setup
              </div>

              <Link 
                href="/admin/settings/sub-ledger" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                🛠️ Sub-Ledger Setup
              </Link>

              <Link 
                href="/shop_admin/inventory" 
                className="flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50/60 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                ⚙️ Inventory & Guards Master
              </Link>

              <Link 
                href="/shop_admin/master/inventory-setup" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                📦 Product Setup
              </Link>

              <Link 
                href="/shop_admin/master/party-setup" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMasterOpen(false)}
              >
                🤝 Party Setup
              </Link>

            </div>
          )}
        </div>
        {/* ----------------- MASTER MENU DROPDOWN END ----------------- */}

        {/* Right Admin Profile & Logout Section */}
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
          {/* ✅ স্ক্রিনে এখন ডাইনামিক নাম শো করবে */}
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1.5 rounded-md">
            User: {currentUserName}
          </span>
          <Link 
            href="/api/auth/logout" 
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Logout
          </Link>
        </div>

      </div>
    </header>
  );
}