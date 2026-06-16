import React, { useEffect, useRef } from 'react';

export default function CryptoTicker() {
  const containerRef = useRef(null);

  useEffect(() => {
    const scriptId = 'tradingview-ticker-script';
    
    // Clean up previous script if re-rendering
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          { "proName": "OKX:BTCUSDT", "title": "Bitcoin" },
          { "proName": "OKX:ETHUSDT", "title": "Ethereum" },
          { "proName": "OKX:SOLUSDT", "title": "Solana" },
          { "proName": "OKX:XRPUSDT", "title": "XRP" },
          { "proName": "OKX:DOGEUSDT", "title": "DOGE" },
          { "proName": "OKX:SUIUSDT", "title": "SUI" }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "adaptive",
        "colorTheme": "dark",
        "locale": "vi"
      });
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full h-[46px] border-y border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-md relative z-20">
      <div className="tradingview-widget-container" ref={containerRef}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
