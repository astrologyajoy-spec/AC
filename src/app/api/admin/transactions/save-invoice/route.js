// src/app/api/admin/transactions/save-invoice/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easy_ledger_db',
};

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    
    // ফ্রন্টএন্ড থেকে আসা সমস্ত প্যারামিটার অবজেক্ট ডিকনস্ট্রাকশন
    const {
      invoice_number, invoice_date, customer_sub_id, customer_name,
      customer_phone, customer__gstin, place_of_supply, is_gst_enabled,
      gross_amount, total_discount, total_taxable_value, total_cgst,
      total_sgst, total_igst, round_off, grand_total, payment_mode,
      cash_paid_amount, bank_paid_amount, due_amount,
      
      // Control Configuration Matrix
      v_type, voucher_type, inst_type, id_type, inst_no, id_no, 
      rebate_amt, adv_amt, narration, 
      
      items
    } = body;

    // ডাটাবেজ ENUM ম্যাপিং সেফগার্ড
    let mappedVType = v_type || 'SALE';
    const finalVoucherType = voucher_type || v_type;
    if (finalVoucherType === 'PURCHASE') mappedVType = 'PURCHASE';
    else if (finalVoucherType === 'SALES_RETURN') mappedVType = 'S_RET';
    else if (finalVoucherType === 'PURCHASE_RETURN') mappedVType = 'P_RET';
    else if (finalVoucherType === 'DAMAGE_OUT') mappedVType = 'DMG_OUT';

    // ডাটাবেজ কানেকশন তৈরি এবং ট্রানজ্যাকশন স্টার্ট
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    let insertedInvoiceId = null;

    // ==========================================
    // কন্ডিশন ১: যদি ভাউচার টাইপ 'PURCHASE' হয়
    // ==========================================
    if (mappedVType === 'PURCHASE') {
      // পারচেজ এন্ট্রির ক্ষেত্রে প্রতিটি আইটেমকে সরাসরি 'purchase_ledger' টেবিলে পুশ করা হবে
      if (items && items.length > 0) {
        for (const item of items) {
          const qty = parseFloat(item.qty || 0);
          const rate = parseFloat(item.mrp_or_selling_rate || item.rate || 0);
          const gstPercent = parseInt(item.gst_percentage || item.gst_percent || 0);
          const itemGrandTotal = parseFloat(item.item_grand_total || (qty * rate));
          
          // আপনার ডাটাবেজ স্কিমা (purchase_ledger) অনুযায়ী ডাইনামিক ফিল্ড ম্যাপিং
          // ফ্রন্টএন্ড থেকে পাঠানো user_id বা shop_id না থাকলে ডিফল্ট ১ সেট হবে
          const shopId = body.shop_id || 1; 
          const userId = body.user_id || 1;
          const productId = item.product_id;
          const supplierId = customer_sub_id || body.supplier_id || 1; // পারচেজ ফর্মে পার্টি আইডি customer_sub_id তে আসে

          const purchaseQuery = `
            INSERT INTO purchase_ledger (
              shop_id, user_id, product_id, supplier_id, quantity, 
              basic_rate, gst_percent, carrying_cost, total_landing_cost, 
              unit_landing_cost, mrp, purchase_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          // ক্যালকুলেশন ম্যাট্রিক্স
          const basicRate = rate; 
          const totalLandingCost = itemGrandTotal;
          const unitLandingCost = qty > 0 ? (totalLandingCost / qty) : basicRate;
          const mrp = item.mrp || rate; 

          await connection.execute(purchaseQuery, [
            shopId,
            userId,
            productId,
            supplierId,
            qty,
            basicRate,
            gstPercent,
            0.00, // carrying_cost ডিফল্ট ০
            totalLandingCost,
            unitLandingCost,
            mrp,
            invoice_date || new Date().toISOString().split('T')[0]
          ]);
        }
      }
      
      // ট্রানজ্যাকশন শেষ করার জন্য একটি ডামি আইডি পাস করা হচ্ছে রিটার্ন রেসপন্সের জন্য
      insertedInvoiceId = 0; 

    } else {
      // ==========================================
      // কন্ডিশন ২: SALE, S_RET, P_RET, DMG_OUT হলে
      // ==========================================
      const invoiceQuery = `
        INSERT INTO sales_invoices (
          invoice_number, v_type, invoice_date, customer_sub_id, customer_name,
          customer_phone, customer__gstin, place_of_supply, is_gst_enabled,
          gross_amount, total_discount, total_taxable_value, total_cgst,
          total_sgst, total_igst, round_off, grand_total, payment_mode,
          cash_paid_amount, bank_paid_amount, due_amount, inst_type, id_type, 
          inst_no, id_no, rebate_amt, adv_amt, narration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [invoiceResult] = await connection.execute(invoiceQuery, [
        invoice_number, mappedVType, invoice_date, customer_sub_id || null, customer_name || 'Walk-in Customer',
        customer_phone || null, customer__gstin || null, place_of_supply || 'West Bengal', is_gst_enabled ?? 1,
        gross_amount || 0.00, total_discount || 0.00, total_taxable_value || 0.00, total_cgst || 0.00,
        total_sgst || 0.00, total_igst || 0.00, round_off || 0.00, grand_total || 0.00, payment_mode || 'CASH',
        cash_paid_amount || 0.00, bank_paid_amount || 0.00, due_amount || 0.00,
        inst_type || null, id_type || null, inst_no || null, id_no || null, rebate_amt || 0.00, adv_amt || 0.00, narration || null
      ]);

      insertedInvoiceId = invoiceResult.insertId;

      // সেলস চাইল্ড আইটেম ইনসার্ট লজিক
      if (items && items.length > 0) {
        const itemQuery = `
          INSERT INTO sales_invoice_items (
            invoice_id, product_id, product_name, sku, unit_type,
            qty, mrp_or_selling_rate, discount_amount, taxable_value,
            gst_percentage, cgst_amount, sgst_amount, igst_amount, item_grand_total, is_free
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const item of items) {
          const qty = parseFloat(item.qty || 0);
          const rate = parseFloat(item.mrp_or_selling_rate || item.rate || 0);
          const discount = parseFloat(item.discount_amount || 0);
          const itemTotal = parseFloat(item.item_grand_total || (qty * rate - discount));
          
          let finalGstPercent = parseInt(item.gst_percentage || 0);
          let taxableValue = itemTotal;
          let cgst = 0, sgst = 0, igst = 0;

          if (is_gst_enabled === 1 && finalGstPercent > 0) {
            taxableValue = itemTotal / (1 + (finalGstPercent / 100));
            const totalTax = itemTotal - taxableValue;

            if (!place_of_supply || place_of_supply.toLowerCase() === 'west bengal') {
              cgst = totalTax / 2;
              sgst = totalTax / 2;
              igst = 0;
            } else {
              cgst = 0;
              sgst = 0;
              igst = totalTax;
            }
          }

          await connection.execute(itemQuery, [
            insertedInvoiceId, 
            String(item.product_id), 
            item.product_name || item.name, 
            item.sku || null, 
            item.unit_type || 'Pcs',
            qty, 
            rate, 
            discount, 
            taxableValue,
            finalGstPercent, 
            cgst, 
            sgst, 
            igst, 
            itemTotal,
            item.is_free || 0
          ]);
        }
      }
    }

    // সমস্ত কোয়েরি সফল হলে ডাটাবেজে পার্মানেন্ট সেভ হবে
    await connection.commit(); 
    await connection.end();

    return NextResponse.json({ 
      success: true, 
      message: mappedVType === 'PURCHASE' 
        ? "Purchase items posted successfully to Purchase Ledger" 
        : "Voucher and Items posted successfully to Sales Ledger Matrix", 
      invoice_id: insertedInvoiceId 
    });

  } catch (error) {
    console.error("CRITICAL LEDGER TRANSACTION ERROR:", error);
    if (connection) {
      await connection.rollback();
      await connection.end();
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}