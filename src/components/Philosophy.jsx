import React from 'react';

export default function Philosophy() {
  return (
    <>
      {/* Investment Corner (Bento Grid) */}
      <section className="py-24 bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <span className="font-label-caps text-label-caps text-secondary uppercase mb-4 block">Trading Lounge</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Góc Đầu Tư</h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              Không gian riêng tư được thiết kế cho các nhà đầu tư chuyên nghiệp, tích hợp bảng giá thời gian thực và không gian thảo luận bảo mật.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Large Feature */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-high/50 backdrop-blur-xl p-6 md:p-10 h-[380px] md:h-[500px] border border-outline-variant/10 flex flex-col justify-end shadow-lg">
              <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-75 transition-all duration-700 group-hover:scale-105">
                <img 
                  loading="lazy" 
                  alt="Góc làm việc cá nhân được trang bị hệ thống màn hình theo dõi số liệu tài chính chuyên sâu" 
                  className="w-full h-full object-cover" 
                  src="/images/philosophy_trading.png"
                />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                  <span className="font-label-caps text-label-caps text-secondary">DỮ LIỆU THỜI GIAN THỰC</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Bảng Giá Độc Quyền</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-6">
                  Kết nối trực tiếp với thị trường toàn cầu thông qua hệ thống hiển thị dữ liệu chuyên sâu ngay tại chỗ ngồi của bạn.
                </p>
                <a className="inline-flex items-center gap-2 font-label-caps text-label-caps text-secondary border-b border-secondary/20 pb-1 group-hover:border-secondary transition-all" href="#trading">
                  CHI TIẾT TRADING LOUNGE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
            {/* Small Sidebar Cards */}
            <div className="md:col-span-4 flex flex-col gap-gutter">
              <div className="flex-1 glass-panel p-6 md:p-8 flex flex-col justify-center border border-outline-variant/10 rounded-xl hover:scale-[1.02] transition-all duration-300">
                <span className="material-symbols-outlined text-secondary mb-4">lock</span>
                <h4 className="font-label-caps text-label-caps text-on-surface mb-2">BẢO MẬT &amp; RIÊNG TƯ</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Phòng VIP dành cho các cuộc đàm phán quan trọng với hệ thống cách âm cao cấp.
                </p>
              </div>
              <div className="flex-1 glass-panel p-6 md:p-8 flex flex-col justify-center border border-outline-variant/10 rounded-xl hover:scale-[1.02] transition-all duration-300">
                <span className="material-symbols-outlined text-secondary mb-4">hub</span>
                <h4 className="font-label-caps text-label-caps text-on-surface mb-2">MẠNG LƯỚI KẾT NỐI</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Nơi hội tụ của những tâm hồn cùng tần số trong lĩnh vực đầu tư và khởi nghiệp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atmosphere Overview */}
      <section className="py-24 bg-surface-container-lowest overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            {/* Image and Overlapping Glass Card */}
            <div className="relative group">
              <div className="aspect-[4/5] overflow-hidden rounded-xl relative border border-outline-variant/10 shadow-2xl">
                <img 
                  loading="lazy" 
                  alt="Barista đang tỉ mỉ thực hiện quá trình chiết xuất cà phê thủ công tại quầy bar" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src="/images/philosophy_coffee.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none"></div>
              </div>
              {/* Overlapping Glass Card with Mobile-safe alignment */}
              <div className="absolute -bottom-6 right-4 md:-right-6 glass-panel p-4 md:p-6 max-w-[240px] sm:max-w-[280px] reveal-on-scroll shadow-2xl border border-secondary/20" style={{ transitionDelay: '100ms' }}>
                <h5 className="font-headline-md text-[20px] text-secondary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Hương Vị Đặc Trưng
                </h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Mỗi hạt cà phê được tuyển chọn từ những vùng nguyên liệu độc bản, rang xay theo tiêu chuẩn Lab chuyên biệt.
                </p>
              </div>
            </div>
 
            {/* Philosophy details */}
            <div className="space-y-10">
              {/* Sub-heading with accent line */}
              <div className="flex items-center gap-3 reveal-on-scroll">
                <span className="w-8 h-[1px] bg-secondary"></span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.25em] text-[11px] block">Triết Lý Của Chúng Tôi</span>
              </div>
              
              <h2 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-on-surface leading-tight reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
                Khi Sự Im Lặng <br/>Lên Tiếng Thay Cho Đẳng Cấp
              </h2>
              
              <div className="w-12 h-[2px] bg-secondary/30 reveal-on-scroll" style={{ transitionDelay: '150ms' }}></div>
              
              {/* Staggered items list */}
              <div className="space-y-8">
                {/* Item 1 */}
                <div className="flex gap-6 reveal-on-scroll" style={{ transitionDelay: '150ms' }}>
                  <div className="flex flex-col items-center min-w-[32px]">
                    <span className="text-secondary font-display-lg opacity-35 leading-none text-2xl mb-1">01</span>
                    <span className="material-symbols-outlined text-secondary/70 text-[20px]">architecture</span>
                  </div>
                  <div>
                    <h4 className="font-label-caps text-label-caps text-on-surface mb-2 tracking-wider">THIẾT KẾ ĐỘC BẢN</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Không gian lấy cảm hứng từ kiến trúc công nghiệp cải tạo, kết hợp giữa sự thô mộc của gạch trần và sự sang trọng của chất liệu đồng.
                    </p>
                  </div>
                </div>
                
                {/* Item 2 */}
                <div className="flex gap-6 reveal-on-scroll" style={{ transitionDelay: '250ms' }}>
                  <div className="flex flex-col items-center min-w-[32px]">
                    <span className="text-secondary font-display-lg opacity-35 leading-none text-2xl mb-1">02</span>
                    <span className="material-symbols-outlined text-secondary/70 text-[20px]">room_service</span>
                  </div>
                  <div>
                    <h4 className="font-label-caps text-label-caps text-on-surface mb-2 tracking-wider">DỊCH VỤ TINH TẾ</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Đội ngũ Barista được đào tạo không chỉ về kỹ thuật pha chế mà còn am hiểu về văn hóa thưởng thức và nghi thức tiếp khách cao cấp.
                    </p>
                  </div>
                </div>
 
                {/* Item 3 */}
                <div className="flex gap-6 reveal-on-scroll" style={{ transitionDelay: '300ms' }}>
                  <div className="flex flex-col items-center min-w-[32px]">
                    <span className="text-secondary font-display-lg opacity-35 leading-none text-2xl mb-1">03</span>
                    <span className="material-symbols-outlined text-secondary/70 text-[20px]">security</span>
                  </div>
                  <div>
                    <h4 className="font-label-caps text-label-caps text-on-surface mb-2 tracking-wider">KHÔNG GIAN BẢO MẬT</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Thiết kế cách âm tối ưu cùng hạ tầng truyền dẫn mã hóa, đem lại môi trường an tâm tuyệt đối cho các giao dịch và đàm phán quan trọng.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4 reveal-on-scroll" style={{ transitionDelay: '600ms' }}>
                <a href="#reservations" className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase rounded-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-secondary/10 text-[12px]">
                  Trải nghiệm không gian <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
