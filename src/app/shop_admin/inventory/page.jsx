// src/app/shop_admin/inventory/page.jsx
'use client';
/* eslint-disable react-hooks/set-state-in-effect */

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
    if (!groupForm.name.trim()) {
      alert('Please enter group name');
      return;
    }
    const newGrp = {
      id: 'grp_' + Date.now(),
      name: groupForm.name,
      code: groupForm.code || 'GRP',
      hsn_code: groupForm.hsn_code || 'N/A'
    };
    setInventoryGroups([...inventoryGroups, newGrp]);
    setGroupForm({ name: '', code: '', hsn_code: '' });
    alert('Inventory Group created successfully!');
  };

  // প্রোডাক্ট সাবমিট বা আপডেট হ্যান্ডলার
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Product name is required');
      return;
    }

    try {
      const payload = {
        shop_id: 1,
        product_name: productForm.name,
        sku_code: productForm.sku || ('SKU-' + Math.floor(1000 + Math.random() * 9000)),
        unit_type: productForm.secondary_unit,
        primary_unit: productForm.primary_unit,
        conversion_multiplier: productForm.conversion_multiplier,
        purchase_rate_bulk: productForm.purchase_rate_bulk,
        selling_price: productForm.selling_rate_retail,
        min_selling_rate: productForm.min_selling_rate,
        gst_percentage: productForm.gst_percentage,
        discount_percent: productForm.max_discount_percentage,
        low_stock_alert: productForm.min_stock_alert,
        is_visible_to_buyer: productForm.is_credit_allowed ? 1 : 0,
        current_stock: productForm.current_stock_kg,
        is_active: 1
      };

      const res = await fetch('/api/admin/inventory/save-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert(isEditing ? 'Product updated successfully!' : 'Product saved to database successfully!');
        fetchSavedProducts();
        setProductForm({
          name: '', sku: '', group_id: '', primary_unit: 'Pcs', secondary_unit: 'Pcs',
          conversion_multiplier: 1, purchase_rate_bulk: 0, selling_rate_retail: 0,
          min_selling_rate: 0, gst_percentage: 0, max_discount_percentage: 0,
          min_stock_alert: 10, is_credit_allowed: true, current_stock_kg: 0
        });
        setIsEditing(false);
        setEditingProductId(null);
      } else {
        alert('Failed to save product: ' + data.message);
      }
    } catch (err) {
      console.error('Save product error:', err);
      alert('Server error while saving product.');
    }
  };

  const handleEditProduct = (prod) => {
    setProductForm(prod);
    setIsEditing(true);
    setEditingProductId(prod.id);
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Inventory & Stock Master</h1>
            <p className="text-xs text-slate-400">Manage products, SKUs, multi-units and groups.</p>
          </div>
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('products')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              📦 Products & Items ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('groups')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'groups' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🏷️ Inventory Groups ({inventoryGroups.length})
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-8">
            {/* Product Form */}
            <form onSubmit={handleProductSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="e.g. Basmati Rice 25kg" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU / Barcode</label>
                  <input 
                    type="text" 
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    placeholder="SKU-1001" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Inventory Group</label>
                  <select 
                    value={productForm.group_id}
                    onChange={(e) => setProductForm({...productForm, group_id: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Select Group --</option>
                    {inventoryGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Unit</label>
                  <select 
                    value={productForm.primary_unit}
                    onChange={(e) => setProductForm({...productForm, primary_unit: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Bag">Bag</option>
                    <option value="Box">Box</option>
                    <option value="Litre">Litre</option>
                    <option value="Meter">Meter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Purchase Rate (Bulk)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={productForm.purchase_rate_bulk}
                    onChange={(e) => setProductForm({...productForm, purchase_rate_bulk: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Selling Rate (Retail)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={productForm.selling_rate_retail}
                    onChange={(e) => setProductForm({...productForm, selling_rate_retail: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GST %</label>
                  <input 
                    type="number" 
                    value={productForm.gst_percentage}
                    onChange={(e) => setProductForm({...productForm, gst_percentage: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Current Stock</label>
                  <input 
                    type="number" 
                    step="any"
                    value={productForm.current_stock_kg}
                    onChange={(e) => setProductForm({...productForm, current_stock_kg: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setProductForm({ name: '', sku: '', group_id: '', primary_unit: 'Pcs', secondary_unit: 'Pcs', conversion_multiplier: 1, purchase_rate_bulk: 0, selling_rate_retail: 0, min_selling_rate: 0, gst_percentage: 0, max_discount_percentage: 0, min_stock_alert: 10, is_credit_allowed: true, current_stock_kg: 0 }); }}
                    className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold shadow transition-all"
                >
                  {isEditing ? 'Update Product' : 'Save Product →'}
                </button>
              </div>
            </form>

            {/* Products List Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">📦 Saved Products ({products.length})</h2>
              {isLoadingProducts ? (
                <p className="text-xs text-slate-400">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-xs text-slate-400">No products added yet.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">SKU</th>
                      <th className="pb-3 font-semibold">Unit</th>
                      <th className="pb-3 font-semibold">Purchase Price</th>
                      <th className="pb-3 font-semibold">Selling Price</th>
                      <th className="pb-3 font-semibold">GST %</th>
                      <th className="pb-3 font-semibold">Stock</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-bold text-white">{p.name}</td>
                        <td className="py-3 font-mono text-slate-300">{p.sku}</td>
                        <td className="py-3 text-slate-300">{p.primary_unit}</td>
                        <td className="py-3 text-slate-300">₹{p.purchase_rate_bulk}</td>
                        <td className="py-3 text-emerald-400 font-bold">₹{p.selling_rate_retail}</td>
                        <td className="py-3 text-slate-300">{p.gst_percentage}%</td>
                        <td className="py-3 font-bold text-white">{p.current_stock_kg}</td>
                        <td className="py-3 text-right space-x-2">
                          <button onClick={() => handleEditProduct(p)} className="text-blue-400 hover:underline">Edit</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-8">
            {/* Group Form */}
            <form onSubmit={handleCreateGroup} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">🏷️ Create Inventory Group</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Group Name *</label>
                  <input 
                    type="text" 
                    required
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                    placeholder="e.g. Groceries, Electronics" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Group Code</label>
                  <input 
                    type="text" 
                    value={groupForm.code}
                    onChange={(e) => setGroupForm({...groupForm, code: e.target.value})}
                    placeholder="GROC" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">HSN Code</label>
                  <input 
                    type="text" 
                    value={groupForm.hsn_code}
                    onChange={(e) => setGroupForm({...groupForm, hsn_code: e.target.value})}
                    placeholder="1006" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold shadow">
                  Save Group →
                </button>
              </div>
            </form>

            {/* Groups Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">🏷️ Inventory Groups ({inventoryGroups.length})</h2>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Group ID</th>
                    <th className="pb-3 font-semibold">Group Name</th>
                    <th className="pb-3 font-semibold">Code</th>
                    <th className="pb-3 font-semibold">HSN Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventoryGroups.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono text-slate-400">{g.id}</td>
                      <td className="py-3 font-bold text-white">{g.name}</td>
                      <td className="py-3 text-slate-300">{g.code}</td>
                      <td className="py-3 text-slate-300">{g.hsn_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}