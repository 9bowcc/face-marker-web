import { Box, Skeleton, Stack } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'upload' | 'canvas' | 'controls';
}

export function LoadingSkeleton({ variant = 'canvas' }: LoadingSkeletonProps) {
  if (variant === 'upload') {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (variant === 'controls') {
    return (
      <Stack spacing={2}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={100} />
      </Stack>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Skeleton
        variant="rectangular"
        height={400}
        sx={{ borderRadius: 2, mb: 2 }}
      />
      <Stack direction="row" spacing={1} justifyContent="center">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </Stack>
    </Box>
  );
}
