import React, { useState } from 'react';
import MenuItem from './MenuItem';

export default function MobileMenu({ menuData, onMenuItemClick, onAddToOrder }) {
  const [activeCategory, setActiveCategory] = useState('phin');

  const categories = [
    { id: 'phin', label: 'Cà Phê Phin' },
    { id: 'tra', label: 'Trà Signature' },
    { id: 'freeze', label: 'Freeze & Đá Xay' },
    { id: 'specialty', label: 'Specialty Cà Phê' },
    { id: 'pastry', label: 'Bánh & Tráng Miệng' },
    { id: 'fuel', label: 'Combo Độc Quyền' }
  ];

  const currentCategoryData = menuData[activeCategory];

  return (
    <div className="block md:hidden">
      {/* Mobile Tabs Selector */}
      <div className="flex justify-start gap-3 mb-8 overflow-x-auto pb-3 border-b border-outline-variant/10 px-margin-mobile scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 border font-label-caps text-[11px] uppercase tracking-wider rounded-sm transition-all flex-shrink-0 ${
              activeCategory === cat.id
                ? 'border-secondary text-secondary'
                : 'border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mobile Panels Content */}
      <div id="mobile-menu-content" className="px-margin-mobile">
        <div className="menu-category-panel block space-y-6">
          <div className="glass-card p-6 rounded-lg space-y-6">
            <p className="font-body-sm text-on-surface-variant text-[14px]">
              {currentCategoryData.intro}
            </p>
            <div className="w-full aspect-[16/10] overflow-hidden rounded-md border border-outline-variant/20">
              <img 
                loading="lazy" 
                alt={currentCategoryData.title} 
                className="w-full h-full object-cover grayscale-[20%] brightness-90" 
                src={currentCategoryData.image}
              />
            </div>
            <div className="space-y-6 pt-4">
              {currentCategoryData.items.map((item, idx) => (
                <MenuItem key={idx} item={item} onClick={onMenuItemClick} onAddToOrder={onAddToOrder} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
