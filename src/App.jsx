import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth,  
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// MENGGUNAKAN IKON STANDARD YANG SELAMAT
import { 
  ShoppingBag, Clock, Trash2, Gift, User, LogOut, ArrowLeft, 
  X, Phone, Lock, Loader2, Landmark, ConciergeBell, 
  ChevronDown, Tag, Activity, Sparkles, MapPin, IdCard, Home, Leaf, Mail, 
  Calendar, CalendarCheck, Waves, LayoutDashboard, Receipt, Plus, TrendingUp, 
  TrendingDown, WifiOff, Trophy, RefreshCcw, Box, Copy, Upload, 
  CheckCircle, Eye, Zap, Play, Check, CreditCard, DollarSign, Search, Filter,
  ChevronRight, Star, Heart, Share2, Info, Settings, Bell, MessageCircle,
  Camera, Map, Navigation, Shield, ShieldCheck, CreditCard as CardIcon
} from 'lucide-react';

// --- Helper untuk Environment Variables (Fix untuk Vercel/Vite) ---
const getEnv = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
  } catch (e) {}
  return "";
};

// --- Konfigurasi Firebase ---
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// --- Initialize Firebase Secara Selamat ---
let app, auth, db;
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase Init Error:", e);
  }
}

const appId = "bisnes-jackfer";

export default function App() {
  // ==========================================
  // STATE LENGKAP (1.3k Line Logic Starts Here)
  // ==========================================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation States
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab, setPrevTab] = useState('home');
  const [showCart, setShowCart] = useState(false);
  
  // Data States
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['Semua', 'Makanan', 'Minuman', 'Snek', 'Dessert']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Order & Cart States
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Profile & Settings
  const [profile, setProfile] = useState({
    name: 'Pelanggan Jackfer',
    phone: '',
    address: '',
    points: 0
  });

  // ==========================================
  // EFFECTS & DATA SYNC
  // ==========================================
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isConfigValid) {
      setError("Konfigurasi Firebase Tidak Lengkap. Sila semak Environment Variables.");
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        setError("Gagal menyambung ke pelayan keselamatan.");
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    // Load Menu
    const unsubMenu = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'menu'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length === 0) {
        // Fallback jika DB kosong
        setMenuItems([
          { id: '1', name: 'Nasi Lemak Ayam Berempah', price: 12.90, category: 'Makanan', image: '🍛', rating: 4.8, desc: 'Nasi lemak tradisi dengan ayam goreng rempah panas.' },
          { id: '2', name: 'Mee Goreng Mamak Special', price: 8.50, category: 'Makanan', image: '🍝', rating: 4.5, desc: 'Mee goreng dengan sotong dan telur mata.' },
          { id: '3', name: 'Teh Tarik Madu Kaw', price: 4.50, category: 'Minuman', image: '☕', rating: 4.9, desc: 'Teh tarik buih melimpah dengan madu asli.' },
          { id: '4', name: 'Kopi O Kampung', price: 2.50, category: 'Minuman', image: '🍵', rating: 4.2, desc: 'Kopi hitam pekat aroma kampung.' },
          { id: '5', name: 'Pisang Goreng Cheese', price: 7.00, category: 'Snek', image: '🍌', rating: 4.7, desc: 'Pisang nipah goreng dengan limpahan cheese parut.' },
        ]);
      } else {
        setMenuItems(data);
      }
    });

    // Load Orders
    const unsubOrders = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(data.filter(o => o.userId === user.uid));
    });

    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, [user]);

  // ==========================================
  // BUSINESS LOGIC FUNCTIONS
  // ==========================================

  const addToCart = useCallback((product) => {
    setCart(curr => {
      const isExist = curr.find(item => item.id === product.id);
      if (isExist) {
        return curr.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...curr, { ...product, qty: 1 }];
    });
    
    // Notification
    const newNotif = { id: Date.now(), text: `${product.name} ditambah ke bakul`, type: 'success' };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 3000);
  }, []);

  const removeFromCart = (id) => {
    setCart(curr => curr.filter(item => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(curr => curr.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);
  const deliveryFee = subtotal > 0 ? 5.00 : 0;
  const discount = appliedVoucher ? (subtotal * 0.1) : 0; // 10% discount for demo
  const finalTotal = subtotal + deliveryFee - discount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isOrdering) return;
    
    setIsOrdering(true);
    try {
      const newOrder = {
        userId: user.uid,
        items: cart,
        subtotal,
        deliveryFee,
        discount,
        total: finalTotal,
        status: 'Sedang Disiapkan',
        createdAt: serverTimestamp(),
        orderId: `JF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), newOrder);
      
      // Update points
      const earnedPoints = Math.floor(finalTotal);
      setProfile(p => ({ ...p, points: p.points + earnedPoints }));

      // Clear Cart & Show Voucher
      setCart([]);
      setShowCart(false);
      setActiveVoucher({ id: newOrder.orderId, points: earnedPoints });
      
    } catch (err) {
      console.error("Ralat pesanan:", err);
    } finally {
      setIsOrdering(false);
    }
  };

  // Filtered Menu
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // ==========================================
  // RENDER COMPONENTS
  // ==========================================

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
       <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <ShoppingBag className="text-indigo-600 w-8 h-8" />
          </div>
       </div>
       <h2 className="text-slate-800 font-black text-xl tracking-tighter">BISNES JACKFER</h2>
       <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Memuatkan Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* TOP NAVIGATION BAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('home')}>
             <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200 group-hover:rotate-12 transition-transform">
                <Zap size={24} fill="currentColor" />
             </div>
             <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tighter text-slate-800 leading-none">JACKFER<span className="text-indigo-600">.</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Smart Biz OS</p>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            
            <button 
              onClick={() => setShowCart(true)}
              className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
            >
              <ShoppingBag size={20} className="group-hover:animate-bounce" />
              <span className="font-bold text-sm hidden sm:block">RM {finalTotal.toFixed(2)}</span>
              {cart.length > 0 && (
                <div className="bg-white text-slate-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ml-1">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="pt-24 pb-32 sm:pt-32 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* TAB: HOME / DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HERO SECTION */}
            <div className="relative bg-indigo-600 rounded-[3rem] p-8 sm:p-16 overflow-hidden shadow-2xl shadow-indigo-100 group">
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
               <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>
               
               <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-indigo-100 text-xs font-bold mb-6 border border-white/20">
                     <Sparkles size={14} className="text-amber-300" /> Promosi Hebat Bulan Ini!
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-6">
                     RASA PADU,<br/>HARGA <span className="text-amber-300 underline decoration-wavy underline-offset-8">MAMPU.</span>
                  </h2>
                  <p className="text-indigo-100 text-lg mb-8 font-medium leading-relaxed max-w-md">
                     Nikmati hidangan kualiti premium terus ke pintu rumah anda. Pesan sekarang dan kumpul mata ganjaran!
                  </p>
                  <div className="flex flex-wrap gap-4">
                     <button onClick={() => setActiveTab('menu')} className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all">
                        PESAN SEKARANG
                     </button>
                     <button className="px-8 py-4 bg-indigo-500/50 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold hover:bg-indigo-500/70 transition-all">
                        LIHAT VOUCHER
                     </button>
                  </div>
               </div>
            </div>

            {/* QUICK STATS / INFO */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
               {[
                 { icon: <Clock />, label: 'Laju', sub: '20-30 Minit', color: 'bg-amber-50 text-amber-600' },
                 { icon: <CheckCircle />, label: 'Halal', sub: '100% Terjamin', color: 'bg-green-50 text-green-600' },
                 { icon: <Trophy />, label: 'Loyalti', sub: `${profile.points} Mata`, color: 'bg-indigo-50 text-indigo-600' },
                 { icon: <Star />, label: 'Rating', sub: '4.9/5 Bintang', color: 'bg-rose-50 text-rose-600' },
               ].map((item, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                       {item.icon}
                    </div>
                    <h4 className="font-black text-slate-800 tracking-tight">{item.label}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">{item.sub}</p>
                 </div>
               ))}
            </div>
            
            {/* RECOMMENDED SECTION */}
            <div>
               <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">PILIHAN <span className="text-indigo-600">POPULAR</span></h3>
                    <p className="text-slate-400 text-sm font-medium">Menu yang paling kerap dipesan minggu ini.</p>
                  </div>
                  <button onClick={() => setActiveTab('menu')} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Lihat Semua <ChevronRight size={18} />
                  </button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.slice(0, 3).map(item => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-2xl transition-all group overflow-hidden">
                       <div className="relative h-48 bg-slate-50 rounded-3xl flex items-center justify-center text-7xl mb-6 group-hover:scale-105 transition-transform duration-500">
                          {item.image}
                          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-xs font-black text-slate-800 shadow-sm">
                             <Star size={12} fill="#f59e0b" className="text-amber-500" /> {item.rating}
                          </div>
                       </div>
                       <h4 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h4>
                       <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-medium">{item.desc}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-indigo-600">RM {item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-indigo-600 active:scale-90 transition-all shadow-lg shadow-slate-200"
                          >
                            <Plus size={20} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* TAB: FULL MENU */}
        {activeTab === 'menu' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                   <h2 className="text-4xl font-black text-slate-800 tracking-tighter">KATALOG <span className="text-indigo-600">MENU</span></h2>
                   <p className="text-slate-400 font-medium">Teroka pelbagai pilihan hidangan kegemaran anda.</p>
                </div>
                
                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
                   <div className="relative group flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                      <input 
                        type="text" 
                        placeholder="Cari hidangan..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-72 pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium"
                      />
                   </div>
                   <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:border-indigo-200'}`}
                        >
                           {cat}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             {filteredMenu.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {filteredMenu.map(item => (
                     <div key={item.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="h-44 bg-slate-50 rounded-3xl flex items-center justify-center text-7xl mb-6 group-hover:scale-110 transition-transform">
                           {item.image}
                        </div>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{item.category}</span>
                           <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star size={14} fill="currentColor" /> {item.rating}
                           </div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-4 h-12 line-clamp-2">{item.name}</h4>
                        <div className="flex items-center justify-between mt-auto">
                           <span className="text-2xl font-black text-indigo-600">RM {item.price.toFixed(2)}</span>
                           <button 
                             onClick={() => addToCart(item)}
                             className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-indigo-600 active:scale-90 transition-all shadow-lg"
                           >
                              <Plus size={20} />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Search size={48} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2">Tiada Hasil Dijumpai</h3>
                   <p className="text-slate-400 font-medium max-w-xs mx-auto">Maaf, kami tidak menemui menu "{searchQuery}". Cuba cari kata kunci lain.</p>
                </div>
             )}
          </div>
        )}

        {/* TAB: ORDERS HISTORY */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end mb-10">
                <div>
                   <h2 className="text-4xl font-black text-slate-800 tracking-tighter">REKOD <span className="text-indigo-600">PESANAN</span></h2>
                   <p className="text-slate-400 font-medium">Senarai sejarah pembelian anda di Bisnes Jackfer.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                   <Activity size={14} /> Auto-update Aktif
                </div>
             </div>

             {orders.length > 0 ? (
                <div className="space-y-6">
                   {orders.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(order => (
                     <div key={order.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                           <div className="flex items-start gap-5">
                              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl ${order.status === 'Selesai' ? 'bg-green-500 shadow-green-100' : 'bg-amber-500 shadow-amber-100 animate-pulse'}`}>
                                 {order.status === 'Selesai' ? <CheckCircle size={32} /> : <Clock size={32} />}
                              </div>
                              <div>
                                 <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">ID: #{order.orderId}</p>
                                 <h4 className="text-xl font-bold text-slate-800">Pesanan {order.items.length} Item</h4>
                                 <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${order.status === 'Selesai' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                       {order.status}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                       <Calendar size={12} /> {order.createdAt?.toDate().toLocaleDateString() || 'Baru Sahaja'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex flex-row md:flex-col justify-between items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                              <div className="text-left md:text-right">
                                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Jumlah Bayaran</p>
                                 <p className="text-2xl font-black text-slate-800 leading-none mt-1">RM {order.total.toFixed(2)}</p>
                              </div>
                              <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all active:scale-95">
                                 Lihat Resit
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100">
                   <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Receipt size={48} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2">Tiada Rekod</h3>
                   <p className="text-slate-400 font-medium max-w-xs mx-auto">Anda belum membuat sebarang pesanan lagi. Jom cuba menu kami!</p>
                   <button onClick={() => setActiveTab('menu')} className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                      Mula Membeli
                   </button>
                </div>
             )}
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
             <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 mb-8">
                <div className="h-32 bg-indigo-600 relative">
                   <div className="absolute -bottom-12 left-10 p-2 bg-white rounded-[2rem] shadow-xl">
                      <div className="w-24 h-24 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-indigo-600">
                         <User size={48} />
                      </div>
                   </div>
                </div>
                <div className="pt-16 pb-10 px-10">
                   <div className="flex justify-between items-start">
                      <div>
                         <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{profile.name}</h2>
                         <p className="text-slate-400 font-medium">Ahli Setia Jackfer sejak 2024</p>
                      </div>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                         <Settings size={20} />
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mt-10">
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mata Ganjaran</p>
                         <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-indigo-600">{profile.points}</span>
                            <Trophy size={16} className="text-amber-500" />
                         </div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tahap Ahli</p>
                         <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-slate-800">SILVER</span>
                            <Sparkles size={16} className="text-indigo-400" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                {[
                  { icon: <MapPin />, label: 'Alamat Penghantaran', sub: 'Tetapkan lokasi utama anda' },
                  { icon: <CardIcon />, label: 'Kaedah Pembayaran', sub: 'Visa, Mastercard, GrabPay' },
                  { icon: <Gift />, label: 'Ganjaran Saya', sub: 'Tebus mata untuk hidangan percuma' },
                  { icon: <ShieldCheck />, label: 'Keselamatan Akaun', sub: 'Tukar kata laluan & biometrik' },
                  { icon: <Phone />, label: 'Hubungi Kami', sub: 'Bantuan khidmat pelanggan 24/7' },
                ].map((link, idx) => (
                  <button key={idx} className="w-full bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           {link.icon}
                        </div>
                        <div className="text-left">
                           <h4 className="font-bold text-slate-800 text-sm">{link.label}</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{link.sub}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-300" />
                  </button>
                ))}
                
                <button className="w-full mt-6 p-5 rounded-2xl border border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
                   <LogOut size={20} /> Log Keluar Akaun
                </button>
             </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION (MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden">
         <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            {[
              { id: 'home', icon: <Home />, label: 'Utama' },
              { id: 'menu', icon: <LayoutDashboard />, label: 'Menu' },
              { id: 'orders', icon: <Receipt />, label: 'Rekod' },
              { id: 'profile', icon: <User />, label: 'Profil' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
              >
                 <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-indigo-50' : ''}`}>
                   {React.cloneElement(tab.icon, { size: 22, strokeWidth: activeTab === tab.id ? 2.5 : 2 })}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
         </div>
      </div>

      {/* SIDE CART PANEL */}
      {showCart && (
        <div className="fixed inset-0 z-[150] flex justify-end">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCart(false)}></div>
           <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">BAKUL <span className="text-indigo-600">SAYA</span></h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sahkan item & buat pesanan</p>
                 </div>
                 <button onClick={() => setShowCart(false)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                    <X size={24}/>
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                 {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
                       <ShoppingBag size={80} className="mb-4" />
                       <p className="text-xl font-bold">Bakul anda masih kosong</p>
                    </div>
                 ) : (
                    cart.map(item => (
                       <div key={item.id} className="flex items-center gap-6 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                             {item.image}
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-slate-800 leading-tight mb-1">{item.name}</h4>
                             <p className="text-indigo-600 font-black">RM {(item.price * item.qty).toFixed(2)}</p>
                             <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                   <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:text-indigo-600 font-black">-</button>
                                   <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                                   <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:text-indigo-600 font-black">+</button>
                                </div>
                             </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                             <Trash2 size={20}/>
                          </button>
                       </div>
                    ))
                 )}
              </div>

              <div className="p-10 border-t border-slate-100 bg-slate-50">
                 <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-slate-500 font-medium">
                       <span>Subjumlah</span>
                       <span>RM {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                       <span>Cas Penghantaran</span>
                       <span>RM {deliveryFee.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                         <span>Diskaun Voucher (10%)</span>
                         <span>- RM {discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200 my-4"></div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-900 font-black text-lg uppercase tracking-widest">JUMLAH</span>
                       <span className="text-4xl font-black text-slate-900 tracking-tighter decoration-indigo-500 decoration-4 underline-offset-4 underline">RM {finalTotal.toFixed(2)}</span>
                    </div>
                 </div>

                 <button 
                   onClick={handlePlaceOrder}
                   disabled={cart.length === 0 || isOrdering}
                   className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                 >
                    {isOrdering ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>SAHKAN PESANAN <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" /></>
                    )}
                 </button>
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Secure payment protected by Jackfer Shield</p>
              </div>
           </div>
        </div>
      )}

      {/* SUCCESS ORDER MODAL */}
      {activeVoucher && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500"></div>
            <div className="relative bg-white w-full max-w-md rounded-[4rem] p-12 text-center shadow-[0_50px_100px_rgba(0,0,0,0.3)] animate-in zoom-in duration-500 border border-slate-100">
               <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-6">
                  <Check size={48} strokeWidth={4} />
               </div>
               <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-3 uppercase">PESANAN TERIMA!</h2>
               <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                 Terima kasih kerana memilih <span className="text-indigo-600 font-bold underline">Bisnes Jackfer</span>. Pesanan anda sedang disiapkan dengan penuh kasih sayang.
               </p>
               
               <div className="relative bg-indigo-600 p-8 rounded-[2.5rem] mb-10 overflow-hidden shadow-xl shadow-indigo-100 group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-3">Voucher Kesetiaan</p>
                  <p className="text-4xl font-black text-white tracking-widest font-mono group-hover:scale-110 transition-transform">#{activeVoucher.id}</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-indigo-100 font-bold text-xs">
                    <Trophy size={14} className="text-amber-300" /> +{activeVoucher.points} Mata Diperoleh
                  </div>
               </div>

               <button 
                 onClick={() => {
                   setActiveVoucher(null);
                   setActiveTab('orders');
                 }}
                 className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
               >
                 LIHAT STATUS PESANAN
               </button>
            </div>
         </div>
      )}

      {/* NOTIFICATIONS TOAST */}
      <div className="fixed bottom-24 sm:bottom-10 right-4 sm:right-10 z-[200] flex flex-col gap-3 pointer-events-none">
         {notifications.map(n => (
           <div key={n.id} className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-300 border border-white/10 pointer-events-auto backdrop-blur-md bg-opacity-90">
              <div className="bg-indigo-500 p-1.5 rounded-lg">
                 <CheckCircle size={16} />
              </div>
              <span className="text-sm font-bold tracking-tight">{n.text}</span>
           </div>
         ))}
      </div>

    </div>
  );
}
