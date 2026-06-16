import React, { useState, useEffect } from 'react';
import { useScrollSpy } from '../hooks/useScrollSpy';
import Logo from './Logo';

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const activeId = useScrollSpy(['home', 'menu', 'trading', 'reservations', 'contact']);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'menu', label: 'Thực đơn' },
    { id: 'trading', label: 'Khu Giao Dịch' },
    { id: 'reservations', label: 'Đặt bàn' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  return (
    <>
      <header className={`fixed top-0 w-full z-[90] border-b border-outline-variant/20 transition-all duration-500 h-20 ${
        isSticky ? 'shadow-2xl bg-surface/95' : 'bg-surface/70 backdrop-blur-xl'
      }`}>
        <div className="flex justify-between items-center max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full">
          <a className="flex items-center h-full py-2" href="#home" aria-label="LAB Coffee Home">
            <Logo className="h-10 md:h-12 w-[120px] md:w-[144px] transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(255,183,123,0.3)]" />
          </a>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`font-label-caps text-label-caps transition-colors duration-300 ${
                  activeId === link.id
                    ? 'text-secondary border-b border-secondary pb-1'
                    : 'text-on-surface-variant hover:text-secondary'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="text-on-surface hover:text-secondary focus:outline-none transition-colors" 
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-[32px] block">menu</span>
            </button>
          </div>
        </div>
      </header>
 
      {/* Mobile Navigation Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-background/95 backdrop-blur-lg transition-transform duration-300 md:hidden flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isDrawerOpen}
        role="dialog"
      >
        <div className="flex justify-between items-center h-20 px-margin-mobile border-b border-outline-variant/10">
          <span className="flex items-center">
            <Logo className="h-8 w-[96px]" />
          </span>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-on-surface hover:text-secondary focus:outline-none" 
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-[32px] block">close</span>
          </button>
        </div>
        <nav className="flex flex-col items-center justify-center space-y-8 h-[calc(100vh-80px)]">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setIsDrawerOpen(false)}
              className={`font-label-caps text-lg transition-colors ${
                activeId === link.id ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
