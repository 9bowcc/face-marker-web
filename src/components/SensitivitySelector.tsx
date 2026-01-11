import { Box, Typography, ToggleButton, ToggleButtonGroup, Stack } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { SensitivityLevel, SENSITIVITY_LABELS } from '../types';

interface SensitivitySelectorProps {
  sensitivity: SensitivityLevel;
  onChange: (sensitivity: SensitivityLevel) => void;
  disabled?: boolean;
}

export function SensitivitySelector({
  sensitivity,
  onChange,
  disabled = false,
}: SensitivitySelectorProps) {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newSensitivity: SensitivityLevel | null
  ) => {
    if (newSensitivity !== null) {
      onChange(newSensitivity);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Detection Sensitivity
      </Typography>
      <ToggleButtonGroup
        value={sensitivity}
        exclusive
        onChange={handleChange}
        disabled={disabled}
        fullWidth
        size="small"
      >
        <ToggleButton value="low">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TuneIcon fontSize="small" />
            <span>Low</span>
          </Stack>
        </ToggleButton>
        <ToggleButton value="medium">
          <span>Medium</span>
        </ToggleButton>
        <ToggleButton value="high">
          <span>High</span>
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {SENSITIVITY_LABELS[sensitivity]}
      </Typography>
    </Box>
  );
}
