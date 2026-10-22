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
    const {
      invoice_number, invoice_date, customer_sub_id, customer_name,
      customer_phone, customer__gstin, place_of_supply, is_gst_enabled,
      gross_amount, total_discount, total_taxable_value, total_cgst,
      total_sgst, total_igst, round_off, grand_total, payment_mode,
      cash_paid_amount, bank_paid_amount, due_amount, items
    } = body;

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction(); // সিকিউর ডাবল-এন্ট্রি সেফ ট্র্যানজ্যাকশন শুরু[cite: 11]

    // ১. মাস্টার ইনভয়েস টেবিলে ডেটা এন্ট্রি[cite: 11]
    const invoiceQuery = `
      INSERT INTO sales_invoices (
        invoice_number, invoice_date, customer_sub_id, customer_name, 
        customer_phone, customer__gstin, place_of_supply, is_gst_enabled, 
        gross_amount, total_discount, total_taxable_value, 
        total_cgst, total_sgst, total_igst, round_off, grand_total, 
        payment_mode, cash_paid_amount, bank_paid_amount, due_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [invoiceResult] = await connection.execute(invoiceQuery, [
      invoice_number, invoice_date, customer_sub_id || null, customer_name || 'Walk-in Customer',
      customer_phone || null, customer__gstin || null, place_of_supply || 'West Bengal', is_gst_enabled,
      gross_amount, total_discount, total_taxable_value, total_cgst, total_sgst, total_igst, round_off,
      grand_total, payment_mode, cash_paid_amount, bank_paid_amount, due_amount
    ]);
    
    const insertedInvoiceId = invoiceResult.insertId;

    // ২. চাইল্ড আইটেম লুপ চালিয়ে 'sales_invoice_items' টেবিলে সেভ করা[cite: 11]
    if (items && items.length > 0) {
      const itemQuery = `
        INSERT INTO sales_invoice_items (
          invoice_id, product_id, product_name, sku, unit_type, qty, 
          mrp_or_selling_rate, discount_amount, taxable_value, 
          gst_percentage, cgst_amount, sgst_amount, igst_amount, item_grand_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const item of items) {
        await connection.execute(itemQuery, [
          insertedInvoiceId, String(item.product_id), item.product_name, item.sku || null, item.unit_type || 'Pcs',
          item.qty, item.mrp_or_selling_rate, item.discount_amount, item.taxable_value,
          item.gst_percentage, item.cgst_amount, item.sgst_amount, item.igst_amount, item.item_grand_total
        ]);
      }
    }

    await connection.commit(); // সবকিছু ঠিক থাকলে ডাটাবেজে স্থায়ীভাবে সেভ হবে[cite: 11]
    await connection.end();

    return NextResponse.json({ success: true, message: "Transaction committed securely!" }, { status: 200 });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // কোনো এরর হলে ডাটাবেজ আগের অবস্থায় ফেরত যাবে[cite: 11]
      await connection.end();
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}