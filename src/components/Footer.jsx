/**
 * Copyright (c) 2026 JaThong. All rights reserved.
 *
 * Developed by:
 * - Thông Trần
 * - Hiếu Đỗ
 */
import React from 'react';


export default function Footer() {
  return (
    <footer className="w-full pt-24 pb-8 bg-surface-container-lowest border-t border-outline-variant/10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="col-span-1 md:col-span-6 space-y-6">
          <span className="font-display-lg text-[22px] md:text-headline-md text-secondary block uppercase tracking-wider">
            LAB COFFEE &amp; Trading Lounge
          </span>
          <p className="text-on-surface-variant max-w-md font-body-sm leading-relaxed">
            Sự giao thoa hoàn hảo giữa nghệ thuật pha chế truyền thống và hạ tầng công nghệ số thế hệ mới. Sự tĩnh lặng là món hàng xa xỉ nhất của chúng tôi.
          </p>
          <div className="pt-4 border-t border-outline-variant/10 text-[10.5px] font-mono text-on-surface-variant/65 space-y-1.5 leading-relaxed">
            <p>Mã số thuế: 0317890210 - CÔNG TY TNHH PHÒNG THÍ NGHIỆM ĐỔI MỚI OBSIDIAN</p>
            <p>Đăng ký lần đầu ngày 12/03/2023 tại Sở Kế hoạch &amp; Đầu tư TP. Hồ Chí Minh</p>
            <p>Địa chỉ đăng ký: 128 Hẻm Thợ Rèn, Quận 1, TP. Hồ Chí Minh, Việt Nam</p>
          </div>
        </div>
        
        {/* Column 2: Quick Links */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <span className="font-mono text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Liên kết nhanh</span>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#home">Trang chủ</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#menu">Thực đơn</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#trading">Khu Giao Dịch</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#reservations">Đặt bàn</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#contact">Liên hệ</a>
        </div>

        {/* Column 3: Policies */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <span className="font-mono text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Chính sách &amp; Quy chế</span>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#">Chính sách bảo mật</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#">Điều khoản sử dụng</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#">Quy chế hoạt động</a>
          <a className="font-body-sm text-[12px] text-on-surface-variant hover:text-secondary underline decoration-secondary/10 hover:decoration-secondary/30 transition-all" href="#">Bảo mật ví Web3</a>
        </div>

        {/* Column 4: Connection */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          <span className="font-mono text-[10px] text-on-surface mb-2 tracking-widest uppercase font-bold">Kênh kết nối</span>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary transition-colors" title="Developer Docs">terminal</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary transition-colors" title="Secure Share">share</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-secondary transition-colors" title="Global Node">public</span>
          </div>
          <p className="font-mono text-on-surface-variant mt-4 uppercase tracking-widest text-[9.5px]">SAIGON // NODE_01</p>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-16 pt-8 border-t border-outline-variant/10 text-center space-y-2">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Copyright (c) 2026 Hiếu Đỗ, Thông Trần, JaThong. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
