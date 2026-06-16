import React, { useEffect } from 'react';

export default function MenuDetailModal({ isOpen, item, onClose, onAddToOrder }) {
  // Prevent page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  const formatTag = (tag) => {
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div 
      id="menu-item-modal" 
      onClick={(e) => e.target.id === 'menu-item-modal' && onClose()}
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-hidden={!isOpen}
    >
      <div className="glass-panel w-full max-w-[600px] mx-margin-mobile p-6 md:p-8 rounded-xl border border-secondary/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface/60 hover:text-secondary transition-colors z-20" 
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[28px] block">close</span>
        </button>
        
        {/* Left Column: Image & Tags */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="w-full aspect-square overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover" 
            />
            {item.tags && item.tags.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-secondary text-on-secondary text-[9px] font-label-caps uppercase rounded-sm tracking-wider shadow-sm"
                  >
                    {formatTag(tag)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Info & Customization */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-headline-md text-[24px] text-secondary font-bold mb-1">{item.name}</h3>
              <div className="text-xl font-bold text-on-surface">{item.price}</div>
            </div>
            <div className="w-full h-[1px] bg-outline-variant/10"></div>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              {item.detailDesc || item.desc}
            </p>
            
            {/* Sensory Notes (conditional) */}
            {item.sensory && (
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-secondary tracking-widest uppercase block">Hương Vị (Sensory Notes)</span>
                <p className="font-body-sm text-[12px] text-on-surface italic">{item.sensory}</p>
              </div>
            )}
            
            {/* Coffee Origin (conditional) */}
            {item.origin && (
              <div className="space-y-1">
                <span className="font-label-caps text-[9px] text-secondary tracking-widest uppercase block">Nguồn Gốc (Origin)</span>
                <p className="font-body-sm text-[12px] text-on-surface-variant">{item.origin}</p>
              </div>
            )}
          </div>
          
          {/* Standard Premium Options Preview */}
          <div className="border-t border-outline-variant/10 pt-4 mt-6 flex flex-col gap-4">
            <div>
              <span className="font-label-caps text-[9px] text-on-tertiary-container tracking-widest uppercase block mb-2">Tùy Chọn Thưởng Thức</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">water_drop</span>
                  <span>Đá: Tiêu chuẩn / Ít đá</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">sugar</span>
                  <span>Đường: 100% / 50% / 0%</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="material-symbols-outlined text-[14px] text-secondary">opacity</span>
                  <span>Nâng cấp: Sữa tươi / Sữa yến mạch (+10k)</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                onAddToOrder(item);
                onClose();
              }}
              className="w-full py-3 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase rounded-sm hover:brightness-110 active:scale-95 transition-all text-center tracking-wider text-[11px] cursor-pointer font-semibold"
            >
              Thêm vào khay gọi món
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
