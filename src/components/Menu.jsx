import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

/**
 * Menu Component
 * File Path: d:/Web_coffe/src/components/Menu.jsx
 * 
 * Fetches menu items from the PHP API, filters them dynamically by category,
 * and displays them in a premium glassmorphic grid with custom animations.
 */
export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart States
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Bàn 01');
  const [ordering, setOrdering] = useState(false);

  // Fetch menu data on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Request menu from local PHP endpoint (all=1 includes out of stock too)
        const response = await axios.get(`${API_BASE_URL}/api/get_menu.php?all=1`);
        
        // Assert that the response is an array
        if (Array.isArray(response.data)) {
          setMenuItems(response.data);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Không thể tải danh sách thực đơn. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.id === item._id);
      if (existing) {
        return prevCart.map((c) =>
          c.id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { id: item._id, name: item.name, price: item.price, category: item.category || 'Coffee', quantity: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setOrdering(true);
      const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const response = await axios.post(`${API_BASE_URL}/api/place_order.php`, {
        items: cart,
        totalPrice,
        customerName: customerName.trim() || 'Vãng lai',
        tableNumber: tableNumber
      });

      if (response.data && response.data.success) {
        alert(`Đặt đồ uống thành công!\nMã đơn pha chế: ${response.data.order_id}\nVui lòng đợi đồ uống tại quầy.`);
        setCart([]);
        setCustomerName('');
      } else {
        alert(response.data?.message || 'Có lỗi xảy ra khi gửi order.');
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra Apache & PHP.');
    } finally {
      setOrdering(false);
    }
  };

  // Retrieve unique categories for filter tabs
  const categories = ['all', ...new Set(menuItems.map(item => item.category?.toLowerCase()).filter(Boolean))];

  // Filter items based on active tab
  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category?.toLowerCase() === activeCategory);

  // Format price into VNĐ display format (e.g. 45000 -> 45.000 VNĐ)
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('vi-VN').format(numPrice) + ' VNĐ';
  };

  return (
    <section className="min-h-screen bg-[#0c0f0f] text-[#e2e2e2] py-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-widest text-[#ffb77b] mb-4">
            Thực Đơn Của Quán
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#ffb77b] to-transparent mx-auto mb-4"></div>
          <p className="text-sm text-[#c4c7c7] tracking-wider uppercase">
            Signature Specialty Coffee & Cyberpunk Quant Lab Selection
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-[#ffb77b] mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-mono tracking-widest text-[#c4c7c7] animate-pulse">
              CONNECTING TO NODE // LOADING MENU...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto bg-red-950/30 border border-red-500/20 rounded p-6 text-center shadow-2xl backdrop-blur-md">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-red-200 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-mono tracking-widest uppercase transition-colors"
            >
              Re-establish Connection
            </button>
          </div>
        )}

        {/* Main Content (if not loading and no error) */}
        {!isLoading && !error && (
          <>
            {/* Category Filter Tabs */}
            {categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 text-xs font-mono uppercase tracking-widest border transition-all duration-300 rounded-sm ${
                      activeCategory === cat
                        ? 'bg-[#ffb77b] text-[#2e1500] border-[#ffb77b] shadow-[0_0_15px_rgba(255,183,123,0.3)]'
                        : 'bg-[#121616]/40 text-[#c4c7c7] border-[#ffb77b]/20 hover:border-[#ffb77b]/50 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'TẤT CẢ // ALL' : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Empty Collection Warning */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20 border border-dashed border-[#ffb77b]/15 rounded bg-[#121616]/10">
                <p className="text-sm font-mono text-[#c4c7c7]">
                  NO DOCUMENTS RETRIEVED // MENU IS CURRENTLY EMPTY
                </p>
              </div>
            )}

             {/* Menu Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="group relative bg-[#121616]/50 backdrop-blur-md border border-[#ffb77b]/10 hover:border-[#ffb77b]/30 p-6 rounded transition-all duration-300 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                >
                  {/* Subtle Glowing Corner Accent */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-[#ffb77b]/50 transition-all duration-300"></div>
                  
                  <div>
                    {/* Category Label */}
                    <span className="text-[10px] font-mono tracking-widest text-[#ffb77b]/75 uppercase block mb-3">
                      [ {item.category || 'Specialty'} ]
                    </span>

                    {/* Item Name */}
                    <h3 className="text-lg font-bold tracking-wide text-white group-hover:text-[#ffb77b] transition-colors duration-300 mb-2">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#c4c7c7] leading-relaxed mb-6">
                      {item.description || 'Hạt Specialty rang mộc thủ công, chiết xuất áp suất tối ưu mang hương vị đậm đà và nguyên bản.'}
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-center justify-between border-t border-[#ffb77b]/5 pt-4 mt-auto">
                    <div>
                      <span className="text-[9px] font-mono text-[#c4c7c7]/50 block">PRICE_UNIT</span>
                      <span className="text-sm font-mono font-semibold text-[#ffb77b] tracking-wider">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    {item.available === false ? (
                      <span className="px-2 py-1 bg-red-950/30 border border-red-500/20 text-red-400 text-[9px] font-mono tracking-widest uppercase">
                        TẠM HẾT // SOLD OUT
                      </span>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3 py-1.5 bg-[#ffb77b] hover:bg-[#ffa659] text-[#2e1500] hover:shadow-[0_0_10px_rgba(255,183,123,0.3)] text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm transition-all"
                      >
                        + THÊM // ADD
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Cyberpunk Checkout Cart Panel */}
            {cart.length > 0 && (
              <div className="fixed bottom-6 right-6 w-80 max-h-[480px] bg-[#121616]/95 backdrop-blur-md border border-[#ffb77b]/30 p-6 rounded shadow-2xl z-50 flex flex-col justify-between text-[#e2e2e2] font-sans animate-fadeIn">
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ffb77b]"></div>
                
                <div>
                  <div className="flex items-center justify-between border-b border-[#ffb77b]/10 pb-3 mb-4">
                    <span className="text-xs font-mono tracking-widest text-[#ffb77b] uppercase font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      GIỎ HÀNG // CART ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                    <button
                      onClick={() => setCart([])}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 uppercase tracking-widest"
                    >
                      XÓA HẾT
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-3 overflow-y-auto max-h-[200px] custom-scroll pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-[#0c0f0f]/60 p-2.5 rounded border border-[#ffb77b]/5">
                        <div>
                          <span className="text-xs font-bold block text-white">{item.name}</span>
                          <span className="text-[10px] font-mono text-[#ffb77b]">{formatPrice(item.price)}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center border border-[#ffb77b]/30 hover:border-[#ffb77b] text-xs transition-colors rounded-sm"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center border border-[#ffb77b]/30 hover:border-[#ffb77b] text-xs transition-colors rounded-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order Checkout Section */}
                <form onSubmit={handlePlaceOrder} className="mt-4 pt-4 border-t border-[#ffb77b]/10 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className="block text-[8px] text-[#c4c7c7] uppercase mb-1">Tên của bạn</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Khách vãng lai"
                        className="w-full bg-[#0c0f0f] border border-[#ffb77b]/20 px-2 py-1 text-[11px] rounded-sm text-white focus:border-[#ffb77b] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-[#c4c7c7] uppercase mb-1">Số bàn / Vị trí</label>
                      <select
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full bg-[#0c0f0f] border border-[#ffb77b]/20 px-2 py-1 text-[11px] rounded-sm text-white focus:border-[#ffb77b] outline-none cursor-pointer"
                      >
                        <option>Bàn 01</option>
                        <option>Bàn 02</option>
                        <option>Bàn 03</option>
                        <option>Bàn 04</option>
                        <option>Bàn 05</option>
                        <option>Mang về</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline font-mono text-xs pt-1.5">
                    <span className="text-[#c4c7c7] font-semibold">TỔNG CỘNG:</span>
                    <span className="text-sm font-extrabold text-[#ffb77b]">
                      {formatPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={ordering}
                    className={`w-full py-2.5 bg-[#ffb77b] text-[#2e1500] font-mono font-bold text-[10px] uppercase tracking-widest rounded-sm border border-[#ffb77b] transition-all ${
                      ordering
                        ? 'bg-[#ffb77b]/20 text-[#ffb77b]/50 border-[#ffb77b]/20 cursor-not-allowed'
                        : 'hover:shadow-[0_0_15px_rgba(255,183,123,0.3)] hover:brightness-105'
                    }`}
                  >
                    {ordering ? 'SENDING ORDER...' : 'PLACE ORDER // GỌI MÓN'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
