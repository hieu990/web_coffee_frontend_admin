import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

/**
 * TestConnection Component
 * File Path: src/components/TestConnection.jsx
 * 
 * A simple utility component that sends a GET request to the backend test.php 
 * endpoint to verify that CORS configuration and backend connection are working.
 */
export default function TestConnection() {
  const [isTesting, setIsTesting] = useState(false);

  const checkConnection = async () => {
    setIsTesting(true);
    try {
      // Send GET request to the test.php endpoint on the PHP backend
      const response = await axios.get(`${API_BASE_URL}/test.php`);
      
      // Display success message containing status and message from JSON response
      if (response.data && response.data.status === 'success') {
        alert(`Success!\nStatus: ${response.data.status}\nMessage: ${response.data.message}`);
      } else {
        alert(`Unexpected Response:\n${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Connection Failed!\nError: ${errorMsg}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#121616]/60 backdrop-blur-md border border-[#ffb77b]/15 rounded max-w-md mx-auto my-12 text-[#e2e2e2] font-sans shadow-xl relative">
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ffb77b]/30"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ffb77b]/30"></div>
      
      <h3 className="text-sm font-mono tracking-widest text-[#ffb77b] uppercase mb-2">
        Backend Connection Tester
      </h3>
      <p className="text-xs text-[#c4c7c7] mb-6 text-center leading-relaxed">
        Pings <code className="text-[#ffb77b]/80 bg-[#0c0f0f] px-1 py-0.5 rounded font-mono">{API_BASE_URL}/test.php</code> to verify CORS config.
      </p>
      
      <button
        onClick={checkConnection}
        disabled={isTesting}
        className={`px-6 py-3 text-xs font-mono uppercase tracking-widest font-semibold border transition-all duration-300 ${
          isTesting
            ? 'bg-[#ffb77b]/20 text-[#ffb77b]/50 border-[#ffb77b]/20 cursor-not-allowed'
            : 'bg-[#ffb77b] text-[#2e1500] border-[#ffb77b] hover:shadow-[0_0_15px_rgba(255,183,123,0.3)] hover:brightness-105 active:scale-[0.98]'
        }`}
      >
        {isTesting ? 'TESTING CONNECTION...' : 'TEST CONNECTION'}
      </button>
    </div>
  );
}
