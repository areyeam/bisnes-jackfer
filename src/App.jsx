import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, MessageCircle, Clock } from 'lucide-react';

// GANTIKAN DENGAN CONFIG FIREBASE ANDA SENDIRI
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "bisnes-jackfer.firebaseapp.com",
  projectId: "bisnes-jackfer",
  storageBucket: "bisnes-jackfer.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [order, setOrder] = useState({ item: '', quantity: 1, name: '' });
  const [status, setStatus] = useState('');

  const handleOrder = async (e) => {
    e.preventDefault();
    setStatus('Sedang menghantar...');
    try {
      await addDoc(collection(db, "orders"), {
        ...order,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      setStatus('Order berjaya dihantar! Jackfer akan hubungi anda.');
      setOrder({ item: '', quantity: 1, name: '' });
    } catch (error) {
      console.error("Error: ", error);
      setStatus('Gagal menghantar order. Sila cuba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Bisnes Jackfer</h1>
        <p className="text-slate-500">Jus Segar & Massage Steering Specialist</p>
      </header>

      <main className="mx-auto max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleOrder} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Pelanggan</label>
            <input 
              type="text" 
              required
              className="w-full p-2 border rounded-lg"
              value={order.name}
              onChange={(e) => setOrder({...order, name: e.target.value})}
              placeholder="Masukkan nama anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pilih Produk/Servis</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={order.item}
              onChange={(e) => setOrder({...order, item: e.target.value})}
              required
            >
              <option value="">-- Sila Pilih --</option>
              <option value="Jus Epal">Jus Epal Segar</option>
              <option value="Jus Oren">Jus Oren Segar</option>
              <option value="Steering Massage">Service Steering Massage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kuantiti</label>
            <input 
              type="number" 
              min="1"
              className="w-full p-2 border rounded-lg"
              value={order.quantity}
              onChange={(e) => setOrder({...order, quantity: parseInt(e.target.value)})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart size={20} />
            Hantar Tempahan
          </button>
        </form>

        {status && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center border border-blue-100">
            {status}
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-xs text-slate-400">
        <p>© 2026 Bisnes Jackfer - Dikuasakan oleh Firebase & Vercel</p>
      </footer>
    </div>
  );
};

export default App;
