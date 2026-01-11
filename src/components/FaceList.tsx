import { Box, Typography, Stack, Chip, Avatar, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import { DetectedFace } from '../types';

interface FaceListProps {
  faces: DetectedFace[];
  onFaceClick: (faceId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function FaceList({
  faces,
  onFaceClick,
  onSelectAll,
  onDeselectAll,
}: FaceListProps) {
  if (faces.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No faces detected yet
        </Typography>
      </Box>
    );
  }

  const selectedCount = faces.filter((f) => f.isSelected).length;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle2">
          Detected Faces ({faces.length})
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Select All">
            <IconButton size="small" onClick={onSelectAll}>
              <SelectAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deselect All">
            <IconButton size="small" onClick={onDeselectAll}>
              <DeselectIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
        {faces.map((face, index) => (
          <Box
            key={face.id}
            onClick={() => onFaceClick(face.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              bgcolor: face.isSelected ? 'action.selected' : 'background.paper',
              border: '1px solid',
              borderColor: face.isSelected ? 'primary.main' : 'divider',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Avatar
              src={face.thumbnail}
              sx={{
                width: 40,
                height: 40,
                bgcolor: face.isSelected ? 'primary.main' : 'grey.400',
                fontSize: '0.875rem',
              }}
            >
              {!face.thumbnail && index + 1}
            </Avatar>
            <Box sx={{ ml: 1.5, flex: 1 }}>
              <Typography variant="body2">Face {index + 1}</Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(face.confidence * 100)}% confidence
              </Typography>
            </Box>
            {face.isSelected ? (
              <CheckCircleIcon color="primary" />
            ) : (
              <RadioButtonUncheckedIcon color="disabled" />
            )}
          </Box>
        ))}
      </Stack>

      <Chip
        label={`${selectedCount} of ${faces.length} selected`}
        size="small"
        color={selectedCount > 0 ? 'primary' : 'default'}
        sx={{ mt: 2, width: '100%' }}
      />
    </Box>
  );
}
