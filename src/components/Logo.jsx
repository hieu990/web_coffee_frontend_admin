import React from 'react';

export default function Logo({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 138 46" 
      className={className}
    >
      {/* Coffee Lab Circle Icon */}
      <image href="/logo-circle.png" x="0" y="0" width="46" height="46" />
      
      {/* Brand Text: LAB COFFEE */}
      <image href="/logo-text-only.png" x="54" y="3" width="80" height="40" />
    </svg>
  );
}

