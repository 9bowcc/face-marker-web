import { useEffect, useRef, RefObject, useCallback } from 'react';
import { Box } from '@mui/material';
import { DetectedFace, MaskConfiguration } from '../types';
import { loadImageToCanvas } from '../utils/imageUtils';
import { drawBoundingBox, applyBlur, applyEmoji } from '../utils/canvasUtils';

interface FaceCanvasProps {
  imageSrc: string | null;
  faces: DetectedFace[];
  maskConfig: MaskConfiguration;
  onFaceClick: (faceId: string) => void;
  zoomLevel?: number;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

export function FaceCanvas({
  imageSrc,
  faces,
  maskConfig,
  onFaceClick,
  zoomLevel = 1,
  canvasRef: externalCanvasRef,
}: FaceCanvasProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !displayCanvas || !img) return;

    const ctx = canvas.getContext('2d');
    const displayCtx = displayCanvas.getContext('2d');
    
    if (!ctx || !displayCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    displayCanvas.width = canvas.width;
    displayCanvas.height = canvas.height;
    displayCtx.drawImage(canvas, 0, 0);

    const selectedFaces = faces.filter((f) => f.isSelected);
    
    if (maskConfig.type !== 'none') {
      for (const face of selectedFaces) {
        const region = {
          x: face.x,
          y: face.y,
          width: face.width,
          height: face.height,
        };

        if (maskConfig.type === 'blur') {
          applyBlur(displayCtx, region, maskConfig.blurIntensity);
        } else if (maskConfig.type === 'emoji') {
          applyEmoji(displayCtx, region, maskConfig.emoji);
        }
      }
    }

    for (const face of faces) {
      drawBoundingBox(displayCtx, face, { selected: face.isSelected });
    }
  }, [faces, maskConfig, canvasRef]);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    loadImageToCanvas(imageSrc, canvasRef.current)
      .then((img) => {
        imageRef.current = img;
        renderCanvas();
      })
      .catch(console.error);
  }, [imageSrc, canvasRef, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const face of faces) {
      if (
        x >= face.x &&
        x <= face.x + face.width &&
        y >= face.y &&
        y <= face.y + face.height
      ) {
        onFaceClick(face.id);
        break;
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <canvas
        ref={displayCanvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '70vh',
          objectFit: 'contain',
          cursor: 'pointer',
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
        }}
      />
    </Box>
  );
}
