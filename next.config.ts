import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 430, 768],
  },
};

export default config;
