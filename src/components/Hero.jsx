import React, { useRef, useEffect } from 'react';

export default function Hero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 40;

    // Initialize rising amber particles (resembling micro heat steam / quantum dust)
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height + height, // start below or randomly
        speed: 0.2 + Math.random() * 0.4,
        radius: 0.6 + Math.random() * 1.8,
        opacity: 0.15 + Math.random() * 0.35,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.005 + Math.random() * 0.015
      });
    }

    let mouse = { x: -999, y: -999 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speed;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.12;

        // Subtle mouse push effect
        if (mouse.x > 0 && mouse.y > 0) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const force = (130 - dist) / 130;
            p.x += (dx / dist) * force * 1.6;
            p.y += (dy / dist) * force * 1.6;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 183, 123, ${p.opacity})`;
        ctx.shadowColor = '#ffb77b';
        ctx.shadowBlur = p.radius > 1.2 ? 3 : 0;
        ctx.fill();

        // Recycle particle
        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* Background Media & Effects */}
      <div className="absolute inset-0 z-0">
        <img 
          loading="eager" 
          alt="Không gian thiết kế sang trọng mang phong cách công nghiệp hiện đại tại LAB COFFEE" 
          className="w-full h-full object-cover opacity-60" 
          src="/hero-bg.jpg"
        />
        <div className="absolute inset-0 hero-gradient"></div>

        {/* Ambient Steam Particles Overlay Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-[2]" 
        />

        {/* Ambient Glow Orbs */}
        <div className="ambient-glow w-96 h-96 bg-[#ffb77b]/5 -top-20 -left-20"></div>
        <div className="ambient-glow w-80 h-80 bg-[#ffb77b]/3 -bottom-10 -right-10" style={{ animationDelay: '-2s', animationDuration: '10s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <div className="inline-flex items-center gap-2 bg-[#ffb77b]/10 border border-[#ffb77b]/20 px-4 py-2 rounded-full mb-6 font-label-caps text-[11px] text-[#ffb77b] uppercase tracking-wider reveal-on-scroll">
          ☕ LAB COFFEE &amp; Trading Lounge
        </div>
        <div className="font-label-caps text-label-caps text-[#ffb77b]/80 mb-6 tracking-[0.3em] uppercase block reveal-on-scroll">
          Cà Phê Thượng Hạng &amp; Bản Lĩnh Tài Chính
        </div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-8 max-w-4xl mx-auto reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
          Cà Phê Đậm Vị, Đầu Tư Sắc Bén
        </h1>
        <p className="font-body-lg text-body-lg text-[#c4c7c7] max-w-2xl mx-auto mb-6 reveal-on-scroll" style={{ transitionDelay: '400ms' }}>
          Trải nghiệm không gian cà phê chuyên biệt kết hợp cùng khu vực đàm thoại tài chính, nơi mỗi ly cà phê là một nguồn cảm hứng cho những quyết định chiến lược.
        </p>
        <div className="inline-flex items-center gap-2 bg-[#121616]/60 border border-[#ffb77b]/10 px-4 py-2 rounded-full mb-8 text-[13px] text-[#c4c7c7] reveal-on-scroll animate-pulse" style={{ transitionDelay: '300ms' }}>
          <span className="material-symbols-outlined text-[#ffb77b] text-[16px]">location_on</span>
          <span>128 Hẻm Thợ Rèn, Quận 1, TP. Hồ Chí Minh</span>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 reveal-on-scroll" style={{ transitionDelay: '350ms' }}>
          <a href="#reservations" className="w-full md:w-auto px-10 py-5 bg-[#ffb77b] hover:bg-[#ffa659] text-[#2e1500] font-mono font-bold text-xs uppercase tracking-wider rounded-sm hover:shadow-[0_0_20px_rgba(255,183,123,0.4)] hover:-translate-y-0.5 transition-all inline-block text-center">
            Đặt bàn ngay
          </a>
          <a href="#menu" className="w-full md:w-auto px-10 py-5 border border-[#ffb77b]/30 hover:border-[#ffb77b] text-white font-mono text-xs uppercase tracking-wider rounded-sm hover:bg-[#ffb77b]/10 transition-all inline-block text-center">
            Khám phá Menu
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <span className="font-label-caps text-[10px] uppercase tracking-widest text-[#c4c7c7]">Cuộn xuống</span>
        <div className="w-6 h-10 border-2 border-[#ffb77b]/30 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-3 bg-[#ffb77b] rounded-full animate-scroll-dot"></div>
        </div>
      </div>
    </section>
  );
}
