import { useState, useEffect } from 'react';

export interface WebGPUSupport {
  isSupported: boolean;
  isChecking: boolean;
  error: string | null;
}

interface GPUAdapter {
  close?: () => void;
}

declare global {
  interface Navigator {
    gpu?: {
      requestAdapter: () => Promise<GPUAdapter | null>;
    };
  }
}

export function useWebGPUSupport(): WebGPUSupport {
  const [support, setSupport] = useState<WebGPUSupport>({
    isSupported: false,
    isChecking: true,
    error: null,
  });

  useEffect(() => {
    const checkWebGPU = async () => {
      try {
        if (!navigator.gpu) {
          setSupport({
            isSupported: false,
            isChecking: false,
            error: 'WebGPU is not supported in this browser',
          });
          return;
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          setSupport({
            isSupported: false,
            isChecking: false,
            error: 'No compatible GPU adapter found',
          });
          return;
        }

        setSupport({
          isSupported: true,
          isChecking: false,
          error: null,
        });

        adapter?.close?.();
      } catch (error) {
        setSupport({
          isSupported: false,
          isChecking: false,
          error: error instanceof Error ? error.message : 'Unknown error checking WebGPU',
        });
      }
    };

    checkWebGPU();
  }, []);

  return support;
}
