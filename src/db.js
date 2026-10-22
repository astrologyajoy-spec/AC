import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // আপনার XAMPP-এর পাসওয়ার্ড থাকলে এখানে লিখবেন
  database: 'easy_ledger_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;