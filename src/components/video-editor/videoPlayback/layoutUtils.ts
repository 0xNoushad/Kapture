import { Application, Sprite, Graphics } from 'pixi.js';
import type { CropRegion } from '../types';

interface LayoutParams {
  container: HTMLDivElement;
  app: Application;
  videoSprite: Sprite;
  maskGraphics: Graphics;
  videoElement: HTMLVideoElement;
  cropRegion?: CropRegion;
  lockedVideoDimensions?: { width: number; height: number } | null;
  borderRadius?: number;
  padding?: number;
}

interface LayoutResult {
  stageSize: { width: number; height: number };
  videoSize: { width: number; height: number };
  baseScale: number;
  baseOffset: { x: number; y: number };
  maskRect: { x: number; y: number; width: number; height: number };
  cropBounds: { startX: number; endX: number; startY: number; endY: number };
}

export function layoutVideoContent(params: LayoutParams): LayoutResult | null {
  const { container, app, videoSprite, maskGraphics, videoElement, cropRegion, lockedVideoDimensions, borderRadius = 0, padding = 0 } = params;

  const videoWidth = lockedVideoDimensions?.width || videoElement.videoWidth;
  const videoHeight = lockedVideoDimensions?.height || videoElement.videoHeight;

  if (!videoWidth || !videoHeight) {
    return null;
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  if (!width || !height) {
    return null;
  }

  app.renderer.resize(width, height);
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';

  // Apply crop region
  const crop = cropRegion || { x: 0, y: 0, width: 1, height: 1 };
  
  // Calculate the cropped dimensions
  const croppedVideoWidth = videoWidth * crop.width;
  const croppedVideoHeight = videoHeight * crop.height;

  const cropStartX = crop.x * videoWidth;
  const cropStartY = crop.y * videoHeight;
  const cropEndX = cropStartX + croppedVideoWidth;
  const cropEndY = cropStartY + croppedVideoHeight;
  
  // Calculate scale to fit the cropped area in the viewport
  // Padding 0 = video fills container (cover), padding 100 = video at 60% size
  const paddingScale = padding > 0 ? (1.0 - (padding / 100) * 0.4) : 1.0;
  const maxDisplayWidth = width * paddingScale;
  const maxDisplayHeight = height * paddingScale;

  // Use "cover" behavior - scale video to fill the padded display area
  // The mask will clip any overflow, ensuring video fills the frame for any aspect ratio
  const scale = Math.max(maxDisplayWidth / croppedVideoWidth, maxDisplayHeight / croppedVideoHeight);

  videoSprite.scale.set(scale);
  
  // Calculate display size of the full video at this scale
  const fullVideoDisplayWidth = videoWidth * scale;
  const fullVideoDisplayHeight = videoHeight * scale;
  
  // Calculate display size of just the cropped region
  const croppedDisplayWidth = croppedVideoWidth * scale;
  const croppedDisplayHeight = croppedVideoHeight * scale;

  // The visible area is the padded display area, centered in the container
  const visibleWidth = maxDisplayWidth;
  const visibleHeight = maxDisplayHeight;
  const visibleX = (width - visibleWidth) / 2;
  const visibleY = (height - visibleHeight) / 2;

  // Center the video within the visible area
  // The video may be larger than the visible area (cover behavior), so we center it
  const videoOffsetX = visibleX + (visibleWidth - croppedDisplayWidth) / 2;
  const videoOffsetY = visibleY + (visibleHeight - croppedDisplayHeight) / 2;
  
  // Position the full video sprite accounting for crop offset
  const spriteX = videoOffsetX - (crop.x * fullVideoDisplayWidth);
  const spriteY = videoOffsetY - (crop.y * fullVideoDisplayHeight);
  
  videoSprite.position.set(spriteX, spriteY);

  // Mask clips to the visible padded area (not the video size)
  maskGraphics.clear();
  maskGraphics.roundRect(visibleX, visibleY, visibleWidth, visibleHeight, borderRadius);
  maskGraphics.fill({ color: 0xffffff });

  return {
    stageSize: { width, height },
    videoSize: { width: croppedVideoWidth, height: croppedVideoHeight },
    baseScale: scale,
    baseOffset: { x: spriteX, y: spriteY },
    maskRect: { x: visibleX, y: visibleY, width: visibleWidth, height: visibleHeight },
    cropBounds: { startX: cropStartX, endX: cropEndX, startY: cropStartY, endY: cropEndY },
  };
}
