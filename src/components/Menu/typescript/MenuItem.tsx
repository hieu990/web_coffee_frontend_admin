import React from 'react';
import { MenuItem as MenuItemType } from './menuData';

interface MenuItemProps {
  item: MenuItemType;
  onClick: (item: MenuItemType) => void;
  onAddToOrder: (item: MenuItemType) => void;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({ item, onClick, onAddToOrder }) => {
  // Format tags into beautiful readable strings (e.g. caffeine-cao -> Caffeine Cao)
  const formatTag = (tag: string) => {
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div 
      className="group border-b border-outline-variant/10 pb-4 transition-all duration-300 hover:border-b-secondary/30 flex justify-between items-center"
    >
      {/* Clickable section for detail modal */}
      <div 
        onClick={() => onClick(item)}
        className="flex-1 cursor-pointer pr-4 menu-item-clickable"
        title="Nhấp để xem chi tiết"
      >
        <div className="flex items-baseline mb-1 gap-2">
          <h4 className="font-menu-item text-[17px] text-on-surface group-hover:text-secondary transition-colors duration-300 flex items-center flex-wrap gap-2 font-medium">
            {item.name}
            {item.tags && item.tags.map((tag, i) => (
              <span 
                key={i} 
                className={`px-2 py-0.5 text-[9px] font-label-caps uppercase rounded-sm tracking-wider ${
                  tag === 'signature' || tag === 'độc-bản' || tag === 'đặc-trưng'
                    ? 'bg-secondary/15 border border-secondary/30 text-secondary'
                    : 'bg-outline-variant/10 border border-outline-variant/20 text-on-surface-variant'
                }`}
              >
                {formatTag(tag)}
              </span>
            ))}
          </h4>
        </div>
        <p className="font-body-sm text-[13px] text-on-surface-variant group-hover:text-on-surface transition-colors duration-300 line-clamp-2">
          {item.desc}
        </p>
      </div>
      
      {/* Price & Direct Selection Actions */}
      <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
        <span className="font-headline-md text-[14px] text-secondary font-bold tracking-wide group-hover:scale-105 transition-transform duration-300">
          {item.price}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToOrder(item);
          }}
          className="px-3 py-1.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-on-secondary border border-secondary/20 hover:border-secondary font-label-caps text-[9px] uppercase tracking-wider transition-all rounded-sm cursor-pointer active:scale-95 shadow-sm hover:shadow-[0_0_10px_rgba(255,183,123,0.3)]"
        >
          + Chọn món
        </button>
      </div>
    </div>
  );
};

export default React.memo(MenuItemComponent);
