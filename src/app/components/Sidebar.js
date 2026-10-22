'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isBooksOpen, setIsBooksOpen] = useState(false);   // 📖 Books & Registers ড্রপডাউন স্টেট
  const [isReportsOpen, setIsReportsOpen] = useState(false); // 📈 Reports ড্রপডাউন স্টেট
  
  // ইউজারের রোল স্টেট
  const [userRole, setUserRole] = useState('operator');

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে রোল তুলে আনা (ডিফল্ট অপারেটর)
    const savedRole = localStorage.getItem('user_role') || 'operator';
    setUserRole(savedRole);
  }, []);

  const sidebarStyle = {
    width: '260px', backgroundColor: '#1a2332', height: '100vh',
    color: '#ffffff', display: 'flex', flexDirection: 'column',
    fontFamily: 'sans-serif', boxSizing: 'border-box', overflowY: 'auto'
  };

  const linkStyle = {
    textDecoration: 'none', fontSize: '20px', color: '#ffffff',
    display: 'block', cursor: 'pointer', transition: 'color 0.2s'
  };

  const subLinkStyle = {
    ...linkStyle,
    fontSize: '16px',
    paddingLeft: '12px'
  };

  const groupHeaderStyle = {
    fontSize: '12px', 
    color: '#64748b', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    marginTop: '8px',
    marginBottom: '4px'
  };

  const getLinkColor = (path) => pathname === path ? '#1e70e6' : '#ffffff';

  return (
    <div style={sidebarStyle}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', padding: '24px 20px 15px 20px' }}>
        Admin Panel
      </div>

      <nav style={{ flex: 1, padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Dashboard */}
        <Link href="/shop_admin/dashboard" style={{ ...linkStyle, color: getLinkColor('/shop_admin/dashboard') }}>
          Dashboard
        </Link>

        {/* 🔒 MASTER SETUP - Admin & Shop Admin Only */}
        {(userRole === 'admin' || userRole === 'shop_admin') && (
          <div>
            <div onClick={() => setIsMasterOpen(!isMasterOpen)} style={{ ...linkStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Master Setup</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{isMasterOpen ? '▲' : '▼'}</span>
            </div>

            {isMasterOpen && (
              <div style={{ marginTop: '12px', paddingLeft: '15px', borderLeft: '1px solid #475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/shop_admin/master/company-profile" style={{ ...linkStyle, fontSize: '16px', color: getLinkColor('/shop_admin/master/company-profile') }}>
                  • Company Profile
                </Link>
                <Link href="/shop_admin/setup-business/customize" style={{ ...linkStyle, fontSize: '16px', color: getLinkColor('/shop_admin/setup-business/customize') }}>
                  • Chart of Accounts
                </Link>
                <Link href="/shop_admin/master/operators" style={{ ...linkStyle, fontSize: '16px', color: getLinkColor('/shop_admin/master/operators') }}>
                  • Operators & Staff
                </Link>
                <Link href="/shop_admin/master/customers" style={{ ...linkStyle, fontSize: '16px', color: getLinkColor('/shop_admin/master/customers') }}>
                  • Customers (Debtors)
                </Link>
                <Link href="/shop_admin/master/suppliers" style={{ ...linkStyle, fontSize: '16px', color: getLinkColor('/shop_admin/master/suppliers') }}>
                  • Suppliers (Creditors)
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 📖 VOUCHERS & ACCOUNT BOOKS */}
        <div>
          <div onClick={() => setIsBooksOpen(!isBooksOpen)} style={{ ...linkStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Transactions & Books</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{isBooksOpen ? '▲' : '▼'}</span>
          </div>

          {isBooksOpen && (
            <div style={{ marginTop: '12px', paddingLeft: '15px', borderLeft: '1px solid #475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/shop_admin/transactions" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/transactions'), fontWeight: 'bold' }}>
                📝 All Transactions
              </Link>
              <Link href="/shop_admin/books/cash-book" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/books/cash-book') }}>
                • Cash Book (ক্যাশ খাতা)
              </Link>
              <Link href="/shop_admin/books/bank-book" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/books/bank-book') }}>
                • Bank Book (ব্যাংক খাতা)
              </Link>
              <Link href="/shop_admin/books/general-ledger" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/books/general-ledger') }}>
                • General Ledger (খতিয়ান)
              </Link>
            </div>
          )}
        </div>

        {/* Products */}
        <Link href="/shop_admin/products" style={{ ...linkStyle, color: getLinkColor('/shop_admin/products') }}>
          Products
        </Link>

        {/* 📈 REPORTS PANEL */}
        <div>
          <div onClick={() => setIsReportsOpen(!isReportsOpen)} style={{ ...linkStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Reports & Final Statements</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{isReportsOpen ? '▲' : '▼'}</span>
          </div>

          {isReportsOpen && (
            <div style={{ marginTop: '12px', paddingLeft: '15px', borderLeft: '1px solid #475569', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={groupHeaderStyle}>Final Statements</div>
              <Link href="/shop_admin/reports/balance-sheet" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/balance-sheet') }}>
                • Balance Sheet (উদ্বর্তপত্র)
              </Link>
              <Link href="/shop_admin/reports/profit-loss" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/profit-loss') }}>
                • Profit & Loss Statement
              </Link>
              <Link href="/shop_admin/reports/trial-balance" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/trial-balance') }}>
                • Trial Balance (রেলমিল)
              </Link>
              <Link href="/shop_admin/reports/daybook" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/daybook') }}>
                • Daily Daybook
              </Link>
              <Link href="/shop_admin/reports/cash-flow" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/cash-flow') }}>
                • Cash Flow Statement
              </Link>

              <div style={groupHeaderStyle}>Stock & Inventory</div>
              <Link href="/shop_admin/reports/stock-valuation" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/stock-valuation') }}>
                • Stock Valuation Report
              </Link>
              <Link href="/shop_admin/reports/low-stock" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/low-stock') }}>
                • Low Stock Alerts
              </Link>

              <div style={groupHeaderStyle}>Sales & Purchases</div>
              <Link href="/shop_admin/reports/sales-summary" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/sales-summary') }}>
                • Sales & GST Summary
              </Link>
              <Link href="/shop_admin/reports/purchase-register" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/purchase-register') }}>
                • Purchase Register
              </Link>
              <Link href="/shop_admin/reports/party-balance" style={{ ...subLinkStyle, color: getLinkColor('/shop_admin/reports/party-balance') }}>
                • Party Receivable (Baki)
              </Link>

            </div>
          )}
        </div>

        {/* 🔒 Settings - Admin & Shop Admin Only */}
        {(userRole === 'admin' || userRole === 'shop_admin') && (
          <Link href="/shop_admin/settings" style={{ ...linkStyle, color: getLinkColor('/shop_admin/settings') }}>
            Settings
          </Link>
        )}

      </nav>
    </div>
  );
}