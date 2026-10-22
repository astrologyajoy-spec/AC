'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('Login Successful!');
        
        // 👑 Khub i gurutwopurno line: Header jate 'shop_admin' khuje pay
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_role', data.user.role); 
        
        // Dashboard-e niye jaoa
        window.location.href = '/shop_admin/dashboard';
      } else {
        alert(data.message || 'Login Failed');
      }
    } catch (error) {
      alert('Error logging in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Easy Ledger Login</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
            <input type="text" required placeholder="username" onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
            <input type="password" required placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-4">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}