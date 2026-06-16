import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

/**
 * AdminLogin Component
 * File Path: src/components/AdminLogin.jsx
 * 
 * Renders a premium, modern login form for the administrative area.
 * Features a dark theme, real-time feedback with shake animation, and loading state.
 */
export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage('');

    // Form validation
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      triggerShake();
      return;
    }

    setIsLoading(true);

    // Authenticate with PHP backend
    axios.post(`${API_BASE_URL}/admin/login.php`, {
      username: username.trim(),
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    .then(response => {
      setIsLoading(false);
      if (response.data && response.data.success) {
        // Store simple auth flag in localStorage for router guard convenience
        localStorage.setItem('isAdminAuthenticated', 'true');
        // Fix #10: save actual username for display in dashboard header
        if (response.data.user?.username) {
          localStorage.setItem('adminUsername', response.data.user.username);
        }
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(response.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
        triggerShake();
      }
    })
    .catch(error => {
      setIsLoading(false);
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối với server.';
      setErrorMessage(errorMsg);
      triggerShake();
    });
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-200 flex items-center justify-center font-sans px-4 relative overflow-hidden">
      
      {/* Decorative ambient glowing lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none"></div>

      {/* Login Card */}
      <div className={`w-full max-w-md bg-[#16181f]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 transition-all ${shake ? 'shake' : ''}`}>
        
        {/* Header / Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 mb-3 shadow-lg shadow-amber-500/10 border border-amber-300/10">
            <span className="material-symbols-outlined text-3xl font-bold">local_cafe</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">LAB COFFEE</h2>
          <p className="text-xs text-amber-500/80 font-mono tracking-widest uppercase mt-1">CỔNG QUẢN TRỊ SYSTEM // ADMIN PORTAL</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
            <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">warning</span>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tên đăng nhập // Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg pointer-events-none">
                person
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Mật khẩu // Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg pointer-events-none">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-amber-700 disabled:to-amber-800 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>ĐANG XÁC THỰC...</span>
              </>
            ) : (
              'ĐĂNG NHẬP'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            Quay lại trang chủ khách hàng
          </button>
        </div>

      </div>
    </div>
  );
}
