import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
// @ts-ignore
import HTMLFlipBook from '../HTMLFlipBook';
import MenuItemComponent from './MenuItem';
// @ts-ignore
import { playPageFlipSound } from '../../../utils/audio';
import { MenuItem } from './menuData';

export type PageType = 'cover' | 'intro' | 'items' | 'back-cover' | 'blank';

export interface PageData {
  type: PageType;
  categoryKey?: string;
  title?: string;
  intro?: string;
  image?: string;
  items?: MenuItem[];
}

interface PageProps {
  number: number;
  isCover: boolean;
  children: React.ReactNode;
  className?: string;
  onPageClick?: () => void;
}

// React-pageflip page component must expose DOM reference via React.forwardRef
const Page = React.forwardRef<HTMLDivElement, PageProps>(({ number, isCover, children, className = "", onPageClick }, ref) => {
  const isLeftPage = number % 2 !== 0 && !isCover;
  const isRightPage = number % 2 === 0 && !isCover;

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Do not trigger page flip if clicking on buttons, links, custom clickable cards or standard interactive inputs
    if (target.closest('.menu-item-clickable, button, a, [role="button"], input, select, textarea')) {
      return;
    }
    if (onPageClick) {
      onPageClick();
    }
  };

  return (
    <div 
      className={`page bg-surface-container relative select-none will-change-transform shadow-lg ${className}`} 
      ref={ref}
      data-density={isCover ? "hard" : "soft"}
      onClick={handlePageClick}
    >
      {!isCover && <div className="page-inner-border" />}
      {!isCover && <div className="page-watermark" />}
      <div className="w-full h-full flex flex-col justify-between relative z-10">
        {children}
        
        {/* Page fold shadows */}
        {isLeftPage && <div className="page-fold-right" />}
        {isRightPage && <div className="page-fold-left" />}
      </div>

      {/* Edge Click Hotspots for Page Flipping */}
      {isLeftPage && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onPageClick) onPageClick();
          }}
          className="absolute left-0 top-0 bottom-0 w-20 z-20 cursor-pointer bg-gradient-to-r from-transparent to-transparent hover:from-white/[0.04] active:from-white/[0.08] transition-all duration-300 flex items-center group/edge"
          title="Trang trước"
        >
          <span className="text-white/30 opacity-0 group-hover/edge:opacity-100 transition-opacity ml-4 text-2xl font-light">❮</span>
        </div>
      )}
      {isRightPage && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onPageClick) onPageClick();
          }}
          className="absolute right-0 top-0 bottom-0 w-20 z-20 cursor-pointer bg-gradient-to-l from-transparent to-transparent hover:from-white/[0.04] active:from-white/[0.08] transition-all duration-300 flex items-center justify-end group/edge"
          title="Trang sau"
        >
          <span className="text-white/30 opacity-0 group-hover/edge:opacity-100 transition-opacity mr-4 text-2xl font-light">❯</span>
        </div>
      )}
      {isCover && number === 0 && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onPageClick) onPageClick();
          }}
          className="absolute right-0 top-0 bottom-0 w-20 z-20 cursor-pointer bg-gradient-to-l from-transparent to-transparent hover:from-white/[0.04] active:from-white/[0.08] transition-all duration-300 flex items-center justify-end group/edge"
          title="Mở sách"
        >
          <span className="text-[#bf953f]/50 opacity-0 group-hover/edge:opacity-100 transition-opacity mr-4 text-2xl font-light">❯</span>
        </div>
      )}
      {isCover && number > 0 && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onPageClick) onPageClick();
          }}
          className="absolute left-0 top-0 bottom-0 w-20 z-20 cursor-pointer bg-gradient-to-r from-transparent to-transparent hover:from-white/[0.04] active:from-white/[0.08] transition-all duration-300 flex items-center group/edge"
          title="Trang trước"
        >
          <span className="text-[#bf953f]/50 opacity-0 group-hover/edge:opacity-100 transition-opacity ml-4 text-2xl font-light">❮</span>
        </div>
      )}
    </div>
  );
});

Page.displayName = 'Page';

interface MenuBookProps {
  pages: PageData[];
  onMenuItemClick: (item: MenuItem) => void;
  onAddToOrder: (item: MenuItem) => void;
}

export default function MenuBook({ pages, onMenuItemClick, onAddToOrder }: MenuBookProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const totalPages = pages.length;
  
  // Rate-limiting page flipping to ensure a flip completes before starting the next one
  const isFlippingRef = useRef<boolean>(false);

  const onPageChange = (e: { data: number }) => {
    setCurrentPage(e.data);
    playPageFlipSound();
    isFlippingRef.current = false;
  };

  const onStateChange = useCallback((e: { data: string }) => {
    if (e.data === 'flipping') {
      isFlippingRef.current = true;
    } else if (e.data === 'read') {
      isFlippingRef.current = false;
    }
  }, []);

  const nextPage = useCallback(() => {
    if (isFlippingRef.current) {
      console.warn("[MenuBook Security] Click ignored: Page flip animation cooldown active (potential automated spam detected).");
      return;
    }
    isFlippingRef.current = true;
    if (bookRef.current) {
      const pageFlipInstance = bookRef.current.getPageFlip();
      if (pageFlipInstance) pageFlipInstance.flipNext();
    }
  }, []);

  const prevPage = useCallback(() => {
    if (isFlippingRef.current) {
      console.warn("[MenuBook Security] Click ignored: Page flip animation cooldown active (potential automated spam detected).");
      return;
    }
    isFlippingRef.current = true;
    if (bookRef.current) {
      const pageFlipInstance = bookRef.current.getPageFlip();
      if (pageFlipInstance) pageFlipInstance.flipPrev();
    }
  }, []);

  const resetBook = useCallback(() => {
    if (isFlippingRef.current) {
      console.warn("[MenuBook Security] Click ignored: Page flip animation cooldown active (potential automated spam detected).");
      return;
    }
    isFlippingRef.current = true;
    if (bookRef.current) {
      const pageFlipInstance = bookRef.current.getPageFlip();
      if (pageFlipInstance) pageFlipInstance.turnToPage(0);
    }
  }, []);

  // Keyboard navigation for flipbook when menu section is in viewport
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const menuSection = document.getElementById('menu');
      if (!menuSection) return;
      
      const rect = menuSection.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (inViewport) {
        if (e.key === 'ArrowRight') nextPage();
        else if (e.key === 'ArrowLeft') prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const bookPages = pages.map((page, index) => {
            const isCover = page.type === 'cover' || page.type === 'back-cover';
            const pageClickHandler = index % 2 === 0 ? nextPage : prevPage;

            if (page.type === 'cover') {
              return (
                <Page key={index} number={index} isCover={true} onPageClick={pageClickHandler}>
                  <div className="face front bg-leather-cover border-r border-[#bf953f]/30 flex flex-col items-center justify-center p-8 text-center cursor-pointer h-full group">
                    <div className="w-full h-full border-[3px] border-[#bf953f]/40 p-8 relative flex flex-col items-center justify-center before:absolute before:inset-2 before:border before:border-[#bf953f]/20">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#bf953f_0%,transparent_70%)] mix-blend-screen pointer-events-none"></div>
                      <span className="font-label-caps text-[10px] text-[#bf953f] mb-8 tracking-[0.3em] uppercase drop-shadow-md">Phiên Bản Độc Quyền</span>
                      <h2 className="font-display-lg text-[48px] text-gold-foil leading-tight mb-4 tracking-widest uppercase font-semibold">Thực Đơn</h2>
                      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent my-8"></div>
                      <p className="font-label-caps text-[11px] text-[#bf953f]/80 tracking-[0.2em] uppercase">EST. 2024</p>
                      
                      <div className="mt-auto flex items-center gap-3 text-[#bf953f] transition-all duration-500 group-hover:scale-110 group-hover:text-[#fcf6ba] drop-shadow-[0_0_15px_rgba(191,149,63,0.5)]">
                        <span className="material-symbols-outlined text-[28px] animate-pulse">auto_stories</span>
                        <span className="font-label-caps uppercase tracking-[0.2em] text-[11px]">Nhấp mở sách</span>
                      </div>
                      
                      {/* Subtle corner folding guide hint */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#bf953f]/10 border border-[#bf953f]/30 text-[#bf953f] px-3 py-1.5 rounded-full text-[10px] font-label-caps uppercase tracking-widest animate-bounce z-20 pointer-events-none shadow-[0_0_10px_rgba(191,149,63,0.2)]">
                        <span>Góc Lật</span>
                        <span className="material-symbols-outlined text-[13px] animate-[pulse_1s_infinite]">gesture</span>
                      </div>
                    </div>
                  </div>
                </Page>
              );
            }

            if (page.type === 'intro') {
              return (
                <Page key={index} number={index} isCover={false} onPageClick={pageClickHandler}>
                  <div className="face back bg-gradient-to-br from-[#1a1c1e] to-[#121414] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-10 justify-between h-full">
                    <div className="flex flex-col">
                      <h3 className="font-headline-md text-headline-md text-secondary mb-2">{page.title}</h3>
                      <div className="w-16 h-[3px] bg-secondary mb-6"></div>
                      <p className="font-body-sm text-[14px] text-on-surface-variant leading-relaxed mb-6">
                        {page.intro}
                      </p>
                    </div>
                    <div className="w-full aspect-[4/3] overflow-hidden border border-outline-variant/20 rounded-sm group/img">
                      <img loading="eager" alt={page.title} className="w-full h-full object-cover grayscale-[20%] contrast-110 brightness-90 transition-transform duration-700 group-hover/img:scale-105" src={page.image}/>
                    </div>
                  </div>
                </Page>
              );
            }

            if (page.type === 'items') {
              return (
                <Page key={index} number={index} isCover={false} onPageClick={pageClickHandler}>
                  <div className="face front bg-gradient-to-br from-[#1e2022] to-[#16181a] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] p-10 overflow-y-auto custom-scroll h-full">
                    <div className="space-y-8">
                      {page.items?.map((item, idx) => (
                        <MenuItemComponent key={idx} item={item} onClick={onMenuItemClick} onAddToOrder={onAddToOrder} />
                      ))}
                    </div>
                  </div>
                </Page>
              );
            }

            if (page.type === 'blank') {
              return (
                <Page key={index} number={index} isCover={false} onPageClick={pageClickHandler}>
                  <div className="face back bg-gradient-to-br from-[#1a1c1e] to-[#121414] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-10 justify-center items-center h-full text-center">
                    <span className="material-symbols-outlined text-[48px] text-secondary/30 mb-4">coffee_maker</span>
                    <p className="font-label-caps text-on-surface-variant/40 tracking-widest text-[11px]">LAB COFFEE & TRADING LOUNGE</p>
                  </div>
                </Page>
              );
            }

            if (page.type === 'back-cover') {
              return (
                <Page key={index} number={index} isCover={true} onPageClick={pageClickHandler}>
                  <div className="face back bg-leather-cover border-l border-[#bf953f]/30 flex flex-col items-center justify-between p-8 text-center h-full">
                    <div className="w-full h-full border-[3px] border-[#bf953f]/30 p-6 flex flex-col items-center justify-between relative before:absolute before:inset-2 before:border before:border-[#bf953f]/15">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#bf953f_0%,transparent_75%)] mix-blend-screen pointer-events-none"></div>
                      
                      <div className="mt-6">
                        <h3 className="font-display-lg text-[32px] text-gold-foil tracking-widest uppercase mb-2">LAB COFFEE</h3>
                        <p className="font-label-caps text-[10px] text-[#bf953f]/80 tracking-[0.25em] mb-4">REFORMATORY LAB &amp; TRADING LOUNGE</p>
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f]/60 to-transparent mx-auto mb-4"></div>
                      </div>

                      <div className="space-y-4 max-w-[280px]">
                        <p className="font-satisfy text-[17px] text-[#bf953f] drop-shadow-sm">"Nơi mỗi ngụm cà phê khơi nguồn chiến lược thị trường sắc bén."</p>
                        <p className="font-body-sm text-[12px] text-[#bf953f]/70 leading-relaxed italic">
                          Xin chân thành cảm ơn quý khách hàng đã lựa chọn trải nghiệm dịch vụ tại LAB COFFEE. Chúc các nhà giao dịch luôn thành công gặt hái lợi nhuận tốt!
                        </p>
                      </div>

                      {/* QR & Contact Info */}
                      <div className="flex items-center gap-4 bg-[#bf953f]/5 border border-[#bf953f]/20 p-4 rounded-sm w-full max-w-[280px] shadow-inner">
                        <div className="w-16 h-16 border-2 border-[#bf953f]/50 p-1 rounded-sm bg-white flex-shrink-0 flex items-center justify-center">
                          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='white'/><path d='M10,10h30v30h-30z M20,20h10v10h-10z M60,10h30v30h-30z M70,20h10v10h-10z M10,60h30v30h-30z M20,70h10v10h-10z M60,60h10v10h-10z M80,60h10v10h-10z M70,70h10v10h-10z M60,80h20v10h-20z M80,80h10v10h-10z' fill='%23bf953f'/></svg>" alt="WiFi & Member QR" className="w-full h-full" />
                        </div>
                        <div className="text-left text-[10px] text-[#bf953f]/80 space-y-1">
                          <p className="font-bold text-[#bf953f] text-[11px] tracking-wider uppercase">Đặc Quyền Hội Viên</p>
                          <p>Quét mã QR kết nối WiFi 10Gbps &amp; nhận ưu đãi giao dịch.</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#bf953f]/60 font-label-caps space-y-1 tracking-widest uppercase mt-4 mb-2">
                        <p>📍 128 Hẻm Thợ Rèn, Quận 1, TP. Hồ Chí Minh</p>
                        <p>📞 Hotline: 1900 8888</p>
                      </div>

                      <button 
                        onClick={resetBook}
                        className="relative overflow-hidden z-10 text-[#0c0f0f] bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#bf953f] px-8 py-3 font-label-caps text-[11px] font-bold tracking-[0.2em] transition-all uppercase rounded-sm cursor-pointer shadow-[0_0_15px_rgba(191,149,63,0.3)] hover:shadow-[0_0_25px_rgba(191,149,63,0.6)] hover:scale-105 active:scale-95 group mb-4"
                      >
                        <span className="relative z-10">Lật Về Trang Đầu</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                      </button>
                    </div>
                  </div>
                </Page>
              );
            }
            return null;
    });

  return (
    <div className="flex flex-col items-center justify-center py-8 relative w-full min-h-[80vh]">
      <div className="flipbook-wrapper w-[95vw] max-w-[1400px] aspect-[1.8/1] flex-none relative">
        {/* Book Spine */}
        <div 
          className="book-spine" 
          id="spine"
          style={{
            left: 'calc(50% - 10px)',
            opacity: currentPage === 0 || currentPage === totalPages - 1 ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}
        />
        
        <HTMLFlipBook
          width={600}
          height={800}
          size="stretch"
          minWidth={300}
          maxWidth={1400}
          minHeight={400}
          maxHeight={1600}
          maxShadowOpacity={0.4}
          showCover={true}
          usePortrait={false}
          mobileScrollSupport={true}
          className="main-book shadow-[0px_45px_90px_rgba(0,0,0,0.7)]"
          onFlip={onPageChange}
          onChangeState={onStateChange}
          ref={bookRef}
        >
          {bookPages}
        </HTMLFlipBook>
      </div>
    </div>
  );
}
