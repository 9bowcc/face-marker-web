import { Box, Typography, Slider, ToggleButton, ToggleButtonGroup, Stack, Divider } from '@mui/material';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { MaskConfiguration } from '../types';
import { EmojiPicker } from './EmojiPicker';

interface MaskControlsProps {
  config: MaskConfiguration;
  onChange: (config: MaskConfiguration) => void;
  selectedCount: number;
  disabled?: boolean;
}

export function MaskControls({
  config,
  onChange,
  selectedCount,
  disabled = false,
}: MaskControlsProps) {
  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: 'blur' | 'emoji' | 'none' | null
  ) => {
    if (newType !== null) {
      onChange({ ...config, type: newType });
    }
  };

  const handleBlurChange = (_: Event, value: number | number[]) => {
    onChange({ ...config, blurIntensity: value as number });
  };

  const handleEmojiChange = (emoji: string) => {
    onChange({ ...config, emoji });
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Mask Settings
      </Typography>

      {selectedCount === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select faces to enable masking options
        </Typography>
      )}

      <Stack spacing={3}>
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Mask Type
          </Typography>
          <ToggleButtonGroup
            value={config.type}
            exclusive
            onChange={handleTypeChange}
            disabled={disabled}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <ToggleButton value="blur">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <BlurOnIcon fontSize="small" />
                <span>Blur</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="emoji">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmojiEmotionsIcon fontSize="small" />
                <span>Emoji</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="none">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VisibilityOffIcon fontSize="small" />
                <span>None</span>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {config.type === 'blur' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Blur Intensity: {config.blurIntensity}%
            </Typography>
            <Slider
              value={config.blurIntensity}
              onChange={handleBlurChange}
              min={1}
              max={100}
              disabled={disabled}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
          </Box>
        )}

        {config.type === 'emoji' && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Select Emoji
            </Typography>
            <EmojiPicker
              selectedEmoji={config.emoji}
              onSelect={handleEmojiChange}
              disabled={disabled}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}
