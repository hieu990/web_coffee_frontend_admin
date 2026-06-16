import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Components
import Header from './components/Header';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import MenuSection from './components/Menu/MenuSection';
import TradingLounge from './components/TradingLounge/TradingLounge';
import Testimonials from './components/Testimonials';
import BookingForm from './components/Reservations/BookingForm';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CursorGlow from './components/CursorGlow';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';

// Admin Components
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

import { useScrollReveal } from './hooks/useScrollReveal';

// Public Home Layout Component
function PublicHome() {
  // Activate scroll reveals
  useScrollReveal();

  // Glass spotlights effect (Optimized: event-delegation hover-tracking with requestAnimationFrame)
  useEffect(() => {
    let activeCard = null;
    let frameId = null;
    let mouseX = 0;
    let mouseY = 0;

    const updateSpotlight = () => {
      if (activeCard) {
        const rect = activeCard.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        activeCard.style.setProperty('--mouse-x', `${x}px`);
        activeCard.style.setProperty('--mouse-y', `${y}px`);
      }
      frameId = null;
    };

    const handleMouseMove = (e) => {
      const card = e.target.closest('.glass-panel, .glass-card');
      if (!card) {
        activeCard = null;
        return;
      }

      activeCard = card;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!frameId) {
        frameId = requestAnimationFrame(updateSpotlight);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Aura mouse trail glow */}
      <CursorGlow />

      {/* Navigation Header */}
      <Header />

      {/* Main Content Sections */}
      <main className="pt-32 transition-all duration-300 min-h-screen">
        {/* original Hero banner component */}
        <Hero />

        {/* Sách Thực Đơn 3D Flipbook */}
        <MenuSection />

        {/* Other Sections */}
        <Philosophy />
        <TradingLounge />
        <Testimonials />
        <BookingForm />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to top button */}
      <BackToTop />
    </>
  );
}

// Main App Router Controller
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Homepage Route */}
        <Route path="/" element={<PublicHome />} />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Admin Dashboard Route */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
