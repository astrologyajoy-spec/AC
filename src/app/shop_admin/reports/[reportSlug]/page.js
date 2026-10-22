'use client';

import { useState, useEffect, use } from 'react';

export default function DynamicReportPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { reportSlug } = params;

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        // এপিআই পাথে এখন সরাসরি reportSlug ডাইনামিক ভ্যালু পাঠানো হচ্ছে
        const res = await fetch(`/api/reports/${reportSlug}`);
        const result = await res.json();
        
        if (result.success) {
          setReportData(result.data);
          setError(null);
        } else {
          setError(result.message || 'রিপোর্ট ডাটা পাওয়া যায়নি।');
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না।');
      } finally {
        setLoading(false);
      }
    }
    
    if (reportSlug) {
      fetchReport();
    }
  }, [reportSlug]);

  if (loading) {
    return <div style={{ padding: '30px', fontSize: '18px', fontWeight: 'bold', color: '#1a2332' }}>🔄 {reportSlug.replace('-', ' ')} লোড হচ্ছে...</div>;
  }

  if (error) {
    return <div style={{ padding: '30px', color: '#dc2626', fontWeight: 'bold' }}>⚠️ এরর: {error}</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const tableHeaderStyle = { backgroundColor: '#f1f5f9', color: '#1e293b', padding: '12px 10px', textAlign: 'left', borderBottom: '2px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold' };
  const cellStyle = { padding: '10px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' };
  const totalRowStyle = { backgroundColor: '#e2e8f0', fontWeight: 'bold', color: '#0f172a' };

  return (
    <div style={{ padding: '30px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* অ্যাকশন বার */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0, textTransform: 'capitalize' }}>
            {reportSlug.replace('-', ' ')}
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Easy Ledger ERP</p>
        </div>
        <button 
          onClick={handlePrint}
          style={{ backgroundColor: '#1e70e6', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* প্রাতিষ্ঠানিক হেডার সামারি */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h2 style={{ fontSize: '26px', margin: '0 0 5px 0', color: '#0f172a', fontWeight: 'bold' }}>Easy Ledger ERP</h2>
        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 5px 0' }}>Cooch Behar, West Bengal</p>
        <h3 style={{ fontSize: '16px', color: '#1e70e6', margin: '0', fontWeight: 'bold' }}>
          {reportData?.title || 'Financial Statement'} {reportData?.asOfDate ? `As On: ${reportData.asOfDate}` : ''}
        </h3>
      </div>

      {/* 📊 BALANCE SHEET ডিজাইন */}
      {reportSlug === 'balance-sheet' && reportData && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Assets */}
          <div style={{ flex: 1, minWidth: '350px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ASSETS (সম্পদ সমূহ)</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {reportData.assets?.map((item, i) => (
                  <tr key={i}>
                    <td style={cellStyle}>{item.account_name}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={totalRowStyle}>
                  <td style={cellStyle}>Total Assets</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>₹ {reportData.totalAssets?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Liabilities & Equity */}
          <div style={{ flex: 1, minWidth: '350px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>LIABILITIES & EQUITY (দায় ও মূলধন)</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...cellStyle, fontWeight: 'bold', color: '#64748b', fontSize: '12px', backgroundColor: '#f8fafc' }} colSpan="2">Liabilities</td>
                </tr>
                {reportData.liabilities?.map((item, i) => (
                  <tr key={i}>
                    <td style={cellStyle}>{item.account_name}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...cellStyle, fontWeight: 'bold', color: '#64748b', fontSize: '12px', backgroundColor: '#f8fafc' }} colSpan="2">Equity / Capital</td>
                </tr>
                {reportData.equity?.map((item, i) => (
                  <tr key={i}>
                    <td style={cellStyle}>{item.account_name}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={totalRowStyle}>
                  <td style={cellStyle}>Total Liabilities & Equity</td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>₹ {reportData.totalLiabilitiesAndEquity?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📖 CASH BOOK ডিজাইন */}
      {reportSlug !== 'balance-sheet' && reportData?.transactions && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Particulars</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Debit (₹)</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.transactions.map((tx, i) => (
                <tr key={i}>
                  <td style={cellStyle}>{tx.date}</td>
                  <td style={cellStyle}>{tx.particular}</td>
                  <td style={{ ...cellStyle, textAlign: 'right', color: tx.debit > 0 ? 'green' : '#334155' }}>
                    {tx.debit > 0 ? tx.debit.toFixed(2) : '-'}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', color: tx.credit > 0 ? 'red' : '#334155' }}>
                    {tx.credit > 0 ? tx.credit.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
              <tr style={totalRowStyle}>
                <td style={cellStyle} colSpan="2">Closing Balance</td>
                <td style={{ ...cellStyle, textAlign: 'right' }} colSpan="2">₹ {reportData.closingBalance?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: #ffffff; padding: 0; margin: 0; }
        }
      `}</style>

    </div>
  );
}