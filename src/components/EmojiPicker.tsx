import { Box, IconButton, Tooltip } from '@mui/material';
import { EMOJI_PRESETS } from '../types';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({
  selectedEmoji,
  onSelect,
  disabled = false,
}: EmojiPickerProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 0.5,
        mt: 1,
      }}
    >
      {EMOJI_PRESETS.map((emoji) => (
        <Tooltip key={emoji} title={emoji}>
          <IconButton
            onClick={() => onSelect(emoji)}
            disabled={disabled}
            sx={{
              fontSize: '1.5rem',
              border: '2px solid',
              borderColor: selectedEmoji === emoji ? 'primary.main' : 'transparent',
              bgcolor: selectedEmoji === emoji ? 'action.selected' : 'transparent',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {emoji}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
}
