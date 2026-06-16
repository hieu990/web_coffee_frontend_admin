import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';
import ReceiptModal from './ReceiptModal';

// Station specs configurations
const STATION_SPECS = {
  'Standard Table': {
    name: 'Bàn Cà Phê Tiêu Chuẩn (Standard Table)',
    price: 0,
    icon: 'local_cafe',
    desc: 'Không gian chung thoáng đãng, yên tĩnh vừa đủ. Thích hợp cho làm việc cá nhân hoặc gặp gỡ đối tác thân thiết.',
    hardware: [
      'Nguồn điện ổ cắm độc lập tại mỗi bàn',
      'Đường truyền Wi-Fi 6 tốc độ cao (Băng tần 5GHz)',
      'Nước uống tinh khiết tiếp đón miễn phí',
      'Ghế ngồi bọc da êm ái, hỗ trợ cột sống nhẹ'
    ]
  },
  'Trading Station': {
    name: 'Trạm Giao Dịch Chuyên Dụng (Trading Dedicated Station)',
    price: 50000,
    icon: 'monitoring',
    desc: 'Thiết kế tối ưu cho các phiên giao dịch căng thẳng. Đáp ứng tốc độ đường truyền và hiển thị thông tin tối đa.',
    hardware: [
      'Màn hình chuyên dụng ASUS ROG OLED 32" 4K (Tần số quét 240Hz)',
      'Cáp mạng LAN vật lý Cat-8 kết nối trực tiếp router DMA (Ping < 2ms)',
      'Ghế ngồi công thái học cao cấp Herman Miller Aeron',
      'Hệ thống nguồn điện dự phòng UPS tránh sập nguồn lệnh',
      'Bàn phím cơ Custom và chuột Silent tiện dụng'
    ]
  },
  'VIP Boardroom': {
    name: 'Phòng Cách Âm Bảo Mật VIP (VIP Soundproof Vault)',
    price: 200000,
    icon: 'lock',
    desc: 'Không gian họp kín và đàm phán hoàn toàn cô lập về mặt âm thanh và tín hiệu mạng. Thích hợp cho thương thảo OTC lớn.',
    hardware: [
      'Không gian cách âm kép vật lý tuyệt đối (Air-gapped room)',
      'Đường dây cáp quang DMA (Direct Market Access) độc lập hai luồng',
      'Màn hình trình chiếu 85" 4K HDR họp hội đồng',
      'Hệ thống lọc và điều hòa không khí vô trùng chuyên sâu',
      'Mini-bar phục vụ nước ép, cold brew cao cấp miễn phí',
      'Trợ lý bảo mật hỗ trợ setup kỹ thuật riêng'
    ]
  }
};

// Cybernetic Corner brackets overlay for premium card styling
const CardCorners = ({ colorClass }) => (
  <div className="absolute inset-0 pointer-events-none z-20">
    {/* Top Left Corner */}
    <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 ${colorClass} opacity-40 group-hover:opacity-100 transition-all duration-300`}></div>
    {/* Top Right Corner */}
    <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 ${colorClass} opacity-40 group-hover:opacity-100 transition-all duration-300`}></div>
    {/* Bottom Left Corner */}
    <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 ${colorClass} opacity-40 group-hover:opacity-100 transition-all duration-300`}></div>
    {/* Bottom Right Corner */}
    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 ${colorClass} opacity-40 group-hover:opacity-100 transition-all duration-300`}></div>
  </div>
);

export default function BookingForm() {
  const [selectedSeat, setSelectedSeat] = useState('Bàn 04');
  const [stationType, setStationType] = useState('Standard Table');
  
  // Custom Timeline Date list (5 days)
  const [dateList, setDateList] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  
  // Custom Time slot list
  const timeSlots = [
    { time: '08:00 AM', status: 'available' },
    { time: '10:00 AM', status: 'available' },
    { time: '12:00 PM', status: 'occupied' },
    { time: '02:00 PM', status: 'available' },
    { time: '04:00 PM', status: 'available' },
    { time: '06:00 PM', status: 'occupied' },
    { time: '08:00 PM', status: 'available' }
  ];
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  
  const [duration, setDuration] = useState(2);
  const [guests, setGuests] = useState('1 Người');
  
  // Client details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  
  // Web3 state
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [payWithCrypto, setPayWithCrypto] = useState(false);
  
  // Privacy mode
  const [anonymousMode, setAnonymousMode] = useState(false);
  
  // Form errors
  const [errors, setErrors] = useState({ name: '', phone: '', email: '', telegram: '' });

  // Receipt Modal control
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Generate tomorrow + 5 days list on mount
  useEffect(() => {
    const dates = [];
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    for (let i = 1; i <= 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = weekdays[d.getDay()];
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const fullDateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      dates.push({ label: `${dayName}, ${dateStr}`, rawDate: fullDateStr });
    }
    setDateList(dates);

    // Retrieve cached user data from localStorage
    const cachedName = localStorage.getItem('client-name') || '';
    const cachedPhone = localStorage.getItem('client-phone') || '';
    const cachedEmail = localStorage.getItem('client-email') || '';
    const cachedTelegram = localStorage.getItem('client-telegram') || '';
    const cachedAnon = localStorage.getItem('client-anon') === 'true';
    
    setClientName(cachedName);
    setClientPhone(cachedPhone);
    setClientEmail(cachedEmail);
    setTelegramHandle(cachedTelegram);
    setAnonymousMode(cachedAnon);
  }, []);

  // Simulated Connect Wallet Function
  const handleConnectWallet = () => {
    if (walletConnected) {
      // Disconnect
      setWalletConnected(false);
      setWalletAddress('');
      setPayWithCrypto(false);
      return;
    }

    setWalletConnecting(true);
    setTimeout(() => {
      setWalletConnecting(false);
      setWalletConnected(true);
      const mockAddr = '0x8f2d' + Math.random().toString(16).substring(2, 8) + '...' + 'e3f' + Math.floor(100 + Math.random() * 900);
      setWalletAddress(mockAddr);
      setPayWithCrypto(true);
      setAnonymousMode(true); // Web3 connection automatically facilitates privacy/anonymous mode

      // Auto-fill ENS mock
      setClientName('whale.eth');
    }, 1200);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', phone: '', email: '', telegram: '' };

    if (!anonymousMode) {
      if (!clientName.trim()) {
        newErrors.name = 'Vui lòng nhập Họ và tên.';
        isValid = false;
      }
      
      const phoneClean = clientPhone.replace(/[\s.-]+/g, '');
      const phoneRegex = /^[0-9]{9,11}$/;
      if (!clientPhone.trim()) {
        newErrors.phone = 'Vui lòng nhập Số điện thoại.';
        isValid = false;
      } else if (!phoneRegex.test(phoneClean)) {
        newErrors.phone = 'Số điện thoại không hợp lệ (cần 9 - 11 chữ số).';
        isValid = false;
      }
    } else {
      if (!telegramHandle.trim()) {
        newErrors.telegram = 'Chế độ ẩn danh yêu cầu Telegram Handle để liên lạc bảo mật.';
        isValid = false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (clientEmail.trim() && !emailRegex.test(clientEmail)) {
      newErrors.email = 'Email không đúng định dạng.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Cache user data
    if (!anonymousMode) {
      localStorage.setItem('client-name', clientName);
      localStorage.setItem('client-phone', clientPhone);
    }
    localStorage.setItem('client-email', clientEmail);
    localStorage.setItem('client-telegram', telegramHandle);
    localStorage.setItem('client-anon', anonymousMode ? 'true' : 'false');

    // Calculations
    const currentSpecs = STATION_SPECS[stationType];
    const costPerHour = currentSpecs.price;
    const totalVND = costPerHour * duration;
    
    // Mock Crypto Conversion
    const totalUSDT = (totalVND / 25000).toFixed(2);
    const gasFee = payWithCrypto ? '0.0003 ETH' : '0';

    let costDisplay = 'Miễn phí';
    let costCryptoDisplay = '';
    if (stationType !== 'Standard Table') {
      costDisplay = totalVND.toLocaleString('vi-VN') + 'đ';
      costCryptoDisplay = `${totalUSDT} USDT`;
    }

    const formattedDate = dateList[selectedDateIndex]?.label || '';

    const payload = {
      name: anonymousMode ? (walletConnected ? 'whale.eth' : '@' + telegramHandle.replace('@', '')) : clientName,
      phone: anonymousMode ? '' : clientPhone,
      email: clientEmail,
      telegram: telegramHandle,
      seat: selectedSeat,
      stationType: stationType,
      date: formattedDate,
      time: selectedTime,
      duration: duration,
      guests: guests,
      payMethod: payWithCrypto ? 'crypto' : 'counter',
      specialRequest: specialRequest,
      anonMode: anonymousMode,
      totalVND: totalVND
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/add_reservation.php`, payload);
      if (response.data && response.data.success) {
        setReceiptData({
          name: payload.name,
          station: `${STATION_SPECS[stationType].name} (Vị trí: ${selectedSeat})`,
          time: `${selectedTime} (${duration} Giờ)`,
          date: formattedDate,
          cost: costDisplay,
          cryptoCost: costCryptoDisplay,
          payMethod: payWithCrypto ? `Ví Web3 (${walletAddress.substring(0, 8)})` : 'Thanh toán tại quầy',
          gasFee: payWithCrypto ? gasFee : undefined,
          anonMode: anonymousMode,
          walletAddr: walletAddress
        });
        setIsReceiptOpen(true);
      } else {
        alert(response.data?.message || 'Có lỗi xảy ra khi lưu đặt chỗ.');
      }
    } catch (err) {
      console.error('Submit reservation failed:', err);
      alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Apache & PHP.');
    }
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    
    // Reset Form Fields (keep client contact details cached)
    setSpecialRequest('');
    setSelectedSeat('Bàn 04');
    setStationType('Standard Table');
    setGuests('1 Người');
    setDuration(2);
    setSelectedTime('02:00 PM');
    setSelectedDateIndex(0);
  };

  const currentSpecs = STATION_SPECS[stationType];
  const isDurationDisabled = stationType === 'Standard Table';
  const totalVND = currentSpecs.price * duration;
  const totalUSDT = (totalVND / 25000).toFixed(2);

  return (
    <section id="reservations" className="py-28 bg-glow-bronze relative overflow-hidden">
      {/* Background grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>

      {/* Ambient Glow Orbs */}
      <div className="ambient-glow w-[500px] h-[500px] bg-secondary/5 -top-40 -left-40" style={{ animationDelay: '-4s', animationDuration: '13s' }}></div>
      <div className="ambient-glow w-[400px] h-[400px] bg-amber-500/3 bottom-10 -right-20" style={{ animationDelay: '-8s', animationDuration: '17s' }}></div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="font-mono text-xs text-secondary mb-4 block tracking-[0.35em] uppercase">
            TRẠM ĐIỀU HÀNH ĐẶT CHỖ // EXECUTIVE RESERVATIONS
          </span>
          <h2 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-on-surface uppercase tracking-widest font-extrabold">
            ĐẶT BÀN TRỰC TUYẾN
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-on-surface-variant mt-4 font-body-sm leading-relaxed">
            Giữ chỗ trực tuyến cho trạm máy tính cấu hình cao, vị trí bàn cafe ngắm cảnh hoặc hầm cách âm bảo mật VIP cho các buổi đàm phán tài chính.
          </p>
          <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mt-6"></div>
        </div>

        {/* Web3 Wallet Connect Bar */}
        <div className="max-w-5xl mx-auto mb-8 flex justify-end">
          <button
            type="button"
            onClick={handleConnectWallet}
            className={`flex items-center gap-2.5 px-5 py-2.5 border font-mono text-[10px] tracking-widest uppercase transition-all rounded-sm hover:scale-[1.02] shadow-md z-20 ${
              walletConnected 
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                : 'border-secondary/30 bg-surface-container-low/40 text-secondary hover:border-secondary/60 hover:bg-secondary/5'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {walletConnected ? 'account_balance_wallet' : 'vpn_key'}
            </span>
            {walletConnecting 
              ? 'Đang kết nối ví...' 
              : walletConnected 
                ? `ĐÃ KẾT NỐI: ${walletAddress}` 
                : 'KẾT NỐI VÍ TRADER (WEB3)'}
          </button>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column Left: Station Selector & Hardware Specifications */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Station Type Selector Cards */}
            <div className="glass-panel p-6 rounded-sm border border-outline-variant/15 relative">
              <h3 className="font-mono text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-outline-variant/10 pb-2.5">
                <span className="material-symbols-outlined text-[16px]">domain</span>
                1. CHỌN KHU VỰC &amp; LOẠI BÀN
              </h3>
              
              <div className="space-y-4">
                {Object.keys(STATION_SPECS).map((type) => {
                  const spec = STATION_SPECS[type];
                  const isSelected = stationType === type;
                  const borderGlowClass = 
                    type === 'Standard Table' ? 'border-secondary/60 bg-secondary/5 shadow-sm shadow-secondary/5' :
                    type === 'Trading Station' ? 'border-emerald-500/50 bg-emerald-500/5 shadow-sm shadow-emerald-500/5' :
                    'border-amber-500/50 bg-amber-500/5 shadow-sm shadow-amber-500/5';
                  const textColorClass = 
                    type === 'Standard Table' ? 'text-secondary' :
                    type === 'Trading Station' ? 'text-emerald-400' :
                    'text-amber-400';
                  
                  return (
                    <div
                      key={type}
                      onClick={() => {
                        setStationType(type);
                        if (type === 'Standard Table') {
                          setSelectedSeat('Bàn 04');
                          setDuration(2);
                        } else if (type === 'Trading Station') {
                          setSelectedSeat('Trạm 03');
                        } else {
                          setSelectedSeat('Vault 02');
                        }
                      }}
                      className={`relative border p-4.5 flex items-start gap-4 cursor-pointer transition-all rounded-sm group select-none ${
                        isSelected 
                          ? borderGlowClass + ' shadow-md shadow-black/40' 
                          : 'border-outline-variant/20 hover:border-secondary/35 bg-surface-container-low/20'
                      }`}
                    >
                      {/* High-tech Corner Brackets for active choice */}
                      {isSelected && (
                        <CardCorners colorClass={
                          type === 'Standard Table' ? 'border-secondary' :
                          type === 'Trading Station' ? 'border-emerald-500' :
                          'border-amber-500'
                        } />
                      )}
                      
                      <span className={`material-symbols-outlined text-2xl ${isSelected ? textColorClass : 'text-on-surface-variant'}`}>
                        {spec.icon}
                      </span>
                      
                      <div className="space-y-1.5 pr-6 flex-grow">
                        <h4 className="font-mono text-[11.5px] font-bold text-on-surface uppercase tracking-wider">
                          {spec.name.split(' (')[0]}
                        </h4>
                        <p className="text-[10.5px] text-on-surface-variant font-mono leading-normal opacity-85">
                          {spec.desc}
                        </p>
                        <div className={`text-[10px] font-mono font-bold pt-1.5 ${textColorClass} tracking-wider`}>
                          {spec.price > 0 ? `${spec.price.toLocaleString('vi-VN')}đ / GIỜ` : 'MIỄN PHÍ ĐẶT CHỖ'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware configuration specs card */}
            <div className="glass-panel p-6 rounded-sm border border-outline-variant/15 relative overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-secondary/50"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-secondary/50"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-secondary/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-secondary/50"></div>

              <h3 className="font-mono text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-outline-variant/10 pb-2.5">
                <span className="material-symbols-outlined text-[16px]">{currentSpecs.icon}</span>
                CẤU HÌNH &amp; THÔNG SỐ VỊ TRÍ
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-xs font-bold text-on-surface">{currentSpecs.name}</h4>
                  <p className="text-[12px] text-on-surface-variant mt-1.5 leading-relaxed">{currentSpecs.desc}</p>
                </div>

                <div className="pt-3 border-t border-outline-variant/10">
                  <span className="font-mono text-[9px] text-secondary tracking-widest uppercase block mb-2">Thông số kỹ thuật phần cứng:</span>
                  <ul className="space-y-2 font-mono text-[11px] text-on-surface-variant">
                    {currentSpecs.hardware.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-secondary select-none">::</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Interactive Booking Input Fields */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 md:p-10 rounded-sm border border-outline-variant/15 relative">
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                
                {/* 1. Select Date Timeline */}
                <div className="space-y-4">
                  <h3 className="font-mono text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    2. CHỌN NGÀY GIAO DỊCH
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2.5 overflow-x-auto py-1 custom-scroll">
                    {dateList.map((date, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`flex-1 min-w-[120px] py-3 px-4 text-center font-mono text-[11px] tracking-wider rounded-sm border uppercase transition-all ${
                          selectedDateIndex === idx 
                            ? 'border-secondary bg-secondary/15 text-secondary shadow-md' 
                            : 'border-outline-variant/20 bg-surface-container-low/40 text-on-surface-variant hover:border-secondary/30'
                        }`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Select Time Slots */}
                <div className="space-y-4">
                  <h3 className="font-mono text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    3. CHỌN KHUNG GIỜ BẮT ĐẦU
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {timeSlots.map((slot, idx) => {
                      const isOccupied = slot.status === 'occupied';
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          type="button"
                          key={idx}
                          disabled={isOccupied}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`time-slot-btn py-3 px-1 text-center font-mono text-[11px] tracking-wider border rounded-sm ${
                            isOccupied 
                              ? 'border-neutral-800 text-neutral-600 bg-neutral-900/50 cursor-not-allowed'
                              : isSelected 
                                ? 'selected border-secondary bg-secondary/10 text-secondary' 
                                : 'border-outline-variant/20 bg-surface-container-low/40 text-on-surface-variant hover:border-secondary/30'
                          }`}
                        >
                          <div>{slot.time}</div>
                          <div className="text-[7.5px] mt-1 opacity-70 tracking-widest uppercase">
                            {isOccupied ? 'Hết chỗ' : 'Còn trống'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Duration & Guests selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5" style={{ opacity: isDurationDisabled ? 0.35 : 1 }}>
                    <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Thời lượng sử dụng</label>
                    <div className="relative">
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        disabled={isDurationDisabled}
                        className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm appearance-none cursor-pointer"
                      >
                        <option value="1">1 Giờ</option>
                        <option value="2">2 Giờ</option>
                        <option value="3">3 Giờ</option>
                        <option value="4">4 Giờ</option>
                        <option value="8">8 Giờ (Cả ngày)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                        keyboard_arrow_down
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Số lượng thành viên</label>
                    <div className="relative">
                      <select 
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm appearance-none cursor-pointer"
                      >
                        <option>1 Người</option>
                        <option>2 Người</option>
                        <option>3 Người</option>
                        <option>4 Người</option>
                        <option>5 - 8 Người</option>
                        <option>Hội thảo nhóm lớn (&gt;8)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                        keyboard_arrow_down
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Client Details (with Privacy Mode Switcher) */}
                <div className="space-y-6 pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      4. THÔNG TIN KHÁCH HÀNG
                    </h3>
                    
                    {/* Anonymous toggle */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={anonymousMode}
                        onChange={(e) => {
                          setAnonymousMode(e.target.checked);
                          if (!e.target.checked && walletConnected) {
                            // If user turns off anon mode, disconnect wallet since they go together
                            setWalletConnected(false);
                            setWalletAddress('');
                            setPayWithCrypto(false);
                            setClientName('');
                          }
                        }}
                        className="rounded border-outline-variant/30 text-secondary focus:ring-secondary/50 bg-[#0d0f0f] w-3.5 h-3.5"
                      />
                      <span className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase">Chế độ Ẩn danh (Privacy)</span>
                    </label>
                  </div>

                  {anonymousMode ? (
                    /* Anonymous Mode active */
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Telegram hoặc Discord Handle *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[12px] text-secondary">@</span>
                          <input 
                            value={telegramHandle}
                            onChange={(e) => {
                              setTelegramHandle(e.target.value);
                              if (errors.telegram) setErrors({ ...errors, telegram: '' });
                            }}
                            required 
                            className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 pl-8 pr-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                            placeholder="username_giao_dich" 
                            type="text"
                          />
                        </div>
                        {errors.telegram && <p className="text-error font-mono text-[9.5px] mt-1">{errors.telegram}</p>}
                        <p className="text-[10px] text-on-surface-variant font-mono leading-relaxed mt-1.5 opacity-80">
                          * Dữ liệu liên lạc sẽ được mã hóa và xóa ngay sau khi bạn rời khỏi quán.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Regular Identity Mode */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Họ và tên *</label>
                        <input 
                          value={clientName}
                          onChange={(e) => {
                            setClientName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: '' });
                          }}
                          required 
                          className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                          placeholder="NGUYỄN VĂN A" 
                          type="text"
                        />
                        {errors.name && <p className="text-error font-mono text-[9.5px] mt-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Số điện thoại *</label>
                        <input 
                          value={clientPhone}
                          onChange={(e) => {
                            setClientPhone(e.target.value);
                            if (errors.phone) setErrors({ ...errors, phone: '' });
                          }}
                          required 
                          className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                          placeholder="090 123 4567" 
                          type="tel"
                        />
                        {errors.phone && <p className="text-error font-mono text-[9.5px] mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Địa chỉ Email (Không bắt buộc)</label>
                      <input 
                        value={clientEmail}
                        onChange={(e) => {
                          setClientEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm" 
                        placeholder="vip-trader@domain.com" 
                        type="email"
                      />
                      {errors.email && <p className="text-error font-mono text-[9.5px] mt-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Phương thức thanh toán</label>
                      <div className="relative">
                        <select 
                          value={payWithCrypto ? 'crypto' : 'counter'}
                          onChange={(e) => {
                            const val = e.target.value === 'crypto';
                            if (val && !walletConnected) {
                              // Force wallet connect trigger
                              handleConnectWallet();
                            } else {
                              setPayWithCrypto(val);
                            }
                          }}
                          className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm appearance-none cursor-pointer"
                        >
                          <option value="counter">Thanh toán tại quầy</option>
                          <option value="crypto">USDT / USDC (Ví Web3)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                          keyboard_arrow_down
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase block">Yêu cầu bổ sung đặc biệt</label>
                    <textarea 
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      className="w-full bg-[#0d0f0f] border border-outline-variant/20 py-3 px-4 font-mono text-[12px] text-on-surface focus:border-secondary transition-all rounded-sm resize-none" 
                      placeholder="Ví dụ: Vị trí bàn yên tĩnh, mượn cổng chuyển HDMI, chuẩn bị sẵn ví lạnh Ledger..." 
                      rows="2"
                    />
                  </div>
                </div>

                {/* 5. Dynamic Billing Summary */}
                <div className="bg-surface-container-low/40 border border-outline-variant/10 p-5 rounded-sm font-mono space-y-2.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rotate-45 translate-x-12 -translate-y-12"></div>
                  
                  <span className="text-[9px] text-secondary tracking-widest block uppercase border-b border-outline-variant/10 pb-1.5 font-bold">
                    HÓA ĐƠN TẠM TÍNH HỆ THỐNG
                  </span>
                  
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Đơn giá loại bàn:</span>
                    <span>{currentSpecs.price > 0 ? `${currentSpecs.price.toLocaleString('vi-VN')}đ / Giờ` : 'Miễn phí'}</span>
                  </div>
                  
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Thời lượng đặt chỗ:</span>
                    <span>{duration} Giờ</span>
                  </div>

                  {payWithCrypto && (
                    <div className="flex justify-between text-[11px] text-emerald-400/80">
                      <span>Tỷ giá quy đổi (MOCK):</span>
                      <span>1 USDT = 25.000đ</span>
                    </div>
                  )}

                  {payWithCrypto && (
                    <div className="flex justify-between text-[11px] text-emerald-400/80">
                      <span>Gas Fee (Giao dịch Web3):</span>
                      <span>0.0003 ETH (~0.95$)</span>
                    </div>
                  )}
                  
                  <div className="border-t border-outline-variant/10 pt-2.5 flex justify-between items-baseline">
                    <span className="text-on-surface font-bold text-[12px] uppercase">TỔNG PHÍ:</span>
                    <div className="text-right">
                      <span className="text-secondary font-extrabold text-base">{totalVND.toLocaleString('vi-VN')}đ</span>
                      {payWithCrypto && totalVND > 0 && (
                        <div className="text-[10px] text-emerald-400 font-bold mt-0.5">({totalUSDT} USDT)</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div>
                  <button 
                    className="w-full py-4.5 font-mono text-[12px] tracking-widest bg-secondary text-on-secondary hover:brightness-110 active:scale-[0.99] transition-all rounded-sm font-bold uppercase relative overflow-hidden group shadow-lg shadow-secondary/15" 
                    type="submit"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                    THỰC THI LỆNH ĐẶT BÀN
                  </button>
                </div>
              </form>
            </div>

            {/* Hotline alternative reservation */}
            <div className="mt-8 text-center reveal-on-scroll">
              <p className="text-on-surface-variant font-mono text-[10px] uppercase tracking-wider">Đặt chỗ khẩn cấp qua Hotline &amp; Zalo encrypted</p>
              <a href="tel:0902345678" className="inline-flex items-center gap-2 mt-3.5 px-6 py-3 border border-secondary/25 hover:bg-secondary/10 text-secondary font-mono text-[10px] uppercase tracking-widest rounded-sm transition-all shadow-md">
                <span className="material-symbols-outlined text-[15px]">call</span>
                HOTLINE / ZALO SECURE: 090 234 5678
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* High-tech Cryptographic Ticket Modal */}
      <ReceiptModal 
        isOpen={isReceiptOpen}
        receiptData={receiptData}
        onClose={handleCloseReceipt}
      />
    </section>
  );
}
