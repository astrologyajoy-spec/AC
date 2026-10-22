import { NextResponse } from 'next/server';
// import db from '@/lib/db'; // আপনার ডাটাবেস কানেকশন পুল

export async function GET(request, { params }) {
  // ফ্রন্টএন্ডের সাথে মিল রেখে এখানে [reportSlug] করা হলো
  const { reportSlug } = params; 
  
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  try {
    let reportData = {};

    // 🔄 reportSlug অনুযায়ী ডাটা ফিল্টারিং
    switch (reportSlug) {
      case 'balance-sheet':
        // 💡 নোট: এখানে পরবর্তীতে আপনার ডাটাবেসের `account_ledgers` টেবিল থেকে 
        // Asset, Liability এবং Capital গ্রপগুলোর SUM() নিয়ে রিয়েল ডাটা পুশ করবেন।
        reportData = {
          title: "Balance Sheet (উদ্বর্তপত্র)",
          asOfDate: toDate || new Date().toLocaleDateString('en-IN'),
          assets: [
            { account_name: 'Cash-in-Hand (নগদ তহবিল)', amount: 45000.00 },
            { account_name: 'Bank Accounts (ব্যাংক ব্যালেন্স)', amount: 125000.00 },
            { account_name: 'Closing Stock (সমাপনী মজুদ)', amount: 380000.00 }
          ],
          liabilities: [
            { account_name: 'Sundry Creditors (বিবিধ পাওনাদার)', amount: 65000.00 },
            { account_name: 'GST Payable', amount: 12000.00 }
          ],
          equity: [
            { account_name: 'Capital Account (মূলধন)', amount: 415000.00 },
            { account_name: 'Retained Earnings (অবন্টিত মুনাফা)', amount: 58000.00 }
          ],
          totalAssets: 550000.00,
          totalLiabilitiesAndEquity: 550000.00
        };
        break;

      case 'cash-book':
        reportData = {
          title: "Cash Book (নগদ খাতা)",
          period: `${fromDate || ''} to ${toDate || ''}`,
          openingBalance: 25000.00,
          closingBalance: 45000.00,
          transactions: [
            { date: '2026-06-01', particular: 'To Opening Balance', debit: 25000, credit: 0 },
            { date: '2026-06-05', particular: 'By Purchase (Cash)', debit: 0, credit: 5000 },
            { date: '2026-06-10', particular: 'To Cash Sales', debit: 25000, credit: 0 },
          ]
        };
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Report type '${reportSlug}' not found.` },
          { status: 404 }
        );
    }

    return NextResponse.json({
      success: true,
      reportSlug,
      data: reportData
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}