// src/constants/subLedgerMapper.js

export const SUB_LEDGER_MAPPING = {
  // 1. Assets Sub-Heads
  "A01.02": {
    category: "Bank Account",
    suggested_placeholders: "e.g. SBI Current Account, HDFC ODD Account",
    table_reference: "bank_accounts"
  },
  "A02.01": {
    category: "Inventory / Stock",
    suggested_placeholders: "e.g. HP Laptop, Wireless Mouse, Glossy Paper",
    table_reference: "products"
  },
  "A03.01": {
    category: "Sundry Debtors / Customers",
    suggested_placeholders: "e.g. Amit Kumar (Client), XYZ Retailers",
    table_reference: "parties" // Type: Customer
  },

  // 2. Liabilities Sub-Heads
  "L01.01": {
    category: "Sundry Creditors / Suppliers",
    suggested_placeholders: "e.g. S S Distributors, Dynamic Wholesalers",
    table_reference: "parties" // Type: Supplier
  },
  "L03.01": {
    category: "Secured Bank Loans / CC Accounts",
    suggested_placeholders: "e.g. PNB CC A/C - 502100",
    table_reference: "loan_accounts"
  },

  // 5. Expenses Sub-Heads (User চাইলে স্পেসিফিক খরচ ভাঙতে পারে)
  "E02.01": {
    category: "Rent Details",
    suggested_placeholders: "e.g. Office Ground Floor Rent, Warehouse Rent",
    table_reference: "generic_sub_ledgers"
  },
  "E02.03": {
    category: "Staff Salaries (Individual)",
    suggested_placeholders: "e.g. Rahul Sharma (Salary), Priya Das (Salary)",
    table_reference: "generic_sub_ledgers"
  }
};