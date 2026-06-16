import React, { useState, useEffect } from 'react';

// Custom Sci-Fi QR Code component representing verification keys
const CyberQRCode = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 border border-secondary/30 bg-[#070909] p-1.5 rounded-sm shadow-inner shadow-black">
    {/* Corner targets */}
    <rect x="5" y="5" width="24" height="24" fill="none" stroke="#ffb77b" strokeWidth="2.5" />
    <rect x="10" y="10" width="14" height="14" fill="#ffb77b" />
    <rect x="71" y="5" width="24" height="24" fill="none" stroke="#ffb77b" strokeWidth="2.5" />
    <rect x="76" y="10" width="14" height="14" fill="#ffb77b" />
    <rect x="5" y="71" width="24" height="24" fill="none" stroke="#ffb77b" strokeWidth="2.5" />
    <rect x="10" y="76" width="14" height="14" fill="#ffb77b" />
    
    {/* Random pixel-like blocks to simulate QR content */}
    <rect x="38" y="8" width="8" height="8" fill="#ffb77b" opacity="0.8" />
    <rect x="50" y="16" width="12" height="6" fill="#ffb77b" opacity="0.9" />
    <rect x="42" y="30" width="16" height="8" fill="#ffb77b" opacity="0.85" />
    <rect x="14" y="42" width="8" height="12" fill="#ffb77b" opacity="0.75" />
    <rect x="28" y="48" width="20" height="4" fill="#ffb77b" opacity="0.9" />
    <rect x="68" y="38" width="10" height="10" fill="#ffb77b" opacity="0.8" />
    <rect x="54" y="54" width="15" height="15" fill="#ffb77b" opacity="0.9" />
    <rect x="38" y="72" width="12" height="12" fill="#ffb77b" opacity="0.8" />
    <rect x="74" y="74" width="14" height="14" fill="#ffb77b" opacity="0.95" />
    <rect x="36" y="40" width="4" height="4" fill="#ffb77b" />
    <rect x="60" y="8" width="4" height="4" fill="#ffb77b" />
    <rect x="60" y="44" width="4" height="4" fill="#ffb77b" />
    
    {/* Micro scanning mesh */}
    <path d="M 5,50 L 95,50" stroke="rgba(255, 183, 123, 0.12)" strokeWidth="1" strokeDasharray="2,2" />
    <path d="M 50,5 L 50,95" stroke="rgba(255, 183, 123, 0.12)" strokeWidth="1" strokeDasharray="2,2" />
  </svg>
);

export default function ReceiptModal({ isOpen, receiptData, onClose }) {
  const [mockTxHash, setMockTxHash] = useState('');
  const [mockBlockNum, setMockBlockNum] = useState(0);

  // Generate simulated blockchain metadata on load
  useEffect(() => {
    if (isOpen) {
      const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
      setMockTxHash(`0x9a8f${randomHex.substring(0, 8)}...${randomHex.substring(12, 16)}d4c`);
      setMockBlockNum(Math.floor(18420000 + Math.random() * 90000));
    }
  }, [isOpen]);

  if (!isOpen || !receiptData) return null;

  return (
    <div 
      className={`fixed inset-0 z-[110] flex items-center justify-center bg-background/85 backdrop-blur-md transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-full max-w-xl p-4 m-4 relative animate-scaleUp">
        {/* Main Ticket Pass Container */}
        <div className="ticket-wrapper p-8 md:p-10 rounded-sm relative overflow-hidden">
          
          {/* Ticket Edge Cutouts */}
          <div className="ticket-cutout-left"></div>
          <div className="ticket-cutout-right"></div>
          <div className="ticket-divider"></div>
          
          {/* Close button top right */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-secondary cursor-pointer z-30 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>

          {/* Ticket UPPER Content */}
          <div className="space-y-6 pb-12">
            
            {/* Header Lock Status */}
            <div className="flex items-center justify-center gap-2 font-mono text-[9px] text-emerald-400 tracking-[0.25em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
              SECURE BOOKING // CONFIRMED
            </div>
            
            <div className="text-center">
              <h2 className="font-mono text-xl md:text-2xl font-black text-on-surface tracking-widest uppercase">
                ĐẶT CHỖ THÀNH CÔNG
              </h2>
              <p className="font-mono text-[10px] text-on-surface-variant tracking-wider mt-2.5 uppercase">
                Mã xác thực kỹ thuật số của bạn đã được khởi tạo
              </p>
            </div>

            {/* Structured Table details */}
            <div className="border border-outline-variant/15 bg-surface-container-lowest/60 p-5 font-mono text-[11px] text-on-surface-variant space-y-3.5 rounded-sm relative z-10 shadow-inner">
              <span className="text-[8px] text-secondary tracking-widest block uppercase border-b border-outline-variant/10 pb-2 font-bold">
                Chi tiết phòng máy &amp; bàn giao dịch
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                <div>
                  <span className="text-[8.5px] text-neutral-500 block uppercase tracking-wider">Khách hàng</span>
                  <span className="text-on-surface font-bold text-[12px]">{receiptData.name}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-neutral-500 block uppercase tracking-wider">Mạng lưới &amp; Vị trí</span>
                  <span className="text-on-surface font-bold text-[12px]">{receiptData.station}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-neutral-500 block uppercase tracking-wider">Khung giờ đặt chỗ</span>
                  <span className="text-on-surface font-bold text-[12px]">{receiptData.time}</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-neutral-500 block uppercase tracking-wider">Ngày giao dịch</span>
                  <span className="text-on-surface font-bold text-[12px]">{receiptData.date}</span>
                </div>
              </div>

              <div className="border-t border-outline-variant/10 pt-3 flex justify-between items-baseline">
                <span className="text-[8.5px] text-neutral-500 uppercase tracking-wider">Phương thức thanh toán</span>
                <span className="text-on-surface font-bold text-[11px]">{receiptData.payMethod}</span>
              </div>

              <div className="border-t border-outline-variant/10 pt-3.5 flex justify-between items-baseline">
                <span className="text-[9px] text-on-surface font-bold uppercase tracking-wider">Phí dịch vụ:</span>
                <div className="text-right">
                  <span className="text-secondary font-black text-sm md:text-base">{receiptData.cost}</span>
                  {receiptData.cryptoCost && (
                    <span className="text-emerald-400 font-bold text-[11px] ml-1.5">({receiptData.cryptoCost})</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket LOWER Content */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Cryptographic metadata log */}
            <div className="font-mono text-[9px] text-on-surface-variant/80 space-y-2 flex-grow">
              <span className="text-[8px] text-secondary tracking-widest block uppercase font-bold mb-3">
                CHỮ KÝ MẬT MÃ // LOG METADATA
              </span>
              
              <div className="flex justify-between border-b border-outline-variant/5 pb-1">
                <span className="text-neutral-500">TX HASH:</span>
                <span className="text-on-surface-variant font-bold select-all">{mockTxHash}</span>
              </div>
              
              <div className="flex justify-between border-b border-outline-variant/5 pb-1">
                <span className="text-neutral-500">BLOCK INDEX:</span>
                <span className="text-on-surface-variant font-bold">#{mockBlockNum}</span>
              </div>

              <div className="flex justify-between border-b border-outline-variant/5 pb-1">
                <span className="text-neutral-500">GAS LIMIT:</span>
                <span className="text-on-surface-variant font-bold">{receiptData.gasFee || '0'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">PASS STATUS:</span>
                <span className="text-emerald-400 font-bold uppercase">APPROVED BY LAB HOST</span>
              </div>
            </div>

            {/* QR Verification Code */}
            <div className="flex-shrink-0">
              <CyberQRCode />
            </div>
          </div>

          {/* Download & Close actions */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                // Mock ticket pass file download
                const element = document.createElement("a");
                const file = new Blob([
                  `--- COFFEE LAB TICKET PASS ---\n` +
                  `Client: ${receiptData.name}\n` +
                  `Station: ${receiptData.station}\n` +
                  `Time: ${receiptData.time}\n` +
                  `Date: ${receiptData.date}\n` +
                  `Cost: ${receiptData.cost} (${receiptData.cryptoCost || 'N/A'})\n` +
                  `TX Hash: ${mockTxHash}\n` +
                  `Block Num: #${mockBlockNum}\n` +
                  `--- SECURE TICKET KEY END ---`
                ], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `ticket-${receiptData.name}-${selectedDateIndex || 'pass'}.txt`;
                document.body.appendChild(element);
                element.click();
              }}
              className="flex-1 py-3.5 font-mono text-[10px] tracking-widest border border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all rounded-sm font-bold uppercase cursor-pointer"
            >
              TẢI TICKET PASS KEY (.TXT)
            </button>
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 font-mono text-[10px] tracking-widest bg-secondary text-on-secondary hover:brightness-110 active:scale-[0.98] transition-all rounded-sm font-bold uppercase cursor-pointer"
            >
              Xác nhận &amp; Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
