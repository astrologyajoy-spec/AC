import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        {/* এখানে কোনো হেডার বা সাইডবার থাকবে না, শুধু children থাকবে */}
        {children}
      </body>
    </html>
  );
}