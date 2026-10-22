// src/constants/globalAccounts.js

export const GLOBAL_ACCOUNTS_TEMPLATE = [
  // ==========================================
  // 1. ASSETS (A) - Default Debit Balance
  // ==========================================
  { code: "A01.01", type: "Asset", default_name: "Cash in Hand", is_custom_slot: false },
  { code: "A01.02", type: "Asset", default_name: "Bank Account", is_custom_slot: false },
  { code: "A01.03", type: "Asset", default_name: "Petty Cash", is_custom_slot: false },
  
  { code: "A02.01", type: "Asset", default_name: "Inventory / Stock", is_custom_slot: false },
  
  { code: "A03.01", type: "Asset", default_name: "Sundry Debtors / Accounts Receivable", is_custom_slot: false },
  { code: "A03.02", type: "Asset", default_name: "Advance Payments / Deposits", is_custom_slot: false },
  { code: "A03.03", type: "Asset", default_name: "TDS / Tax Receivable", is_custom_slot: false },

  { code: "A04.01", type: "Asset", default_name: "Office Furniture & Fixtures", is_custom_slot: false },
  { code: "A04.02", type: "Asset", default_name: "Computers & Electronic Equipment", is_custom_slot: false },
  { code: "A04.03", type: "Asset", default_name: "Property / Land & Buildings", is_custom_slot: false },
  
  // New Reserved Slots for Assets
  { code: "A05.01", type: "Asset", default_name: "Unused Custom Asset Slot 1", is_custom_slot: true },
  { code: "A05.02", type: "Asset", default_name: "Unused Custom Asset Slot 2", is_custom_slot: true },

  // ==========================================
  // 2. LIABILITIES (L) - Default Credit Balance
  // ==========================================
  { code: "L01.01", type: "Liability", default_name: "Sundry Creditors / Accounts Payable", is_custom_slot: false },
  { code: "L01.02", type: "Liability", default_name: "Salaries Payable", is_custom_slot: false },
  { code: "L01.03", type: "Liability", default_name: "Outstanding Expenses", is_custom_slot: false },

  { code: "L02.01", type: "Liability", default_name: "Output CGST", is_custom_slot: false },
  { code: "L02.02", type: "Liability", default_name: "Output SGST", is_custom_slot: false },
  { code: "L02.03", type: "Liability", default_name: "Output IGST", is_custom_slot: false },
  { code: "L02.04", type: "Liability", default_name: "Net GST Payable", is_custom_slot: false },

  { code: "L03.01", type: "Liability", default_name: "Secured Bank Loans / CC Account", is_custom_slot: false },
  { code: "L03.02", type: "Liability", default_name: "Unsecured Loans / Personal Borrowings", is_custom_slot: false },
  
  // New Reserved Slots for Liabilities
  { code: "L04.01", type: "Liability", default_name: "Unused Custom Liability Slot 1", is_custom_slot: true },

  // ==========================================
  // 3. EQUITY / CAPITAL (Q) - Default Credit Balance
  // ==========================================
  { code: "Q01.01", type: "Equity", default_name: "Owner's Capital Account", is_custom_slot: false },
  { code: "Q01.02", type: "Equity", default_name: "Owner's Drawings", is_custom_slot: false },
  { code: "Q01.03", type: "Equity", default_name: "Retained Earnings / Balance Brought Forward", is_custom_slot: false },

  // ==========================================
  // 4. INCOME / REVENUE (I) - Default Credit Balance
  // ==========================================
  { code: "I01.01", type: "Income", default_name: "Product Sales Revenue", is_custom_slot: false },
  { code: "I01.02", type: "Income", default_name: "Service & Maintenance Revenue", is_custom_slot: false },
  { code: "I01.03", type: "Income", default_name: "Sales Returns (Contra Income - Debit)", is_custom_slot: false },
  
  { code: "I02.01", type: "Income", default_name: "Discount Received", is_custom_slot: false },
  { code: "I02.02", type: "Income", default_name: "Interest & Other Income", is_custom_slot: false },
  
  // New Reserved Slots for Income
  { code: "I03.01", type: "Income", default_name: "Unused Custom Income Slot 1", is_custom_slot: true },

  // ==========================================
  // 5. EXPENSES (E) - Default Debit Balance
  // ==========================================
  { code: "E01.01", type: "Expense", default_name: "Cost of Goods Purchased", is_custom_slot: false },
  { code: "E01.02", type: "Expense", default_name: "Purchase Returns (Contra Expense - Credit)", is_custom_slot: false },
  { code: "E01.03", type: "Expense", default_name: "Direct Freight & Carriage Inward", is_custom_slot: false },

  { code: "E02.01", type: "Expense", default_name: "Rent / Lease Expense", is_custom_slot: false },
  { code: "E02.02", type: "Expense", default_name: "Electricity & Utility Bills", is_custom_slot: false },
  { code: "E02.03", type: "Expense", default_name: "Staff Salaries & Wages", is_custom_slot: false },
  { code: "E02.04", type: "Expense", default_name: "Office Tea, Snacks & Welfare", is_custom_slot: false },
  { code: "E02.05", type: "Expense", default_name: "Printing, Stationery & Office Supplies", is_custom_slot: false },
  { code: "E02.06", type: "Expense", default_name: "Telephone & Internet Expenses", is_custom_slot: false },
  { code: "E02.07", type: "Expense", default_name: "Travel & Conveyance", is_custom_slot: false },
  { code: "E02.08", type: "Expense", default_name: "Repairs & Maintenance", is_custom_slot: false },
  { code: "E02.09", type: "Expense", default_name: "Marketing & Advertisements", is_custom_slot: false },
  
  { code: "E03.01", type: "Expense", default_name: "Discount Allowed", is_custom_slot: false },
  { code: "E03.02", type: "Expense", default_name: "Bank Charges & Fees", is_custom_slot: false },
  { code: "E03.03", type: "Expense", default_name: "Interest Paid on Loans", is_custom_slot: false },
  { code: "E03.04", type: "Expense", default_name: "Bad Debts Written Off", is_custom_slot: false },
  { code: "E03.05", type: "Expense", default_name: "Depreciation Expense", is_custom_slot: false },
  
  // New Reserved Slots for Expenses
  { code: "E04.01", type: "Expense", default_name: "Unused Custom Expense Slot 1", is_custom_slot: true },
  { code: "E04.02", type: "Expense", default_name: "Unused Custom Expense Slot 2", is_custom_slot: true },
  { code: "E04.03", type: "Expense", default_name: "Unused Custom Expense Slot 3", is_custom_slot: true }
];