/**
 * Copyright (c) 2026 JAThong, Trần Hoàng Thông và Đỗ Lê Trọng Hiếu. All rights reserved.
 *
 * Developed by:
 * - Thông Trần
 * - Hiếu Đỗ
 */
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import HTMLFlipBook from './HTMLFlipBook';
import MenuItemComponent from './MenuItem';
import { playPageFlipSound } from '../../utils/audio';

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
const Page = React.forwardRef(({ number, isCover, children, className = '' }, ref) => {
  return (
    <div
      className={`page bg-surface-container relative select-none ${className}`}
      ref={ref}
      data-density={isCover ? 'hard' : 'soft'}
    >
      {!isCover && <div className="page-inner-border" />}
      {!isCover && <div className="page-watermark" />}
      <div className="w-full h-full flex flex-col justify-between relative z-10">
        {children}
        {!isCover && number % 2 !== 0 && <div className="page-fold-right" />}
        {!isCover && number % 2 === 0 && <div className="page-fold-left" />}
      </div>
    </div>
  );
});
Page.displayName = 'Page';

// ---------------------------------------------------------------------------
// BookSkeleton — displayed while page-flip initialises
// ---------------------------------------------------------------------------
function BookSkeleton() {
  return (
    <div className="book-skeleton w-full aspect-[1.8/1] flex rounded-sm overflow-hidden"
      aria-hidden="true" aria-label="Đang tải sách thực đơn...">
      {/* Left page skeleton */}
      <div className="flex-1 bg-[#1a1c1e] relative overflow-hidden border-r border-[#bf953f]/10">
        <div className="absolute inset-0 skeleton-shimmer" />
        <div className="p-10 space-y-4 opacity-30">
          <div className="h-5 w-1/2 rounded bg-[#bf953f]/20" />
          <div className="h-1 w-16 rounded bg-[#bf953f]/20 mt-2" />
          <div className="h-3 w-full rounded bg-white/5 mt-4" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
          <div className="h-3 w-4/6 rounded bg-white/5" />
          <div className="h-32 w-full rounded bg-white/5 mt-6" />
        </div>
      </div>
      {/* Right page skeleton */}
      <div className="flex-1 bg-[#1e2022] relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" style={{ animationDelay: '0.2s' }} />
        <div className="p-10 space-y-6 opacity-25">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-start">
              <div className="space-y-2 flex-1 pr-4">
                <div className="h-4 w-2/3 rounded bg-white/8" />
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="h-3 w-4/5 rounded bg-white/5" />
              </div>
              <div className="h-4 w-20 rounded bg-[#bf953f]/15 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BookMenu
// ---------------------------------------------------------------------------
export default function BookMenu({ menuData, onMenuItemClick, onAddToOrder }) {
  const bookRef = useRef(null);

  // currentPage drives the counter / button disabled states.
  const [currentPage, setCurrentPage] = useState(0);

  // isReady: true after HTMLFlipBook fires onReady → hide skeleton, show book
  const [isReady, setIsReady] = useState(false);

  // Guard: prevent queuing multiple flips before the animation completes.
  const isFlippingRef = useRef(false);

  // Safety valve: if onFlip / onChangeState never fires, unlock after 700 ms.
  const lockTimeoutRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Build static page data array — memoised so it is computed only once
  // ---------------------------------------------------------------------------
  const categories = useMemo(() => [
    menuData.phin,
    menuData.tra,
    menuData.freeze,
    menuData.specialty,
    menuData.pastry,
    menuData.fuel,
  ], [menuData]);

  const pages = useMemo(() => {
    const arr = [];
    arr.push({ type: 'cover' });
    categories.forEach(cat => {
      arr.push({ type: 'intro', title: cat.title, intro: cat.intro, image: cat.image });
      arr.push({ type: 'items', items: cat.items });
    });
    arr.push({ type: 'back-cover' });
    return arr;
  }, [categories]);

  const totalPages = pages.length;

  // ---------------------------------------------------------------------------
  // Lock helpers
  // ---------------------------------------------------------------------------
  const acquireLock = useCallback(() => {
    isFlippingRef.current = true;
    clearTimeout(lockTimeoutRef.current);
    lockTimeoutRef.current = setTimeout(() => {
      isFlippingRef.current = false;
    }, 700);
  }, []);

  const releaseLock = useCallback(() => {
    clearTimeout(lockTimeoutRef.current);
    isFlippingRef.current = false;
  }, []);

  // ---------------------------------------------------------------------------
  // page-flip event callbacks
  // ---------------------------------------------------------------------------
  const onPageChange = useCallback((e) => {
    setCurrentPage(e.data);
    playPageFlipSound();
    releaseLock();
  }, [releaseLock]);

  const onStateChange = useCallback((e) => {
    if (e.data === 'flipping') {
      isFlippingRef.current = true;
    } else if (e.data === 'read') {
      releaseLock();
    }
  }, [releaseLock]);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Navigation actions
  // ---------------------------------------------------------------------------
  const nextPage = useCallback(() => {
    if (isFlippingRef.current) return;
    const pf = bookRef.current?.getPageFlip();
    if (!pf) return;
    acquireLock();
    pf.flipNext();
  }, [acquireLock]);

  const prevPage = useCallback(() => {
    if (isFlippingRef.current) return;
    const pf = bookRef.current?.getPageFlip();
    if (!pf) return;
    acquireLock();
    pf.flipPrev();
  }, [acquireLock]);

  const resetBook = useCallback(() => {
    if (isFlippingRef.current) return;
    const pf = bookRef.current?.getPageFlip();
    if (!pf) return;
    acquireLock();
    pf.turnToPage(0);
  }, [acquireLock]);

  // Cleanup
  useEffect(() => () => clearTimeout(lockTimeoutRef.current), []);

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      const menuSection = document.getElementById('menu');
      if (!menuSection) return;
      const rect = menuSection.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inViewport) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); nextPage(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevPage(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  // ---------------------------------------------------------------------------
  // Memoised page JSX
  // ---------------------------------------------------------------------------
  const bookPages = useMemo(() => pages.map((page, index) => {
    const isCover = page.type === 'cover' || page.type === 'back-cover';

    if (page.type === 'cover') {
      return (
        <Page key={index} number={index} isCover={true}>
          <div className="face front bg-leather-cover border-r border-[#bf953f]/30 flex flex-col items-center justify-center p-8 text-center h-full group">
            <div className="w-full h-full border-[3px] border-[#bf953f]/40 p-8 relative flex flex-col items-center justify-center before:absolute before:inset-2 before:border before:border-[#bf953f]/20">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#bf953f_0%,transparent_70%)] mix-blend-screen pointer-events-none" />
              <span className="font-label-caps text-[10px] text-[#bf953f] mb-8 tracking-[0.3em] uppercase drop-shadow-md">Phiên Bản Độc Quyền</span>
              <h2 className="font-display-lg text-[48px] text-gold-foil leading-tight mb-4 tracking-widest uppercase font-semibold">Thực Đơn</h2>
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f] to-transparent my-8" />
              <p className="font-label-caps text-[11px] text-[#bf953f]/80 tracking-[0.2em] uppercase">EST. 2024</p>
              <div className="mt-auto flex items-center gap-3 text-[#bf953f] transition-all duration-500 group-hover:scale-110 group-hover:text-[#fcf6ba] drop-shadow-[0_0_15px_rgba(191,149,63,0.5)]">
                <span className="material-symbols-outlined text-[28px]">auto_stories</span>
                <span className="font-label-caps uppercase tracking-[0.2em] text-[11px]">Nhấp mở sách</span>
              </div>
              {/* Hint badge — pulse 3 times then stop (CSS animation-iteration-count:3) */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#bf953f]/10 border border-[#bf953f]/30 text-[#bf953f] px-3 py-1.5 rounded-full text-[10px] font-label-caps uppercase tracking-widest hint-badge z-20 pointer-events-none shadow-[0_0_10px_rgba(191,149,63,0.2)]">
                <span>Góc Lật</span>
                <span className="material-symbols-outlined text-[13px]">gesture</span>
              </div>
            </div>
          </div>
        </Page>
      );
    }

    if (page.type === 'intro') {
      return (
        <Page key={index} number={index} isCover={false}>
          <div className="face back bg-gradient-to-br from-[#1a1c1e] to-[#121414] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-10 justify-between h-full">
            <div className="flex flex-col">
              <h3 className="font-headline-md text-headline-md text-secondary mb-2">{page.title}</h3>
              <div className="w-16 h-[3px] bg-secondary mb-6" />
              <p className="font-body-sm text-[14px] text-on-surface-variant leading-relaxed mb-6">{page.intro}</p>
            </div>
            <div className="w-full aspect-[4/3] overflow-hidden border border-outline-variant/20 rounded-sm group/img">
              <img
                loading="lazy"
                decoding="async"
                alt={page.title}
                className="w-full h-full object-cover grayscale-[20%] contrast-110 brightness-90 transition-transform duration-700 group-hover/img:scale-105"
                src={page.image}
              />
            </div>
          </div>
        </Page>
      );
    }

    if (page.type === 'items') {
      return (
        <Page key={index} number={index} isCover={false}>
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

    if (page.type === 'back-cover') {
      return (
        <Page key={index} number={index} isCover={true}>
          <div className="face back bg-leather-cover border-l border-[#bf953f]/30 flex flex-col items-center justify-between p-8 text-center h-full">
            <div className="w-full h-full border-[3px] border-[#bf953f]/30 p-6 flex flex-col items-center justify-between relative before:absolute before:inset-2 before:border before:border-[#bf953f]/15">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#bf953f_0%,transparent_75%)] mix-blend-screen pointer-events-none" />
              <div className="mt-6">
                <h3 className="font-display-lg text-[32px] text-gold-foil tracking-widest uppercase mb-2">LAB COFFEE</h3>
                <p className="font-label-caps text-[10px] text-[#bf953f]/80 tracking-[0.25em] mb-4">REFORMATORY LAB &amp; TRADING LOUNGE</p>
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#bf953f]/60 to-transparent mx-auto mb-4" />
              </div>
              <div className="space-y-4 max-w-[280px]">
                <p className="font-satisfy text-[17px] text-[#bf953f] drop-shadow-sm">"Nơi mỗi ngụm cà phê khơi nguồn chiến lược thị trường sắc bén."</p>
                <p className="font-body-sm text-[12px] text-[#bf953f]/70 leading-relaxed italic">
                  Xin chân thành cảm ơn quý khách hàng đã lựa chọn trải nghiệm dịch vụ tại LAB COFFEE. Chúc các nhà giao dịch luôn thành công gặt hái lợi nhuận tốt!
                </p>
              </div>
              {/* QR & Contact */}
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </button>
            </div>
          </div>
        </Page>
      );
    }

    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [pages, onMenuItemClick, onAddToOrder, resetBook]);

  // ---------------------------------------------------------------------------
  // Page counter label & progress dots
  // ---------------------------------------------------------------------------
  const pageLabel = useMemo(() => {
    if (currentPage === 0) return 'Bìa trước';
    if (currentPage >= totalPages - 1) return 'Bìa sau';
    return `Trang ${currentPage} / ${totalPages - 2}`;
  }, [currentPage, totalPages]);

  // Build progress dot array: skip cover(0) and back-cover(last)
  const innerPageCount = totalPages - 2; // number of inner pages
  const progressDots = useMemo(() => {
    // Show at most 13 dots, evenly sampled
    const MAX_DOTS = Math.min(innerPageCount, 13);
    return Array.from({ length: MAX_DOTS }, (_, i) => {
      const pageIdx = Math.round((i / (MAX_DOTS - 1)) * (innerPageCount - 1)) + 1;
      const isActive = currentPage > 0 && currentPage < totalPages - 1 &&
        Math.abs(currentPage - pageIdx) < Math.ceil(innerPageCount / MAX_DOTS / 2 + 0.5);
      return { pageIdx, isActive };
    });
  }, [innerPageCount, totalPages, currentPage]);

  const atStart = currentPage === 0;
  const atEnd   = currentPage >= totalPages - 1;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center py-8 relative w-full min-h-[80vh]">

      {/* Outer wrapper — side padding carves out space for the nav buttons */}
      <div className="relative w-[95vw] max-w-[1400px]" style={{ paddingLeft: '64px', paddingRight: '64px' }}>

        {/* ── Book ─────────────────────────────────────────────────────── */}
        <div className="flipbook-wrapper w-full aspect-[1.8/1] flex-none relative">

          {/* Skeleton loader — shown while page-flip is initialising */}
          {!isReady && (
            <div className="absolute inset-0 z-50 rounded-sm overflow-hidden">
              <BookSkeleton />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#bf953f]/20">
                  <span className="material-symbols-outlined text-[18px] text-[#bf953f] animate-spin" style={{ animationDuration: '1.5s' }}>progress_activity</span>
                  <span className="text-[11px] font-label-caps text-[#bf953f]/80 uppercase tracking-widest">Đang tải sách...</span>
                </div>
              </div>
            </div>
          )}

          {/* Book — fades in once ready */}
          <div className={`w-full h-full transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
            <HTMLFlipBook
              width={600}
              height={800}
              size="stretch"
              minWidth={300}
              maxWidth={1400}
              minHeight={400}
              maxHeight={1600}
              showCover={true}
              usePortrait={false}
              mobileScrollSupport={true}
              className="main-book"
              onFlip={onPageChange}
              onChangeState={onStateChange}
              onReady={handleReady}
              ref={bookRef}
            >
              {bookPages}
            </HTMLFlipBook>
          </div>
        </div>

        {/* ── Side nav buttons ──────────────────────────────────────────── */}
        <button
          onClick={prevPage}
          disabled={atStart}
          aria-label="Trang trước"
          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
          className="group flex items-center justify-center w-12 h-12 rounded-full
            bg-[#bf953f]/10 border border-[#bf953f]/30 text-[#bf953f]
            hover:bg-[#bf953f]/25 hover:border-[#bf953f]/70 hover:scale-110
            active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed
            transition-all duration-200 shadow-lg backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-2xl group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
        </button>

        <button
          onClick={nextPage}
          disabled={atEnd}
          aria-label="Trang sau"
          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}
          className="group flex items-center justify-center w-12 h-12 rounded-full
            bg-[#bf953f]/10 border border-[#bf953f]/30 text-[#bf953f]
            hover:bg-[#bf953f]/25 hover:border-[#bf953f]/70 hover:scale-110
            active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed
            transition-all duration-200 shadow-lg backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-2xl group-hover:translate-x-0.5 transition-transform">chevron_right</span>
        </button>
      </div>

      {/* ── Navigation strip: prev | progress dots | label | next ──────── */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={prevPage}
          disabled={atStart}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-label-caps uppercase
            tracking-widest text-[#bf953f]/60 hover:text-[#bf953f]
            disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Trước
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-3 py-1 border border-[#bf953f]/20 rounded">
          {/* Cover dot */}
          <button
            onClick={resetBook}
            title="Bìa trước"
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentPage === 0 ? 'bg-[#bf953f] scale-125' : 'bg-[#bf953f]/25 hover:bg-[#bf953f]/50'
            }`}
          />
          {/* Inner page dots */}
          {progressDots.map((dot, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                dot.isActive
                  ? 'w-3 h-1.5 bg-[#bf953f]'
                  : 'w-1.5 h-1.5 bg-[#bf953f]/20'
              }`}
            />
          ))}
          {/* Back-cover dot */}
          <div
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              currentPage >= totalPages - 1 ? 'bg-[#bf953f] scale-125' : 'bg-[#bf953f]/25'
            }`}
          />
        </div>

        {/* Page label */}
        <span className="font-label-caps text-[11px] text-[#bf953f]/50 tracking-widest
          px-3 py-1 border border-[#bf953f]/20 rounded tabular-nums min-w-[110px] text-center">
          {pageLabel}
        </span>

        <button
          onClick={nextPage}
          disabled={atEnd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-label-caps uppercase
            tracking-widest text-[#bf953f]/60 hover:text-[#bf953f]
            disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
        >
          Sau
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
