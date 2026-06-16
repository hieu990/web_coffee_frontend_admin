import React, { useState, useEffect, useRef } from 'react';
import NetworkCanvas from './NetworkCanvas';
import TradingView from './TradingView';
import CryptoTicker from './CryptoTicker';

export default function TradingLounge() {
  // Live Metrics State
  const [ping, setPing] = useState(12.4);
  const [noise, setNoise] = useState(31.0);
  const [voltage, setVoltage] = useState(220.1);

  // Real-time fluctuation effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Ping: 11.0 to 14.5
      setPing((11.0 + Math.random() * 3.5).toFixed(1));
      // Noise: 30.0 to 33.0
      setNoise((30.0 + Math.random() * 3.0).toFixed(1));
      // Voltage: 220.0 to 220.3
      setVoltage((220.0 + Math.random() * 0.3).toFixed(1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // 3D Tilt Effect Handler
  const handleMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-15deg to 15deg)
    const xPct = x / rect.width - 0.5;
    const yPct = y / rect.height - 0.5;
    
    card.style.transform = `rotateX(${yPct * -15}deg) rotateY(${xPct * 15}deg)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };
  const amenities = [
    {
      id: '01',
      icon: 'router',
      title: 'Hạ Tầng Sợi Quang DMA',
      desc: 'Truy cập thị trường trực tiếp (Direct Market Access) với định tuyến quốc tế ưu tiên. Đảm bảo tốc độ khớp lệnh dưới mili-giây.',
      badge: '10GBPS DEDICATED',
      colSpan: 'md:col-span-7',
      delay: 0
    },
    {
      id: '02',
      icon: 'shield_locked',
      title: 'Bảo Mật Enterprise VPN',
      desc: 'Tường lửa lớp doanh nghiệp & VPN IP tĩnh riêng biệt. Bảo vệ an toàn tuyệt đối cho ví lạnh và chặn đứng mọi nỗ lực DDoS.',
      badge: 'SECURE ENCLAVE',
      colSpan: 'md:col-span-5',
      delay: 100
    },
    {
      id: '03',
      icon: 'weekend',
      title: 'Herman Miller & 4K Ultra-wide',
      desc: 'Hệ ghế công thái học Herman Miller Aeron nâng đỡ đa điểm, đi kèm cụm màn hình cong Ultra-wide chống mỏi mắt chuyên dụng.',
      badge: 'ERGONOMIC LAB',
      colSpan: 'md:col-span-4',
      delay: 200
    },
    {
      id: '04',
      icon: 'electrical_services',
      title: 'UPS & Lọc Nguồn Sine',
      desc: 'Nguồn điện sạch Isolator loại bỏ nhiễu sóng, đi kèm UPS dự phòng đa tầng bảo vệ thiết bị phần cứng đắt tiền của bạn.',
      badge: 'PURE SINE WAVE',
      colSpan: 'md:col-span-4',
      delay: 300
    },
    {
      id: '05',
      icon: 'science',
      title: 'Nootropic Energy Station',
      desc: 'Trạm nạp năng lượng não bộ với Cà phê Nootropics đặc chế, duy trì đỉnh cao tập trung liên tục 12h mà không lo sụt giảm.',
      badge: 'COGNITIVE BOOST',
      colSpan: 'md:col-span-4',
      delay: 400
    }
  ];
  return (
    <section id="trading" className="pt-16 pb-24 bg-[#0c0f0f] relative overflow-hidden">
      {/* Interactive Financial Network Nodes Canvas */}
      <NetworkCanvas />
      
      {/* Ambient Glow Orbs - Cyber theme */}
      <div className="ambient-glow w-96 h-96 bg-green-500/10 -top-20 -right-20" style={{ animationDelay: '-4s', animationDuration: '12s' }}></div>
      <div className="ambient-glow w-80 h-80 bg-red-500/5 bottom-10 left-10" style={{ animationDelay: '-1s', animationDuration: '9s' }}></div>
      
      {/* Section Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-16 relative z-10">
        <span className="font-label-caps text-label-caps text-secondary mb-4 block tracking-[0.25em] uppercase">KHÔNG GIAN LÀM VIỆC CAO CẤP</span>
        <h2 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-on-surface uppercase tracking-wide">TRADING LOUNGE</h2>
        <div className="w-16 h-[2px] bg-secondary mx-auto mt-6"></div>
        <p className="max-w-2xl mx-auto text-on-surface-variant font-body-lg px-4 mt-8">
          Không gian giao dịch tài chính sang trọng kết hợp cùng dịch vụ cà phê Specialty cao cấp. Nơi tối ưu hóa sự tập trung và mang đến những đặc quyền tốt nhất cho mọi nhà đầu tư.
        </p>
      </div>

      {/* Top Crypto Ticker */}
      <div className="mb-16">
        <CryptoTicker />
      </div>

      {/* Market Sentiment & TradingView Widget Container */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-8 mb-24 relative z-10">
        <div className="flex flex-col gap-0 glass-panel border-outline-variant/10 shadow-2xl rounded-sm overflow-hidden">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-low/50 px-6 py-4 border-b border-outline-variant/20 gap-4 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <h2 className="font-headline-md text-[16px] text-on-surface flex items-center gap-2 uppercase tracking-widest">
                <span className="material-symbols-outlined text-secondary text-[18px]">satellite_alt</span>
                Lab Live Terminal
              </h2>
              <div className="h-4 w-px bg-outline-variant/30 hidden sm:block"></div>
              <div className="flex items-center gap-2 text-[11px] font-label-caps tracking-wider text-on-surface-variant">
                <span>Trạng thái mạng:</span>
                <span className="flex items-center gap-1.5 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  TỐT (12ms)
                </span>
              </div>
            </div>

            {/* Mocked Live Sentiment Stats */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-on-surface-variant font-label-caps uppercase tracking-widest">Sợ Hãi & Tham Lam</span>
                <span className="text-[14px] font-bold text-green-400">72 - THAM LAM</span>
              </div>
              <div className="h-6 w-px bg-outline-variant/30"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-on-surface-variant font-label-caps uppercase tracking-widest">Vol 24h Toàn Cầu</span>
                <span className="text-[14px] font-bold text-on-surface">$84.2B</span>
              </div>
              <div className="h-6 w-px bg-outline-variant/30"></div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-surface-container-high rounded-sm font-label-caps text-[10px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> UTC+07</span>
              </div>
            </div>
          </div>
          
          {/* TradingView Component */}
          <TradingView />
        </div>
      </section>

      {/* Terminal Specs Board */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 mb-24 relative z-10 py-12">
        {/* Data Particles Background specifically for this section */}
        <div className="absolute inset-0 data-particles-bg opacity-30 pointer-events-none rounded-sm [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>

        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-10 uppercase tracking-[0.3em] flex items-center gap-4 relative z-10">
          <span className="w-12 h-px bg-on-surface-variant/30"></span>
          LAB SYSTEM DIAGNOSTICS
          <span className="w-12 h-px bg-on-surface-variant/30"></span>
        </h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
          {/* Left Column: Live Metrics Dashboard */}
          <div className="xl:col-span-3 glass-panel p-6 border-outline-variant/10 rounded-sm flex flex-col gap-6 relative overflow-hidden bg-[#0c0f0f]/80 xl:sticky xl:top-32 self-start w-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-[30px] rounded-full pointer-events-none"></div>
            
            <div className="border-b border-outline-variant/20 pb-4">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                ACTIVE MONITORING
              </span>
            </div>

            <div className="space-y-6 flex-1">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wider">BINANCE LATENCY</span>
                  <span className="text-[16px] font-mono font-bold text-green-400 transition-colors duration-200">{ping}ms</span>
                </div>
                <div className="h-[2px] w-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-green-400/50 transition-all duration-500" style={{ width: `${(ping/20)*100}%` }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wider">AMBIENT NOISE</span>
                  <span className="text-[16px] font-mono font-bold text-secondary transition-colors duration-200">{noise} dB</span>
                </div>
                <div className="h-[2px] w-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-secondary/50 transition-all duration-500" style={{ width: `${(noise/50)*100}%` }}></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wider">POWER STABILITY</span>
                  <span className="text-[16px] font-mono font-bold text-green-400 transition-colors duration-200">{voltage}V</span>
                </div>
                <div className="h-[2px] w-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-green-400/50 transition-all duration-500" style={{ width: `${(voltage/230)*100}%` }}></div>
                </div>
              </div>
              
              {/* Metric 4 */}
              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wider">FIREWALL STATUS</span>
                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono uppercase">SECURED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Amenities Grid */}
          <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6">
            {amenities.map((amenity, idx) => (
              <div 
                key={idx}
                className={`${amenity.colSpan} tilt-card-container group`}
                style={{ transitionDelay: `${amenity.delay}ms` }}
              >
                <div
                  className="glass-panel p-8 flex flex-col justify-between tilt-card h-full rounded-sm reveal-on-scroll border border-outline-variant/10 relative overflow-hidden bg-surface-container-lowest/40 hover:bg-surface-container-low/60"
                  style={{ minHeight: amenity.colSpan === 'md:col-span-4' ? '220px' : '260px' }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Quiet Luxury Metallic Sheen on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out_infinite] pointer-events-none"></div>

                  <div className="relative z-10 tilt-card-content">
                    <div className="flex justify-between items-start mb-6">
                      <span className="material-symbols-outlined text-secondary/80 text-[32px] font-light group-hover:text-secondary transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,183,123,0.5)]">{amenity.icon}</span>
                      <span className="font-mono text-[10px] text-on-surface-variant/50 group-hover:text-secondary/50 transition-colors">{amenity.id}</span>
                    </div>
                    
                    <h4 className="font-headline-md text-[17px] mb-3 tracking-wide text-on-surface group-hover:text-white transition-colors">
                      <span className="glitch-hover" data-text={amenity.title}>{amenity.title}</span>
                    </h4>
                    <p className="font-body-sm text-on-surface-variant/70 leading-relaxed group-hover:text-on-surface-variant transition-colors">
                      {amenity.desc}
                    </p>
                  </div>

                  {amenity.badge && (
                    <div className="mt-8 pt-4 border-t border-outline-variant/10 relative z-10 flex justify-between items-center tilt-card-content">
                      <span className="font-mono text-[10px] text-secondary tracking-[0.1em]">{amenity.badge}</span>
                      <span className="material-symbols-outlined text-[14px] text-secondary/30 group-hover:text-secondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">arrow_forward</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-8 mb-24 relative z-10">
        <div className="glass-panel p-12 md:p-20 text-center border-secondary/30 rounded-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,123,0.1)_0%,transparent_60%)] group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <span className="material-symbols-outlined text-secondary text-[48px] mb-6 drop-shadow-[0_0_15px_rgba(255,183,123,0.5)]">vpn_key</span>
            <h2 className="font-display-lg text-[36px] md:text-[56px] mb-6 uppercase tracking-wider text-on-surface font-semibold">Bắt Đầu Giao Dịch</h2>
            <p className="font-body-lg text-[16px] text-on-surface-variant mb-12 max-w-2xl mx-auto leading-relaxed">
              Các trạm giao dịch (Trading Pods) luôn trong tình trạng khan hiếm. Hãy xác nhận vị thế của bạn tại Lab ngay hôm nay để không bỏ lỡ những biến động lớn từ thị trường.
            </p>
            <a href="#reservations" className="relative overflow-hidden inline-flex items-center justify-center gap-3 bg-secondary text-on-secondary px-14 py-5 font-label-caps text-[13px] font-bold shadow-[0_0_30px_rgba(255,183,123,0.3)] hover:shadow-[0_0_50px_rgba(255,183,123,0.6)] hover:-translate-y-1 transition-all rounded-sm uppercase tracking-[0.2em] group/btn">
              <span className="relative z-10">Mở Khóa Trạm Của Bạn</span>
              <span className="material-symbols-outlined text-[18px] relative z-10 group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}
