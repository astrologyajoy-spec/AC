import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easy_ledger_db',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing Invoice ID' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // ১. প্রথমে sales_invoices টেবিলে চেক করা
    let [invoiceRows] = await connection.execute(
      'SELECT * FROM sales_invoices WHERE id = ?',
      [id]
    );

    let invoice = null;
    let itemRows = [];

    if (invoiceRows.length > 0) {
      // যদি সেলস বা ইনভয়েস টেবিলে ডেটা পাওয়া যায়
      invoice = invoiceRows[0];
      
      const [items] = await connection.execute(
        'SELECT * FROM sales_invoice_items WHERE invoice_id = ?',
        [id]
      );
      itemRows = items;
    } else {
      // ২. [FALLBACK] যদি সেলস টেবিলে না পায়, তবে purchase_ledger থেকে সাপ্লায়ারের ডিটেইলস সহ জয়েন করে ডেটা আনা
      const [purchaseRows] = await connection.execute(
        `SELECT p.*, pt.party_name as supplier_name, pt.mobile as supplier_phone, pt.gstin as supplier_gstin, prod.product_name 
         FROM purchase_ledger p
         LEFT JOIN parties pt ON p.supplier_id = pt.id
         LEFT JOIN products_inventory prod ON p.product_id = prod.id
         WHERE p.id = ?`,
        [id]
      );

      if (purchaseRows.length === 0) {
        await connection.end();
        return NextResponse.json({ success: false, message: 'Transaction record not found in database' }, { status: 404 });
      }

      const pRow = purchaseRows[0];
      
      // ফ্রন্টএন্ড ভিউ মেলাবার জন্য অবজেক্ট ম্যাপিং
      invoice = {
        id: pRow.id,
        invoice_number: `PUR-VOUCHER-${pRow.id}`, 
        invoice_date: pRow.purchase_date,
        v_type: 'PURCHASE',
        customer_name: pRow.supplier_name || 'Unknown Supplier',
        customer_phone: pRow.supplier_phone || '',
        customer__gstin: pRow.supplier_gstin || '',
        place_of_supply: 'West Bengal', 
        is_gst_enabled: pRow.gst_percent > 0 ? 1 : 0,
        gross_amount: parseFloat(pRow.total_landing_cost || 0),
        total_discount: 0,
        round_off: 0,
        grand_total: parseFloat(pRow.total_landing_cost || 0),
        payment_mode: 'CREDIT', 
        cash_paid_amount: 0,
        bank_paid_amount: 0,
        due_amount: parseFloat(pRow.total_landing_cost || 0)
      };

      // প্রোডাক্ট আইটেম অ্যারে তৈরি
      itemRows = [{
        id: pRow.id,
        product_id: pRow.product_id,
        product_name: pRow.product_name || `Product Code: ${pRow.product_id}`,
        sku: '',
        unit_type: 'Pcs',
        qty: pRow.quantity,
        mrp_or_selling_rate: pRow.basic_rate,
        gst_percentage: pRow.gst_percent,
        item_grand_total: pRow.total_landing_cost
      }];
    }

    // ৩. shops টেবিল থেকে প্রথম অ্যাক্টিভ দোকানের প্রোফাইল তুলে আনা
    const [shopRows] = await connection.execute('SELECT * FROM shops LIMIT 1');
    const shop = shopRows.length > 0 ? shopRows[0] : null;

    await connection.end();

    return NextResponse.json({
      success: true,
      invoice,
      items: itemRows,
      shop
    });

  } catch (error) {
    console.error('Print Data Fetch Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}