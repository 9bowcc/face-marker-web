import { useCallback, useState } from 'react';
import { Box, Typography, Button, Paper, alpha } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import { SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, MAX_FILE_SIZE } from '../types';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  enableDragDrop?: boolean;
}

export function ImageUpload({
  onFileSelect,
  accept = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].join(','),
  disabled = false,
  enableDragDrop = true,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && enableDragDrop) {
      setIsDragging(true);
    }
  }, [disabled, enableDragDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      e.target.value = '';
    },
    [onFileSelect]
  );

  return (
    <Paper
      sx={{
        p: 4,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        bgcolor: isDragging ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'background.paper',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled
          ? {}
          : {
              borderColor: 'primary.light',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
            },
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Box sx={{ mb: 2 }}>
        {isDragging ? (
          <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        ) : (
          <ImageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        )}
      </Box>
      <Typography variant="h6" gutterBottom>
        {isDragging ? 'Drop your image here' : 'Upload an Image'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag and drop or click to select
        <br />
        Supports JPG, PNG, WebP (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
      </Typography>
      <Button
        variant="contained"
        component="label"
        disabled={disabled}
        startIcon={<CloudUploadIcon />}
      >
        Select File
        <input
          type="file"
          hidden
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
        />
      </Button>
    </Paper>
  );
}
