'use client';

import { useState, useEffect } from 'react';

export default function AdvancedInvoiceBilling() {
  // ১. অ্যাডভান্সড সেটিংস মেট্রিয়াক্স স্টেট
  const [advSettings, setAdvSettings] = useState({
    gstMatrix: true,        // Tax slab computation
    rowDiscount: false,     // Item wise flat discount input
    narration: false,       // Bottom long text note field
    paymentInstrument: false, // Bank Txn ID / Cheque No tracking
    specialRebate: false,   // Direct flat rebate from grand total
    promoRow: false         // Sample row with 0 billing rate
  });

  // সেটিংস সাইড প্যানেল পপআপ টগল স্টেট
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // গ্লোবাল কনফিগারেশন ও ট্রানজ্যাকশন টাইপ মোড (Database Enum: SALE, PURCHASE, S_RET, P_RET, DMG_OUT অনুযায়ী)
  const [voucherType, setVoucherType] = useState('SALE'); 
  const [reverseCharge, setReverseCharge] = useState(false); 
  const [tcsApplicable, setTcsApplicable] = useState(false); 
  
  // ইনভয়েস মাস্টার স্টেট
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch (e) {
      return new Date().toLocaleDateString('en-CA'); 
    }
  });
  const [selectedPartyId, setSelectedPartyId] = useState(''); 
  const [partyName, setPartyName] = useState('Walk-in Customer'); 
  const [partyPhone, setPartyPhone] = useState(''); 
  const [partyGstin, setPartyGstin] = useState(''); 
  const [placeOfSupply, setPlaceOfSupply] = useState('West Bengal'); 

  // নতুন অ্যাডভান্সড মেটা ফিল্ডস (ডাটাবেজ কলাম ম্যাপিং)
  const [instType, setInstType] = useState('NONE');  
  const [instNo, setInstNo] = useState(''); 
  const [rebateAmt, setRebateAmt] = useState(''); 
  const [advAmt, setAdvAmt] = useState(''); 
  const [narration, setNarration] = useState(''); 

  // পেমেন্ট ও পারশিয়াল মোড স্টেট
  const [paymentMode, setPaymentMode] = useState('CASH');  
  const [cashPaidAmount, setCashPaidAmount] = useState(''); 
  const [bankPaidAmount, setBankPaidAmount] = useState(''); 
  
  // কার্ট এবং লাইভ সার্চ ইঞ্জিন স্টেট
  const [cart, setCart] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [currentProduct, setCurrentProduct] = useState(null); 
  
  // প্রোডাক্ট রো অ্যাডিশনাল ক্যালকুলেশন স্টেট
  const [quantity, setQuantity] = useState('1'); 
  const [salePriceWithGst, setSalePriceWithGst] = useState('');  // মূল গ্লোবাল রেট স্টেট
  const [localPrice, setLocalPrice] = useState('');             // [ফিক্সড]: টাইপিং লক এড়ানোর জন্য লোকাল বাফার স্টেট
  const [itemDiscount, setItemDiscount] = useState(0);  
  const [originalSellingRate, setOriginalSellingRate] = useState(0);  
  const [isFreeItem, setIsFreeItem] = useState(false); 

  // মডাল উইন্ডো স্টেট
  const [showPartyModal, setShowPartyModal] = useState(false); 
  const [showProductModal, setShowProductModal] = useState(false); 
  
  // নতুন কাস্টমার কুইক ফর্ম স্টেট
  const [newPartyName, setNewPartyName] = useState(''); 
  const [newPartyPhone, setNewPartyPhone] = useState(''); 
  const [newPartyType, setNewPartyType] = useState('customer'); 

  // নতুন প্রোডাক্ট ইনভেন্টরি কুইক ফর্ম স্টেট
  const [newProdName, setNewProdName] = useState(''); 
  const [newProdSku, setNewProdSku] = useState(''); 
  const [newProdPrice, setNewProdPrice] = useState(''); 
  const [newProdGst, setNewProdGst] = useState(18); 

  // ডাটাবেজ ব্যাকআপ স্টেট হোল্ডারস
  const [dbProducts, setDbProducts] = useState([]);  
  const [dbParties, setDbParties] = useState([]);    
  const [filteredProducts, setFilteredProducts] = useState([]); 

  // ইন-লাইন অ্যাকশন বাটন শো/হাইড স্টেট
  const [isCommitted, setIsCommitted] = useState(false);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState(null);

  // মাস্টার ডাটা লোড ও ইনভয়েস নম্বর জেনারেশন
  useEffect(() => {
    fetchMasterData(); 
    setInvoiceNo('INV-' + Math.floor(100000 + Math.random() * 900000)); 
  }, [voucherType]); 

  const fetchMasterData = async () => {
    try {
      const prodRes = await fetch('/api/admin/inventory/save-product');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success && prodData.data) {
          setDbProducts(prodData.data.map(p => ({
            id: p.id,
            name: p.product_name,
            sku: p.sku_code,
            unit_type: p.unit_type || 'Pcs',
            selling_rate: parseFloat(p.selling_price) || 0,
            default_gst_percentage: parseInt(p.gst_percentage) || 0
          })));
        }
      }

      const partyRes = await fetch('/api/admin/parties'); 
      if (partyRes.ok) {
        const partyData = await partyRes.json();
        if (partyData.success && partyData.data) {
          setDbParties(partyData.data);
        }
      }
    } catch (err) {
      console.error("Data loading error:", err);
    }
  };

  // লাইভ সার্চ ফিল্টারিং লজিক
  useEffect(() => {
    if (searchQuery.trim() === '' || (currentProduct && currentProduct.name === searchQuery)) {
      setFilteredProducts([]);
    } else {
      const filtered = dbProducts.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, dbProducts, currentProduct]); 

  // প্রোডাক্ট সিলেক্ট করার ইভেন্ট হ্যান্ডলার
  const handleProductSelect = (prod) => {
    setCurrentProduct(prod); 
    setSearchQuery(prod.name); 
    setFilteredProducts([]); 
    setSalePriceWithGst(String(prod.selling_rate)); 
    setLocalPrice(String(prod.selling_rate)); // লোকাল বাফার সিঙ্ক
    setOriginalSellingRate(prod.selling_rate); 
    setItemDiscount(0); 
    setIsFreeItem(false); 
    setIsCommitted(false); 
  };

  // টাইপ করার সময় লোকাল স্টেট আপডেট হবে (কোনো রি-রেন্ডার লক করবে না)
  const handlePriceInputChange = (val) => {
    setLocalPrice(val);
    setSalePriceWithGst(val);
  };

  // ফোকাস সরালে বা টাইপ শেষ হলে ডিসকাউন্ট হিসাব হবে
  const handlePriceBlur = () => {
    const price = parseFloat(localPrice) || 0;
    if (originalSellingRate > 0 && price < originalSellingRate) {
      setItemDiscount(originalSellingRate - price);
    } else {
      setItemDiscount(0);
    }
  };

  // কাস্টমার পরিবর্তন হ্যান্ডলার
  const handlePartyChange = (id) => {
    setSelectedPartyId(id); 
    const party = dbParties.find(p => String(p.id) === String(id));
    if (party) {
      setPartyName(party.name || party.ledger_name);
      setPartyPhone(party.phone || '');
      setPartyGstin(party.party_code || '');
    } else {
      setPartyName('Walk-in Customer');
      setPartyPhone('');
      setPartyGstin('');
    }
    setIsCommitted(false);
  };

  // কুইক কাস্টমার এড সাবমিট
  const handleAddPartySubmit = async (e) => {
    e.preventDefault();
    if (!newPartyName) return alert("Customer name required");
    const newCustomer = { 
      id: Date.now(), 
      name: newPartyName, 
      phone: newPartyPhone, 
      party_code: 'CUST-' + Math.floor(1000 + Math.random() * 9000) 
    };
    setDbParties([newCustomer, ...dbParties]);
    setSelectedPartyId(String(newCustomer.id));
    setPartyName(newCustomer.name);
    setPartyPhone(newCustomer.phone);
    setShowPartyModal(false);
    setNewPartyName('');
    setNewPartyPhone('');
  };

  // কুইক ইনভেন্টরি প্রোডাক্ট এড সাবমিট
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return alert("Name and price required");
    const newItem = { 
      id: Date.now(), 
      name: newProdName, 
      sku: newProdSku || 'SKU-GEN', 
      selling_rate: parseFloat(newProdPrice), 
      default_gst_percentage: parseInt(newProdGst), 
      unit_type: 'Pcs' 
    };
    setDbProducts([newItem, ...dbProducts]);
    handleProductSelect(newItem);
    setShowProductModal(false);
    setNewProdName('');
    setNewProdSku('');
    setNewProdPrice('');
  };

  // কার্টে আইটেম পুশ ও ক্যালকুলেশন লজিক
  const addToCart = (e) => {
    e.preventDefault();
    if (!currentProduct) return alert("Please select a product first.");
    const currentQty = parseFloat(quantity) || 0;
    if (currentQty <= 0) return alert("Invalid quantity.");

    setIsCommitted(false);

    const typedPrice = parseFloat(localPrice) || 0; // কার্টে নেওয়ার সময় লোকাল প্রাইস রিড করা হচ্ছে
    const finalRate = isFreeItem ? 0 : typedPrice;
    
    // ডিসকাউন্ট রি-ক্যালকুলেট করে নেওয়া হচ্ছে সুরক্ষার জন্য
    const dynamicDiscount = (originalSellingRate > 0 && typedPrice < originalSellingRate) ? (originalSellingRate - typedPrice) : 0;
    const finalDiscount = isFreeItem ? 0 : (advSettings.rowDiscount ? dynamicDiscount * currentQty : 0);
    
    const totalRowAmount = currentQty * finalRate;
    const gstRate = advSettings.gstMatrix ? currentProduct.default_gst_percentage : 0;
    
    const taxableValue = (gstRate > 0 && finalRate > 0) ? (totalRowAmount / (1 + gstRate / 100)) : totalRowAmount;
    const totalTax = totalRowAmount - taxableValue;

    let cgst = 0, sgst = 0, igst = 0;
    if (placeOfSupply === 'West Bengal') {
      cgst = totalTax / 2;
      sgst = totalTax / 2;
    } else {
      igst = totalTax;
    }

    setCart([...cart, {
      product_id: String(currentProduct.id),
      product_name: currentProduct.name,
      sku: currentProduct.sku,
      unit_type: currentProduct.unit_type,
      qty: currentQty,
      mrp_or_selling_rate: finalRate,
      discount_amount: finalDiscount,
      taxable_value: taxableValue,
      gst_percentage: gstRate,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      item_grand_total: totalRowAmount,
      is_free: isFreeItem ? 1 : 0 
    }]);

    setSearchQuery('');
    setCurrentProduct(null);
    setQuantity('1');
    setSalePriceWithGst('');
    setLocalPrice(''); // ক্লিয়ার লোকাল স্টেট
    setItemDiscount(0);
    setIsFreeItem(false);
  };

  // গ্লোবাল লাইভ টোটাল ক্যালকুলেশন
  const grossAmount = cart.reduce((sum, item) => sum + item.item_grand_total, 0); 
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount_amount, 0); 
  const taxableValue = cart.reduce((sum, item) => sum + item.taxable_value, 0); 
  const totalCgst = cart.reduce((sum, item) => sum + item.cgst_amount, 0); 
  const totalSgst = cart.reduce((sum, item) => sum + item.sgst_amount, 0); 
  const totalIgst = cart.reduce((sum, item) => sum + item.igst_amount, 0); 
  
  const currentRebate = advSettings.specialRebate ? (parseFloat(rebateAmt) || 0) : 0; 
  
  const rawGrandTotal = grossAmount - currentRebate; 
  const grandTotal = Math.round(rawGrandTotal < 0 ? 0 : rawGrandTotal); 
  const roundOff = grandTotal - rawGrandTotal; 

  const currentCashPaid = paymentMode === 'CASH' ? grandTotal : (parseFloat(cashPaidAmount) || 0); 
  const currentBankPaid = paymentMode === 'BANK' ? grandTotal : (parseFloat(bankPaidAmount) || 0); 
  const currentAdvPaid = paymentMode === 'PARTIAL' ? (parseFloat(advAmt) || 0) : 0; 

  const calculatedDue = paymentMode === 'CREDIT' 
    ? grandTotal 
    : (paymentMode === 'PARTIAL' ? Math.max(0, grandTotal - currentAdvPaid) : Math.max(0, grandTotal - (currentCashPaid + currentBankPaid)));

  // ডাটাবেজে ইনভয়েস সেভ করার হ্যান্ডলার
  const handleCommitInvoice = async () => {
    if (cart.length === 0) {
      alert("আপনার কার্ট খালি! অনুগ্রহ করে প্রথমে আইটেম যোগ করুন।");
      return;
    }

    const payload = {
      invoice_number: invoiceNo,
      invoice_date: invoiceDate,
      v_type: voucherType, 
      customer_sub_id: selectedPartyId || null,
      customer_name: partyName,
      customer_phone: partyPhone || null,
      customer__gstin: partyGstin || null,
      place_of_supply: placeOfSupply,
      is_gst_enabled: advSettings.gstMatrix ? 1 : 0,
      gross_amount: grossAmount,
      total_discount: totalDiscount,
      total_taxable_value: taxableValue,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: totalIgst,
      round_off: roundOff,
      grand_total: grandTotal,
      payment_mode: paymentMode,
      cash_paid_amount: paymentMode === 'PARTIAL' ? currentCashPaid : (paymentMode === 'CASH' ? grandTotal : 0),
      bank_paid_amount: paymentMode === 'PARTIAL' ? currentBankPaid : (paymentMode === 'BANK' ? grandTotal : 0),
      due_amount: calculatedDue,
      items: cart
    };

    try {
      const response = await fetch('/api/admin/transactions/save-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        setGeneratedInvoiceId(resData.invoice_id || null);
        setIsCommitted(true);
      } else {
        alert("❌ Error: " + resData.message);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error: কানেক্ট করা যাচ্ছে না!");
    }
  };

  const resetVoucherForm = () => {
    setCart([]);
    setInvoiceNo('INV-' + Math.floor(100000 + Math.random() * 900000));
    setCashPaidAmount('');
    setBankPaidAmount('');
    setRebateAmt('');
    setAdvAmt('');
    setNarration('');
    setInstNo('');
    setInstType('NONE');
    setIsCommitted(false);
    setGeneratedInvoiceId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white border border-gray-200 rounded-xl shadow-sm mt-3 text-gray-800 font-sans relative">
      
      {/* CONTROL CONFIG MATRIX */}
      {showSettingsPanel && (
        <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 text-slate-100 z-50 p-5 shadow-2xl border-l border-slate-700 animate-in slide-in-from-right">
          <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
            <h3 className="font-bold text-xs tracking-wider text-blue-400">⚙️ CONTROL CONFIG MATRIX</h3>
            <button onClick={() => setShowSettingsPanel(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
          </div>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <div>
                <p className="font-bold text-slate-200">1. GST Matrix (Tax On/Off)</p>
                <p className="text-[10px] text-slate-400">Compute & display tax breakup columns</p>
              </div>
              <input type="checkbox" checked={advSettings.gstMatrix} onChange={(e) => setAdvSettings({...advSettings, gstMatrix: e.target.checked})} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <div>
                <p className="font-bold text-slate-200">2. Row-wise Discount</p>
                <p className="text-[10px] text-slate-400">Enable item markdown fields</p>
              </div>
              <input type="checkbox" checked={advSettings.rowDiscount} onChange={(e) => setAdvSettings({...advSettings, rowDiscount: e.target.checked})} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <div>
                <p className="font-bold text-slate-200">3. Voucher Narration Box</p>
                <p className="text-[10px] text-slate-400">Enable footer voucher remarks</p>
              </div>
              <input type="checkbox" checked={advSettings.narration} onChange={(e) => setAdvSettings({...advSettings, narration: e.target.checked})} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <div>
                <p className="font-bold text-slate-200">4. Payment Instrument Tracker</p>
                <p className="text-[10px] text-slate-400">Track Cheque/UPI transaction data</p>
              </div>
              <input type="checkbox" checked={advSettings.paymentInstrument} onChange={(e) => setAdvSettings({...advSettings, paymentInstrument: e.target.checked})} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <div>
                <p className="font-bold text-slate-200">5. Special Trade Rebate</p>
                <p className="text-[10px] text-slate-400">Extra flat subtraction on footer</p>
              </div>
              <input type="checkbox" checked={advSettings.specialRebate} onChange={(e) => setAdvSettings({...advSettings, specialRebate: e.target.checked})} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <div>
                <p className="font-bold text-slate-200">6. Promotional / Free Gift Row</p>
                <p className="text-[10px] text-slate-400">Enable zero-rate sample check option</p>
              </div>
              <input type="checkbox" checked={advSettings.promoRow} onChange={(e) => setAdvSettings({...advSettings, promoRow: e.target.checked})} className="w-4 h-4 accent-blue-500 cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* MASTER CONTROL HEADER */}
      <div className="border-b border-gray-100 pb-3 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-blue-900 tracking-tight flex items-center gap-2">
            📊 Core ERP Ledger Accounts Voucher Engine
          </h2>
          <p className="text-[11px] text-gray-400 font-medium">Real-time Double Entry Accounting Protocol Architecture</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1 border rounded-lg">
          <select 
            className="px-2.5 py-1.5 border border-blue-200 bg-white text-blue-950 font-bold text-xs rounded-md shadow-sm outline-none cursor-pointer"
            value={voucherType}
            onChange={(e) => setVoucherType(e.target.value)}
          >
            <option value="SALE">🛍️ SALES VOUCHER (Outward)</option>
            <option value="PURCHASE">📦 PURCHASE VOUCHER (Inward Stock)</option>
            <option value="S_RET">🔄 SALES RETURN (S_RET)</option>
            <option value="P_RET">↩️ PURCHASE RETURN (P_RET)</option>
            <option value="DMG_OUT">⚠️ DAMAGE / SCRAP OUT</option>
          </select>
          <button 
            type="button"
            onClick={() => setShowSettingsPanel(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-md shadow-sm transition-colors"
          >
            ⚙️ Control Matrix
          </button>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* MASTER METADATA */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5">
              <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">📌 Voucher Ledger Metadata</h3>
              <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-800 font-bold rounded">Auto Num Enabled</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Voucher / Invoice No</label>
                <input type="text" className="w-full px-2.5 py-1.5 border rounded-md text-xs font-mono font-bold bg-gray-100 border-gray-300 text-gray-600 outline-none" value={invoiceNo} readOnly />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Voucher Date</label>
                <input type="date" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Debtor Subsidiary Ledger</label>
                <button type="button" onClick={() => setShowPartyModal(true)} className="text-[10px] text-blue-600 font-bold hover:text-blue-800">➕ Quick Account Add</button>
              </div>
              <select className="w-full px-2.5 py-1.5 border border-gray-300 bg-white rounded-md text-xs font-semibold text-gray-700" value={selectedPartyId} onChange={(e) => handlePartyChange(e.target.value)}>
                <option value="">-- Non-Registered Walk-In Counter Sales --</option>
                {dbParties.map((p) => <option key={p.id} value={p.id}>{p.name || p.ledger_name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Customer Name</label>
                <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white" value={partyName} onChange={(e) => setPartyName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Phone Number</label>
                <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 bg-white" value={partyPhone} onChange={(e) => setPartyPhone(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">GSTIN Identification</label>
                <input type="text" placeholder="Optional GSTIN" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-mono text-gray-700 uppercase placeholder-gray-300" value={partyGstin} onChange={(e) => setPartyGstin(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Place of Supply State</label>
                <select className="w-full px-2.5 py-1.5 border border-gray-300 bg-white rounded-md text-xs text-gray-700" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)}>
                  <option value="West Bengal">Intrastate (West Bengal - 19)</option>
                  <option value="Other State">Interstate (Out of State)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CATALOG ITEM ADDER */}
          <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3 relative">
            <div className="flex justify-between items-center border-b border-gray-200/60 pb-1.5">
              <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">📦 Inventory Manifest Line Items</h3>
              <button type="button" onClick={() => setShowProductModal(true)} className="text-[10px] text-blue-600 font-bold hover:text-blue-800">➕ Quick Catalog Add</button>
            </div>
            
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Search Stock Catalog Item</label>
              <input type="text" placeholder="Type name / fetch SKU..." className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-800 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {filteredProducts.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-50 text-xs shadow-xl divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <li key={p.id} onClick={() => handleProductSelect(p)} className="p-2 hover:bg-gray-50 cursor-pointer font-semibold flex justify-between items-center text-gray-700">
                      <span className="truncate">{p.name}</span>
                      <span className="text-gray-400 font-mono text-[10px]">₹{p.selling_rate}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Quantity</label>
                <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-800 text-center" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              
              {/* [সম্পূর্ণ ফিক্সড]: টাইপিং লক এড়িয়ে স্মুথ কিবোর্ড ইনপুট রেডি */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Final Rate (₹)</label>
                <input 
                  type="text" 
                  disabled={isFreeItem} 
                  className="w-full px-2.5 py-1.5 border border-yellow-300 bg-yellow-50 text-yellow-950 font-bold rounded-md text-xs text-center disabled:bg-gray-100 outline-none" 
                  value={isFreeItem ? '0' : localPrice} 
                  onChange={(e) => handlePriceInputChange(e.target.value)}
                  onBlur={handlePriceBlur}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Disc/Unit (₹)</label>
                <input type="text" className="w-full px-2.5 py-1.5 border border-gray-200 bg-gray-100 text-gray-500 rounded-md text-xs text-center" value={isFreeItem ? 0 : itemDiscount} readOnly />
              </div>
            </div>

            {advSettings.promoRow && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-2 rounded-lg text-xs font-bold text-blue-950 animate-fadeIn">
                <input type="checkbox" id="free_sample_check" checked={isFreeItem} onChange={(e) => setIsFreeItem(e.target.checked)} className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                <label htmlFor="free_sample_check" className="cursor-pointer">Mark as Free Sample / Promo (₹0 Rate)</label>
              </div>
            )}

            <button type="button" onClick={addToCart} className="w-full bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold py-2 rounded-md shadow-sm transition-colors uppercase tracking-wider">
              ➕ Push Items to Manifest
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5">Stock Items / Catalog Details</th>
                  <th className="p-2.5 text-center">Qty / Unit</th>
                  <th className="p-2.5 text-right">Taxable Net Value</th>
                  {advSettings.gstMatrix && <th className="p-2.5 text-right">Tax Matrix (GST)</th>}
                  <th className="p-2.5 text-right">Total Net Price</th>
                  <th className="p-2.5 text-center">Drop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={advSettings.gstMatrix ? 6 : 5} className="p-12 text-center text-gray-400 italic font-normal">
                      No stock catalog items pushed to voucher ledger manifest.
                    </td>
                  </tr>
                ) : (
                  cart.map((item, index) => (
                    <tr key={index} className={`hover:bg-gray-50/80 text-gray-800 transition-colors ${item.is_free ? 'bg-blue-50/30' : ''}`}>
                      <td className="p-2.5">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          {item.product_name} 
                          {item.is_free === 1 && <span className="px-1.5 py-0.2 bg-blue-600 text-white font-bold text-[8px] rounded uppercase">FREE</span>}
                        </div>
                        {item.sku && <div className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</div>}
                      </td>
                      <td className="p-2.5 text-center font-bold text-gray-600">
                        {item.qty} <span className="text-[10px] font-medium text-gray-400">{item.unit_type}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono">₹{item.taxable_value.toFixed(2)}</td>
                      {advSettings.gstMatrix && (
                        <td className="p-2.5 text-right text-emerald-700 font-mono">
                          ₹{(item.cgst_amount + item.sgst_amount + item.igst_amount).toFixed(2)}
                          <span className="text-[9px] font-bold block text-gray-400 font-sans">({item.gst_percentage}%)</span>
                        </td>
                      )}
                      <td className="p-2.5 text-right font-bold font-mono text-gray-950">₹{item.item_grand_total.toFixed(2)}</td>
                      <td className="p-2.5 text-center">
                        <button type="button" onClick={() => setCart(cart.filter((_, i) => i !== index))} className="text-gray-300 hover:text-red-600 text-sm font-bold px-1">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SETTLEMENT PANEL & LIVE CALCULATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* BALANCING SETTLEMENT LEDGER */}
            <div className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl space-y-3">
              <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200/60 pb-1.5">
                💳 Balancing Settlement Ledger
              </h4>
              <div className="space-y-2">
                <select className="w-full px-2.5 py-1.5 border border-gray-300 bg-white rounded-md text-xs font-bold text-gray-700 outline-none shadow-sm" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="CASH">💵 COUNTER IMMEDIATE FULL CASH SETTLEMENT</option>
                  <option value="BANK">🏦 ONLINE BANKING TRANSFERS / UPI</option>
                  <option value="PARTIAL">🌗 SPLIT PARTIAL / DEFERRED BALANCING ACCOUNT</option>
                  <option value="CREDIT">🛍️ FULL CREDIT RECORD (ধারে)</option>
                </select>

                {advSettings.paymentInstrument && (paymentMode === 'BANK' || paymentMode === 'PARTIAL') && (
                  <div className="p-2 bg-white border rounded-lg border-gray-200 grid grid-cols-2 gap-2 animate-fadeIn">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Instrument Code</label>
                      <select className="w-full p-1 border rounded bg-gray-50 text-[11px] font-bold outline-none" value={instType} onChange={(e) => setInstType(e.target.value)}>
                        <option value="NONE">NONE</option>
                        <option value="CHEQUE">CHEQUE</option>
                        <option value="UPI">UPI ID</option>
                        <option value="NEFT">NEFT / RTGS</option>
                        <option value="CARD">CARD TXN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Instrument No / ID</label>
                      <input type="text" className="w-full p-1 border rounded text-[11px] font-mono outline-none" value={instNo} onChange={(e) => setInstNo(e.target.value)} />
                    </div>
                  </div>
                )}

                {paymentMode === 'PARTIAL' && (
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-dashed border-gray-200">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Advance Received</label>
                      <input type="text" className="w-full px-2.5 py-1 border border-gray-300 rounded text-xs font-bold font-mono text-gray-800 outline-none" value={advAmt} onChange={(e) => setAdvAmt(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Cash Split Mapped</label>
                      <input type="text" className="w-full px-2.5 py-1 border border-gray-300 rounded text-xs font-bold font-mono text-gray-800 outline-none" value={cashPaidAmount} onChange={(e) => setCashPaidAmount(e.target.value)} />
                    </div>
                  </div>
                )}

                {calculatedDue > 0 && (
                  <div className="bg-red-50 p-2 border border-red-100 rounded flex justify-between items-center text-[11px] font-bold text-red-900">
                    <span>Outstanding Due Balance:</span>
                    <span className="font-mono text-xs">₹{calculatedDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE BILL SUMMARY */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-1 text-xs text-gray-500 font-semibold shadow-sm">
              <div className="flex justify-between">
                <span>Gross Assessment Value:</span>
                <span className="font-mono text-gray-800">₹{grossAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-400">
                <span>Aggregated Discount:</span>
                <span className="font-mono">- ₹{totalDiscount.toFixed(2)}</span>
              </div>

              {advSettings.specialRebate && (
                <div className="flex justify-between items-center text-rose-700 py-0.5 border-t border-dashed border-gray-100 animate-fadeIn">
                  <span>Special Flat Trade Rebate (₹):</span>
                  <input type="text" className="w-20 px-1 py-0.5 border border-rose-300 rounded font-mono text-right text-xs bg-rose-50 outline-none" value={rebateAmt} onChange={(e) => setRebateAmt(e.target.value)} />
                </div>
              )}

              <div className="flex justify-between text-gray-700 pt-0.5 border-t border-gray-100">
                <span>Net Taxable Assessable Value:</span>
                <span className="font-mono">₹{taxableValue.toFixed(2)}</span>
              </div>

              {advSettings.gstMatrix && (
                <>
                  {placeOfSupply === 'West Bengal' ? (
                    <>
                      <div className="flex justify-between text-emerald-700 text-[11px]">
                        <span>Central Tax (CGST):</span>
                        <span className="font-mono">₹{totalCgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 text-[11px]">
                        <span>State Tax (SGST):</span>
                        <span className="font-mono">₹{totalSgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-emerald-700 text-[11px]">
                      <span>Integrated Tax (IGST):</span>
                      <span className="font-mono">₹{totalIgst.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-between text-gray-400 text-[10px]">
                <span>Round Off Adjust:</span>
                <span className="font-mono">₹{roundOff.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-300 my-1 pt-1 flex justify-between text-sm font-bold text-gray-900 bg-gray-100 p-1.5 rounded">
                <span>GRAND TOTAL:</span>
                <span className="font-mono text-emerald-700 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {advSettings.narration && (
            <div className="bg-gray-50 border p-3 rounded-xl animate-fadeIn">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Voucher Ledger Narration Remarks (Max 150 Chars)</label>
              <textarea maxLength={150} rows={2} placeholder="Enter official voucher reference accounts note..." className="w-full p-2 border border-gray-300 bg-white rounded text-xs font-medium outline-none" value={narration} onChange={(e) => setNarration(e.target.value)} />
            </div>
          )}

          {/* ACTION BUTTON AREA */}
          {cart.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2.5 pt-2 border-t border-gray-100">
              
              {isCommitted && generatedInvoiceId ? (
                <div className="flex flex-wrap items-center gap-2 bg-emerald-50 p-2 rounded-xl border border-emerald-200 animate-fadeIn w-full md:w-auto justify-end">
                  <span className="text-xs font-bold text-emerald-800 px-2">✓ Voucher Posted! Actions:</span>
                  
                  <a 
                    href={`/shop_admin/transactions/print/${generatedInvoiceId}`} 
                    target="_blank" 
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    📄 Print Invoice
                  </a>

                  <a 
                    href={`/shop_admin/transactions/print/${generatedInvoiceId}?mode=challan`} 
                    target="_blank" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    🚚 Delivery Challan
                  </a>

                  <button 
                    type="button" 
                    onClick={resetVoucherForm}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    Next New Entry ➕
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={handleCommitInvoice} 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  🚀 Commit Invoice & Post Ledgers
                </button>
              )}
              
            </div>
          )}
        </div>
      </div>

      {/* POPUP MODAL: NEW CUSTOMER */}
      {showPartyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddPartySubmit} className="bg-white p-5 rounded-xl max-w-sm w-full space-y-3.5 shadow-2xl border border-gray-100">
            <div className="border-b pb-1.5"><h3 className="font-bold text-sm text-gray-800">➕ Add New Debtor Subsidiary Ledger</h3></div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Ledger Name *</label>
              <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-800 outline-none" required placeholder="e.g. Mondal Hardware" value={newPartyName} onChange={(e) => setNewPartyName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Mobile Phone</label>
              <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-800 outline-none" placeholder="10 digit phone number" value={newPartyPhone} onChange={(e) => setNewPartyPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Category Type</label>
              <select className="w-full px-2.5 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-700 outline-none" value={newPartyType} onChange={(e) => setNewPartyType(e.target.value)}>
                <option value="customer">Sundry Debtors (Customer)</option>
                <option value="supplier">Sundry Creditors (Supplier)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setShowPartyModal(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shadow-sm">Save Ledger</button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP MODAL: NEW PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddProductSubmit} className="bg-white p-5 rounded-xl max-w-sm w-full space-y-3.5 shadow-2xl border border-gray-100">
            <div className="border-b pb-1.5"><h3 className="font-bold text-sm text-gray-800">📦 Quick Stock Inventory Entry</h3></div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Product Name *</label>
              <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-800 outline-none" required placeholder="e.g. PVC Pipe 4 Inch" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">SKU / Code</label>
                <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-800 font-mono outline-none" placeholder="Auto Code" value={newProdSku} onChange={(e) => setNewProdSku(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">Price With GST *</label>
                <input type="text" className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-800 outline-none" required placeholder="0.00" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Default GST Tax Rate</label>
              <select className="w-full px-2.5 py-1.5 border border-gray-300 bg-white rounded text-xs font-semibold text-gray-700 outline-none" value={newProdGst} onChange={(e) => setNewProdGst(e.target.value)}>
                <option value={0}>0% (Exempted)</option>
                <option value={5}>5% Slab</option>
                <option value={12}>12% Slab</option>
                <option value={18}>18% Slab</option>
                <option value={28}>28% Slab</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setShowProductModal(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shadow-sm">Save & Map</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}