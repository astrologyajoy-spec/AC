import Link from 'next/link';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* পাবলিক হেডার */}
      <header className="w-full bg-slate-900/50 backdrop-blur border-b border-slate-800 fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-500">
            Easy Ledger
          </Link>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="#features">Features</Link>
            <Link href="#stats">Stats</Link>
            <Link href="#pricing">Pricing</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/shop_admin/login" className="text-sm font-medium text-slate-300">
              Sign In
            </Link>
            <Link href="/register" className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold">
              Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
}