'use client'

import { useEffect } from 'react';
import { initRUM } from '@/lib/performance/rum';

export default function RUMProvider() {
  useEffect(() => {
    // Initialize RUM only in browser
    if (typeof window !== 'undefined') {
      initRUM();
    }
  }, []);

  // This component doesn't render anything
  return null;
}