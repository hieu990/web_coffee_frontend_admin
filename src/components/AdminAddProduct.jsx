import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

/**
 * AdminAddProduct Component (Advanced Menu)
 * File Path: src/components/AdminAddProduct.jsx
 * 
 * Provides an administrative form to insert a new product with customizations (sizes, ice, toppings)
 * into the MongoDB products collection.
 */
export default function AdminAddProduct({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image_url: '',
    is_in_stock: true,
  });

  // Sizes state (default: S, M, L)
  const [sizes, setSizes] = useState([
    { size: 'S', upcharge: 0 },
    { size: 'M', upcharge: 5000 },
    { size: 'L', upcharge: 10000 }
  ]);
  const [newSize, setNewSize] = useState({ size: '', upcharge: '' });

  // Ice levels state
  const [iceLevels, setIceLevels] = useState(['0%', '50%', '100%']);

  // Toppings state
  const [toppings, setToppings] = useState([]);
  const [newTopping, setNewTopping] = useState({ name: '', price: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Size handlers
  const handleAddSize = () => {
    if (!newSize.size.trim()) return;
    const up = parseFloat(newSize.upcharge) || 0;
    setSizes(prev => [...prev, { size: newSize.size.toUpperCase().trim(), upcharge: up }]);
    setNewSize({ size: '', upcharge: '' });
  };

  const handleRemoveSize = (index) => {
    setSizes(prev => prev.filter((_, idx) => idx !== index));
  };

  // Ice level handlers
  const handleIceToggle = (level) => {
    if (iceLevels.includes(level)) {
      setIceLevels(prev => prev.filter(l => l !== level));
    } else {
      setIceLevels(prev => [...prev, level]);
    }
  };

  // Topping handlers
  const handleAddTopping = () => {
    if (!newTopping.name.trim()) return;
    const pr = parseFloat(newTopping.price) || 0;
    setToppings(prev => [...prev, { name: newTopping.name.trim(), price: pr }]);
    setNewTopping({ name: '', price: '' });
  };

  const handleRemoveTopping = (index) => {
    setToppings(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Vui lòng nhập tên sản phẩm.');
      return;
    }
    const basePrice = parseFloat(formData.price);
    if (isNaN(basePrice) || basePrice <= 0) {
      setErrorMessage('Vui lòng nhập đơn giá cơ bản hợp lệ lớn hơn 0.');
      return;
    }
    if (!formData.category.trim()) {
      setErrorMessage('Vui lòng nhập danh mục sản phẩm.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        price: basePrice,
        description: formData.description.trim(),
        category: formData.category.trim(),
        image_url: formData.image_url.trim(),
        is_in_stock: formData.is_in_stock,
        sizes,
        ice_levels: iceLevels,
        toppings
      };

      const response = await axios.post(
        `${API_BASE_URL}/admin/menu/create.php`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      if (response.data && response.data.success) {
        // Reset form
        setFormData({
          name: '',
          price: '',
          description: '',
          category: '',
          image_url: '',
          is_in_stock: true,
        });
        setToppings([]);
        setSizes([
          { size: 'S', upcharge: 0 },
          { size: 'M', upcharge: 5000 },
          { size: 'L', upcharge: 10000 }
        ]);
        
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(response.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm.');
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message;
      setErrorMessage(serverMsg || 'Không thể kết nối đến máy chủ API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
          [LỖI]: {errorMessage}
        </div>
      )}

      {/* Tên sản phẩm */}
      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tên đồ uống</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập tên đồ uống"
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none transition-colors"
          disabled={isSubmitting}
        />
      </div>

      {/* Đơn giá & Danh mục */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Đơn giá cơ bản (S)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Ví dụ: 40000"
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none transition-colors"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Danh mục</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Coffee, Tea, IceBlended..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none transition-colors"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Mô tả & Hình ảnh */}
      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Mô tả món ăn/đồ uống</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả công thức, hương vị đặc trưng..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none transition-colors resize-none h-16"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Đường dẫn ảnh biểu trưng</label>
        <input
          type="text"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://images.unsplash.com/... hoặc để trống"
          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-2 text-white outline-none transition-colors"
          disabled={isSubmitting}
        />
      </div>

      {/* ── SIZE CUSTOMIZATION ────────────────────────────────────────── */}
      <div className="border border-[#2a2f3a] rounded-lg p-3 bg-slate-950/20">
        <label className="block text-[10px] text-amber-500 uppercase tracking-wider font-bold mb-2">Tùy biến Kích thước (Sizes)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {sizes.map((s, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-[#1a1d24] border border-[#2a2f3a] px-2 py-1 rounded text-[10px] text-slate-300">
              {s.size} (+{s.upcharge.toLocaleString('vi-VN')}đ)
              <button type="button" onClick={() => handleRemoveSize(idx)} className="text-red-400 hover:text-red-300 ml-1 text-xs">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Size (e.g. XL)"
            value={newSize.size}
            onChange={(e) => setNewSize(prev => ({ ...prev, size: e.target.value }))}
            className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none text-[10px]"
          />
          <input
            type="number"
            placeholder="Cộng thêmđ"
            value={newSize.upcharge}
            onChange={(e) => setNewSize(prev => ({ ...prev, upcharge: e.target.value }))}
            className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none text-[10px]"
          />
          <button type="button" onClick={handleAddSize} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 rounded font-bold text-[10px]">
            Thêm
          </button>
        </div>
      </div>

      {/* ── ICE LEVELS ────────────────────────────────────────────────── */}
      <div className="border border-[#2a2f3a] rounded-lg p-3 bg-slate-950/20">
        <label className="block text-[10px] text-amber-500 uppercase tracking-wider font-bold mb-2">Tùy biến Mức Đá (Ice Levels)</label>
        <div className="flex gap-4">
          {['0%', '50%', '100%'].map(level => (
            <label key={level} className="inline-flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={iceLevels.includes(level)}
                onChange={() => handleIceToggle(level)}
                className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0"
              />
              {level} đá
            </label>
          ))}
        </div>
      </div>

      {/* ── TOPPING CUSTOMIZATION ─────────────────────────────────────── */}
      <div className="border border-[#2a2f3a] rounded-lg p-3 bg-slate-950/20">
        <label className="block text-[10px] text-amber-500 uppercase tracking-wider font-bold mb-2">Tùy biến Topping đi kèm</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {toppings.map((t, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-[#1a1d24] border border-[#2a2f3a] px-2 py-1 rounded text-[10px] text-slate-300">
              {t.name} (+{t.price.toLocaleString('vi-VN')}đ)
              <button type="button" onClick={() => handleRemoveTopping(idx)} className="text-red-400 hover:text-red-300 ml-1 text-xs">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tên topping"
            value={newTopping.name}
            onChange={(e) => setNewTopping(prev => ({ ...prev, name: e.target.value }))}
            className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none text-[10px]"
          />
          <input
            type="number"
            placeholder="Đơn giá"
            value={newTopping.price}
            onChange={(e) => setNewTopping(prev => ({ ...prev, price: e.target.value }))}
            className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white outline-none text-[10px]"
          />
          <button type="button" onClick={handleAddTopping} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 rounded font-bold text-[10px]">
            Thêm
          </button>
        </div>
      </div>

      {/* Tình trạng kho hàng */}
      <div className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          name="is_in_stock"
          id="is_in_stock"
          checked={formData.is_in_stock}
          onChange={handleChange}
          className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-0 w-4 h-4"
          disabled={isSubmitting}
        />
        <label htmlFor="is_in_stock" className="text-[10px] text-slate-300 font-bold uppercase cursor-pointer">
          Sản phẩm có sẵn trong kho hàng (Còn hàng)
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-amber-800 disabled:to-amber-900 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition-all shadow-[0_0_16px_rgba(245,158,11,0.1)] hover:scale-[1.01]"
      >
        {isSubmitting ? 'ĐANG GỬI DỮ LIỆU...' : 'THÊM VÀO THỰC ĐƠN'}
      </button>
    </form>
  );
}
