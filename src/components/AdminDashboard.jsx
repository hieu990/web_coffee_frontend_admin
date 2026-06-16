import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TestConnection from './TestConnection';
import AdminAddProduct from './AdminAddProduct';

// ---------------------------------------------------------------------------
// Fix #1: Beep Sound for new POS orders using Web Audio API
// ---------------------------------------------------------------------------
function playOrderBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Browser may block autoplay audio, ignore silently
  }
}

// ---------------------------------------------------------------------------
// Toast Notification System
// ---------------------------------------------------------------------------
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
  const colors = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    error:   'border-red-500/40 bg-red-500/10 text-red-300',
    info:    'border-sky-500/40 bg-sky-500/10 text-sky-300',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  };
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md
            shadow-[0_8px_32px_rgba(0,0,0,0.6)] font-mono text-xs font-bold
            animate-[toast-slide-in_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]
            ${colors[t.type] || colors.info}`}
        >
          <span className="material-symbols-outlined text-base flex-shrink-0">{icons[t.type] || icons.info}</span>
          <span className="max-w-xs">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Dialog
// ---------------------------------------------------------------------------
function ConfirmDialog({ open, title, message, confirmLabel = 'Xác nhận', onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 max-w-sm w-full mx-4 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <span className="material-symbols-outlined text-xl">{danger ? 'warning' : 'help'}</span>
        </div>
        <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-[#2a2f3a] hover:bg-[#343a47] text-slate-300 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-colors text-white ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton Loader Card
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-5 space-y-3 overflow-hidden relative">
      <div className="absolute inset-0 admin-skeleton-shimmer" />
      <div className="h-4 w-1/2 rounded bg-white/5" />
      <div className="h-8 w-2/3 rounded bg-white/5" />
      <div className="h-3 w-1/3 rounded bg-white/5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Real-time Clock
// ---------------------------------------------------------------------------
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-xs font-mono text-amber-400/80 tracking-widest hidden md:block tabular-nums">
      {time}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ShiftSchedulerForm
// ---------------------------------------------------------------------------
function ShiftSchedulerForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [hourlyRate, setHourlyRate] = useState('20000');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const startStr = `${date} ${startTime}:00`;
    const endStr = `${date} ${endTime}:00`;

    onSubmit({
      employee_name: name.trim(),
      shift_type: shiftType,
      start_time: startStr,
      end_time: endStr,
      hourly_rate: parseFloat(hourlyRate) || 20000,
      notes: notes.trim()
    });

    setName('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-left">
      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tên nhân viên</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhân viên"
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ca trực</label>
          <select
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
          >
            <option value="morning">Ca Sáng</option>
            <option value="afternoon">Ca Chiều</option>
            <option value="night">Ca Tối</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Lương (đ/giờ)</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="Ví dụ: 20000"
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ngày trực</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Giờ bắt đầu</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Giờ kết thúc</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ghi chú</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Phân công vị trí, việc cần làm..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition-all shadow-[0_0_16px_rgba(245,158,11,0.1)] hover:scale-[1.01]"
      >
        LÊN LỊCH CA TRỰC
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// PromotionForm
// ---------------------------------------------------------------------------
function PromotionForm({ onSubmit }) {
  const [promoType, setPromoType] = useState('FlashSale');
  const [title, setTitle] = useState('');
  
  // Flash Sale fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [discountPercentFS, setDiscountPercentFS] = useState('10');

  // Voucher fields
  const [code, setCode] = useState('');
  const [discountPercentV, setDiscountPercentV] = useState('10');
  const [usageLimit, setUsageLimit] = useState('100');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      promotion_type: promoType,
      title: title.trim()
    };

    if (promoType === 'FlashSale') {
      if (!startDate || !endDate) return;
      payload.start_date = startDate.replace('T', ' ') + ':00';
      payload.end_date = endDate.replace('T', ' ') + ':00';
      payload.discount_percentage = parseFloat(discountPercentFS) || 10;
    } else {
      if (!code.trim()) return;
      payload.code = code.trim().toUpperCase();
      payload.discount_percentage = parseFloat(discountPercentV) || 10;
      payload.usage_limit = parseInt(usageLimit) || 100;
    }

    onSubmit(payload);

    // Reset fields
    setTitle('');
    setStartDate('');
    setEndDate('');
    setCode('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-left">
      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Loại khuyến mãi</label>
        <select
          value={promoType}
          onChange={(e) => setPromoType(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
        >
          <option value="FlashSale">Flash Sale (Theo giờ/ngày)</option>
          <option value="Voucher">Mã Voucher (Nhập mã)</option>
        </select>
      </div>

      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tiêu đề chiến dịch</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Giảm giá Chào Hè / Tri ân khách hàng"
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
          required
        />
      </div>

      {promoType === 'FlashSale' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Phần trăm giảm giá (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={discountPercentFS}
              onChange={(e) => setDiscountPercentFS(e.target.value)}
              placeholder="Ví dụ: 15"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Mã Voucher (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ví dụ: HELLO2026"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Giới hạn sử dụng</label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Ví dụ: 100"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Phần trăm giảm giá (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={discountPercentV}
              onChange={(e) => setDiscountPercentV(e.target.value)}
              placeholder="Ví dụ: 20"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none"
              required
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition-all shadow-[0_0_16px_rgba(245,158,11,0.1)] hover:scale-[1.01]"
      >
        TẠO KHUYẾN MÃI MỚI
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Fix #2: Edit Product Modal
// ---------------------------------------------------------------------------
function EditProductModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item.name || '');
  const [price, setPrice] = useState(item.price || '');
  const [category, setCategory] = useState(item.category || '');
  const [costPrice, setCostPrice] = useState(item.cost_price || '');
  const [description, setDescription] = useState(item.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(item._id, {
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      cost_price: parseFloat(costPrice) || 0,
      description: description.trim()
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1d24] border border-amber-500/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-[0_25px_60px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-5 border-b border-[#2a2f3a] pb-3">
          <span className="material-symbols-outlined text-amber-400">edit</span>
          <h3 className="text-sm font-bold text-white">Chỉnh sửa sản phẩm</h3>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-3 text-xs font-mono">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tên sản phẩm</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Giá bán (đ)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Giá vốn (đ) — COGS</label>
              <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Danh mục</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none">
              <option value="coffee">Coffee</option>
              <option value="milk-tea">Milk Tea</option>
              <option value="juice">Juice</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Mô tả</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none resize-none" />
          </div>
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-[#2a2f3a] hover:bg-[#343a47] text-slate-300 font-bold rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg transition-all disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminDashboard
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const { toasts, addToast } = useToast();

  // States
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalReservations: 0, topItems: [] });
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [refreshMenuTrigger, setRefreshMenuTrigger] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  // Fix #2: Edit modal
  const [editingProduct, setEditingProduct] = useState(null);
  // Fix #3: Date filter for stats
  const [statsDateFrom, setStatsDateFrom] = useState('');
  const [statsDateTo, setStatsDateTo] = useState('');
  // Fix #10: Username from localStorage
  const adminUsername = localStorage.getItem('adminUsername') || 'Administrator';
  // Fix #1: Track previous order count for beep
  const prevPendingCountRef = useRef(0);

  // Confirm dialog state
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null, danger: false, confirmLabel: 'Xác nhận' });
  const showConfirm = useCallback((opts) => setConfirm({ open: true, ...opts }), []);
  const closeConfirm = useCallback(() => setConfirm(c => ({ ...c, open: false })), []);

  // Route Guard
  useEffect(() => {
    if (localStorage.getItem('isAdminAuthenticated') !== 'true') navigate('/admin/login');
  }, [navigate]);

  // Load data based on active tab
  const loadStats = useCallback(async (from = '', to = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to)   params.append('to', to);
      const res = await axios.get(
        `http://localhost/Web_coffee/admin/metrics/dashboard.php${params.toString() ? '?' + params.toString() : ''}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setStats({
          totalOrders: res.data.totalOrders,
          totalRevenue: res.data.current_metrics.total_revenue,
          totalReservations: res.data.totalReservations,
          totalCostOfGoods: res.data.current_metrics.total_cost_of_goods,
          profitMargin: res.data.current_metrics.profit_margin,
          topItems: res.data.current_metrics.top_selling_items || []
        });
      }
    } catch (err) {
      addToast('Không thể tải báo cáo thống kê.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'stats') {
          await loadStats(statsDateFrom, statsDateTo);
          return;
        } else if (activeTab === 'orders') {
          const res = await axios.get('http://localhost/Web_coffee/admin/get_orders.php', { withCredentials: true });
          if (Array.isArray(res.data)) setOrders(res.data);
        } else if (activeTab === 'menu') {
          const [activeRes, trashRes] = await Promise.all([
            axios.get('http://localhost/Web_coffee/admin/menu/list.php', { withCredentials: true }),
            axios.get('http://localhost/Web_coffee/admin/menu/list.php?view=trash', { withCredentials: true })
          ]);
          if (Array.isArray(activeRes.data)) setMenuItems(activeRes.data);
          if (Array.isArray(trashRes.data)) setTrashItems(trashRes.data);
        } else if (activeTab === 'reservations') {
          const res = await axios.get('http://localhost/Web_coffee/admin/get_reservations.php', { withCredentials: true });
          if (Array.isArray(res.data)) setReservations(res.data);
        } else if (activeTab === 'testimonials') {
          const res = await axios.get('http://localhost/Web_coffee/admin/get_all_testimonials.php', { withCredentials: true });
          if (Array.isArray(res.data)) setTestimonials(res.data);
        } else if (activeTab === 'shifts') {
          const res = await axios.get('http://localhost/Web_coffee/admin/shifts/list.php', { withCredentials: true });
          if (Array.isArray(res.data)) setShifts(res.data);
        } else if (activeTab === 'inventory') {
          const res = await axios.get('http://localhost/Web_coffee/admin/inventory/list.php', { withCredentials: true });
          if (Array.isArray(res.data)) setInventory(res.data);
        } else if (activeTab === 'promotions') {
          const res = await axios.get('http://localhost/Web_coffee/admin/promotions/list.php', { withCredentials: true });
          if (Array.isArray(res.data)) setPromotions(res.data);
        }
      } catch (err) {
        console.error('Failed to load data for tab ' + activeTab, err);
        if (err.response?.status === 401) {
          localStorage.removeItem('isAdminAuthenticated');
          localStorage.removeItem('adminUsername');
          navigate('/admin/login');
        } else {
          addToast('Không thể tải dữ liệu. Kiểm tra kết nối server.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab, refreshMenuTrigger, navigate, addToast, loadStats]);

  // POS polling — Fix #1: play beep when new Pending orders arrive
  useEffect(() => {
    if (activeTab !== 'orders') return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost/Web_coffee/admin/get_orders.php', { withCredentials: true });
        if (Array.isArray(res.data)) {
          const newPendingCount = res.data.filter(o => o.status === 'Pending').length;
          if (newPendingCount > prevPendingCountRef.current) {
            playOrderBeep();
            addToast(`🔔 Có ${newPendingCount - prevPendingCountRef.current} đơn hàng mới!`, 'warning');
          }
          prevPendingCountRef.current = newPendingCount;
          setOrders(res.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('isAdminAuthenticated');
          localStorage.removeItem('adminUsername');
          navigate('/admin/login');
        }
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTab, navigate, addToast]);

  const handleLogout = () => {
    showConfirm({
      title: 'Đăng xuất hệ thống?',
      message: 'Phiên làm việc hiện tại sẽ kết thúc. Bạn cần đăng nhập lại để truy cập.',
      confirmLabel: 'Đăng xuất',
      danger: true,
      onConfirm: () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/admin/login');
      }
    });
  };

  // Fix #2: Update (edit) product
  const handleEditProduct = async (id, updates) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/menu/update.php',
        { id, ...updates },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (response.data?.success) {
        setEditingProduct(null);
        setRefreshMenuTrigger(prev => prev + 1);
        addToast('Sản phẩm đã được cập nhật thành công.', 'success');
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      addToast('Không thể cập nhật sản phẩm.', 'error');
    }
  };

  // Fix #8: Restore from trash
  const handleRestoreProduct = async (id) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/menu/restore.php',
        { id },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (response.data?.success) {
        setRefreshMenuTrigger(prev => prev + 1);
        addToast('Sản phẩm đã được khôi phục vào thực đơn.', 'success');
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      addToast('Không thể khôi phục sản phẩm.', 'error');
    }
  };

  // Fix #9: Add stock (increment mode)
  const handleAddStock = async (id, addAmount) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/inventory/update_stock.php',
        { id, mode: 'add', add_amount: parseFloat(addAmount) },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (response.data?.success) {
        addToast(`Đã nhập thêm ${addAmount} đơn vị vào kho.`, 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      addToast('Không thể nhập thêm kho.', 'error');
    }
  };

  // 1. Toggle Menu (Stock status)
  const handleToggleMenu = async (id, currentStatus) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/menu/update.php', {
        id, is_in_stock: !currentStatus
      }, { withCredentials: true });
      if (response.data?.success) {
        setRefreshMenuTrigger(prev => prev + 1);
        addToast(!currentStatus ? 'Món đã được bật — Còn hàng' : 'Món đã được tắt — Hết hàng', 'success');
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể cập nhật trạng thái món.', 'error');
    }
  };

  // 1b. Soft Delete Product — Fix #8
  const handleDeleteProduct = (id, name) => {
    showConfirm({
      title: `Chuyển "${name}" vào Thùng rác?`,
      message: 'Sản phẩm sẽ bị ẩn khỏi thực đơn nhưng vẫn có thể khôi phục trong tab Thùng rác.',
      confirmLabel: 'Chuyển vào Thùng rác',
      danger: false,
      onConfirm: async () => {
        closeConfirm();
        try {
          const response = await axios.post('http://localhost/Web_coffee/admin/menu/delete.php',
            { id, permanent: false },
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
          );
          if (response.data?.success) {
            setRefreshMenuTrigger(prev => prev + 1);
            addToast('Đã chuyển vào Thùng rác. Có thể khôi phục.', 'warning');
          } else {
            addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
          }
        } catch (err) {
          addToast('Không thể xóa sản phẩm.', 'error');
        }
      }
    });
  };

  // 1b2. Permanent delete from Trash
  const handlePermanentDelete = (id, name) => {
    showConfirm({
      title: `Xóa vĩnh viễn "${name}"?`,
      message: 'Hành động này không thể hoàn tác. Sản phẩm sẽ biến mất hoàn toàn khỏi hệ thống.',
      confirmLabel: 'Xóa vĩnh viễn',
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          const response = await axios.post('http://localhost/Web_coffee/admin/menu/delete.php',
            { id, permanent: true },
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
          );
          if (response.data?.success) {
            setRefreshMenuTrigger(prev => prev + 1);
            addToast('Đã xóa vĩnh viễn sản phẩm.', 'success');
          } else {
            addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
          }
        } catch (err) {
          addToast('Không thể xóa vĩnh viễn.', 'error');
        }
      }
    });
  };

  // 1c. HR & Shift Handlers
  const handleCreateShift = async (payload) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/shifts/create.php', payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data?.success) {
        addToast('Lên lịch ca làm việc thành công.', 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể tạo ca làm.', 'error');
    }
  };

  const handleUpdateShiftStatus = async (id, status) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/shifts/update.php', { id, status }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data?.success) {
        addToast(`Cập nhật trạng thái ca làm → ${status}`, 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể cập nhật ca làm.', 'error');
    }
  };

  const handleSwapShiftType = async (id, newType) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/shifts/update.php', { id, shift_type: newType }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data?.success) {
        addToast(`Đã chuyển ca làm sang ca: ${newType}`, 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể chuyển ca làm.', 'error');
    }
  };

  const handleDeleteShift = (id) => {
    showConfirm({
      title: 'Xóa ca làm này khỏi lịch trình?',
      message: 'Lịch trình làm việc của nhân viên này sẽ bị gỡ bỏ vĩnh viễn.',
      confirmLabel: 'Xóa ca làm',
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          const response = await axios.post('http://localhost/Web_coffee/admin/shifts/delete.php', { id }, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          });
          if (response.data?.success) {
            addToast('Đã xóa ca làm việc.', 'success');
            setRefreshMenuTrigger(p => p + 1);
          } else {
            addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
          }
        } catch (err) {
          console.error(err);
          addToast('Không thể xóa ca làm.', 'error');
        }
      }
    });
  };

  // 1d. Inventory Handlers — Fix #9: mode 'set' (ghi đè)
  const handleUpdateStock = async (id, newStock) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/inventory/update_stock.php', {
        id, mode: 'set', stock_level: parseFloat(newStock)
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data?.success) {
        addToast('Đã ghi đè mức tồn kho nguyên liệu.', 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể cập nhật tồn kho.', 'error');
    }
  };

  // 1e. Promotion Handlers
  const handleCreatePromotion = async (payload) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/promotions/create.php', payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data?.success) {
        addToast('Tạo sự kiện khuyến mãi thành công.', 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Không thể tạo khuyến mãi.', 'error');
    }
  };

  const handleTogglePromotion = async (id, currentStatus) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/promotions/toggle.php', {
        id, is_active: !currentStatus
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (response.data?.success) {
        addToast(!currentStatus ? 'Đã kích hoạt chương trình khuyến mãi.' : 'Đã tạm dừng chương trình khuyến mãi.', 'success');
        setRefreshMenuTrigger(p => p + 1);
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể cập nhật trạng thái khuyến mãi.', 'error');
    }
  };

  const handleDeletePromotion = (id) => {
    showConfirm({
      title: 'Xóa khuyến mãi này?',
      message: 'Chương trình khuyến mãi sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      confirmLabel: 'Xóa vĩnh viễn',
      danger: true,
      onConfirm: async () => {
        closeConfirm();
        try {
          const response = await axios.post('http://localhost/Web_coffee/admin/promotions/delete.php', { id }, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          });
          if (response.data?.success) {
            addToast('Đã xóa chương trình khuyến mãi.', 'success');
            setRefreshMenuTrigger(p => p + 1);
          } else {
            addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
          }
        } catch (err) {
          console.error(err);
          addToast('Không thể xóa khuyến mãi.', 'error');
        }
      }
    });
  };


  // 2. Update Order
  const handleUpdateOrder = async (id, newStatus) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/update_order.php', {
        id, status: newStatus
      }, { withCredentials: true });
      if (response.data?.success) {
        const res = await axios.get('http://localhost/Web_coffee/admin/get_orders.php', { withCredentials: true });
        if (Array.isArray(res.data)) setOrders(res.data);
        const labels = { Preparing: 'Đang pha chế', Completed: 'Hoàn thành', Cancelled: 'Đã hủy đơn' };
        addToast(`Đơn hàng → ${labels[newStatus] || newStatus}`, newStatus === 'Cancelled' ? 'warning' : 'success');
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể cập nhật trạng thái đơn hàng.', 'error');
    }
  };

  const handleCancelOrder = (id) => {
    showConfirm({
      title: 'Hủy đơn hàng này?',
      message: 'Hành động này không thể hoàn tác. Đơn hàng sẽ chuyển sang trạng thái Đã Hủy.',
      confirmLabel: 'Hủy đơn',
      danger: true,
      onConfirm: () => { closeConfirm(); handleUpdateOrder(id, 'Cancelled'); }
    });
  };

  // 3. Update Reservation
  const handleUpdateReservation = async (id, newStatus) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/update_reservation.php', {
        id, status: newStatus
      }, { withCredentials: true });
      if (response.data?.success) {
        const res = await axios.get('http://localhost/Web_coffee/admin/get_reservations.php', { withCredentials: true });
        if (Array.isArray(res.data)) setReservations(res.data);
        const labels = { Confirmed: 'Đã xác nhận', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' };
        addToast(`Đặt bàn → ${labels[newStatus] || newStatus}`, newStatus === 'Cancelled' ? 'warning' : 'success');
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể cập nhật trạng thái đặt bàn.', 'error');
    }
  };

  const handleCancelReservation = (id) => {
    showConfirm({
      title: 'Hủy đặt bàn này?',
      message: 'Khách hàng sẽ không được tự động thông báo. Vui lòng liên hệ thủ công nếu cần.',
      confirmLabel: 'Hủy đặt bàn',
      danger: true,
      onConfirm: () => { closeConfirm(); handleUpdateReservation(id, 'Cancelled'); }
    });
  };

  // 4. Testimonial Moderation
  const handleModerateTestimonial = async (id, action) => {
    try {
      const response = await axios.post('http://localhost/Web_coffee/admin/update_testimonial.php', {
        id, action
      }, { withCredentials: true });
      if (response.data?.success) {
        const res = await axios.get('http://localhost/Web_coffee/admin/get_all_testimonials.php', { withCredentials: true });
        if (Array.isArray(res.data)) setTestimonials(res.data);
        addToast(action === 'approve' ? 'Đánh giá đã được phê duyệt' : 'Đánh giá đã được xóa', action === 'approve' ? 'success' : 'warning');
      } else {
        addToast(response.data?.message || 'Có lỗi xảy ra.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể duyệt phản hồi.', 'error');
    }
  };

  const handleDeleteTestimonial = (id) => {
    showConfirm({
      title: 'Xóa đánh giá này?',
      message: 'Đánh giá sẽ bị xóa vĩnh viễn khỏi hệ thống và không thể khôi phục.',
      confirmLabel: 'Xóa vĩnh viễn',
      danger: true,
      onConfirm: () => { closeConfirm(); handleModerateTestimonial(id, 'delete'); }
    });
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  const tabs = [
    { key: 'stats',        icon: 'dashboard',      label: 'Báo cáo thống kê' },
    { key: 'orders',       icon: 'flatware',        label: 'Quầy pha chế (POS)', badge: pendingCount },
    { key: 'menu',         icon: 'menu_book',       label: 'Quản lý thực đơn' },
    { key: 'reservations', icon: 'calendar_month',  label: 'Quản lý đặt bàn' },
    { key: 'testimonials', icon: 'reviews',         label: 'Duyệt phản hồi' },
    { key: 'shifts',       icon: 'groups',          label: 'Quản lý nhân sự' },
    { key: 'inventory',    icon: 'inventory_2',    label: 'Quản lý kho' },
    { key: 'promotions',   icon: 'campaign',       label: 'Khuyến mãi & Sự kiện' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans flex flex-col">

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        danger={confirm.danger}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Fix #2: Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          item={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleEditProduct}
        />
      )}

      {/* ── Header — Fix #10: show real username ──────────────────────── */}
      <header className="bg-[#13151c] border-b border-[#2a2f3a] py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-black text-sm tracking-wider shadow-[0_0_16px_rgba(245,158,11,0.3)]">
            LAB_ADMIN
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Bảng Quản Trị Hệ Thống</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-mono mt-1">
              LAB COFFEE &amp; Trading Lounge Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <LiveClock />
          <div className="text-right hidden md:block">
            <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">Đang đăng nhập</span>
            <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1 justify-end">
              <span className="material-symbols-outlined text-sm">account_circle</span>
              {adminUsername}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300
              border border-red-500/20 hover:border-red-500/40 text-xs font-bold rounded-lg
              transition-all font-mono uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Tab Navigation — Fix #5: mobile horizontal scroll ─────────── */}
      <nav className="bg-[#13151c] border-b border-[#2a2f3a] px-2 sm:px-6 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2230]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-[10px]">{tab.label.split(' ')[0]}</span>
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[9px]
                font-black rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-grow p-6 max-w-7xl w-full mx-auto">

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
            <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 admin-skeleton-shimmer" />
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-4 items-center py-2">
                  <div className="h-4 rounded bg-white/5 flex-1" />
                  <div className="h-4 rounded bg-white/5 w-20" />
                  <div className="h-4 rounded bg-white/5 w-28" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <div className="animate-fadeIn space-y-0">

            {/* ── 1. STATS — Fix #3: date range filter ─────────────── */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Date range filter bar */}
                <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-4 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Từ ngày</label>
                    <input type="date" value={statsDateFrom} onChange={e => setStatsDateFrom(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Đến ngày</label>
                    <input type="date" value={statsDateTo} onChange={e => setStatsDateTo(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono" />
                  </div>
                  <button onClick={() => loadStats(statsDateFrom, statsDateTo)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors font-mono">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">search</span>Lọc báo cáo
                  </button>
                  {(statsDateFrom || statsDateTo) && (
                    <button onClick={() => { setStatsDateFrom(''); setStatsDateTo(''); loadStats('',''); }}
                      className="px-3 py-1.5 bg-[#2a2f3a] hover:bg-[#343a47] text-slate-400 hover:text-slate-200 font-bold text-xs rounded-lg transition-colors font-mono">
                      <span className="material-symbols-outlined text-sm align-middle">close</span> Xóa bộ lọc
                    </button>
                  )}
                  {(statsDateFrom || statsDateTo) && (
                    <span className="text-[10px] text-amber-400 font-mono ml-auto">
                      ● Đang xem: {statsDateFrom || '...'} → {statsDateTo || 'nay'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Revenue */}
                  <div className="bg-[#1a1d24] border border-[#2a2f3a] hover:border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform border border-emerald-500/20">
                      <span className="material-symbols-outlined text-xl">monetization_on</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Doanh thu</span>
                      <span className="text-lg font-black text-white mt-0.5 block">{formatPrice(stats.totalRevenue)}</span>
                    </div>
                  </div>

                  {/* Profit Margin */}
                  <div className="bg-[#1a1d24] border border-[#2a2f3a] hover:border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform border border-emerald-500/20">
                      <span className="material-symbols-outlined text-xl">trending_up</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Lợi nhuận</span>
                      <span className="text-lg font-black text-emerald-400 mt-0.5 block">{formatPrice(stats.profitMargin || 0)}</span>
                    </div>
                  </div>

                  {/* COGS */}
                  <div className="bg-[#1a1d24] border border-[#2a2f3a] hover:border-amber-500/30 rounded-xl p-4 flex items-center gap-3 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-110 transition-transform border border-amber-500/20">
                      <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Giá vốn (COGS)</span>
                      <span className="text-lg font-black text-slate-300 mt-0.5 block">{formatPrice(stats.totalCostOfGoods || 0)}</span>
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="bg-[#1a1d24] border border-[#2a2f3a] hover:border-sky-500/30 rounded-xl p-4 flex items-center gap-3 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg group-hover:scale-110 transition-transform border border-sky-500/20">
                      <span className="material-symbols-outlined text-xl">shopping_bag</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Đơn hàng</span>
                      <span className="text-lg font-black text-white mt-0.5 block">{stats.totalOrders} <span className="text-xs font-semibold text-slate-500">Đơn</span></span>
                    </div>
                  </div>

                  {/* Reservations */}
                  <div className="bg-[#1a1d24] border border-[#2a2f3a] hover:border-amber-500/30 rounded-xl p-4 flex items-center gap-3 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:scale-110 transition-transform border border-amber-500/20">
                      <span className="material-symbols-outlined text-xl">event_seat</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Đặt bàn</span>
                      <span className="text-lg font-black text-white mt-0.5 block">{stats.totalReservations} <span className="text-xs font-semibold text-slate-500">Lượt</span></span>
                    </div>
                  </div>
                </div>

                {/* Top Selling */}
                <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">star</span>
                    Top 5 Món Đồ Uống Bán Chạy Nhất
                    <span className="text-[9px] font-mono text-slate-500 ml-auto uppercase tracking-wider">Real-time Aggregation</span>
                  </h3>
                  {stats.topItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-xs font-mono">
                      <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">bar_chart</span>
                      CHƯA CÓ DỮ LIỆU BÁN HÀNG ĐƯỢC GHI NHẬN
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                            <th className="py-3 px-4">Tên đồ uống</th>
                            <th className="py-3 px-4 text-center">Số lượng bán ra</th>
                            <th className="py-3 px-4 text-right">Tổng doanh thu món</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.topItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors">
                              <td className="py-4 px-4 font-bold text-slate-200 flex items-center gap-2">
                                <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded-full ${
                                  idx === 0 ? 'bg-amber-500 text-slate-950' :
                                  idx === 1 ? 'bg-slate-500 text-white' :
                                  idx === 2 ? 'bg-amber-800 text-white' : 'bg-[#2a2f3a] text-slate-400'
                                }`}>{idx + 1}</span>
                                {item.name}
                              </td>
                              <td className="py-4 px-4 text-center font-semibold font-mono text-slate-400">{item.quantity} ly</td>
                              <td className="py-4 px-4 text-right font-black font-mono text-amber-400">{formatPrice(item.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* DB Test */}
                <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-[#2a2f3a] pb-3 font-mono flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">dns</span>
                    Kiểm tra trạng thái kết nối
                  </h3>
                  <TestConnection />
                </div>
              </div>
            )}

            {/* ── 2. ORDERS (POS Kanban Board) ─────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">table_chart</span>
                    Bảng Điều Phối Kanban (Real-time POS Board)
                    <span className="text-[9px] text-slate-500 font-mono">(Tự động đồng bộ mỗi 10s)</span>
                  </h3>
                  <button
                    onClick={() => setRefreshMenuTrigger(p => p + 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2230] hover:bg-[#2a2f3a] text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition-all font-mono border border-[#2a2f3a]"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Làm mới
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-24 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl text-slate-600 font-mono">
                    <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">receipt_long</span>
                    <p className="text-sm">CHƯA CÓ ĐƠN HÀNG NÀO TRÊN HỆ THỐNG</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                    {[
                      { key: 'Pending',   title: 'Chờ Duyệt',    color: 'border-amber-500', bg: 'bg-amber-500/5', text: 'text-amber-400' },
                      { key: 'Preparing', title: 'Pha Chế',      color: 'border-sky-500',   bg: 'bg-sky-500/5',   text: 'text-sky-400' },
                      { key: 'Completed', title: 'Hoàn Thành',   color: 'border-emerald-500', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
                      { key: 'Cancelled', title: 'Đã Hủy',       color: 'border-red-500',     bg: 'bg-red-500/5',     text: 'text-red-400' }
                    ].map((col) => {
                      const colOrders = orders.filter(o => o.status === col.key);
                      return (
                        <div key={col.key} className={`rounded-xl border ${col.color} ${col.bg} p-4 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.3)]`}>
                          <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-2">
                            <span className={`text-xs font-bold font-mono uppercase tracking-wider ${col.text}`}>{col.title}</span>
                            <span className="text-[10px] font-mono font-bold bg-[#0f1117] text-slate-400 border border-[#2a2f3a] px-2 py-0.5 rounded-full">
                              {colOrders.length}
                            </span>
                          </div>
                          
                          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                            {colOrders.length === 0 ? (
                              <div className="text-center py-8 text-slate-600 font-mono text-[10px] uppercase">
                                Trống
                              </div>
                            ) : (
                              colOrders.map((order) => (
                                <div key={order._id} className="bg-[#13151c] border border-[#2a2f3a] rounded-xl p-4 flex flex-col justify-between hover:border-[#3a4050] transition-colors relative overflow-hidden">
                                  <div>
                                    <div className="flex items-center justify-between mb-3.5">
                                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-[#0f1117] px-2 py-0.5 rounded border border-[#2a2f3a]">
                                        #{order._id.substring(18).toUpperCase()}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-500 font-semibold">
                                        {order.created_at ? order.created_at.split(' ')[1] : '—'}
                                      </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-xs font-mono mb-3.5">
                                      <div className="flex justify-between"><span className="text-slate-500">Khách:</span><span className="font-bold text-slate-200">{order.customerName}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">Bàn:</span><span className="font-bold text-slate-200">{order.tableNumber}</span></div>
                                    </div>

                                    <div className="border-t border-[#2a2f3a] py-2.5 mb-2.5 space-y-1.5">
                                      {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs font-mono">
                                          <span className="font-bold text-slate-300">
                                            {item.name} <span className="text-slate-500 font-normal">×{item.quantity}</span>
                                          </span>
                                          <span className="text-slate-400">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="flex justify-between items-baseline font-mono text-xs mb-3.5">
                                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Tổng cộng:</span>
                                      <span className="text-sm font-black text-amber-400">{formatPrice(order.totalPrice)}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    {(order.status === 'Pending' || order.status === 'Preparing') && (
                                      <div className="grid grid-cols-2 gap-2">
                                        {order.status === 'Pending' && (
                                          <button onClick={() => handleUpdateOrder(order._id, 'Preparing')}
                                            className="py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors font-mono uppercase tracking-wider text-[9px] flex items-center justify-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">coffee</span> Nhận đơn
                                          </button>
                                        )}
                                        {order.status === 'Preparing' && (
                                          <button onClick={() => handleUpdateOrder(order._id, 'Completed')}
                                            className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors font-mono uppercase tracking-wider text-[9px] flex items-center justify-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">check</span> Hoàn thành
                                          </button>
                                        )}
                                        <button onClick={() => handleCancelOrder(order._id)}
                                          className="py-1.5 bg-[#1e2230] hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-bold rounded-lg transition-all font-mono uppercase tracking-wider text-[9px] border border-transparent hover:border-red-500/20 flex items-center justify-center gap-1">
                                          <span className="material-symbols-outlined text-[12px]">close</span> Hủy đơn
                                        </button>
                                      </div>
                                    )}

                                    {/* Status History Timeline */}
                                    {order.status_history && order.status_history.length > 0 && (
                                      <div className="mt-3.5 pt-3.5 border-t border-[#2a2f3a] text-[9px] text-slate-500 font-mono space-y-1">
                                        <span className="font-bold uppercase tracking-wider block text-slate-400 mb-1">Nhật ký đơn hàng:</span>
                                        {order.status_history.map((h, hidx) => {
                                          const statusLabels = { Pending: 'Tạo đơn', Preparing: 'Nhận đơn', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' };
                                          const timeStr = h.changed_at ? h.changed_at.split(' ')[1] : '';
                                          return (
                                            <div key={hidx} className="flex justify-between items-center">
                                              <span>● {statusLabels[h.status] || h.status}</span>
                                              <span>{timeStr}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── 3. MENU MANAGER ──────────────────────────────────────── */}
            {activeTab === 'menu' && (
              <div className="grid md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-[#2a2f3a] pb-3">
                    <span className="material-symbols-outlined text-amber-400">add_circle</span>
                    Thêm đồ uống mới
                  </h3>
                  <AdminAddProduct onSuccess={() => setRefreshMenuTrigger(prev => prev + 1)} />
                </div>
                <div className="md:col-span-8 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-[#2a2f3a] pb-3">
                    <span className="material-symbols-outlined text-amber-400">restaurant_menu</span>
                    Danh sách thực đơn hiện tại
                    <span className="ml-auto text-[10px] font-mono text-slate-500">{menuItems.length} món</span>
                  </h3>
                  {/* Fix #5/#8: Trash toggle bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setShowTrash(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        !showTrash ? 'bg-amber-500 text-slate-950' : 'bg-[#1e2230] text-slate-400 hover:text-slate-200'
                      }`}>
                      <span className="material-symbols-outlined text-sm align-middle mr-1">restaurant_menu</span>Thực đơn ({menuItems.length})
                    </button>
                    <button onClick={() => setShowTrash(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        showTrash ? 'bg-red-500/30 text-red-300 border border-red-500/30' : 'bg-[#1e2230] text-slate-400 hover:text-slate-200'
                      }`}>
                      <span className="material-symbols-outlined text-sm align-middle mr-1">delete</span>Thùng rác ({trashItems.length})
                    </button>
                  </div>

                  {!showTrash ? (
                    menuItems.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 font-mono text-xs">
                        <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">menu_book</span>
                        THỰC ĐƠN CHƯA CÓ SẢN PHẨM NÀO
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                              <th className="py-3 px-4">Tên sản phẩm / Tùy biến</th>
                              <th className="py-3 px-4">Danh mục</th>
                              <th className="py-3 px-4 text-center">Giá bán / Vốn</th>
                              <th className="py-3 px-4 text-center">Trạng thái</th>
                              <th className="py-3 px-4 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {menuItems.map((item) => (
                              <tr key={item._id} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors">
                                <td className="py-4 px-4">
                                  <span className="font-bold text-slate-200 block">{item.name}</span>
                                  <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">
                                    {item.sizes && item.sizes.length > 0 && (
                                      <span className="block">Sizes: {item.sizes.map(s => `${s.size}(+${s.upcharge.toLocaleString('vi-VN')}đ)`).join(', ')}</span>
                                    )}
                                    {item.ice_levels && item.ice_levels.length > 0 && (
                                      <span className="block">Mức đá: {item.ice_levels.join(' / ')}</span>
                                    )}
                                    {item.toppings && item.toppings.length > 0 && (
                                      <span className="block">Toppings: {item.toppings.map(t => `${t.name}(+${t.price.toLocaleString('vi-VN')}đ)`).join(', ')}</span>
                                    )}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-mono text-xs text-slate-400 capitalize">{item.category}</td>
                                <td className="py-4 px-4 text-center font-mono">
                                  <span className="font-semibold text-amber-400/80 block">{formatPrice(item.price)}</span>
                                  {item.cost_price > 0 && (
                                    <span className="text-[10px] text-slate-500 block">Vốn: {formatPrice(item.cost_price)}</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <button
                                    onClick={() => handleToggleMenu(item._id, item.is_in_stock !== false)}
                                    className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-bold rounded-lg transition-all border ${
                                      item.is_in_stock !== false
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                    }`}
                                  >
                                    {item.is_in_stock !== false ? '● Còn hàng' : '● Hết hàng'}
                                  </button>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    {/* Fix #2: Edit button */}
                                    <button onClick={() => setEditingProduct(item)}
                                      className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 hover:border-sky-500 rounded-lg transition-all">
                                      <span className="material-symbols-outlined text-sm block">edit</span>
                                    </button>
                                    {/* Fix #8: Soft delete button */}
                                    <button onClick={() => handleDeleteProduct(item._id, item.name)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg transition-all">
                                      <span className="material-symbols-outlined text-sm block">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    /* Trash view */
                    trashItems.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 font-mono text-xs">
                        <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">delete_outline</span>
                        THÙNG RÁC TRỐNG — KHÔNG CÓ SẢN PHẨM NÀO BỊ XÓA
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                              <th className="py-3 px-4">Tên sản phẩm</th>
                              <th className="py-3 px-4">Danh mục</th>
                              <th className="py-3 px-4 text-center">Giá bán</th>
                              <th className="py-3 px-4 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trashItems.map((item) => (
                              <tr key={item._id} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors opacity-60 hover:opacity-100">
                                <td className="py-4 px-4">
                                  <span className="font-bold text-slate-400 block line-through">{item.name}</span>
                                </td>
                                <td className="py-4 px-4 font-mono text-xs text-slate-500 capitalize">{item.category}</td>
                                <td className="py-4 px-4 text-center font-semibold font-mono text-slate-500">{formatPrice(item.price)}</td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <button onClick={() => handleRestoreProduct(item._id)}
                                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-lg text-[10px] font-mono font-bold transition-all">
                                      <span className="material-symbols-outlined text-sm align-middle mr-0.5">restore</span>Khôi phục
                                    </button>
                                    <button onClick={() => handlePermanentDelete(item._id, item.name)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg transition-all">
                                      <span className="material-symbols-outlined text-sm block">delete_forever</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ── 4. RESERVATIONS ──────────────────────────────────────── */}
            {activeTab === 'reservations' && (
              <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-[#2a2f3a] pb-3">
                  <span className="material-symbols-outlined text-amber-400">book_online</span>
                  Danh sách đặt chỗ của khách hàng
                  <span className="ml-auto text-[10px] font-mono text-slate-500">{reservations.length} lượt</span>
                </h3>
                {reservations.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 text-sm font-mono">
                    <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">calendar_month</span>
                    CHƯA CÓ LƯỢT ĐẶT BÀN NÀO
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          <th className="py-3 px-4">Tên / Liên hệ</th>
                          <th className="py-3 px-4">Loại bàn / Vị trí</th>
                          <th className="py-3 px-4">Ngày / Giờ</th>
                          <th className="py-3 px-4 text-center">Phương thức</th>
                          <th className="py-3 px-4 text-center">Trạng thái</th>
                          <th className="py-3 px-4 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res) => (
                          <tr key={res._id} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors">
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-200 block">
                                {res.name} {res.anonMode && <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1 py-0.5 rounded font-mono uppercase font-black ml-1 border border-indigo-500/20">ANON</span>}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                                {res.phone ? `SĐT: ${res.phone}` : res.telegram ? `TG: @${res.telegram}` : res.email}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs font-bold text-slate-300 block">{res.stationType}</span>
                              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Vị trí: {res.seat} ({res.guests})</span>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs">
                              <span className="text-slate-300 block">{res.date}</span>
                              <span className="text-slate-500 block mt-0.5">{res.time} ({res.duration} giờ)</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                res.payMethod === 'crypto' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#2a2f3a] text-slate-400'
                              }`}>
                                {res.payMethod === 'crypto' ? 'USDT (Web3)' : 'Quầy (VND)'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-lg border ${
                                res.status === 'Pending'   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                res.status === 'Confirmed' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                res.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {res.status === 'Pending' ? 'Chờ duyệt' :
                                 res.status === 'Confirmed' ? 'Đã duyệt' :
                                 res.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right space-x-1.5">
                              {res.status === 'Pending' && (
                                <button onClick={() => handleUpdateReservation(res._id, 'Confirmed')}
                                  className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-mono font-bold rounded transition-colors">
                                  Duyệt
                                </button>
                              )}
                              {res.status === 'Confirmed' && (
                                <button onClick={() => handleUpdateReservation(res._id, 'Completed')}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-mono font-bold rounded transition-colors">
                                  Xong
                                </button>
                              )}
                              {(res.status === 'Pending' || res.status === 'Confirmed') && (
                                <button onClick={() => handleCancelReservation(res._id)}
                                  className="px-2.5 py-1 bg-[#2a2f3a] hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-[10px] font-mono font-bold rounded transition-all border border-transparent hover:border-red-500/20">
                                  Hủy
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── 5. TESTIMONIALS ──────────────────────────────────────── */}
            {activeTab === 'testimonials' && (
              <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-[#2a2f3a] pb-3">
                  <span className="material-symbols-outlined text-amber-400">rate_review</span>
                  Kiểm duyệt phản hồi của khách hàng
                  <span className="ml-auto text-[10px] font-mono text-slate-500">{testimonials.length} phản hồi</span>
                </h3>
                {testimonials.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 text-sm font-mono">
                    <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">reviews</span>
                    CHƯA CÓ ĐÁNH GIÁ NÀO ĐỂ HIỂN THỊ
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testimonials.map((test) => (
                      <div key={test._id} className="p-5 border border-[#2a2f3a] rounded-xl bg-[#13151c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#3a4050] transition-colors">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-bold text-slate-200 text-sm">{test.author}</span>
                            <span className="text-xs text-slate-500 font-mono">({test.role})</span>
                            <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                              test.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {test.status === 'Approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed italic">"{test.text}"</p>
                          <span className="text-[10px] font-mono text-slate-600 block">Ngày gửi: {test.created_at || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono flex-shrink-0">
                          {test.status !== 'Approved' && (
                            <button onClick={() => handleModerateTestimonial(test._id, 'approve')}
                              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg transition-colors">
                              Phê duyệt
                            </button>
                          )}
                          <button onClick={() => handleDeleteTestimonial(test._id)}
                            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold rounded-lg transition-all border border-red-500/20 hover:border-red-500">
                            Xóa bỏ
          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 6. HR & SHIFTS ────────────────────────────────────────── */}
            {activeTab === 'shifts' && (
              <div className="grid md:grid-cols-12 gap-6 items-start text-left">
                {/* Form lên lịch ca làm mới */}
                <div className="md:col-span-4 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-[#2a2f3a] pb-3 font-mono">
                    <span className="material-symbols-outlined text-amber-400">more_time</span>
                    Lên Lịch Ca Làm Mới
                  </h3>
                  <ShiftSchedulerForm onSubmit={handleCreateShift} />
                </div>

                {/* Danh sách ca làm của nhân viên */}
                <div className="md:col-span-8 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-[#2a2f3a] pb-3 font-mono">
                    <span className="material-symbols-outlined text-amber-400">calendar_view_week</span>
                    Lịch Làm Việc Ca Trực Tuần
                    <span className="ml-auto text-[10px] text-slate-500 font-normal">{shifts.length} ca trực</span>
                  </h3>
                  {shifts.length === 0 ? (
                    <div className="text-center py-20 text-slate-600 text-xs font-mono">
                      <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">pending_actions</span>
                      CHƯA CÓ CA TRỰC NÀO ĐƯỢC LÊN LỊCH
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                            <th className="py-3 px-4">Nhân viên</th>
                            <th className="py-3 px-4">Ca trực</th>
                            <th className="py-3 px-4">Thời gian</th>
                            <th className="py-3 px-4 text-center">Lương dự tính</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shifts.map((shift) => {
                            const hourly = shift.hourly_rate || 20000;
                            const start = new Date(shift.start_time);
                            const end = new Date(shift.end_time);
                            const hours = Math.max(0.5, Math.round(((end - start) / 1000 / 60 / 60) * 10) / 10);
                            const totalPay = hours * hourly;

                            const shiftMeta = {
                              morning: { label: 'Sáng', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                              afternoon: { label: 'Chiều', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
                              night: { label: 'Tối', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                            };
                            const typeMeta = shiftMeta[shift.shift_type] || shiftMeta.morning;

                            return (
                              <tr key={shift._id} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors">
                                <td className="py-4 px-4 font-bold text-slate-200">{shift.employee_name}</td>
                                <td className="py-4 px-4">
                                  <select
                                    value={shift.shift_type}
                                    onChange={(e) => handleSwapShiftType(shift._id, e.target.value)}
                                    className={`text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded border ${typeMeta.color} bg-[#13151c] cursor-pointer outline-none focus:ring-0`}
                                  >
                                    <option value="morning">Sáng</option>
                                    <option value="afternoon">Chiều</option>
                                    <option value="night">Tối</option>
                                  </select>
                                </td>
                                <td className="py-4 px-4 font-mono text-[11px] text-slate-400 leading-normal">
                                  <div className="text-slate-300 font-bold">{start.toLocaleDateString('vi-VN')}</div>
                                  <div className="text-slate-500 text-[10px] mt-0.5">
                                    {start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({hours}h)
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center font-bold font-mono text-emerald-400">
                                  {formatPrice(totalPay)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <select
                                    value={shift.status}
                                    onChange={(e) => handleUpdateShiftStatus(shift._id, e.target.value)}
                                    className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded border bg-[#13151c] outline-none cursor-pointer ${
                                      shift.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                      shift.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                      shift.status === 'Swapped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}
                                  >
                                    <option value="Scheduled">Chờ làm</option>
                                    <option value="Completed">Đã làm</option>
                                    <option value="Swapped">Đã đổi</option>
                                    <option value="Cancelled">Đã hủy</option>
                                  </select>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button
                                    onClick={() => handleDeleteShift(shift._id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg transition-all"
                                  >
                                    <span className="material-symbols-outlined text-sm block">delete</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 7. INVENTORY AUTO-DEDUCTION ────────────────────────────── */}
            {activeTab === 'inventory' && (
              <div className="bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-left">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-[#2a2f3a] pb-3 font-mono">
                  <span className="material-symbols-outlined text-amber-400">inventory</span>
                  Quản Lý Kho Nguyên Liệu &amp; Khấu Trừ Tự Động
                  <span className="ml-auto text-[10px] text-slate-500 font-normal">{inventory.length} nguyên liệu</span>
                </h3>

                {inventory.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 text-xs font-mono">
                    <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">inventory_2</span>
                    CHƯA CÓ NGUYÊN LIỆU NÀO TRONG KHO
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                          <th className="py-3 px-4">Tên nguyên liệu</th>
                          <th className="py-3 px-4 text-center">Tồn kho hiện tại</th>
                          <th className="py-3 px-4 text-center">Ngưỡng cảnh báo</th>
                          <th className="py-3 px-4">Định mức công thức (Recipe Mappings)</th>
                          <th className="py-3 px-4 text-right">Cập nhật nhanh lượng tồn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => {
                          return (
                            <tr key={item._id} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors">
                              <td className="py-4 px-4">
                                <span className="font-bold text-slate-200 block">{item.ingredient_name}</span>
                                {item.low_stock_warning && (
                                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase animate-pulse">
                                    <span className="material-symbols-outlined text-[10px]">warning</span> Sắp hết kho!
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center font-bold font-mono text-slate-300">
                                {item.stock_level.toLocaleString('vi-VN')} {item.unit}
                              </td>
                              <td className="py-4 px-4 text-center font-mono text-slate-500">
                                &lt; {item.low_stock_threshold.toLocaleString('vi-VN')} {item.unit}
                              </td>
                              <td className="py-4 px-4 font-mono text-[10px] text-slate-400 leading-normal max-w-xs">
                                {item.recipe_mappings && item.recipe_mappings.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {item.recipe_mappings.map((recipe, ridx) => {
                                      // Attempt to find product name in menuItems
                                      const matchedProd = menuItems.find(p => p._id === recipe.product_id);
                                      const prodName = matchedProd ? matchedProd.name : `Product ID: ${recipe.product_id.substring(18).toUpperCase()}`;
                                      return (
                                        <div key={ridx} className="flex justify-between gap-2 border-b border-[#2a2f3a]/20 pb-0.5">
                                          <span className="text-slate-500">{prodName}</span>
                                          <span className="font-bold text-amber-500/80">-{recipe.deduction_amount}{item.unit}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-slate-600">Chưa cấu hình recipe</span>
                                )}
                              </td>
                              {/* Fix #9: Two input modes — add stock and set stock */}
                              <td className="py-4 px-4 text-right">
                                <InventoryStockControl item={item} onSet={handleUpdateStock} onAdd={handleAddStock} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── 8. PROMOTIONS & MARKETING ────────────────────────────── */}
            {activeTab === 'promotions' && (
              <div className="grid md:grid-cols-12 gap-6 items-start text-left">
                {/* Left side: Create form */}
                <div className="md:col-span-4 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-[#2a2f3a] pb-3 font-mono">
                    <span className="material-symbols-outlined text-amber-400">campaign</span>
                    Tạo Sự Kiện / Khuyến Mãi
                  </h3>
                  <PromotionForm onSubmit={handleCreatePromotion} />
                </div>

                {/* Right side: List promotions */}
                <div className="md:col-span-8 bg-[#1a1d24] border border-[#2a2f3a] rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                  <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2 border-b border-[#2a2f3a] pb-3 font-mono">
                    <span className="material-symbols-outlined text-amber-400">local_activity</span>
                    Danh Sách Chương Trình Đã Đăng
                    <span className="ml-auto text-[10px] text-slate-500 font-normal">{promotions.length} chiến dịch</span>
                  </h3>

                  {promotions.length === 0 ? (
                    <div className="text-center py-20 text-slate-600 text-xs font-mono">
                      <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">campaign</span>
                      CHƯA CÓ CHƯƠNG TRÌNH KHUYẾN MÃI NÀO ĐƯỢC TẠO
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#2a2f3a] text-[10px] font-mono uppercase tracking-widest text-slate-500">
                            <th className="py-3 px-4">Chiến dịch / Chi tiết</th>
                            <th className="py-3 px-4 text-center">Loại</th>
                            <th className="py-3 px-4 text-center">Chiết khấu</th>
                            <th className="py-3 px-4 text-center">Trạng thái</th>
                            <th className="py-3 px-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {promotions.map((promo) => {
                            const isVoucher = promo.promotion_type === 'Voucher';
                            const isFlashSale = promo.promotion_type === 'FlashSale';

                            return (
                              <tr key={promo._id} className="border-b border-[#1e2230] hover:bg-[#1e2230] transition-colors">
                                <td className="py-4 px-4">
                                  <span className="font-bold text-slate-200 block">{promo.title}</span>
                                  {isFlashSale && promo.flash_sale_details && (
                                    <span className="text-[10px] font-mono text-slate-500 block mt-1 leading-normal">
                                      Thời gian: {promo.flash_sale_details.start_date} → {promo.flash_sale_details.end_date}
                                    </span>
                                  )}
                                  {isVoucher && promo.voucher_details && (
                                    <span className="text-[10px] font-mono text-slate-500 block mt-1 leading-normal">
                                      Code: <span className="text-amber-400 font-bold bg-[#13151c] px-1.5 py-0.5 rounded border border-[#2a2f3a]">{promo.voucher_details.code}</span>
                                      &nbsp;|&nbsp; Đã dùng: {promo.voucher_details.usage_count}/{promo.voucher_details.usage_limit}
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                                    isFlashSale
                                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {isFlashSale ? 'Flash Sale' : 'Voucher'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center font-bold font-mono text-amber-400">
                                  -{isFlashSale ? promo.flash_sale_details?.discount_percentage : promo.voucher_details?.discount_percentage}%
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <button
                                    onClick={() => handleTogglePromotion(promo._id, promo.is_active !== false)}
                                    className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold rounded border ${
                                      promo.is_active !== false
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                    }`}
                                  >
                                    {promo.is_active !== false ? '● Hoạt động' : '● Tạm dừng'}
                                  </button>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button
                                    onClick={() => handleDeletePromotion(promo._id)}
                                    className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg transition-all"
                                  >
                                    <span className="material-symbols-outlined text-sm block">delete</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}


          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0c12] border-t border-[#1e2230] py-4 text-[10px] text-slate-600 font-mono tracking-wider flex flex-col md:flex-row justify-between items-center px-6 gap-2">
        <span>&copy; 2026 LAB COFFEE ADMIN &nbsp;//&nbsp; {adminUsername.toUpperCase()} SESSION ACTIVE</span>
        <span className="text-slate-500 font-bold">DEVELOPED BY: JATHONG // HIEUDO // THONGTRAN</span>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fix #9: Inventory Stock Control component (Set vs Add mode)
// ---------------------------------------------------------------------------
function InventoryStockControl({ item, onSet, onAdd }) {
  const [mode, setMode] = useState('set'); // 'set' | 'add'
  const [value, setValue] = useState('');

  const handleApply = () => {
    if (!value || isNaN(parseFloat(value))) return;
    if (mode === 'add') {
      onAdd(item._id, value);
    } else {
      onSet(item._id, value);
    }
    setValue('');
  };

  return (
    <div className="inline-flex flex-col gap-1.5 items-end">
      <div className="flex items-center gap-1">
        <button onClick={() => setMode('set')}
          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded transition-all ${
            mode === 'set' ? 'bg-amber-500 text-slate-950' : 'bg-[#2a2f3a] text-slate-400 hover:text-slate-200'
          }`}>Ghi đè</button>
        <button onClick={() => setMode('add')}
          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded transition-all ${
            mode === 'add' ? 'bg-emerald-500 text-white' : 'bg-[#2a2f3a] text-slate-400 hover:text-slate-200'
          }`}>Nhập thêm</button>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder={mode === 'add' ? '+số lượng' : item.stock_level}
          className="w-24 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded px-2 py-1 text-xs text-white outline-none font-mono text-center"
        />
        <span className="text-[10px] text-slate-500 font-mono">{item.unit}</span>
        <button onClick={handleApply}
          className={`p-1 rounded text-[10px] transition-all ${
            mode === 'add'
              ? 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white'
              : 'bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950'
          }`}>
          <span className="material-symbols-outlined text-sm block">{mode === 'add' ? 'add' : 'check'}</span>
        </button>
      </div>
    </div>
  );
}
