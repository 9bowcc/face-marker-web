import { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Stack,
  Typography,
  TextField,
  Slider,
  Box,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import { ExportOptions, DEFAULT_EXPORT_OPTIONS } from '../types';

interface DownloadButtonProps {
  onDownload: (options: ExportOptions) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function DownloadButton({
  onDownload,
  disabled = false,
  isProcessing = false,
}: DownloadButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (format: 'jpeg' | 'png') => {
    onDownload({ ...options, format });
    handleClose();
  };

  const handleQuickDownload = () => {
    onDownload(options);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Download
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Filename"
          value={options.filename}
          onChange={(e) => setOptions({ ...options, filename: e.target.value })}
          size="small"
          fullWidth
          disabled={disabled}
        />

        {options.format === 'jpeg' && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Quality: {options.quality}%
            </Typography>
            <Slider
              value={options.quality}
              onChange={(_, value) => setOptions({ ...options, quality: value as number })}
              min={10}
              max={100}
              disabled={disabled}
              size="small"
            />
          </Box>
        )}

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleQuickDownload}
            disabled={disabled || isProcessing}
            sx={{ flex: 1 }}
          >
            {isProcessing ? 'Processing...' : 'Download'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClick}
            disabled={disabled || isProcessing}
          >
            Format
          </Button>
        </Stack>
      </Stack>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleDownload('jpeg')}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="JPEG" secondary="Smaller file size" />
        </MenuItem>
        <MenuItem onClick={() => handleDownload('png')}>
          <ListItemIcon>
            <HighQualityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="PNG" secondary="Lossless quality" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
