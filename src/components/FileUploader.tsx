/**
 * File upload component for images and videos
 */

import { useCallback, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  styled,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import {
  validateFile,
  formatFileSize,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '../utils/fileValidation';
import { SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES } from '../constants';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const UploadArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  '&.drag-over': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
}));

const FileInput = styled('input')({
  display: 'none',
});

export const FileUploader = ({ onFileSelect, disabled = false }: FileUploaderProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      // Clear previous errors
      setError(null);

      // Validate the file
      const validation = validateFile(file);

      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // File is valid, proceed with upload
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <UploadArea
        className={dragOver ? 'drag-over' : ''}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        elevation={0}
        role="button"
        aria-label="Upload image or video file"
        aria-describedby="upload-instructions upload-file-size-limits"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} aria-hidden="true" />
        <Typography variant="h6" gutterBottom>
          Drop your file here or click to browse
        </Typography>
        <Typography id="upload-instructions" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Supported formats: Images (JPEG, PNG, WebP) and Videos (MP4, WebM, MOV)
        </Typography>
        <Typography id="upload-file-size-limits" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Maximum file size: {formatFileSize(MAX_IMAGE_SIZE)} for images, {formatFileSize(MAX_VIDEO_SIZE)} for videos
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ImageIcon fontSize="small" aria-hidden="true" />
            <Typography variant="caption">Images</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VideoFileIcon fontSize="small" aria-hidden="true" />
            <Typography variant="caption">Videos</Typography>
          </Box>
        </Box>
      </UploadArea>
      <FileInput
        ref={inputRef}
        type="file"
        accept={[...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        aria-label="Select image or video file to upload"
      />
    </Box>
  );
};
