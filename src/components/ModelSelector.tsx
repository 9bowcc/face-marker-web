import { ToggleButton, ToggleButtonGroup, Typography, Stack, Chip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SpeedIcon from '@mui/icons-material/Speed';

interface ModelSelectorProps {
  activeDetector: 'mediapipe' | 'faceapi';
  onSwitch: (detector: 'mediapipe' | 'faceapi') => void;
  disabled?: boolean;
}

export function ModelSelector({
  activeDetector,
  onSwitch,
  disabled = false,
}: ModelSelectorProps) {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newDetector: 'mediapipe' | 'faceapi' | null
  ) => {
    if (newDetector !== null) {
      onSwitch(newDetector);
    }
  };

  return (
    <Stack spacing={1} alignItems="center">
      <Typography variant="caption" color="text.secondary">
        Detection Model
      </Typography>
      <ToggleButtonGroup
        value={activeDetector}
        exclusive
        onChange={handleChange}
        disabled={disabled}
        size="small"
      >
        <ToggleButton value="mediapipe">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <SmartToyIcon fontSize="small" />
            <span>MediaPipe</span>
          </Stack>
        </ToggleButton>
        <ToggleButton value="faceapi">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <SpeedIcon fontSize="small" />
            <span>face-api</span>
          </Stack>
        </ToggleButton>
      </ToggleButtonGroup>
      <Chip
        size="small"
        label={activeDetector === 'mediapipe' ? 'High Accuracy' : 'Lightweight'}
        color={activeDetector === 'mediapipe' ? 'primary' : 'secondary'}
        variant="outlined"
      />
    </Stack>
  );
}
