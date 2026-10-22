// src/app/shop_admin/inventory/page.jsx
'use client';

import { useState, useEffect } from 'react';

export default function InventoryMaster() {
  // --- ডাটাবেস থেকে লেজার ও সাব-লেজার লোড করার স্টেট ---
  const [dbLedgers, setDbLedgers] = useState([]);
  const [isLoadingLedgers, setIsLoadingLedgers] = useState(true);

  // সিস্টেমের ইনভেন্টরি অ্যাকাউন্টস গ্রুপ স্টেট
  const [inventoryGroups, setInventoryGroups] = useState([]);

  // ডাটাবেসে সেভ থাকা প্রোডাক্ট মাস্টার স্টেট
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // --- 🔄 ডাটাবেস থেকে লেজার/সাব-লেজার এবং প্রোডাক্ট ডাটা লোড করা ---
  async function fetchCoreData() {
    try {
      setIsLoadingLedgers(true);
      const ledgerRes = await fetch('/api/admin/settings/get-main-ledgers');
      const ledgerJson = await ledgerRes.json();
      
      if (ledgerJson.success && ledgerJson.data) {
        setDbLedgers(ledgerJson.data);
        
        // অ্যাকাউন্ট লেজার ডাটাকে ইনভেন্টরি গ্রুপের সাথে ম্যাপ করা
        const mappedGroups = ledgerJson.data.map(l => ({
          id: `grp_${l.id}`,
          name: l.ledger_name,
          code: l.ledger_code,
          hsn_code: 'General'
        }));
        setInventoryGroups(mappedGroups);
      }
    } catch (error) {
      console.error("Error loading database ledgers for inventory:", error);
    } finally {
      setIsLoadingLedgers(false);
    }
  }

  async function fetchSavedProducts() {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/admin/inventory/save-product');
      const json = await res.json();
      if (json.success && json.data) {
        // ডাটাবেসের কলাম স্ট্রাকচারকে ফ্রন্টএন্ড ফর্মের স্টেটের সাথে সামঞ্জস্যপূর্ণ করা
        const mappedProducts = json.data.map(p => ({
          id: p.id,
          name: p.product_name,
          sku: p.sku_code,
          group_id: p.shop_id ? `grp_${p.shop_id}` : '', // সেভ করা লেজার আইডি ট্র্যাকিং
          primary_unit: p.primary_unit || 'Pcs',
          secondary_unit: p.unit_type || 'Pcs',
          conversion_multiplier: parseFloat(p.conversion_multiplier) || 1,
          purchase_rate_bulk: parseFloat(p.purchase_rate_bulk) || 0,
          selling_rate_retail: parseFloat(p.selling_price) || 0,
          min_selling_rate: parseFloat(p.min_selling_rate) || 0,
          gst_percentage: parseInt(p.gst_percentage) || 0,
          max_discount_percentage: parseFloat(p.discount_percent) || 0,
          min_stock_alert: parseInt(p.low_stock_alert) || 10,
          is_credit_allowed: p.is_visible_to_buyer === 1,
          current_stock_kg: parseFloat(p.current_stock) || 0
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error fetching items from database:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  }

  useEffect(() => {
    fetchCoreData();
    fetchSavedProducts();
  }, []);

  // ফরম কন্ট্রোল স্টেটমেন্টস
  const [activeTab, setActiveTab] = useState('products'); 
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // প্রোডাক্ট এন্ট্রি ফর্ম অবজেক্ট (সমস্ত পূর্ববর্তী ফিল্ড অক্ষুণ্ন রাখা হয়েছে)
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    group_id: '', 
    primary_unit: 'Pcs',
    secondary_unit: 'Pcs',
    conversion_multiplier: 1,
    purchase_rate_bulk: 0,
    selling_rate_retail: 0,
    min_selling_rate: 0,
    gst_percentage: 0,
    max_discount_percentage: 0,
    min_stock_alert: 10,
    is_credit_allowed: true,
    current_stock_kg: 0
  });

  // গ্রুপ এন্ট্রি ফর্ম অবজেক্ট
  const [groupForm, setGroupForm] = useState({ name: '', code: '', hsn_code: '' });

  // নতুন ইনভেন্টরি ক্যাটাগরি/গ্রুপ তৈরি
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupForm.name || !groupForm.code) {
      alert("Please enter group name and assign a ledger code.");
      return;
    }
    const newGroup = {
      id: `grp_${Date.now()}`,
      name: groupForm.name,
      code: groupForm.code, 
      hsn_code: groupForm.hsn_code || 'N/A'
    };
    setInventoryGroups([...inventoryGroups, newGroup]);
    setGroupForm({ name: '', code: '', hsn_code: '' });
    alert("New Inventory Category mapped with Ledger Profile!");
  };

  // 💾 প্রোডাক্ট সেভ বা আপডেট করার ডাটাবেস হ্যান্ডলার
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.group_id) {
      alert("Product Name and Linked Ledger Group are strictly required.");
      return;
    }

    try {
      const cleanLedgerId = productForm.group_id.replace('grp_', '');
      
      // ডাটাবেস পেলোডে ফর্মের সমস্ত অতিরিক্ত ফিল্ড ম্যাপ করা হলো
      const payload = {
        id: isEditing ? editingProductId : null,
        shop_id: parseInt(cleanLedgerId) || 1, 
        sku_code: productForm.sku || `SKU-${Date.now().toString().slice(-6)}`,
        product_name: productForm.name,
        primary_unit: productForm.primary_unit,
        unit_type: productForm.secondary_unit, // secondary_unit ডাটাবেসের unit_type এ যাচ্ছে
        conversion_multiplier: parseFloat(productForm.conversion_multiplier) || 1,
        purchase_rate_bulk: parseFloat(productForm.purchase_rate_bulk) || 0.00,
        selling_price: parseFloat(productForm.selling_rate_retail) || 0.00,
        min_selling_rate: parseFloat(productForm.min_selling_rate) || 0.00,
        gst_percentage: parseInt(productForm.gst_percentage) || 0,
        discount_percent: parseFloat(productForm.max_discount_percentage) || 0.00,
        low_stock_alert: parseInt(productForm.min_stock_alert) || 10,
        is_visible_to_buyer: productForm.is_credit_allowed ? 1 : 0,
        current_stock: parseFloat(productForm.current_stock_kg) || 0.00
      };

      const response = await fetch('/api/admin/inventory/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(isEditing ? "Product updated in database successfully!" : "Product committed and synced with database!");
        
        // ফর্ম রিসেট
        setIsEditing(false);
        setEditingProductId(null);
        setProductForm({
          name: '', sku: '', group_id: '', primary_unit: 'Pcs', secondary_unit: 'Pcs',
          conversion_multiplier: 1, purchase_rate_bulk: 0, selling_rate_retail: 0,
          min_selling_rate: 0, gst_percentage: 0, max_discount_percentage: 0,
          min_stock_alert: 10, is_credit_allowed: true, current_stock_kg: 0
        });
        fetchSavedProducts(); // লাইভ লিস্ট রিফ্রেশ
      } else {
        alert("Failed to sync with Database: " + result.message);
      }
    } catch (error) {
      console.error("API Call error:", error);
      alert("Network failure or API route missing.");
    }
  };

  // এডিট মোড অ্যাক্টিভেশন
  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setProductForm({ ...product });
    setActiveTab('products'); 
  };

  return (
    <div className="max-w-7xl mx-auto p-5 bg-white rounded-xl shadow-sm mt-4 border border-gray-100">
      
      {/* Top Identity Block */}
      <div className="border-b border-gray-200 pb-3.5 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            📦 Advanced Inventory & Stock Master
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Configure product SKUs, define custom business rules, and bind inventory nodes with active <span className="text-blue-600 font-bold">Chart of Accounts/Sub-Ledgers</span>.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            type="button"
            onClick={() => { setActiveTab('products'); if(!isEditing) { setEditingProductId(null); } }}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {isEditing ? '📝 Edit Product' : '➕ Add Product'}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'groups' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            📁 Link Ledger Groups
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COMPONENT: CONFIGURATION FORMS */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 shadow-2xs h-fit">
          
          {activeTab === 'products' && (
            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest border-b pb-1.5 border-gray-200 flex justify-between">
                <span>{isEditing ? 'Modify Product Specifications' : 'Product Node Registration'}</span>
                {isEditing && <span className="text-amber-600 font-bold normal-case text-[11px]">Mode: Update</span>}
              </h3>

              {/* Product Title Entry */}
              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Product Commercial Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aluminium Sheet"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                />
              </div>

              {/* SKU & Linked Account Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Custom SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ALU-SH-01"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900 font-mono font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Linked Account Ledger Head *</label>
                  <select
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
                    value={productForm.group_id}
                    onChange={(e) => setProductForm({...productForm, group_id: e.target.value})}
                  >
                    <option value="">-- Select Accounting Head --</option>
                    {inventoryGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Unit Config Matrix */}
              <div className="p-3 bg-amber-50/40 border border-amber-200/70 rounded-lg space-y-2.5">
                <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest">⚖️ Unit Conversion & Stock Quantifier</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-amber-900 uppercase mb-0.5">Primary (Bulk)</label>
                    <select
                      className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-semibold text-gray-800"
                      value={productForm.primary_unit}
                      onChange={(e) => setProductForm({...productForm, primary_unit: e.target.value})}
                    >
                      <option value="Pcs">Pieces (Pcs)</option>
                      <option value="Kg">Kilogram (Kg)</option>
                      <option value="Box">Box / Carton</option>
                      <option value="Bag">Bag / Sack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-amber-900 uppercase mb-0.5">Secondary (Sale)</label>
                    <select
                      className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-semibold text-gray-800"
                      value={productForm.secondary_unit}
                      onChange={(e) => setProductForm({...productForm, secondary_unit: e.target.value})}
                    >
                      <option value="Pcs">Pieces (Pcs)</option>
                      <option value="Kg">Kilogram (Kg)</option>
                      <option value="Gram">Gram (g)</option>
                      <option value="Packet">Packet</option>
                      <option value="Ltr">Litre (Ltr)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-amber-900 uppercase mb-0.5">Multiplier Rate</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                      value={productForm.conversion_multiplier === 0 ? '' : productForm.conversion_multiplier}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setProductForm({...productForm, conversion_multiplier: val === '' ? 0 : val});
                        }
                      }}
                      onBlur={(e) => {
                        setProductForm({...productForm, conversion_multiplier: parseFloat(e.target.value) || 1});
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Matrix */}
              <div className="grid grid-cols-3 gap-2 bg-blue-50/30 p-2.5 border border-blue-100 rounded-lg">
                <div>
                  <label className="block text-[9px] font-black text-blue-900 uppercase mb-0.5">Bulk Pur. Rate</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    value={productForm.purchase_rate_bulk === 0 ? '' : productForm.purchase_rate_bulk}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setProductForm({...productForm, purchase_rate_bulk: val === '' ? 0 : val});
                      }
                    }}
                    onBlur={(e) => {
                      setProductForm({...productForm, purchase_rate_bulk: parseFloat(e.target.value) || 0});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-blue-900 uppercase mb-0.5">Selling Price *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    value={productForm.selling_rate_retail === 0 ? '' : productForm.selling_rate_retail}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setProductForm({...productForm, selling_rate_retail: val === '' ? 0 : val});
                      }
                    }}
                    onBlur={(e) => {
                      setProductForm({...productForm, selling_rate_retail: parseFloat(e.target.value) || 0});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-blue-900 uppercase mb-0.5">Floor Min Rate</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                    value={productForm.min_selling_rate === 0 ? '' : productForm.min_selling_rate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setProductForm({...productForm, min_selling_rate: val === '' ? 0 : val});
                      }
                    }}
                    onBlur={(e) => {
                      setProductForm({...productForm, min_selling_rate: parseFloat(e.target.value) || 0});
                    }}
                  />
                </div>
              </div>

              {/* Risk Control parameters */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-gray-700 uppercase mb-0.5">GST Slab (%)</label>
                  <select
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-bold text-gray-800"
                    value={productForm.gst_percentage}
                    onChange={(e) => setProductForm({...productForm, gst_percentage: parseInt(e.target.value) || 0})}
                  >
                    <option value="0">0% Exempt</option>
                    <option value="5">5% Standard</option>
                    <option value="12">12% Mid</option>
                    <option value="18">18% High</option>
                    <option value="28">28% Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-700 uppercase mb-0.5">Discount %</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                    value={productForm.max_discount_percentage === 0 ? '' : productForm.max_discount_percentage}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setProductForm({...productForm, max_discount_percentage: val === '' ? 0 : val});
                      }
                    }}
                    onBlur={(e) => {
                      setProductForm({...productForm, max_discount_percentage: parseFloat(e.target.value) || 0});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-700 uppercase mb-0.5">Low Stock Alert</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full p-1 border border-gray-300 rounded text-xs bg-white font-mono font-medium text-gray-900 focus:outline-none focus:border-blue-500"
                    value={productForm.min_stock_alert === 0 ? '' : productForm.min_stock_alert}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setProductForm({...productForm, min_stock_alert: val === '' ? 0 : val});
                      }
                    }}
                    onBlur={(e) => {
                      setProductForm({...productForm, min_stock_alert: parseFloat(e.target.value) || 10});
                    }}
                  />
                </div>
              </div>

              {/* Initial Stock Parameters */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Initial Stock Level</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Opening quantity..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900 font-mono font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
                    value={productForm.current_stock_kg === 0 ? '' : productForm.current_stock_kg}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setProductForm({...productForm, current_stock_kg: val === '' ? 0 : val});
                      }
                    }}
                    onBlur={(e) => {
                      setProductForm({...productForm, current_stock_kg: parseFloat(e.target.value) || 0});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Visibility Status</label>
                  <select
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
                    value={productForm.is_credit_allowed ? 'yes' : 'no'}
                    onChange={(e) => setProductForm({...productForm, is_credit_allowed: e.target.value === 'yes'})}
                  >
                    <option value="yes">🔓 Visible to Buyer</option>
                    <option value="no">🔒 Hidden from Buyer</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-[11px] uppercase tracking-wider transition-all shadow-md"
              >
                {isEditing ? '💾 Apply Property Changes' : '📦 Commit Stock To Catalog'}
              </button>
            </form>
          )}

          {activeTab === 'groups' && (
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest border-b pb-1.5 border-gray-200">
                Create Dynamic Account-Inventory Link
              </h3>
              
              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Select Database Main/Sub Ledger *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-sm"
                  onChange={(e) => {
                    const selected = dbLedgers.find(l => l.ledger_code === e.target.value);
                    if(selected) {
                      setGroupForm({...groupForm, name: selected.ledger_name, code: selected.ledger_code});
                    }
                  }}
                >
                  <option value="">{isLoadingLedgers ? 'Fetching Database Ledgers...' : '-- Choose Ledger From Database --'}</option>
                  {dbLedgers.map(l => (
                    <option key={l.id} value={l.ledger_code}>{l.ledger_code} - {l.ledger_name} ({l.ledger_group})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Category Profile Title</label>
                <input
                  type="text"
                  required
                  placeholder="Auto-filled from ledger name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 font-bold focus:outline-none focus:border-blue-500 shadow-2xs"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Ledger Blueprint Code</label>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Auto-filled code..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-gray-100 text-gray-600 font-mono font-bold cursor-not-allowed shadow-2xs"
                    value={groupForm.code}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-700 uppercase mb-1 tracking-wider">Statutory HSN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1006"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 font-mono focus:outline-none focus:border-blue-500 shadow-2xs"
                    value={groupForm.hsn_code}
                    onChange={(e) => setGroupForm({...groupForm, hsn_code: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-[11px] uppercase tracking-wider transition-all shadow-md"
              >
                🔗 Establish Ledger-Stock Mapping
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COMPONENT: LIVE REGISTER MATRIX */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Live Inventory Master Registry</span>
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-mono font-bold text-[10px]">
              Active Items Indexed: {products.length}
            </span>
          </div>

          {isLoadingProducts ? (
            <div className="text-center py-10 text-xs font-bold text-gray-500">
              🔄 Pulling synchronized items from Database...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <span className="text-3xl block mb-2">📦</span>
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">No Products Deployed In Current Catalog</h4>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                Use the left configurations console to link products with active ledger accounts and spin up new warehouse inventory.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-2xs bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 text-[10px] font-black uppercase border-b border-gray-200 tracking-wider">
                    <th className="p-2.5">Product Particulars & Category</th>
                    <th className="p-2.5">Pricing Matrix (INR)</th>
                    <th className="p-2.5 text-center">Discount</th>
                    <th className="p-2.5 text-center">Buyer View</th>
                    <th className="p-2.5 text-right">Available Stock</th>
                    <th className="p-2.5 text-center">Operations</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-600 divide-y divide-gray-100 font-medium">
                  {products.map((p) => {
                    const matchedGroup = inventoryGroups.find(g => g.id === p.group_id);
                    const isLowStock = p.current_stock_kg <= p.min_stock_alert;

                    return (
                      <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${isLowStock ? 'bg-red-50/30' : ''}`}>
                        <td className="p-2.5">
                          <span className="block font-bold text-gray-900 text-sm">{p.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                            <span className="font-mono text-gray-400 font-bold bg-gray-100 px-1 rounded">{p.sku || 'NO-SKU'}</span>
                            <span className="text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.2 border border-blue-100 rounded">
                              🔗 Linked Head: {matchedGroup ? `${matchedGroup.code} (${matchedGroup.name})` : 'Linked to Master Shop'}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] space-y-0.5">
                          <span className="block text-blue-700 font-bold">Price: <b>₹{p.selling_rate_retail}</b>/{p.secondary_unit}</span>
                        </td>
                        <td className="p-2.5 text-center space-y-0.5">
                          <span className="block text-[11px] text-purple-700 font-bold">{p.max_discount_percentage}% Max</span>
                        </td>
                        <td className="p-2.5 text-center">
                          {p.is_credit_allowed ? (
                            <span className="text-emerald-600 text-xs font-bold">🔓 Public</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black rounded-full uppercase tracking-tighter">🔒 Hidden</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          <span className={`block font-bold text-sm ${isLowStock ? 'text-red-600' : 'text-blue-700'}`}>
                            {p.current_stock_kg} {p.secondary_unit}
                          </span>
                          {isLowStock && <span className="text-[9px] text-red-500 font-bold block">⚠️ Low Stock Alert</span>}
                        </td>
                        <td className="p-2.5 text-center">
                          <button 
                            type="button"
                            onClick={() => handleEditClick(p)}
                            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-bold text-[11px] tracking-wide transition-all shadow-sm"
                          >
                            📝 Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}