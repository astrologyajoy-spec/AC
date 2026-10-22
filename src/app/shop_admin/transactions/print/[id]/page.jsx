'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function PrintVoucherSystem({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const printMode = searchParams.get('mode') || 'invoice'; 

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrintData() {
      try {
        const res = await fetch(`/api/admin/transactions/get-invoice-print?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setInvoice(data.invoice);
          setItems(data.items);
          setShop(data.shop);
        } else {
          setError(data.message || 'Invoice fetch failed.');
        }
      } catch (err) {
        console.error("Error fetching print data:", err);
        setError('Network Error connected to backend.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPrintData();
  }, [id]);

  const handleModeChange = (mode) => {
    router.push(`${pathname}?mode=${mode}`);
  };

  const getHeaderTitle = () => {
    const vType = invoice?.v_type || 'SALE';
    switch (printMode) {
      case 'cash_memo':
        return 'CASH MEMO';
      case 'bill':
        return 'RETAIL BILL';
      case 'challan':
        return 'DELIVERY CHALLAN';
      case 'invoice':
      default:
        return `${vType} TAX INVOICE`;
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm font-bold tracking-wide animate-pulse">⏳ Loading Official Print Preview Matrix...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 bg-red-50 border border-red-200 rounded-xl text-center shadow-sm">
        <h3 className="text-red-700 font-bold text-base mb-2">❌ Invoice Not Found!</h3>
        <p className="text-xs text-red-600 font-medium">{error || 'The requested txn token does not exist in ledger records.'}</p>
      </div>
    );
  }

  // ক্যালকুলেশন ভেরিয়েবলস
  const totalGst = invoice.is_gst_enabled === 1 ? (parseFloat(invoice.total_cgst || 0) + parseFloat(invoice.total_sgst || 0) + parseFloat(invoice.total_igst || 0)) : 0;
  const initialGross = parseFloat(invoice.gross_amount || 0);
  
  // শুধুমাত্র 'invoice' মোড হলেই GST বাদ দিয়ে মূল Taxable Gross দেখাবে
  const isInvoiceMode = printMode === 'invoice';
  const displayGross = isInvoiceMode ? (initialGross - totalGst) : initialGross;

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto text-gray-900 font-sans shadow-sm border rounded-lg mt-4">
      
      {/* PRINT TOOLBAR & ACTION BUTTONS CONTROL CONSOLE */}
      <div className="mb-6 bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Generate As:</span>
          <button 
            onClick={() => handleModeChange('invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${printMode === 'invoice' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
          >
            📄 Tax Invoice
          </button>
          <button 
            onClick={() => handleModeChange('cash_memo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${printMode === 'cash_memo' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
          >
            💰 Cash Memo
          </button>
          <button 
            onClick={() => handleModeChange('bill')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${printMode === 'bill' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
          >
            🧾 Retail Bill
          </button>
          <button 
            onClick={() => handleModeChange('challan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${printMode === 'challan' ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
          >
            🚚 Challan
          </button>
        </div>

        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-xs transition-transform active:scale-95 whitespace-nowrap"
        >
          🖨️ Execute Print / Save PDF
        </button>
      </div>

      {/* INVOICE MASTER HEADER SHEET */}
      <div className="border-b-2 border-gray-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
            {shop?.shop_name || 'OFFICIAL RETAIL STORE'}
          </h1>
          {shop?.legal_name && <p className="text-xs font-bold text-gray-600">({shop.legal_name})</p>}
          
          <div className="text-[11px] text-gray-500 font-medium mt-1.5 space-y-0.5">
            <p>📍 {shop?.registered_address || 'Cooch Behar, West Bengal, India'}</p>
            <p>📞 Phone: <span className="text-gray-900 font-bold">{shop?.mobile_no || 'N/A'}</span> {shop?.alt_mobile_no && `, ${shop.alt_mobile_no}`}</p>
            {shop?.email_id && <p>✉️ Email: {shop.email_id}</p>}
            {shop?.gstin && <p className="font-mono font-bold text-xs text-gray-800">GSTIN: {shop.gstin}</p>}
          </div>
        </div>

        <div className="text-right">
          <div className="bg-gray-900 text-white font-black px-3 py-1 text-sm tracking-wider uppercase inline-block rounded mb-3">
            {getHeaderTitle()}
          </div>
          <div className="text-xs font-medium text-gray-600 space-y-1">
            <p>Invoice No: <span className="font-mono font-bold text-gray-900 text-sm">{invoice.invoice_number}</span></p>
            <p>Date: <span className="font-bold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</span></p>
            <p>Place of Supply: <span className="font-bold text-gray-900">{invoice.place_of_supply}</span></p>
          </div>
        </div>
      </div>

      {/* BILL TO PARTY SUBSIDIARY */}
      <div className="my-5 grid grid-cols-2 gap-4 bg-gray-50/70 p-3 rounded-lg border">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Meticulous Buyer Details (Billed To):</h3>
          <p className="font-bold text-sm text-gray-900">{invoice.customer_name}</p>
          {invoice.customer_phone && <p className="text-xs text-gray-600 mt-0.5">📞 Phone: {invoice.customer_phone}</p>}
          {invoice.customer__gstin && <p className="text-xs font-mono font-bold text-gray-700 mt-0.5">GSTIN: {invoice.customer__gstin}</p>}
        </div>
        <div className="text-right border-l pl-4 flex flex-col justify-center">
          <p className="text-xs text-gray-500">Settlement Mode</p>
          <p className="text-base font-black text-blue-900 tracking-wide uppercase mt-0.5">{invoice.payment_mode}</p>
        </div>
      </div>

      {/* MANIFEST LINE ITEMS TABLE */}
      <table className="w-full text-left border-collapse border border-gray-300 text-xs my-4">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
            <th className="border border-gray-300 p-2 text-center w-10">Sl</th>
            <th className="border border-gray-300 p-2">Item Description & Catalog SKU</th>
            <th className="border border-gray-300 p-2 text-center w-24">Qty / Unit</th>
            <th className="border border-gray-300 p-2 text-right w-28">Rate (₹)</th>
            {invoice.is_gst_enabled === 1 && isInvoiceMode && <th className="border border-gray-300 p-2 text-center w-16">GST</th>}
            <th className="border border-gray-300 p-2 text-right w-32">Total Price (₹)</th>
          </tr>
        </thead>
        <tbody className="font-medium divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id || index} className="text-gray-800">
              <td className="border border-gray-300 p-2 text-center font-mono">{index + 1}</td>
              <td className="border border-gray-300 p-2">
                <div className="font-bold text-gray-900">{item.product_name}</div>
                {item.sku && <span className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</span>}
              </td>
              <td className="border border-gray-300 p-2 text-center font-bold">
                {parseFloat(item.qty)} <span className="text-[10px] font-normal text-gray-500">{item.unit_type}</span>
              </td>
              <td className="border border-gray-300 p-2 text-right font-mono">
                {parseFloat(item.mrp_or_selling_rate).toFixed(2)}
              </td>
              {invoice.is_gst_enabled === 1 && isInvoiceMode && (
                <td className="border border-gray-300 p-2 text-center font-mono text-gray-600">
                  {parseInt(item.gst_percentage)}%
                </td>
              )}
              <td className="border border-gray-300 p-2 text-right font-bold font-mono">
                {parseFloat(item.item_grand_total).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FOOTER FINANCE BALANCE CALCULATION BLOCK */}
      <div className="mt-6 flex justify-between items-start gap-8">
        <div className="w-1/2 space-y-3">
          {shop?.invoice_terms && (
            <div className="p-2 border rounded text-[10px] text-gray-500 leading-relaxed bg-gray-50">
              <span className="font-bold block text-gray-700 mb-0.5">📌 Terms & Declarations:</span>
              {shop.invoice_terms}
            </div>
          )}
        </div>

        <div className="w-1/2 border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-1.5 text-xs text-gray-600 font-semibold shadow-2xs">
          
          {/* লেবেল কাস্টমাইজেশন: ইনভয়েস ছাড়া বাকিগুলোতে স্পষ্ট (Incl. GST) লেখা থাকবে */}
          <div className="flex justify-between font-bold text-gray-800">
            <span>{isInvoiceMode ? "Gross Value (Excl. GST):" : "Gross Value (Incl. GST):"}</span>
            <span className="font-mono">₹{displayGross.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-400">
            <span>Total Account Markdown Disc:</span>
            <span className="font-mono">- ₹{parseFloat(invoice.total_discount).toFixed(2)}</span>
          </div>

          {/* শুধুমাত্র Tax Invoice এ ট্যাক্স ব্রেকআপ লাইনটি দেখা যাবে */}
          {invoice.is_gst_enabled === 1 && isInvoiceMode && (
            <div className="flex justify-between text-emerald-800 text-[11px] pt-1 border-t border-dashed">
              <span>Total Accrued GST (Tax):</span>
              <span className="font-mono">₹{totalGst.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-400 text-[10px]">
            <span>Fractional Round Off Auto:</span>
            <span className="font-mono">₹{parseFloat(invoice.round_off).toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-400 pt-2 flex justify-between text-sm font-black text-gray-900 bg-gray-100 p-1.5 rounded">
            <span>NET BILL GRAND TOTAL:</span>
            <span className="font-mono text-emerald-800 text-base">₹{parseFloat(invoice.grand_total).toLocaleString('en-IN')}</span>
          </div>

          {printMode !== 'challan' && (
            <div className="pt-2 text-[11px] space-y-1 border-t border-dashed border-gray-300">
              <div className="flex justify-between text-gray-700">
                <span>Immediate Cash Settled:</span>
                <span className="font-mono font-bold">₹{parseFloat(invoice.cash_paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Online Bank/UPI Logged:</span>
                <span className="font-mono font-bold">₹{parseFloat(invoice.bank_paid_amount || 0).toFixed(2)}</span>
              </div>
              {parseFloat(invoice.due_amount) > 0 ? (
                <div className="flex justify-between text-red-700 font-bold bg-red-50 px-1 rounded border border-red-200 mt-1">
                  <span>Outstanding Balance Due:</span>
                  <span className="font-mono">₹{parseFloat(invoice.due_amount).toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-center font-black text-emerald-700 bg-emerald-100/70 py-1 mt-1 tracking-wider uppercase border border-emerald-300 rounded">
                  ★ SECURED FULLY PAID ★
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 flex justify-between items-end text-xs pt-4 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 italic">This is an authorized computer-generated document voucher invoice.</p>
          <p className="text-[9px] text-gray-300 font-mono mt-0.5">Hash Token: {id}•{invoice.invoice_number}</p>
        </div>
        <div className="text-center border-t border-gray-900 pt-1.5 w-48 font-bold">
          <p className="text-[10px] text-gray-500 uppercase">Authorized Signature For</p>
          <p className="text-gray-900 text-[11px] mt-4 truncate">{shop?.shop_name || 'Easy Ledger Store'}</p>
        </div>
      </div>
    </div>
  );
}