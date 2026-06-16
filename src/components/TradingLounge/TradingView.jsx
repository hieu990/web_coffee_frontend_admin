import React, { useEffect, useState, useRef } from 'react';

export default function TradingView() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    // Unique ID for widget container
    const containerId = 'tradingview_chart';

    // Function to load the TradingView script if it's not present
    const loadScript = (callback) => {
      if (window.TradingView) {
        callback();
        return;
      }
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.onload = callback;
      document.head.appendChild(script);
    };

    let checkIframe;

    // Initialize widget function
    const initWidget = () => {
      if (typeof window.TradingView !== 'undefined' && document.getElementById(containerId)) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": "OKX:BTCUSDT",
          "interval": "15",
          "timezone": "Asia/Ho_Chi_Minh",
          "theme": "dark",
          "style": "1",
          "locale": "vi",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "favorites": {
            "intervals": ["1", "5", "15", "30", "60", "240", "1D"]
          },
          "container_id": containerId
        });

        // Hide skeleton loader once iframe loads
        let checks = 0;
        checkIframe = setInterval(() => {
          const chartContainer = document.getElementById(containerId);
          checks++;
          if ((chartContainer && chartContainer.querySelector('iframe')) || checks > 50) {
            clearInterval(checkIframe);
            setIsLoading(false);
          }
        }, 100);
      }
    };

    loadScript(() => {
      initWidget();
    });

    return () => {
      if (checkIframe) clearInterval(checkIframe);
    };
  }, []);

  return (
    <div className="w-full h-[380px] md:h-[75vh] glass-panel relative overflow-hidden rounded-sm border border-secondary/20 shadow-[0_0_30px_rgba(255,183,123,0.05)]" id="trading-view-widget">
      {/* Skeleton Loader */}
      {isLoading && (
        <div id="tradingview-skeleton" className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 z-10 transition-opacity duration-500">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">Đang tải biểu đồ tài chính...</p>
        </div>
      )}
      <div className="tradingview-widget-container w-full h-full">
        <div id="tradingview_chart" ref={containerRef} className="w-full h-full"></div>
      </div>
    </div>
  );
}
