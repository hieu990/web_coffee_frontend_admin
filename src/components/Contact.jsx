import React, { useState, useEffect } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Liên hệ chung');
  const [message, setMessage] = useState('');

  // Quick Copy Feedback States
  const [copiedField, setCopiedField] = useState('');

  // Simulated Console Terminal Logs for Business routing feedback
  const [logs, setLogs] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Load cached details and check for existing cooldown
  useEffect(() => {
    const cachedName = localStorage.getItem('client-name') || '';
    const cachedPhone = localStorage.getItem('client-phone') || '';
    const cachedEmail = localStorage.getItem('client-email') || '';
    setName(cachedName);
    setPhone(cachedPhone);
    setEmail(cachedEmail);

    const lastSentTime = localStorage.getItem('last-message-sent-time');
    if (lastSentTime) {
      const elapsed = Date.now() - parseInt(lastSentTime);
      const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 1500);
  };

  const handleSubjectSelect = (subj) => {
    setSubject(subj);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setIsSending(true);
    setShowConsole(true);
    setLogs([]);

    // Cache contact details
    localStorage.setItem('client-name', name);
    localStorage.setItem('client-phone', phone);
    localStorage.setItem('client-email', email);

    const logMessages = [
      'INITIATING MESSAGE TRANSMISSION PROTOCOL...',
      'ESTABLISHING CONNECT WITH MAIL SERVER GATEWAY...',
      'ROUTING REQUEST TO CORRESPONDING DEPARTMENT...',
      `FORWARDING INQUIRY PACKET TO: [BD_desk@obsidianbrew.com]...`,
      'SENDING CONFIRMATION COPY TO CLIENT INBOX... SUCCESS',
      'MESSAGE ROUTED SUCCESSFULLY. STATUS: DISPATCHED',
      'LAB COFFEE MANAGEMENT HAS BEEN NOTIFIED.'
    ];

    let currentLogIndex = 0;
    const addLog = () => {
      if (currentLogIndex < logMessages.length) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [...prev, `[${time}] ${logMessages[currentLogIndex]}`]);
        currentLogIndex++;
        setTimeout(addLog, 500);
      } else {
        setIsSending(false);
        setMessage('');

        // Activate 60s cooldown to prevent spamming
        const now = Date.now();
        localStorage.setItem('last-message-sent-time', now.toString());
        setCooldown(60);
      }
    };

    addLog();
  };

  return (
    <section id="contact" className="py-32 bg-glow-dark border-t border-outline-variant/10 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>

      {/* Ambient Glow Orbs */}
      <div className="ambient-glow w-[500px] h-[500px] bg-secondary/5 -bottom-40 -right-40" style={{ animationDelay: '-3s', animationDuration: '14s' }}></div>
      <div className="ambient-glow w-[400px] h-[400px] bg-sky-500/2 top-20 -left-20" style={{ animationDelay: '-8s', animationDuration: '18s' }}></div>

      {/* Section Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-20 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="h-[1px] w-6 bg-secondary/30"></span>
          <span className="font-mono text-xs text-secondary tracking-[0.35em] uppercase">
            LIÊN HỆ &amp; HỢP TÁC // PARTNERSHIPS
          </span>
          <span className="h-[1px] w-6 bg-secondary/30"></span>
        </div>
        <h2 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-transparent bg-clip-text bg-gradient-to-r from-secondary via-on-surface to-secondary uppercase tracking-widest font-extrabold">
          THÔNG TIN LIÊN HỆ
        </h2>
        <p className="max-w-2xl mx-auto text-sm text-on-surface-variant mt-4 font-body-sm leading-relaxed">
          Gặp gỡ đội ngũ quản lý của LAB COFFEE hoặc liên hệ hợp tác cung ứng bán buôn hạt cà phê và nhượng quyền thương hiệu đại lý.
        </p>
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent mx-auto mt-6"></div>
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 space-y-12">
        
        {/* Row 1: Horizontal Contact Details Grid (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Box 1: Address & GPS */}
          <div className="glass-panel p-6 rounded-sm border border-outline-variant/10 relative">
            <span className="font-mono text-[9px] text-secondary tracking-widest block uppercase mb-3 font-bold">ĐỊA CHỈ TRỤ SỞ // ADDRESS</span>
            <p className="font-mono text-xs text-on-surface font-semibold">128 Hẻm Thợ Rèn, Quận 1</p>
            <p className="font-mono text-[10.5px] text-on-surface-variant mt-1.5 leading-relaxed">TP. Hồ Chí Minh, Việt Nam</p>
            <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between font-mono text-[9px] text-on-surface-variant">
              <span>GPS: 10.7769° N, 106.6975° E</span>
              <button 
                type="button" 
                onClick={() => handleCopy('10.7769, 106.6975', 'gps')}
                className="text-secondary hover:underline tracking-wider uppercase cursor-pointer"
              >
                {copiedField === 'gps' ? '[ COPIED ]' : '[ SAO CHÉP ]'}
              </button>
            </div>
          </div>

          {/* Box 2: Connection / Opening Hours */}
          <div className="glass-panel p-6 rounded-sm border border-outline-variant/10">
            <span className="font-mono text-[9px] text-secondary tracking-widest block uppercase mb-3 font-bold">GIỜ MỞ CỬA // HOURS</span>
            <div className="space-y-2 font-mono text-[11px] text-on-surface-variant">
              <div className="flex justify-between">
                <span>Thứ 2 — Thứ 6:</span>
                <span className="text-on-surface font-bold">07:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span>Thứ 7 — Chủ Nhật:</span>
                <span className="text-on-surface font-bold">08:00 - 00:00</span>
              </div>
              <div className="flex justify-between text-[9px] border-t border-outline-variant/10 pt-2.5 text-emerald-400">
                <span>PHỤC VỤ SỰ KIỆN:</span>
                <span className="font-bold">HỖ TRỢ 24/7</span>
              </div>
            </div>
          </div>

          {/* Box 3: Channels / Email & Phone */}
          <div className="glass-panel p-6 rounded-sm border border-outline-variant/10">
            <span className="font-mono text-[9px] text-secondary tracking-widest block uppercase mb-3 font-bold">ĐƯỜNG DÂY LIÊN HỆ // CHANNELS</span>
            <p className="font-mono text-xs text-on-surface font-semibold">hello@obsidianbrew.com</p>
            <p className="font-mono text-[10.5px] text-on-surface-variant mt-1">+84 (0) 90 234 5678</p>
            <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between font-mono text-[9.5px] text-on-surface-variant">
              <span>Đại diện BD Desk</span>
              <button 
                type="button" 
                onClick={() => handleCopy('hello@obsidianbrew.com', 'email')}
                className="text-secondary hover:underline tracking-wider uppercase cursor-pointer"
              >
                {copiedField === 'email' ? '[ COPIED ]' : '[ SAO CHÉP ]'}
              </button>
            </div>
          </div>

          {/* Box 4: Networks & Professional Socials */}
          <div className="glass-panel p-6 rounded-sm border border-outline-variant/10">
            <span className="font-mono text-[9px] text-secondary tracking-widest block uppercase mb-3 font-bold">MẠNG XÃ HỘI // SOCIAL NETWORKS</span>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-on-surface-variant hover:text-secondary flex items-center gap-1.5 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                LINKEDIN
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-on-surface-variant hover:text-secondary flex items-center gap-1.5 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                X (TWITTER)
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-on-surface-variant hover:text-secondary flex items-center gap-1.5 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                FACEBOOK
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-on-surface-variant hover:text-secondary flex items-center gap-1.5 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                INSTAGRAM
              </a>
            </div>
          </div>

        </div>

        {/* Row 2: Form & Map Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 md:p-10 rounded-sm border border-outline-variant/15 relative">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">HỌ VÀ TÊN *</label>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                      className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                      placeholder="NGUYỄN VĂN A" 
                      type="text"
                    />
                  </div>
                  
                  <div className="space-y-2.5">
                    <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">SỐ ĐIỆN THOẠI *</label>
                    <input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required 
                      className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                      placeholder="090 123 4567" 
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">ĐỊA CHỈ EMAIL *</label>
                  <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                    placeholder="partner@domain.com" 
                    type="email"
                  />
                </div>

                {/* Subject Selector (Quick Chips) */}
                <div className="space-y-3">
                  <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">TIÊU ĐỀ HỢP TÁC</label>
                  <div className="flex flex-wrap gap-2.5">
                    {['Liên hệ chung', 'Đăng ký Trading Lounge', 'Đặt sự kiện / Phòng họp VIP', 'Hợp tác bán buôn / nhượng quyền'].map((subj) => {
                      const isSelected = subject === subj;
                      return (
                        <button
                          type="button"
                          key={subj}
                          onClick={() => handleSubjectSelect(subj)}
                          className={`py-2 px-4 font-mono text-[10px] tracking-wider border rounded-sm transition-all ${
                            isSelected 
                              ? 'border-secondary bg-secondary/15 text-secondary shadow-md' 
                              : 'border-outline-variant/20 bg-surface-container-low/30 text-on-surface-variant hover:border-secondary/30'
                          }`}
                        >
                          {subj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">TIN NHẮN / YÊU CẦU CHI TIẾT</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required 
                    className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm resize-none" 
                    placeholder="Vui lòng để lại tin nhắn chi tiết về nhu cầu hợp tác của bạn..." 
                    rows="3"
                  />
                </div>

                <button 
                  disabled={isSending || cooldown > 0}
                  className="w-full py-4.5 font-mono text-[12px] tracking-widest bg-secondary text-on-secondary hover:brightness-110 transition-all active:scale-[0.99] rounded-sm font-bold uppercase relative overflow-hidden group shadow-lg shadow-secondary/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100" 
                  type="submit"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                  {cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : 'GỬI TIN NHẮN LIÊN HỆ'}
                </button>
              </form>

              {/* Simulated Console System Logger for Business feedback */}
              {showConsole && (
                <div className="mt-8 border border-outline-variant/20 bg-[#060808] p-5 font-mono text-[10.5px] rounded-sm relative z-10 shadow-inner animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2 mb-3">
                    <span className="text-secondary tracking-widest font-bold text-[8.5px] uppercase">
                      MESSAGE TRANSMISSION PIPELINE LOGS
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  
                  <div className="space-y-1.5 text-neutral-400 font-mono">
                    {logs.map((log, index) => {
                      let textColor = 'text-neutral-400';
                      if (log.includes('SUCCESS') || log.includes('NOTIFIED')) textColor = 'text-emerald-400';
                      if (log.includes('INITIATING') || log.includes('ESTABLISHING')) textColor = 'text-secondary';
                      return (
                        <div key={index} className={`${textColor} leading-relaxed`}>
                          {log}
                        </div>
                      );
                    })}
                    {isSending && (
                      <div className="text-secondary flex items-center gap-1.5 animate-pulse">
                        <span>[ SYSTEM RUNNING ] Forwarding request...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Google Maps Dark Mode */}
          <aside className="lg:col-span-5 h-[400px] lg:h-auto min-h-[500px] lg:min-h-[550px] relative z-10 self-stretch">
            <div className="w-full h-full rounded bg-[#090b0b] border border-outline-variant/15 overflow-hidden shadow-2xl relative min-h-[500px] lg:min-h-[550px]">
              
              {/* Maps Frame */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4853037233215!2d106.6974868!3d10.7769165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919.4853037233215%3A0x0!2zMTDCsDQ2JzM2LjkiTiAxMDbCsDQxJzUwLjkiRQ!5e0!3m2!1svi!2svn!4v1717891200000!5m2!1svi!2svn" 
                className="w-full h-full border-0 dark-mode-map-iframe absolute inset-0" 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="LAB Coffee Google Map"
              />

              {/* Glowing Tactical Radar HUD overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="w-5 h-5 bg-secondary rounded-full border border-surface-container-lowest shadow-[0_0_20px_#ffb77b] z-20"></div>
                <div className="radar-pulse-ring w-16 h-16"></div>
                <div className="radar-pulse-ring w-32 h-32" style={{ animationDelay: '1s' }}></div>
                <div className="radar-pulse-ring w-48 h-48" style={{ animationDelay: '2s' }}></div>
              </div>

              {/* Cyber labels on top corners */}
              <div className="absolute top-4 left-4 bg-surface-container-lowest/80 border border-outline-variant/15 px-2.5 py-1 rounded text-[8px] font-mono text-secondary tracking-widest uppercase pointer-events-none z-20">
                SECURE RADAR PINPOINT
              </div>
              <div className="absolute top-4 right-4 bg-surface-container-lowest/80 border border-outline-variant/15 px-2.5 py-1 rounded text-[8px] font-mono text-on-surface-variant tracking-widest uppercase pointer-events-none z-20">
                GRID_REF: SGN_01
              </div>

              {/* Glass panel Navigation Details Overlay at the bottom */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="glass-panel p-5 flex justify-between items-center rounded-sm">
                  <div>
                    <p className="font-mono text-[9px] text-secondary tracking-widest uppercase mb-1">GHÉ THĂM CHÚNG TÔI // NAVIGATION</p>
                    <p className="font-mono text-[10.5px] text-on-surface uppercase tracking-wider">Lấy chỉ đường qua Bản đồ</p>
                  </div>
                  <a 
                    className="w-10 h-10 rounded-full border border-secondary/40 hover:border-secondary flex items-center justify-center text-secondary hover:bg-secondary hover:text-on-secondary transition-all shadow-md" 
                    href="https://maps.google.com/?q=10.7769165,106.6974868"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="material-symbols-outlined text-[18px]">near_me</span>
                  </a>
                </div>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </section>
  );
}
