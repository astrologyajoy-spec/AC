import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
    let connection;
    try {
        const body = await request.json();
        const { shop_id, ledger_list } = body; 

        if (!ledger_list || ledger_list.length === 0) {
            return NextResponse.json({ success: false, message: "Ledger config list cannot be empty." }, { status: 400 });
        }

        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'easy_ledger_db'
        });

        await connection.beginTransaction();

        // ১. ক্যাশ এবং মেইন ব্যাংক অ্যাকাউন্ট যা সব ব্যবসার জন্য ইন্টারনাল ট্রানজেকশনে বাধ্যতামূলক লাগবে
        const defaultAssets = [
            ['Cash in Hand', 'Asset', 'Direct'],
            ['Main Bank Account', 'Asset', 'Direct']
        ];

        for (let baseAsset of defaultAssets) {
            // যদি ইউজার ভুল করে এগুলো ডিলিটও করে দেয়, তবুও সিস্টেম সেফটির জন্য ব্যাকগ্রাউন্ডে চেক করে অ্যাড করা হবে
            const alreadyExists = ledger_list.some(l => l.name.toLowerCase() === baseAsset[0].toLowerCase());
            if (!alreadyExists) {
                await connection.execute(
                    `INSERT INTO account_ledgers (shop_id, ledger_name, ledger_group, ledger_type) VALUES (?, ?, ?, ?)`,
                    [shop_id, baseAsset[0], baseAsset[1], baseAsset[2]]
                );
            }
        }

        // ২. ইউজারের তৈরি করা কাস্টমাইজড লিস্টটি ডাটাবেজে ইনসার্ট করা
        for (let item of ledger_list) {
            await connection.execute(
                `INSERT INTO account_ledgers (shop_id, ledger_name, ledger_group, ledger_type) VALUES (?, ?, ?, ?)`,
                [shop_id, item.name, item.group, item.type || 'Indirect']
            );
        }

        await connection.commit();
        return NextResponse.json({ success: true, message: "Custom chart of accounts generated successfully." });

    } catch (error) {
        if (connection) await connection.rollback();
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        if (connection) await connection.end();
    }
}