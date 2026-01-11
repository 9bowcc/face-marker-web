import { useState, useCallback } from 'react';
import { MaskConfiguration, DEFAULT_MASK_CONFIG, EMOJI_PRESETS } from '../types';

interface UseMaskConfigurationResult {
  config: MaskConfiguration;
  setMaskType: (type: 'blur' | 'mosaic' | 'emoji' | 'none') => void;
  setBlurIntensity: (intensity: number) => void;
  setEmoji: (emoji: string) => void;
  reset: () => void;
}

export function useMaskConfiguration(): UseMaskConfigurationResult {
  const [config, setConfig] = useState<MaskConfiguration>(DEFAULT_MASK_CONFIG);

  const setMaskType = useCallback((type: 'blur' | 'mosaic' | 'emoji' | 'none') => {
    setConfig((prev) => ({ ...prev, type }));
  }, []);

  const setBlurIntensity = useCallback((intensity: number) => {
    // Clamp value between 1 and 100
    const clampedIntensity = Math.max(1, Math.min(100, intensity));
    setConfig((prev) => ({ ...prev, blurIntensity: clampedIntensity }));
  }, []);

  const setEmoji = useCallback((emoji: string) => {
    // Validate emoji is in presets or allow custom
    if (EMOJI_PRESETS.includes(emoji as typeof EMOJI_PRESETS[number]) || emoji.length > 0) {
      setConfig((prev) => ({ ...prev, emoji }));
    }
  }, []);

  const reset = useCallback(() => {
    setConfig(DEFAULT_MASK_CONFIG);
  }, []);

  return {
    config,
    setMaskType,
    setBlurIntensity,
    setEmoji,
    reset,
  };
}
