import React, { Component, useState, useCallback } from 'react';
import { menuData } from './menuData';
import BookMenu from './BookMenu';
import MobileMenu from './MobileMenu';
import MenuDetailModal from './MenuDetailModal';

// Error boundary to prevent the entire page from going blank if flipbook crashes
class MenuErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[MenuSection] Flipbook error caught by boundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <section id="menu" className="py-24 bg-glow-bronze relative">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <h2 className="font-headline-md text-secondary mb-4">SÁCH THỰC ĐƠN</h2>
            <p className="text-on-surface-variant text-sm font-mono mb-2">
              Không thể tải quyển sách thực đơn. Vui lòng tải lại trang.
            </p>
            <p className="text-red-400 text-xs font-mono opacity-60">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 border border-secondary/40 text-secondary text-xs font-mono uppercase tracking-wider hover:bg-secondary/10 transition-all rounded-sm"
            >
              Tải lại trang
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

function MenuSectionInner() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ordering state
  const [orderItems, setOrderItems] = useState([]);
  const [isTrayExpanded, setIsTrayExpanded] = useState(false);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Order Tray Actions
  const handleAddToOrder = useCallback((item) => {
    setOrderItems((prev) => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const handleUpdateQty = (name, delta) => {
    setOrderItems((prev) => {
      return prev.map(i => {
        if (i.name === name) {
          const newQty = i.qty + delta;
          return newQty > 0 ? { ...i, qty: newQty } : null;
        }
        return i;
      }).filter(Boolean);
    });
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    setIsTrayExpanded(false);
  };

  const shareMenu = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Thực đơn LAB COFFEE',
        text: 'Khám phá thực đơn độc quyền tại LAB COFFEE & Trading Lounge',
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Đã sao chép liên kết thực đơn vào bộ nhớ tạm!');
      }).catch(console.error);
    }
  };

  // Calculate order totals
  const totalQty = orderItems.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = orderItems.reduce((acc, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
    return acc + (priceNum * item.qty);
  }, 0);

  return (
    <section id="menu" className="py-24 bg-glow-bronze relative overflow-hidden">
      {/* Section Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-8">
        <span className="font-label-caps text-label-caps text-secondary mb-4 block tracking-[0.25em] uppercase">
          PHÒNG THÍ NGHIỆM ĐỔI MỚI GIỚI THIỆU
        </span>
        <h2 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-on-surface uppercase tracking-wide">
          SÁCH THỰC ĐƠN
        </h2>
        <div className="w-16 h-[2px] bg-secondary mx-auto mt-6 mb-8"></div>
        <p className="max-w-2xl mx-auto text-on-surface-variant font-body-lg px-4">
          Khám phá thực đơn độc quyền được tuyển chọn kỹ lưỡng. Lật từng trang để cảm nhận sự kết hợp giữa nghệ thuật pha chế thủ công và nhịp đập tài chính.
        </p>
        
        {/* Share & PDF Actions */}
        <div className="flex justify-center gap-4 mt-8 reveal-on-scroll">
          <button 
            onClick={shareMenu}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-outline-variant/30 text-on-surface-variant hover:text-secondary hover:border-secondary font-label-caps text-[10px] uppercase tracking-wider rounded-sm transition-all bg-surface/30"
          >
            <span className="material-symbols-outlined text-sm">share</span> Chia sẻ thực đơn
          </button>
          <a 
            href="#" 
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-outline-variant/30 text-on-surface-variant hover:text-secondary hover:border-secondary font-label-caps text-[10px] uppercase tracking-wider rounded-sm transition-all bg-surface/30"
          >
            <span className="material-symbols-outlined text-sm">download</span> Tải bản PDF
          </a>
        </div>
      </div>

      {/* Desktop Digital Flipbook Section (Hidden on Mobile) */}
      <div className="hidden md:block">
        {/* Keyboard navigation tip */}
        <div className="flex justify-center items-center gap-2 text-on-surface-variant text-[11px] font-label-caps uppercase opacity-65 tracking-wider mb-6">
          <span className="material-symbols-outlined text-[14px]">keyboard</span>
          <span>Mẹo: Sử dụng phím mũi tên <span className="text-secondary font-bold">←</span> và <span className="text-secondary font-bold">→</span> để lật trang</span>
        </div>

        <div className="flex max-w-container-max mx-auto px-margin-desktop justify-center items-center py-8">
          <BookMenu 
            menuData={menuData} 
            onMenuItemClick={handleItemClick} 
            onAddToOrder={handleAddToOrder}
          />
        </div>
      </div>

      {/* Mobile Menu Feed Section (Tabbed View for Mobile, Hidden on Desktop) */}
      <MobileMenu 
        menuData={menuData} 
        onMenuItemClick={handleItemClick} 
        onAddToOrder={handleAddToOrder}
      />

      {/* Reusable Item Detail Popup Modal */}
      <MenuDetailModal 
        isOpen={isModalOpen} 
        item={selectedItem} 
        onClose={handleCloseModal} 
        onAddToOrder={handleAddToOrder}
      />

      {/* Floating Order Tray */}
      {orderItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end">
          {/* Expanded Tray Panel */}
          {isTrayExpanded && (
            <div className="glass-panel w-80 md:w-96 p-6 mb-4 rounded-xl border border-secondary/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                <h4 className="font-headline-md text-base text-secondary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">shopping_bag</span> Khay Gọi Món
                </h4>
                <button 
                  onClick={handleClearOrder}
                  className="text-on-surface-variant hover:text-error text-[10px] font-label-caps uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Xóa hết
                </button>
              </div>
              
              {/* Items List */}
              <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scroll pr-1">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4 text-[13px]">
                    <div className="flex-1">
                      <p className="font-medium text-on-surface leading-tight">{item.name}</p>
                      <p className="text-[11px] text-secondary mt-0.5">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={() => handleUpdateQty(item.name, -1)}
                        className="w-6 h-6 rounded-full border border-outline-variant/35 flex items-center justify-center hover:border-secondary hover:text-secondary text-xs transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-medium text-on-surface w-4 text-center">{item.qty}</span>
                      <button 
                        onClick={() => handleUpdateQty(item.name, 1)}
                        className="w-6 h-6 rounded-full border border-outline-variant/35 flex items-center justify-center hover:border-secondary hover:text-secondary text-xs transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t border-outline-variant/10 pt-3 flex justify-between items-baseline">
                <span className="text-[10px] text-on-surface-variant font-label-caps uppercase tracking-wider">Tổng cộng tạm tính:</span>
                <span className="text-lg font-bold text-secondary">
                  {totalAmount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              
              <div className="bg-secondary/5 border border-secondary/15 p-3 rounded-md text-[10px] text-on-surface-variant leading-relaxed text-center">
                Vui lòng chụp ảnh màn hình khay này hoặc báo mã món cho Barista tại quầy phục vụ để nhận đồ uống!
              </div>
            </div>
          )}
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsTrayExpanded(!isTrayExpanded)}
            className="flex items-center gap-3 bg-secondary text-on-secondary px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(255,183,123,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer font-label-caps text-label-caps uppercase tracking-widest text-[11px] font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isTrayExpanded ? 'close' : 'shopping_bag'}
            </span>
            <span>
              {isTrayExpanded ? 'Đóng' : `Khay Món (${totalQty})`}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}

export default function MenuSection() {
  return (
    <MenuErrorBoundary>
      <MenuSectionInner />
    </MenuErrorBoundary>
  );
}
