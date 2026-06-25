/**
 * Copyright (c) 2026 JAThong, Trần Hoàng Thông và Đỗ Lê Trọng Hiếu. All rights reserved.
 *
 * Developed by:
 * - Thông Trần
 * - Hiếu Đỗ
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios']
        }
      }
    }
  }
});
