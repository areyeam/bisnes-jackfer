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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  serverTimestamp 
} from 'firebase/firestore';
// USING ONLY SAFE, STANDARD ICONS TO PREVENT CRASHES
import { 
  ShoppingBag, Clock, Trash2, Gift, User, LogOut, ArrowLeft, 
  X, Phone, Lock, Loader2, Landmark, ConciergeBell, 
  ChevronDown, Tag, Activity, Sparkles, MapPin, IdCard, Home, Leaf, Mail, 
  Calendar, CalendarCheck, Waves, LayoutDashboard, Receipt, Plus, TrendingUp, 
  TrendingDown, WifiOff, Trophy, RefreshCcw, Box, Copy, Upload, 
  CheckCircle, Eye, Zap, Play, Check, CreditCard, DollarSign
} from 'lucide-react';

// --- Safe Firebase Initialization ---
let app, auth, db;
let initError = null;
try {
  if (typeof __firebase_config !== 'undefined') {
    const config = JSON.parse(__firebase_config);
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    initError = "Firebase Config Missing";
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
  initError = e.message;
}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- CONFIGURATION ---
const LOGO_URL = "https://drive.google.com/uc?export=view&id=15zawbpVZ89BnZ7pMmgVJiudTN8xSgtjQ"; 
const FALLBACK_LOGO = "https://ui-avatars.com/api/?name=Bisnes+Jackfer&background=65a30d&color=fff&length=2&rounded=true&bold=true&size=256";

// --- BANKING DETAILS ---
const DUITNOW_QR_URL = "https://i.ibb.co/p99J4w8/IMG-20260204-143833-346.jpg";
const BUSINESS_BANK_DETAILS = {
  bankName: "RHB Bank",
  accountName: "NUR NAJWA NAZMINA BINTI AZMAN",
  accountNumber: "11306160255276"
};

// --- IMAGES ---
const BACKGROUNDS = {
  welcome: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop", 
  physio: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2670&auto=format&fit=crop",
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2670&auto=format&fit=crop",
  juice: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=2574&auto=format&fit=crop",
  swimming: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2670&auto=format&fit=crop",
  sports: "https://images.unsplash.com/photo-1626224583764-84786c71971e?q=80&w=2670&auto=format&fit=crop"
};

// --- DATA ---
// Switched icons to Emojis to prevent white-screen crashes on missing icons
const SERVICES = [
  { id: 'juice', name: 'Fruit Juice', emoji: '🍊', color: 'bg-orange-50 text-orange-600', gradient: 'from-orange-400 to-amber-500', description: 'Freshly squeezed goodness', subText: '7am - 6pm (Delivery @ 8pm)' },
  { id: 'physio', name: 'Physiotherapy', emoji: '🩺', color: 'bg-teal-50 text-teal-600', gradient: 'from-teal-500 to-emerald-600', description: 'Professional recovery & rehab' },
  { id: 'massage', name: 'Massage Service', emoji: '💆', color: 'bg-purple-50 text-purple-600', gradient: 'from-purple-500 to-indigo-600', description: 'Relax & rejuvenate' },
  { id: 'swimming', name: 'Swimming', emoji: '🏊', color: 'bg-blue-50 text-blue-600', gradient: 'from-blue-400 to-cyan-500', description: 'Coaching & Equipment Rental' },
  { id: 'sports', name: 'Sports Rental', emoji: '🏸', color: 'bg-red-50 text-red-600', gradient: 'from-red-500 to-pink-600', description: 'Rackets & Balls (4 Hours)' },
];

const JUICE_MENU = [
  { id: 'j1', type: 'juice', name: "Fresh Watermelon", emoji: "🍉", color: "bg-red-50 text-red-600" },
  { id: 'j2', type: 'juice', name: "Squeezed Orange", emoji: "🍊", color: "bg-orange-50 text-orange-600" },
  { id: 'j3', type: 'juice', name: "Zesty Lemonade", emoji: "🍋", color: "bg-yellow-50 text-yellow-600" },
  { id: 'j4', type: 'juice', name: "Tropical Pineapple", emoji: "🍍", color: "bg-amber-50 text-amber-600" },
];

const PHYSIO_MENU = [{ id: 'p1', type: 'physio', name: "Physiotherapy Session", emoji: "🩺", color: "bg-teal-50 text-teal-600", basePrice: 0 }];

const MASSAGE_MENU = [
  { id: 'm1', type: 'massage', name: "Express Massage (30m)", emoji: "💆", color: "bg-purple-50 text-purple-600", price: 35.00 },
  { id: 'm2', type: 'massage', name: "Full Body (60m)", emoji: "🧘", color: "bg-indigo-50 text-indigo-600", price: 70.00 },
  { id: 'm3', type: 'massage', name: "Royal Full Body (120m)", emoji: "👑", color: "bg-amber-50 text-amber-600", price: 130.00 },
];

const SWIMMING_MENU = [
  { id: 's1', type: 'swimming_coaching', name: "Swimming Coaching", emoji: "🏊‍♂️", color: "bg-blue-50 text-blue-600", price: 15.00 },
  { id: 's2', type: 'swimming_rental', name: "Swimming Goggles", emoji: "🥽", color: "bg-cyan-50 text-cyan-600", price: 3.00, stockKey: 'swim_goggles' },
  { id: 's3', type: 'swimming_rental', name: "Kickboard", emoji: "🏄‍♂️", color: "bg-sky-50 text-sky-600", price: 3.00, stockKey: 'swim_kickboard' },
  { id: 's4', type: 'swimming_rental', name: "Swimming Cap", emoji: "🧢", color: "bg-indigo-50 text-indigo-600", price: 2.00, stockKey: 'swim_cap' },
  { id: 's5', type: 'swimming_rental', name: "Pool Noodles", emoji: "🛟", color: "bg-yellow-50 text-yellow-600", price: 3.00, stockKey: 'swim_noodles' },
];

const SPORTS_MENU = [
  { id: 'sp1', type: 'sports_rental', name: "Badminton Racket", emoji: "🏸", color: "bg-red-50 text-red-600", price: 3.00, bundle: true, stockKey: 'racket_badminton' },
  { id: 'sp2', type: 'sports_rental', name: "Squash Racket", emoji: "🎾", color: "bg-orange-50 text-orange-600", price: 3.00, bundle: true, stockKey: 'racket_squash' },
  { id: 'sp3', type: 'sports_rental', name: "Tennis Racket", emoji: "🎾", color: "bg-green-50 text-green-600", price: 3.00, bundle: true, stockKey: 'racket_tennis' },
  { id: 'sp4', type: 'sports_rental', name: "Squash Ball", emoji: "⚫", color: "bg-gray-50 text-gray-800", price: 2.00 },
  { id: 'sp5', type: 'sports_rental', name: "Tennis Ball", emoji: "🎾", color: "bg-yellow-50 text-yellow-600", price: 2.00 },
  { id: 'sp6', type: 'sports_sale', name: "Shuttlecock (Buy)", emoji: "🏸", color: "bg-stone-50 text-stone-600", price: 5.00 },
];

const INITIAL_STOCK = { racket_badminton: 4, racket_squash: 2, racket_tennis: 2, swim_goggles: 4, swim_kickboard: 4, swim_cap: 4, swim_noodles: 4 };

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('welcome'); 
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isOffline, setIsOffline] = useState(false); 
  
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]); 
  const [inventory, setInventory] = useState(INITIAL_STOCK);
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard & Auth
  const [staffTab, setStaffTab] = useState('orders'); 
  const [staffFilterService, setStaffFilterService] = useState('all');
  const [staffSort, setStaffSort] = useState('newest'); 
  const [staffPassword, setStaffPassword] = useState('');
  const [staffAuthError, setStaffAuthError] = useState('');
  
  // Forms
  const [expenseName, setExpenseName] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('stock');

  // UI State
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [customizingItem, setCustomizingItem] = useState(null);
  
  // Customization
  const [sugarLevel, setSugarLevel] = useState('No Sugar'); 
  const [cupSize, setCupSize] = useState('Medium'); 
  const [physioRate, setPhysioRate] = useState('public'); 
  const [massageArea, setMassageArea] = useState('Head & Shoulder'); 
  const [massageAddOn, setMassageAddOn] = useState(false); 
  const [swimCapType, setSwimCapType] = useState('Silicone'); 

  // Customer Data
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(''); 
  const [customerBlock, setCustomerBlock] = useState(''); 
  const [roomNumber, setRoomNumber] = useState(''); 
  const [matricNo, setMatricNo] = useState(''); 
  const [staffId, setStaffId] = useState(''); 
  const [homeAddress, setHomeAddress] = useState(''); 
  const [massageClientType, setMassageClientType] = useState('student'); 

  // Booking & Payment
  const [deliveryMode, setDeliveryMode] = useState('lobby'); 
  const [paymentMethod, setPaymentMethod] = useState('cash'); 
  const [discountPercent, setDiscountPercent] = useState(0); 
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMsg, setVoucherMsg] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  
  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null); 
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Game State
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameBoard, setGameBoard] = useState(Array(9).fill(null));
  const [gameStatus, setGameStatus] = useState('intro');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [trialCustomer, setTrialCustomer] = useState({ name: '', matric: '', choice: 'Watermelon' });

  // --- Logic Helpers ---
  const cartHasMobileService = useMemo(() => cart.some(item => ['physio', 'massage'].includes(item.type)), [cart]);
  const cartHasCoaching = useMemo(() => cart.some(item => item.type === 'swimming_coaching'), [cart]);
  const cartHasAppointment = useMemo(() => cartHasMobileService || cartHasCoaching, [cartHasMobileService, cartHasCoaching]);
  const cartHasPhysio = useMemo(() => cart.some(item => item.type === 'physio'), [cart]);
  const cartHasMassage = useMemo(() => cart.some(item => item.type === 'massage'), [cart]);

  const getEffectiveClientType = () => {
    if (cartHasPhysio) {
      const item = cart.find(i => i.type === 'physio');
      if (item.variant.includes('Student')) return 'student';
      if (item.variant.includes('Staff')) return 'staff';
      return 'public';
    }
    return cartHasMassage ? massageClientType : 'public';
  };

  // --- Date Logic ---
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) { 
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const getSlotsForItem = (dateObj, itemType) => {
    if (!dateObj) return [];
    const day = dateObj.getDay(); 
    if (['physio', 'massage'].includes(itemType)) {
        if (day === 1 || day === 5) return ['22:00']; // Mon, Fri
        if (day >= 2 && day <= 4) return ['20:00', '21:00']; // Tue, Wed, Thu
        if (day === 6) return ['18:00', '19:00', '20:00', '21:00']; // Sat
    } else if (itemType === 'swimming_coaching') {
        if (day === 1 || day === 5) return ['20:00']; // Mon, Fri
    }
    return [];
  };

  const isSlotBooked = (dateStr, timeStr, currentCartIndex = -1) => {
     const inOrders = orders.some(o => 
        o.status !== 'cancelled' && 
        o.items?.some(i => i.date === dateStr && i.time === timeStr)
     );
     const inCart = cart.some((c, idx) => 
        idx !== currentCartIndex && c.date === dateStr && c.time === timeStr
     );
     return inOrders || inCart;
  };

  const setItemSchedule = (index, dateObj, timeStr) => {
     setCart(prev => prev.map((item, i) => {
        if (i === index) {
           return { ...item, dateObj, date: dateObj?.toLocaleDateString() || null, time: timeStr || null };
        }
        return item;
     }));
  };

  // --- Auth & Listeners ---
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (e) { console.error("Auth:", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const unsubOrders = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), 
      s => { setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))); setIsOffline(false); }, 
      e => setIsOffline(true)
    );
    const unsubExpenses = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), 
      s => setExpenses(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubInv = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'inventory_main', 'stock'), 
      s => { if (s.exists()) setInventory(s.data()); else setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'inventory_main', 'stock'), INITIAL_STOCK); }
    );
    return () => { unsubOrders(); unsubExpenses(); unsubInv(); };
  }, [user]);

  // --- Handlers ---
  const applyVoucher = () => {
  const code = (voucherInput || '').trim().toUpperCase();
  const isJackVoucher = /^JACK\d{1,3}$/.test(code);

  if (!code) {
    setVoucherMsg('Please enter a voucher code.');
    return;
  }

  if (isJackVoucher) {
    setDiscountPercent(0.10);
    setAppliedVoucher({ code, percent: 10 });
    setVoucherMsg('Voucher applied: 10% off ✅');
  } else {
    setDiscountPercent(0);
    setAppliedVoucher(null);
    setVoucherMsg('Invalid voucher code ❌');
  }
};

const removeVoucher = () => {
  setDiscountPercent(0);
  setAppliedVoucher(null);
  setVoucherInput('');
  setVoucherMsg('');
};
const handleReceiptUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 600;
      const scale = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setReceiptImage(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

  const handleGameClick = (index) => {
    if (gameBoard[index] || !isPlayerTurn || gameStatus !== 'playing') return;
    const newBoard = [...gameBoard];
    newBoard[index] = 'X';
    setGameBoard(newBoard);
    
    // Win Logic
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const check = (b) => {
      for(let l of lines) if(b[l[0]] && b[l[0]]===b[l[1]] && b[l[0]]===b[l[2]]) return b[l[0]];
      return null;
    };
    
    const winner = check(newBoard);
    if (winner === 'X') setGameStatus('won');
    else if (!newBoard.includes(null)) setGameStatus('draw');
    else setIsPlayerTurn(false);
  };

  // Bot Turn
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const empty = gameBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
        if (empty.length === 0) return;
        
        const move = empty[Math.floor(Math.random() * empty.length)];
        const newBoard = [...gameBoard];
        newBoard[move] = 'O';
        setGameBoard(newBoard);
        
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        let winner = null;
        for(let l of lines) if(newBoard[l[0]] && newBoard[l[0]]===newBoard[l[1]] && newBoard[l[0]]===newBoard[l[2]]) winner = newBoard[l[0]];

        if (winner === 'O') setGameStatus('lost');
        else if (!newBoard.includes(null)) setGameStatus('draw');
        else setIsPlayerTurn(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, gameBoard]);

  const submitTrialClaim = async () => {
    if (!trialCustomer.name || !trialCustomer.matric) return alert("Fill details!");
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
        items: [{ id: 'trial', name: `Free: ${trialCustomer.choice}`, qty: 1, price: 0, variant: 'Win Reward' }],
        subtotal: 0, total: 0, status: 'pending', isTrial: true, timestamp: Date.now(), customerCode: Math.floor(Math.random()*9000)+1000,
        customerDetails: { name: trialCustomer.name, matricNo: trialCustomer.matric, clientType: 'student', paymentMethod: 'free' }
      });
      alert("Claimed!"); setShowGameModal(false);
    } catch(e) { console.error(e); } finally { setIsLoading(false); }
  };

  const submitOrder = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const finalTotal = calculateTotal();
      
      // Remove the non-serializable dateObj and sanitize undefined fields before saving
      const cleanedCart = cart.map(item => {
         const { dateObj, ...rest } = item;
         const cleanItem = { ...rest };
         // Explicitly replace undefined with null for Firestore compatibility
         if (cleanItem.date === undefined) cleanItem.date = null;
         if (cleanItem.time === undefined) cleanItem.time = null;
         if (cleanItem.bundle === undefined) cleanItem.bundle = false;
         if (cleanItem.stockKey === undefined) cleanItem.stockKey = null;
         return cleanItem;
      });

      const orderData = {
        items: cleanedCart, subtotal: finalTotal, discount: 0, total: finalTotal,
        status: 'pending', timestamp: Date.now(), customerCode: Math.floor(Math.random()*9000)+1000, userId: user.uid,
        receiptImage: paymentMethod === 'qr' ? receiptImage : null,
        customerDetails: { 
            name: customerName || 'N/A', 
            phone: customerPhone || 'N/A', 
            email: customerEmail || 'N/A', 
            matricNo: matricNo || 'N/A', 
            staffId: staffId || 'N/A', 
            block: customerBlock || 'N/A', 
            roomNumber: roomNumber || 'N/A', 
            homeAddress: homeAddress || 'N/A', 
            deliveryMode: deliveryMode || 'lobby', 
            paymentMethod: paymentMethod || 'cash', 
            bank: paymentMethod === 'qr' ? 'RHB QR' : 'Cash', 
            clientType: cartHasMobileService ? getEffectiveClientType() : 'standard' 
        }
      };
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      
      const invRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory_main', 'stock');
      for(let i of cart) if(i.stockKey) await updateDoc(invRef, {[i.stockKey]: increment(-i.qty)});

      const newVoucher = `JACK${Math.floor(Math.random()*100)}`;

      // --- EMAIL JS INTEGRATION ---
      if (customerEmail) {
         try {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  service_id: 'service_3kj1ch1',
                  template_id: 'template_kd13abi',
                  user_id: 'diDwLTYFVg4PBmisN', // Public Key
                  template_params: {
                     customer_name: customerName,
                     customer_email: customerEmail,
                     total_amount: finalTotal.toFixed(2),
                     voucher_code: newVoucher
                  }
               })
            });
            console.log("Voucher email sent!");
         } catch (emailErr) {
            console.error("Email sending failed silently:", emailErr);
         }
      }

      setActiveVoucher({ code: newVoucher, amount: "10%", email: customerEmail });
      setCart([]); setReceiptImage(null); setShowPaymentModal(false); setIsCartExpanded(false);
    } catch(e) { console.error("Submit Order Error: ", e); alert("Failed to connect to database. Please refresh and try again."); } finally { setIsLoading(false); }
  };

  const addExpense = async () => {
    if (!user || !expenseName || !expenseCost) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), { item: expenseName, cost: parseFloat(expenseCost), category: expenseCategory, timestamp: Date.now(), userId: user.uid });
    setExpenseName(''); setExpenseCost('');
  };

  const deleteExpense = async (id) => { if(user) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id)); }
  const toggleOrderStatus = async (orderId, currentStatus) => { if (user) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: currentStatus === 'pending' ? 'completed' : 'pending' }); };

  const sortedOrders = useMemo(() => {
    let sorted = [...orders];
    if (staffSort === 'newest') sorted.sort((a, b) => b.timestamp - a.timestamp);
    else if (staffSort === 'oldest') sorted.sort((a, b) => a.timestamp - b.timestamp);
    return sorted;
  }, [orders, staffSort]);

  const filteredStaffOrders = useMemo(() => {
     if (staffFilterService === 'all') return sortedOrders;
     return sortedOrders.filter(o => o.items.some(i => i.type && i.type.includes(staffFilterService)));
  }, [sortedOrders, staffFilterService]);

  const verifyOrders = useMemo(() => sortedOrders.filter(o => o.customerDetails?.paymentMethod === 'qr' || o.receiptImage), [sortedOrders]);

  const financialStats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.cost, 0);
    return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
  }, [orders, expenses]);

  // --- Renderers ---
  const AnimatedServiceLogo = () => (
    <div className="w-36 h-36 rounded-full shadow-2xl border-4 border-white/80 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center mb-8 mx-auto relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <span className="text-6xl animate-bounce drop-shadow-sm">🍊</span>
    </div>
  );

  const handleStaffLogin = () => {
    if (staffPassword === 'jackfer2025') { setViewMode('staff'); setStaffPassword(''); setStaffAuthError(''); } else { setStaffAuthError('Incorrect password'); }
  };

  const handleResetInventory = async () => {
      if(!user) return;
      const inventoryRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory_main', 'stock');
      await setDoc(inventoryRef, INITIAL_STOCK);
      alert("Inventory levels have been reset to default.");
  };

  const handleSelectService = (serviceId) => { setSelectedServiceId(serviceId); setViewMode('customer_menu'); };

  const initiateAdd = (item) => {
    if (item.stockKey && inventory[item.stockKey] <= 0) { alert("Sorry, this item is currently out of stock!"); return; }
    setCustomizingItem(item); setSugarLevel('No Sugar'); setCupSize('Medium'); setPhysioRate('public'); setMassageArea('Head & Shoulder'); setMassageAddOn(false); setSwimCapType('Silicone');
  };

  const getPrice = () => {
    if (!customizingItem) return 0;
    if (customizingItem.type === 'juice') {
        if (cupSize === 'Small') return 5.00;
        if (cupSize === 'Medium') return 7.00;
        if (cupSize === 'Large') return 8.00;
        return 7.00;
    }
    if (customizingItem.type === 'physio') return physioRate === 'student' ? 25.00 : physioRate === 'staff' ? 45.00 : 80.00;
    if (customizingItem.type === 'massage') return (customizingItem.price + (massageAddOn ? 6.00 : 0));
    return customizingItem.price;
  };

  const generateVariantString = () => {
    if (customizingItem.type === 'juice') return `${cupSize}, ${sugarLevel}`;
    if (customizingItem.type === 'physio') return { student: 'IIUM Student', staff: 'IIUM Staff', public: 'Public' }[physioRate];
    if (customizingItem.type === 'massage') return ((customizingItem.id === 'm1' ? `Area: ${massageArea}` : '') + (massageAddOn ? ', +10mins' : '')) || "Standard";
    if (customizingItem.id === 's4') return `Type: ${swimCapType}`; 
    return "";
  };

  const confirmAddToCart = () => {
    if (!customizingItem) return;
    const finalPrice = getPrice();
    const variantDetails = generateVariantString();
    setCart(prev => {
      const existing = prev.find(i => i.id === customizingItem.id && i.variant === variantDetails);
      if (existing) return prev.map(i => (i.id === customizingItem.id && i.variant === variantDetails) ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...customizingItem, qty: 1, variant: variantDetails, price: finalPrice, type: customizingItem.type, name: customizingItem.name, stockKey: customizingItem.stockKey || null, bundle: customizingItem.bundle || false, date: null, time: null }];
    });
    setCustomizingItem(null);
  };

  const removeFromCart = (index) => setCart(prev => prev.filter((_, i) => i !== index));

  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => item.bundle ? acc + (Math.floor(item.qty/2)*5) + ((item.qty%2)*3) : acc + (item.price * item.qty), 0);
    const discountAmount = subtotal * discountPercent;
    let deliveryFee = (!cartHasAppointment && deliveryMode === 'room') ? 0.50 : 0;
    return subtotal + deliveryFee - discountAmount;
  };

  const handleCheckout = () => {
    if (!customerName || !customerPhone || !customerEmail) { alert("Please fill in Name, Phone, and Email."); return; }
    for (const item of cart) { if (item.stockKey && item.qty > (inventory[item.stockKey] || 0)) { alert(`Not enough stock for ${item.name}.`); return; } }
    
    // Check if any appointment items are missing a selected date/time
    for (const item of cart) {
       if (['physio', 'massage', 'swimming_coaching'].includes(item.type)) {
          if (!item.date || !item.time) {
             alert(`Please select an appointment date and time for ${item.name}.`);
             return;
          }
       }
    }

    if (cartHasMobileService) {
        const clientType = getEffectiveClientType();
        if (clientType === 'student' && (!matricNo || !customerBlock || !roomNumber)) {
            alert("Please complete your details (Matric No, Block, Room)."); return;
        }
        if (clientType === 'staff' && (!staffId || !homeAddress)) {
            alert("Please provide your Staff ID and Home Address."); return;
        }
        if (clientType === 'public' && (!matricNo || !homeAddress)) { 
            alert("Please provide the Last 4 Digits of your IC and Home Address."); return;
        }
    } else if (!cartHasAppointment) {
        if ((deliveryMode === 'room' && !roomNumber) || (!customerBlock)) { alert("Please provide Block/Room."); return; }
    }

    if (paymentMethod === 'qr') {
      setReceiptImage(null); // Reset receipt
      setShowPaymentModal(true);
    } else {
      submitOrder();
    }
  };

  if (initError) {
    return <div className="p-10 text-center"><h1 className="text-2xl font-bold text-red-500">System Error</h1><p>{initError}</p></div>;
  }

  // --- Render ---
  return (
    <div className="font-sans text-gray-800 selection:bg-lime-200">
      {/* WELCOME */}
      {viewMode === 'welcome' && (
         <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-6 transition-all" style={{ backgroundImage: `url('${BACKGROUNDS.welcome}')` }}>
           <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 backdrop-blur-[2px]"></div>
           <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] w-full max-w-md text-center border border-white/40">
              <AnimatedServiceLogo />
              <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Bisnes <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-emerald-600">Jackfer</span></h1>
              <p className="text-gray-600 mb-10 font-medium text-lg">Premium Wellness & Freshness</p>
              
              <button onClick={() => setViewMode('customer_hub')} className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white py-4 rounded-2xl font-bold mb-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300">
                <ShoppingBag className="w-5 h-5 text-lime-400" /> Book Services
              </button>
              
              <button onClick={() => setViewMode('staff_auth')} className="w-full flex justify-center items-center gap-2 bg-white/60 hover:bg-white/90 border border-white text-gray-700 py-4 rounded-2xl font-bold shadow-sm transition-colors duration-300">
                Staff Access
              </button>
           </div>
         </div>
      )}

      {/* STAFF AUTH */}
      {viewMode === 'staff_auth' && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
           <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-sm text-center border border-gray-100">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-gray-600" /></div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Staff Access</h2>
              <input type="password" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} placeholder="Enter Password" className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-center font-medium outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 transition-all" />
              <button onClick={handleStaffLogin} className="w-full bg-lime-500 text-gray-900 py-4 rounded-xl font-bold mb-4 hover:bg-lime-600 hover:shadow-lg transition-all">Unlock Dashboard</button>
              <button onClick={() => setViewMode('welcome')} className="text-gray-400 text-sm font-medium hover:text-gray-600">Cancel</button>
              {staffAuthError && <p className="text-red-500 text-xs mt-4 font-medium bg-red-50 py-2 rounded-lg">{staffAuthError}</p>}
           </div>
        </div>
      )}

      {/* SERVICE SELECTION */}
      {viewMode === 'customer_hub' && (
        <div className="min-h-screen p-6 flex flex-col justify-center bg-cover bg-center bg-fixed relative" style={{ backgroundImage: `url('${BACKGROUNDS.juice}')` }}>
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[12px]"></div>
          <div className="relative z-10 w-full max-w-lg mx-auto">
            <header className="flex justify-between items-center mb-10">
              <div><h1 className="text-4xl font-black text-gray-900 tracking-tight">Services</h1><p className="text-gray-500 font-medium mt-1">Choose your wellness</p></div>
              <button onClick={() => setViewMode('welcome')} className="bg-white p-3 rounded-full shadow-sm text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"><ArrowLeft className="w-6 h-6" /></button>
            </header>
            <div className="grid gap-5">
              {SERVICES.map((s) => (
                <button key={s.id} onClick={() => { setSelectedServiceId(s.id); setViewMode('customer_menu'); }} className="group w-full text-left p-6 rounded-[2rem] bg-white/90 backdrop-blur-md border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-lime-200 transition-all duration-300 flex items-center gap-6 transform hover:-translate-y-1">
                  <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-sm bg-gradient-to-br ${s.gradient} text-4xl group-hover:scale-110 transition-transform duration-300`}>{s.emoji}</div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-lime-700 transition-colors">{s.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MENU */}
      {viewMode === 'customer_menu' && (
        <div className="min-h-screen pb-40 bg-cover bg-center bg-fixed relative transition-all duration-500" style={{ backgroundImage: `url('${BACKGROUNDS[selectedServiceId === 'sports' ? 'swimming' : selectedServiceId]}')` }}>
           <div className="absolute inset-0 bg-white/70 backdrop-blur-md"></div>
           <div className="relative z-10">
             <div className="sticky top-0 bg-white/80 backdrop-blur-lg z-20 border-b border-white/50 p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{SERVICES.find(s=>s.id===selectedServiceId)?.emoji}</div>
                   <h1 className="font-bold text-lg tracking-tight text-gray-900">Menu</h1>
                </div>
                <button onClick={() => setViewMode('customer_hub')} className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-full transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
             </div>
             
             <div className="p-6 max-w-3xl mx-auto">
                {selectedServiceId === 'juice' && (
                  <>
                    <div className="mb-8 bg-orange-50/90 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-4 flex items-start gap-3 text-sm text-orange-900 shadow-sm">
                      <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" />
                      <div>
                        <p className="font-bold">Operation Hours: 7:00 AM - 6:00 PM</p>
                        <p className="opacity-80 font-medium">Note: All orders will be delivered starting from 8:00 PM.</p>
                      </div>
                    </div>
                    {/* GAME BANNER */}
                    <div onClick={() => { setShowGameModal(true); setGameStatus('playing'); setGameBoard(Array(9).fill(null)); setIsPlayerTurn(true); }} className="mb-8 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-[2rem] p-6 text-white cursor-pointer shadow-[0_8px_30px_rgba(249,115,22,0.3)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                       <div className="relative flex justify-between items-center z-10">
                          <div>
                             <span className="bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30 inline-block mb-2">Free Trial</span>
                             <h3 className="text-3xl font-black italic tracking-tighter drop-shadow-md">FIGHT FOR JUICE!</h3>
                             <p className="text-sm font-medium opacity-90 mt-1">Beat the bot in Tic-Tac-Toe to win.</p>
                          </div>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 shadow-inner group-hover:rotate-12 transition-transform">
                             <Zap className="w-8 h-8 text-white drop-shadow-md fill-current" />
                          </div>
                       </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   {(selectedServiceId==='juice'?JUICE_MENU:selectedServiceId==='physio'?PHYSIO_MENU:selectedServiceId==='massage'?MASSAGE_MENU:selectedServiceId==='swimming'?SWIMMING_MENU:SPORTS_MENU).map(item => (
                      <div key={item.id} className="bg-white/80 backdrop-blur-lg p-5 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white/60 hover:border-lime-300 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex justify-between items-start group">
                         <div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 ${item.color} shadow-inner`}>{item.emoji}</div>
                            <h3 className="font-bold text-gray-900 text-lg tracking-tight mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-500 font-medium">
                               {item.type === 'juice' && 'From RM 5.00'}
                               {item.type === 'physio' && 'Student/Staff Rates'}
                               {item.price && `RM ${item.price.toFixed(2)}`}
                            </p>
                            {item.stockKey && <div className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded-md inline-block mt-2">Stock: {inventory[item.stockKey]}</div>}
                         </div>
                         <button onClick={() => { setCustomizingItem(item); setSugarLevel('No Sugar'); setCupSize('Medium'); }} className="bg-gray-100 text-gray-600 hover:text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm hover:shadow-lg hover:scale-110 transition-all duration-300 active:scale-95 group-hover:bg-lime-500">
                            <Plus className="w-5 h-5" />
                         </button>
                      </div>
                   ))}
                </div>
             </div>

             {/* FLOATING CART BAR */}
             {cart.length > 0 && !activeVoucher && (
                <div className="fixed bottom-6 left-4 right-4 z-30 pointer-events-none animate-in slide-in-from-bottom-10 duration-500">
                   <div className="max-w-3xl mx-auto bg-gray-900/95 backdrop-blur-xl text-white p-4 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.3)] pointer-events-auto flex justify-between items-center cursor-pointer border border-white/10 hover:scale-[1.02] transition-transform" onClick={() => setIsCartExpanded(true)}>
                      <div className="flex items-center gap-4 pl-2">
                         <div className="bg-lime-400 text-gray-900 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-lime-400/20">{cart.length}</div>
                         <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Estimated Total</p>
                            <p className="font-black text-2xl leading-none">RM {cart.reduce((a,b)=>a+(b.price*b.qty),0).toFixed(2)}</p>
                         </div>
                      </div>
                      <div className="font-bold flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition-colors px-5 py-3 rounded-xl mr-1">
                         View Cart <ChevronDown className="w-4 h-4 rotate-180"/>
                      </div>
                   </div>
                </div>
             )}
           </div>
        </div>
      )}

      {/* VIEW: STAFF DASHBOARD */}
      {viewMode === 'staff' && (
        <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{ backgroundImage: `url('${BACKGROUNDS.physio}')` }}>
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-2xl"></div>
          <div className="relative z-10">
             <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20 shadow-sm">
               <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <div className="flex items-center gap-3">
                    <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-md"><LayoutDashboard className="w-5 h-5" /></div>
                    <div><h1 className="font-black text-xl text-gray-900 tracking-tight">Jackfer Admin</h1><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Dashboard</p></div>
                 </div>
                 <div className="flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-xl self-start md:self-auto overflow-x-auto">
                     <button onClick={() => setStaffTab('orders')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${staffTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Orders</button>
                     <button onClick={() => setStaffTab('verify')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${staffTab === 'verify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Verify</button>
                     <button onClick={() => setStaffTab('expenses')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${staffTab === 'expenses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Finances</button>
                     <div className="w-px h-4 bg-gray-300 mx-2"></div>
                     <button onClick={() => setViewMode('welcome')} className="px-3 text-gray-400 hover:text-red-500 transition-colors"><LogOut className="w-4 h-4" /></button>
                 </div>
               </div>
             </header>
             <main className="max-w-6xl mx-auto p-6">
               {staffTab === 'orders' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredStaffOrders.map((order) => (
                     <div key={order.id} className={`bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/50 transition-all duration-300 ${order.status === 'completed' ? 'opacity-60 bg-gray-50/50' : 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'}`}>
                        <div className="flex justify-between items-center mb-4">
                           <span className="font-black text-gray-900 text-lg tracking-tight">#{order.customerCode}</span>
                           <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${order.status === 'completed' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-lime-50 text-lime-700 border-lime-200'}`}>{order.status}</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">RM {order.total.toFixed(2)}</h3>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm border border-gray-100 space-y-2">
                           <p className="font-bold text-gray-800 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {order.customerDetails?.name}</p>
                           <p className="text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> {order.customerDetails?.phone}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                           {order.items.map((i,x)=>(
                              <div key={x} className="flex gap-3 text-sm items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                 <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">{i.qty}x</span>
                                 <div className="flex-1">
                                    <p className="font-bold text-gray-900">{i.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 mb-1">{i.variant}</p>
                                    {i.date && (
                                       <div className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-1 rounded w-fit border border-teal-100">
                                          {i.date} @ {i.time}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                        <button onClick={() => toggleOrderStatus(order.id, order.status)} className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${order.status === 'completed' ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-gray-900 text-white hover:bg-black shadow-md'}`}>{order.status === 'completed' ? 'Undo' : 'Mark Served'}</button>
                     </div>
                   ))}
                 </div>
               )}
               {staffTab === 'verify' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {verifyOrders.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400 font-medium">No receipt payments to verify.</div> : verifyOrders.map(order => (
                        <div key={order.id} className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/50 flex flex-col sm:flex-row gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                           <div className="flex-1">
                              <h3 className="font-black text-xl text-gray-900 mb-1 tracking-tight">#{order.customerCode} <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded ml-2 align-middle">{order.customerDetails.paymentMethod.toUpperCase()}</span></h3>
                              <p className="text-sm text-gray-500 mb-4">{order.customerDetails.name} • <span className="font-black text-gray-900 text-lg align-middle">RM {order.total.toFixed(2)}</span></p>
                              <div className="text-sm space-y-2 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                 {order.items.map((i,x)=><div key={x} className="flex justify-between text-gray-700 font-medium"><span><span className="text-gray-400 mr-2">{i.qty}x</span>{i.name}</span></div>)}
                              </div>
                              <button onClick={() => toggleOrderStatus(order.id, order.status)} className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${order.status === 'completed' ? 'bg-gray-200 text-gray-600' : 'bg-lime-500 text-gray-900 hover:bg-lime-600 shadow-md shadow-lime-200'}`}>{order.status === 'completed' ? 'Mark Pending' : 'Approve & Serve'}</button>
                           </div>
                           <div className="w-full sm:w-40 h-40 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative group" onClick={() => order.receiptImage && setViewingReceipt(order.receiptImage)}>
                              {order.receiptImage ? (
                                <>
                                  <img src={order.receiptImage} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 backdrop-blur-[0px] group-hover:backdrop-blur-sm flex items-center justify-center transition-all duration-300"><Eye className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 transform scale-50 group-hover:scale-100 transition-all duration-300"/></div>
                                </>
                              ) : <div className="text-center p-4"><FileCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" /><span className="text-[10px] text-gray-400">No Receipt</span></div>}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
               {staffTab === 'expenses' && (
                   <div className="space-y-8 max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                         <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-green-100 text-left">
                            <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6 text-green-600"/></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
                            <p className="text-3xl font-black text-gray-900">RM {financialStats.totalRevenue.toFixed(2)}</p>
                         </div>
                         <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-red-100 text-left">
                            <div className="bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><TrendingDown className="w-6 h-6 text-red-600"/></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Expenses</p>
                            <p className="text-3xl font-black text-gray-900">RM {financialStats.totalExpenses.toFixed(2)}</p>
                         </div>
                         <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[2rem] shadow-lg text-left text-white">
                            <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><DollarSign className="w-6 h-6 text-white"/></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Net Profit</p>
                            <p className="text-3xl font-black">RM {financialStats.netProfit.toFixed(2)}</p>
                         </div>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-sm border border-white/50">
                         <h3 className="font-black text-xl text-gray-900 mb-6 tracking-tight">Add Expense</h3>
                         <div className="flex flex-col md:flex-row gap-4">
                            <input type="text" placeholder="Item Name" value={expenseName} onChange={e=>setExpenseName(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-gray-400 transition-colors" />
                            <input type="number" placeholder="Cost (RM)" value={expenseCost} onChange={e=>setExpenseCost(e.target.value)} className="w-full md:w-32 bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-gray-400 transition-colors" />
                            <button onClick={addExpense} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"><Plus className="w-5 h-5" /> Add</button>
                         </div>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white/50 overflow-hidden">
                         <div className="p-6 border-b border-gray-100 bg-gray-50/50"><h3 className="font-bold text-gray-900">Recent Transactions</h3></div>
                         <div className="divide-y divide-gray-50">
                           {expenses.length === 0 ? <p className="p-10 text-center text-gray-400 font-medium">No records found.</p> : expenses.map(e => (
                              <div key={e.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                 <div><div className="font-bold text-gray-900">{e.item}</div><div className="text-xs text-gray-500 mt-1 font-medium">{new Date(e.timestamp).toLocaleDateString()}</div></div>
                                 <div className="flex items-center gap-6"><span className="font-black text-gray-900">RM {e.cost.toFixed(2)}</span><button onClick={()=>deleteExpense(e.id)} className="bg-white p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"><Trash2 className="w-4 h-4"/></button></div>
                              </div>
                           ))}
                         </div>
                      </div>
                   </div>
               )}
             </main>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMIZATION */}
      {customizingItem && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{customizingItem.name}</h3>
                  <button onClick={() => setCustomizingItem(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5 text-gray-600"/></button>
               </div>
               
               {/* Options based on type */}
               {customizingItem.type === 'juice' && (
                  <div className="space-y-6 mb-8">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Cup Size</label>
                        <div className="flex flex-col gap-3">
                           {['Small', 'Medium', 'Large'].map(s => {
                              const p = s === 'Small' ? '5.00' : s === 'Medium' ? '7.00' : '8.00';
                              const label = s === 'Small' ? 'Small (12oz)' : s === 'Medium' ? 'Medium (16oz)' : 'Large (22oz)';
                              return (
                                 <button key={s} onClick={() => setCupSize(s)} className={`flex justify-between items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${cupSize === s ? 'bg-lime-50 border-lime-500 text-lime-900 shadow-sm scale-[1.01]' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'}`}>
                                    <span className="font-bold">{label}</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${cupSize === s ? 'bg-white border-lime-200 text-lime-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>RM {p}</span>
                                 </button>
                              )
                           })}
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Sugar Level</label>
                        <div className="flex gap-2 flex-wrap">
                           {['Normal Sugar','Less Sugar','No Sugar'].map(s=><button key={s} onClick={()=>setSugarLevel(s)} className={`px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all ${sugarLevel===s?'bg-lime-50 border-lime-500 text-lime-900':'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>{s}</button>)}
                        </div>
                     </div>
                  </div>
               )}
               
               {customizingItem.type === 'physio' && (
                  <div className="space-y-6 mb-8">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Select Client Type</label>
                        <div className="flex flex-col gap-3">
                           {[{ id: 'student', label: 'IIUM Student', price: '25.00' }, { id: 'staff', label: 'IIUM Staff', price: '45.00' }, { id: 'public', label: 'Public', price: '80.00' }].map((rate) => (
                              <button key={rate.id} onClick={() => setPhysioRate(rate.id)} className={`flex justify-between items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${physioRate === rate.id ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm scale-[1.01]' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'}`}>
                                 <span className="font-bold">{rate.label}</span>
                                 <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${physioRate === rate.id ? 'bg-white border-teal-200 text-teal-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>RM {rate.price}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {customizingItem.type === 'massage' && (
                  <div className="space-y-6 mb-8">
                     {customizingItem.id === 'm1' && (
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Select Area</label>
                           <div className="flex flex-col gap-2">
                              {['Head & Shoulder', 'Shoulder & Back', 'Lower Body'].map(area => (
                                 <button key={area} onClick={() => setMassageArea(area)} className={`px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all flex justify-between items-center ${massageArea === area ? 'bg-purple-50 border-purple-500 text-purple-900' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                                    {area}
                                    {massageArea === area && <CheckCircle className="w-5 h-5 text-purple-500" />}
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}
                     <div className="pt-2">
                        <button onClick={() => setMassageAddOn(!massageAddOn)} className={`w-full flex justify-between items-center px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${massageAddOn ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                           <div className="text-left">
                              <span className="font-bold block">Add 10 Mins Extra</span>
                              <span className="text-xs font-medium opacity-70">+ RM 6.00</span>
                           </div>
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${massageAddOn ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300'}`}>
                              {massageAddOn && <Check className="w-4 h-4" strokeWidth={3}/>}
                           </div>
                        </button>
                     </div>
                  </div>
               )}

               {customizingItem.id === 's4' && (
                  <div className="space-y-6 mb-8">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Select Material</label>
                        <div className="flex gap-3">
                           {['Silicone', 'Mesh'].map((type) => (
                              <button key={type} onClick={() => setSwimCapType(type)} className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${swimCapType === type ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
                                 {type}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
               
               {customizingItem.bundle && (
                  <div className="mb-8 bg-yellow-50/80 border border-yellow-200 p-4 rounded-2xl flex items-start gap-3 text-sm text-yellow-800 shadow-sm">
                     <Tag className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                     <div>
                        <span className="font-bold block mb-0.5 text-yellow-900">Bundle Offer!</span>
                        Rent 2 for RM 5.00 (Save RM 1.00)
                     </div>
                  </div>
               )}
               
               <button onClick={confirmAddToCart} className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 rounded-[1.5rem] font-bold text-lg shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                  Add to Order • RM {getPrice().toFixed(2)}
               </button>
            </div>
         </div>
      )}

      {/* MODAL: CHECKOUT / CART */}
      {isCartExpanded && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] p-6 sm:p-8 h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/50">
               <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/95 backdrop-blur z-10 pb-4 border-b border-gray-100">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h2>
                  <button onClick={() => setIsCartExpanded(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5"/></button>
               </div>
               
               {/* Items */}
               <div className="space-y-4 mb-8">
                  {cart.map((item,i) => {
                     const requiresAppointment = ['physio', 'massage', 'swimming_coaching'].includes(item.type);
                     return (
                     <div key={i} className="flex flex-col border border-gray-100 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                           <div className="flex gap-4 items-center">
                              <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold shadow-sm">{item.qty}</span>
                              <div><p className="font-bold text-gray-900">{item.name}</p><p className="text-xs text-gray-500 font-medium mt-0.5">{item.variant}</p></div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="font-black text-gray-900">RM {(item.price*item.qty).toFixed(2)}</span>
                              <button onClick={()=>removeFromCart(i)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                           </div>
                        </div>

                        {/* --- PER-ITEM APPOINTMENT PICKER --- */}
                        {requiresAppointment && (
                           <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Calendar className="w-4 h-4"/> Schedule Date & Time</h4>
                              
                              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-3">
                                 {availableDates.map((date, idx) => {
                                    const isSelected = item.dateObj && date.toDateString() === item.dateObj.toDateString();
                                    const disabled = getSlotsForItem(date, item.type).length === 0;
                                    return (
                                       <button
                                          key={idx}
                                          onClick={() => !disabled && setItemSchedule(i, date, null)}
                                          className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl border-2 transition-all ${isSelected ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-sm' : disabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                       >
                                          <span className="text-[10px] uppercase font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                          <span className="text-lg font-black leading-none">{date.getDate()}</span>
                                       </button>
                                    );
                                 })}
                              </div>

                              {item.dateObj && (
                                 <div className="grid grid-cols-3 gap-2">
                                    {getSlotsForItem(item.dateObj, item.type).map(time => {
                                       const booked = isSlotBooked(item.dateObj.toLocaleDateString(), time, i);
                                       const isSelected = item.time === time;
                                       return (
                                          <button
                                             key={time}
                                             onClick={() => !booked && setItemSchedule(i, item.dateObj, time)}
                                             disabled={booked}
                                             className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 ${booked ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed line-through' : isSelected ? 'bg-teal-500 border-teal-500 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                          >
                                             {booked ? <X className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                                             {time}
                                          </button>
                                       )
                                    })}
                                 </div>
                              )}
                              {item.dateObj && getSlotsForItem(item.dateObj, item.type).length === 0 && (
                                 <p className="text-xs text-gray-500 font-medium text-center py-2 bg-gray-50 rounded-lg">No slots available on this day.</p>
                              )}
                           </div>
                        )}
                     </div>
                  )})}
               </div>

               {/* Form */}
               <div className="space-y-4 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-4 h-4"/> Customer Details</h3>
                  <input placeholder="Full Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all bg-white" />
                  <div className="flex gap-3">
                     <input placeholder="Phone" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className="w-1/2 p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all bg-white" />
                     <input placeholder="Email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} className="w-1/2 p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all bg-white" />
                  </div>
                  
                  {cartHasMobileService ? (
                     <div className="pt-4 border-t border-gray-200 mt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Service Location & ID</h3>
                        
                        {(!cartHasPhysio && cartHasMassage) && (
                           <div className="flex gap-2 mb-4 p-1.5 bg-gray-200/50 rounded-xl">
                              {['student', 'staff', 'public'].map(type => (
                                 <button key={type} onClick={() => setMassageClientType(type)} className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${massageClientType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{type}</button>
                              ))}
                           </div>
                        )}
                        
                        <div className="flex gap-3 mb-4">
                           <button disabled className="flex-1 py-3 text-xs font-bold rounded-xl border-2 bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed">Walk in (Unavailable)</button>
                           <button onClick={()=>setDeliveryMode('room')} className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${deliveryMode==='room'?'bg-gray-900 border-gray-900 text-white shadow-md':'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                              {getEffectiveClientType() === 'student' ? 'Room Service' : 'In-house Service'}
                              {getEffectiveClientType() !== 'student' && <span className={`text-[9px] ${deliveryMode==='room'?'text-gray-300':'text-orange-600'}`}>+RM2/km (Pay F2F)</span>}
                           </button>
                        </div>

                        <div className="space-y-3">
                           {getEffectiveClientType() === 'student' && (
                              <div className="flex gap-3">
                                 <input placeholder="Matric No." value={matricNo} onChange={e=>setMatricNo(e.target.value)} className="w-1/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                                 <input placeholder="Block" value={customerBlock} onChange={e=>setCustomerBlock(e.target.value)} className="w-1/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                                 <input placeholder="Room" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} className="w-1/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                              </div>
                           )}
                           {getEffectiveClientType() === 'staff' && (
                              <div className="flex gap-3">
                                 <input placeholder="Staff ID" value={staffId} onChange={e=>setStaffId(e.target.value)} className="w-1/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                                 <input placeholder="Full Home Address" value={homeAddress} onChange={e=>setHomeAddress(e.target.value)} className="w-2/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                              </div>
                           )}
                           {getEffectiveClientType() === 'public' && (
                              <div className="flex gap-3">
                                 <input placeholder="Last 4-Digit IC" value={matricNo} onChange={e=>setMatricNo(e.target.value)} className="w-1/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                                 <input placeholder="Full Home Address" value={homeAddress} onChange={e=>setHomeAddress(e.target.value)} className="w-2/3 bg-white p-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                              </div>
                           )}
                        </div>
                     </div>
                  ) : cartHasCoaching ? (
                     <div className="pt-4 border-t border-gray-200 mt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Coaching Location</h3>
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold border border-blue-200 flex items-center gap-3 shadow-sm">
                           <div className="bg-blue-100 p-2 rounded-lg"><MapPin className="w-5 h-5 text-blue-600"/></div>
                           Swimming Pool, Sport Complex IIUM Kuantan
                        </div>
                     </div>
                  ) : (
                     <div className="pt-4 border-t border-gray-200 mt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Delivery Location</h3>
                        {!cartHasCoaching && (
                           <div className="flex gap-3 mb-3">
                              <button onClick={()=>setDeliveryMode('lobby')} className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all ${deliveryMode==='lobby'?'bg-gray-900 border-gray-900 text-white shadow-md':'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Lobby Collection</button>
                              <button onClick={()=>setDeliveryMode('room')} className={`flex-1 py-3 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1 ${deliveryMode==='room'?'bg-gray-900 border-gray-900 text-white shadow-md':'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Room Delivery <span className={`${deliveryMode==='room'?'bg-white/20':'bg-gray-100 text-gray-500'} px-1.5 py-0.5 rounded ml-1`}>+0.50</span></button>
                           </div>
                        )}
                        <div className="flex gap-3">
                           <input placeholder="Block" value={customerBlock} onChange={e=>setCustomerBlock(e.target.value)} className="w-1/2 bg-white p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                           {deliveryMode === 'room' && !cartHasCoaching && (
                              <input placeholder="Room Number" value={roomNumber} onChange={e=>setRoomNumber(e.target.value)} className="w-1/2 bg-white p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 transition-all" />
                           )}
                        </div>
                     </div>
                  )}
               </div>

               {/* Payment Method */}
               <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Payment Method</h3>
                  <div className="flex gap-3">
                     <button onClick={()=>setPaymentMethod('cash')} className={`flex-1 py-4 rounded-xl text-sm font-bold border-2 transition-all ${paymentMethod==='cash'?'bg-green-50 border-green-500 text-green-800 shadow-sm':'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Pay Cash</button>
                     <button onClick={()=>{setPaymentMethod('qr'); setShowPaymentModal(true); setReceiptImage(null);}} className={`flex-1 py-4 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 transition-all ${paymentMethod==='qr'?'bg-blue-50 border-blue-500 text-blue-800 shadow-sm':'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}><Box className="w-4 h-4"/> QR Pay</button>
                  </div>
               </div>

                              {/* Voucher Code */}
               <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Voucher
                  </h3>

                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-lime-50 border border-lime-200 p-4 rounded-2xl">
                      <div>
                        <p className="text-sm font-black text-gray-900">{appliedVoucher.code}</p>
                        <p className="text-xs font-bold text-lime-700">{appliedVoucher.percent}% discount applied</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeVoucher}
                        className="px-4 py-2 rounded-xl font-bold text-sm bg-white border border-gray-200 hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        placeholder="Enter voucher code (e.g., JACK10)"
                        value={voucherInput}
                        onChange={(e) => { setVoucherInput(e.target.value); setVoucherMsg(''); }}
                        className="flex-1 p-4 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={applyVoucher}
                        className="px-6 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {voucherMsg && (
                    <p className="text-xs font-bold mt-3 text-gray-600">{voucherMsg}</p>
                  )}
               </div>
               <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-gray-900 py-5 rounded-[1.5rem] font-black text-lg shadow-[0_8px_20px_rgba(132,204,22,0.3)] hover:shadow-[0_12px_25px_rgba(132,204,22,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex justify-between px-8 items-center border border-lime-300">
                  <span>Place Order</span>
                  <span className="bg-white/40 px-3 py-1.5 rounded-xl border border-white/50 drop-shadow-sm">RM {calculateTotal().toFixed(2)}</span>
               </button>
            </div>
         </div>
      )}

      {/* MODAL: QR PAYMENT (MANDATORY UPLOAD) */}
      {showPaymentModal && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-6"><h3 className="font-black text-2xl text-gray-900 tracking-tight">Scan to Pay</h3><button onClick={()=>setShowPaymentModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5"/></button></div>
               
               <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 text-center mb-6 relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-[10px] font-black tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">DUITNOW</div>
                  <img src={DUITNOW_QR_URL} className="w-full max-w-[220px] mx-auto rounded-2xl border-4 border-white shadow-md mb-6 object-contain mix-blend-multiply" />
                  <div className="text-left bg-white p-4 rounded-2xl text-sm space-y-3 border border-gray-100 shadow-sm">
                     <p className="flex justify-between items-center"><span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Bank</span><span className="font-bold text-gray-900">{BUSINESS_BANK_DETAILS.bankName}</span></p>
                     <p className="flex justify-between items-center"><span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Acc No.</span><span className="font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 text-xs flex items-center gap-2">{BUSINESS_BANK_DETAILS.accountNumber} <Copy className="w-3 h-3 text-gray-400"/></span></p>
                     <p className="flex justify-between items-center"><span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Name</span><span className="font-bold text-xs truncate w-32 text-right text-gray-900">{BUSINESS_BANK_DETAILS.accountName}</span></p>
                     <div className="mt-3 pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Amount to Pay</span>
                        <span className="font-black text-3xl text-blue-600 leading-none tracking-tighter">RM {calculateTotal().toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               {/* UPLOAD SECTION */}
               <div className="mb-6">
                  <label className={`block w-full border-2 border-dashed rounded-[2rem] p-6 text-center cursor-pointer transition-all duration-300 ${receiptImage ? 'border-green-400 bg-green-50 shadow-inner' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                     <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                     {receiptImage ? (
                        <div className="relative animate-in zoom-in fade-in duration-300">
                           <img src={receiptImage} className="h-32 mx-auto rounded-xl object-contain shadow-md bg-white p-1 border border-gray-100" />
                           <div className="mt-4 text-xs font-bold text-green-800 flex items-center justify-center gap-1.5 bg-green-100 py-1.5 px-4 rounded-full w-fit mx-auto border border-green-200"><CheckCircle className="w-4 h-4"/> Receipt Attached</div>
                           <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">Click to replace</p>
                        </div>
                     ) : (
                        <div className="py-6">
                           <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100"><Upload className="w-6 h-6 text-blue-500" /></div>
                           <span className="text-sm font-bold text-gray-700 block mb-1">Upload Receipt Image</span>
                           <span className="text-xs text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider mt-1">* Mandatory Proof</span>
                        </div>
                     )}
                  </label>
               </div>

               <button 
                  onClick={submitOrder} 
                  disabled={!receiptImage || isLoading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${receiptImage ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
               >
                  {isLoading ? <Loader2 className="animate-spin w-6 h-6"/> : 'Confirm Payment'}
               </button>
            </div>
         </div>
      )}

      {/* MODAL: GAME */}
      {showGameModal && (
         <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-[3rem] p-8 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 shadow-2xl">
               <div className="text-center">
                  <h2 className="text-4xl font-black italic uppercase mb-8 flex justify-center items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 drop-shadow-sm"><Zap className="text-orange-500 fill-current w-8 h-8"/> Fight!</h2>
                  
                  {gameStatus === 'won' ? (
                     <div className="animate-in zoom-in fade-in duration-500">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200/50 border border-yellow-200"><Trophy className="w-12 h-12 text-yellow-500"/></div>
                        <h3 className="font-black text-3xl mb-2 text-gray-900 tracking-tight">YOU WON!</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Claim your free premium drink.</p>
                        
                        <div className="space-y-4 mb-8 text-left bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                           <input className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all" placeholder="Your Name" onChange={e=>setTrialCustomer({...trialCustomer,name:e.target.value})} />
                           <input className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all" placeholder="Matric No" onChange={e=>setTrialCustomer({...trialCustomer,matric:e.target.value})} />
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Select Reward</p>
                              <div className="flex gap-2">
                                 {['Watermelon','Orange','Lemon'].map(f=><button key={f} onClick={()=>setTrialCustomer({...trialCustomer,choice:f})} className={`flex-1 py-3 text-[11px] font-bold border-2 rounded-xl transition-all ${trialCustomer.choice===f?'bg-yellow-50 border-yellow-400 text-yellow-800 shadow-sm scale-105':'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}>{f}</button>)}
                              </div>
                           </div>
                        </div>
                        <button onClick={submitTrialClaim} disabled={isLoading} className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2">
                           {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Gift className="w-5 h-5"/> Claim Prize</>}
                        </button>
                     </div>
                  ) : (
                     <>
                        <div className="grid grid-cols-3 gap-3 mb-8 max-w-[260px] mx-auto bg-gray-50 p-4 rounded-[2rem] border border-gray-100 shadow-inner">
                           {gameBoard.map((c,i)=><button key={i} onClick={()=>handleGameClick(i)} disabled={c!==null || gameStatus!=='playing'} className={`h-20 rounded-2xl text-4xl font-black transition-all shadow-sm ${c==='X'?'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/30 scale-105 border border-blue-400':c==='O'?'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30 scale-105 border border-red-400':'bg-white hover:bg-gray-100 text-gray-300 border border-gray-200'}`}>{c}</button>)}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-6">
                           <div className={`w-2 h-2 rounded-full animate-pulse ${gameStatus === 'playing' ? (isPlayerTurn ? 'bg-blue-500' : 'bg-red-500') : 'bg-gray-400'}`}></div>
                           <p className="font-bold text-gray-500 text-sm uppercase tracking-widest">{gameStatus==='playing'? (isPlayerTurn?"Your Turn (X)":"Bot Thinking...") : (gameStatus==='lost'?"You Lost!":"Draw!")}</p>
                        </div>
                        
                        {gameStatus!=='playing' && <button onClick={initGame} className="mt-2 bg-gray-900 text-white px-10 py-4 rounded-xl text-sm font-bold shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"><RefreshCcw className="w-4 h-4"/> Try Again</button>}
                        <button onClick={()=>setShowGameModal(false)} className="absolute top-6 right-6 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900"><X className="w-5 h-5"/></button>
                     </>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* MODAL: VIEW RECEIPT (STAFF) */}
      {viewingReceipt && (
         <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" onClick={()=>setViewingReceipt(null)}>
            <img src={viewingReceipt} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl animate-in zoom-in duration-200 border border-white/10" />
            <div className="absolute bottom-8 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold border border-white/20">Click anywhere to close</div>
         </div>
      )}

      {/* CONFIRMATION VOUCHER */}
      {activeVoucher && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center relative overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-white/50">
               <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-lime-50 to-white -z-10"></div>
               <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-lime-100"><Check className="w-12 h-12 text-lime-500" strokeWidth={3}/></div>
               <h2 className="text-3xl font-black mb-2 text-gray-900 tracking-tight">Order Sent!</h2>
               <p className="text-gray-500 mb-8 font-medium">We've received your order. Please wait for confirmation.</p>
               <button onClick={()=>setActiveVoucher(null)} className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] shadow-xl transition-transform">Done</button>
            </div>
         </div>
      )}
    </div>
  );
}
