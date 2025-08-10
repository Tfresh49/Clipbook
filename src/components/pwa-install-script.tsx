'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function PwaInstallScript() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.error('ServiceWorker registration failed: ', err);
            toast({
              variant: 'destructive',
              title: 'Offline Mode Failed',
              description: 'Could not set up offline access. Please try again later.',
            });
          }
        );
      });
    }
  }, [toast]);

  return null;
}
