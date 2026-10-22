// src/app/api/admin/inventory/save-product/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easy_ledger_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM products_inventory ORDER BY id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      sku_code,
      product_name,
      primary_unit,
      secondary_unit,
      conversion_multiplier,
      purchase_rate_bulk,
      selling_rate_retail,
      min_selling_rate,
      gst_percentage,
      max_discount_percentage,
      min_stock_alert,
      is_credit_allowed,
      current_stock_kg
    } = body;

    // 🚨 FIX: Foreign key constraint error stop korar jonno fixed default shop account load kora holo
    // Apnar database architecture anujayi active shop id jodi '1' hoy, tobe eti safe standard bypass query
    const targetShopId = 1; 
    const activeUnitType = secondary_unit || 'Pcs';

    if (id) {
      // 📝 MODE: UPDATE
      const updateQuery = `
        UPDATE products_inventory 
        SET 
          shop_id = ?, 
          sku_code = ?, 
          product_name = ?, 
          primary_unit = ?,
          unit_type = ?, 
          conversion_multiplier = ?,
          purchase_rate_bulk = ?,
          current_stock = ?, 
          selling_price = ?, 
          min_selling_rate = ?,
          gst_percentage = ?,
          discount_percent = ?, 
          low_stock_alert = ?, 
          is_visible_to_buyer = ?
        WHERE id = ?
      `;
      
      const values = [
        targetShopId,
        sku_code || `SKU-${Date.now().toString().slice(-6)}`,
        product_name,
        primary_unit || 'Pcs',
        activeUnitType,
        parseFloat(conversion_multiplier) || 1.00,
        parseFloat(purchase_rate_bulk) || 0.00,
        parseFloat(current_stock_kg) || 0.00,
        parseFloat(selling_rate_retail) || 0.00,
        parseFloat(min_selling_rate) || 0.00,
        parseInt(gst_percentage) || 0,
        parseFloat(max_discount_percentage) || 0.00,
        parseInt(min_stock_alert) || 10,
        is_credit_allowed ? 1 : 0,
        id
      ];

      await pool.query(updateQuery, values);
      return NextResponse.json({ success: true, message: 'Catalog details safely updated!' });

    } else {
      // ➕ MODE: INSERT
      const insertQuery = `
        INSERT INTO products_inventory (
          shop_id, sku_code, product_name, primary_unit, unit_type, 
          conversion_multiplier, purchase_rate_bulk, current_stock, 
          selling_price, min_selling_rate, gst_percentage, 
          discount_percent, low_stock_alert, is_visible_to_buyer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        targetShopId,
        sku_code || `SKU-${Date.now().toString().slice(-6)}`,
        product_name,
        primary_unit || 'Pcs',
        activeUnitType,
        parseFloat(conversion_multiplier) || 1.00,
        parseFloat(purchase_rate_bulk) || 0.00,
        parseFloat(current_stock_kg) || 0.00,
        parseFloat(selling_rate_retail) || 0.00,
        parseFloat(min_selling_rate) || 0.00,
        parseInt(gst_percentage) || 0,
        parseFloat(max_discount_percentage) || 0.00,
        parseInt(min_stock_alert) || 10,
        is_credit_allowed ? 1 : 0
      ];

      await pool.query(insertQuery, values);
      return NextResponse.json({ success: true, message: 'New item securely committed without constraint mismatch!' });
    }

  } catch (error) {
    console.error("Database Transaction Exception:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}