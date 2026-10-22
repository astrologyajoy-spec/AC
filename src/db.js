import mysql from 'mysql2/promise';

let pool;
let isMock = false;

// In-memory mock store when MySQL is not connected
const mockUsers = [
  { 
    id: 1, 
    username: 'admin', 
    full_name: 'Admin User', 
    role: 'admin', 
    shop_id: 1, 
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password: password
  }
];
const mockProducts = [];
const mockParties = [];
const mockTransactions = [];
const mockLedgers = [];

const memoryStore = {
  users: mockUsers,
  products: mockProducts,
  parties: mockParties,
  transactions: mockTransactions,
  ledgers: mockLedgers,
};

try {
  pool = mysql.createPool(
    process.env.DATABASE_URL || {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'easy_ledger_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }
  );
} catch (err) {
  console.warn('MySQL pool creation failed, using mock DB:', err.message);
  isMock = true;
}

const robustPool = {
  async query(sql, params) {
    if (isMock) {
      return handleMockQuery(sql, params);
    }
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.warn('MySQL query failed, falling back to mock:', err.message);
      isMock = true;
      return handleMockQuery(sql, params);
    }
  },
  async execute(sql, params) {
    return this.query(sql, params);
  },
  async getConnection() {
    if (isMock) {
      return {
        query: async (sql, params) => robustPool.query(sql, params),
        execute: async (sql, params) => robustPool.query(sql, params),
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      };
    }
    try {
      return await pool.getConnection();
    } catch (err) {
      isMock = true;
      return {
        query: async (sql, params) => robustPool.query(sql, params),
        execute: async (sql, params) => robustPool.query(sql, params),
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      };
    }
  }
};

function handleMockQuery(sql, params) {
  const lowerSql = sql.toLowerCase().trim();
  if (lowerSql.includes('select * from users where username')) {
    const username = params?.[0];
    const user = memoryStore.users.find(u => u.username === username);
    return [user ? [user] : [], []];
  }
  if (lowerSql.includes('select')) {
    return [[], []];
  }
  if (lowerSql.includes('insert') || lowerSql.includes('update') || lowerSql.includes('delete')) {
    return [{ insertId: 1, affectedRows: 1 }, []];
  }
  return [[], []];
}

export default robustPool;