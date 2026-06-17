import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { port: 5174 },
  build: {
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-maps',
              test: /[\\/]node_modules[\\/](@react-google-maps|@googlemaps)[\\/]/,
              priority: 90,
            },
            {
              name: 'vendor-charts',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 80,
            },
            {
              name: 'vendor-redux',
              test: /[\\/]node_modules[\\/](@reduxjs|react-redux|redux|immer|reselect)[\\/]/,
              priority: 70,
            },
            {
              name: 'vendor-react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 60,
            },
            {
              name: 'vendor-ui',
              test: /[\\/]node_modules[\\/](@radix-ui|radix-ui|@floating-ui|cmdk|@tanstack)[\\/]/,
              priority: 50,
            },
            {
              name: 'vendor-icons',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 40,
            },
            {
              name: 'vendor-forms',
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-country',
              test: /[\\/]node_modules[\\/]country-state-city[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-other',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
