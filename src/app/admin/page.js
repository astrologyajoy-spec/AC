'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // API থেকে ডাটা নিয়ে আসা
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>লেনদেনের তালিকা</h1>
      
      {/* এখানে আপনার কোডটি বসান */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">তারিখ</th>
              <th className="py-2 px-4 border">বিবরণ</th>
              <th className="py-2 px-4 border">ধরন</th>
              <th className="py-2 px-4 border">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{item.date}</td>
                <td className="py-2 px-4 border">{item.description}</td>
                <td className={`py-2 px-4 border font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.type}
                </td>
                <td className="py-2 px-4 border">৳ {item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}