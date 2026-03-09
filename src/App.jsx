import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, MessageCircle, Clock, Star, Phone, MapPin } from 'lucide-react';

// === PENTING: GANTIKAN DENGAN CONFIG FIREBASE ANDA SENDIRI ===
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
  const [order, setOrder] = useState({ item: '', quantity: 1, name: '', phone: '' });
  const [status, setStatus] = useState('');

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!order.item) {
      setStatus('Sila pilih produk atau servis.');
      return;
    }
    
    setStatus('Sedang menghantar tempahan...');
    try {
      await addDoc(collection(db, "orders"), {
        ...order,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      setStatus('Tempahan berjaya! Jackfer akan hubungi anda segera.');
      setOrder({ item: '', quantity: 1, name: '', phone: '' });
    } catch (error) {
      console.error("Error: ", error);
      setStatus('Gagal menghantar. Sila semak sambungan internet anda.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <header className="bg-blue-600 text-white py-12 px-4 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold mb-2">Bisnes Jackfer</h1>
        <p className="text-blue-100 text-lg">Pakar Jus Segar & Steering Specialist</p>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 grid md:grid-cols-2 gap-8">
        {/* Bahagian Borang Tempahan */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> Borang Tempahan
          </h2>
          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input 
                type="text" 
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={order.name}
                onChange={(e) => setOrder({...order, name: e.target.value})}
                placeholder="Nama penuh anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No. Telefon</label>
              <input 
                type="tel" 
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={order.phone}
                onChange={(e) => setOrder({...order, phone: e.target.value})}
                placeholder="Contoh: 0123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Servis/Produk</label>
              <select 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={order.item}
                onChange={(e) => setOrder({...order, item: e.target.value})}
                required
              >
                <option value="">-- Klik untuk Pilih --</option>
                <optgroup label="Minuman Segar">
                  <option value="Jus Epal">Jus Epal Hijau</option>
                  <option value="Jus Oren">Jus Oren Sunkist</option>
                </optgroup>
                <optgroup label="Servis Kenderaan">
                  <option value="Steering Massage">Steering Massage Treatment</option>
                  <option value="Steering Checkup">Pemeriksaan Steering</option>
                </optgroup>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              Hantar Sekarang
            </button>
          </form>
          {status && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-center text-sm font-medium border border-blue-100">
              {status}
            </div>
          )}
        </section>

        {/* Bahagian Info Kedai */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4">Kenapa Pilih Jackfer?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Star className="text-yellow-500 shrink-0" size={20} />
                <span>Bahan 100% asli dan segar setiap hari.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="text-green-500 shrink-0" size={20} />
                <span>Servis pantas dan dijamin puas hati.</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-red-500 shrink-0" size={20} />
                <span>Lokasi strategik dan mudah dikunjungi.</span>
              </li>
            </ul>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Hubungi Kami</p>
              <p className="text-lg font-bold text-slate-800">012-XXXXXXX</p>
            </div>
            <Phone className="text-blue-600" size={32} />
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-slate-400 text-sm">
        <p>© 2026 Bisnes Jackfer. Hak Cipta Terpelihara.</p>
      </footer>
    </div>
  );
};

export default App;
