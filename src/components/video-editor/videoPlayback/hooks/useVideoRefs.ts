import { useRef } from 'react';
import type { Application, Container, Sprite, Graphics, BlurFilter } from 'pixi.js';
import type { ZoomRegion, TrimRegion, SpeedRegion } from '../../types';
import { DEFAULT_FOCUS } from '../constants';

export interface VideoRefs {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  appRef: React.MutableRefObject<Application | null>;
  videoSpriteRef: React.MutableRefObject<Sprite | null>;
  videoContainerRef: React.MutableRefObject<Container | null>;
  cameraContainerRef: React.MutableRefObject<Container | null>;
  timeUpdateAnimationRef: React.MutableRefObject<number | null>;
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  focusIndicatorRef: React.MutableRefObject<HTMLDivElement | null>;
  currentTimeRef: React.MutableRefObject<number>;
  zoomRegionsRef: React.MutableRefObject<ZoomRegion[]>;
  selectedZoomIdRef: React.MutableRefObject<string | null>;
  animationStateRef: React.MutableRefObject<{ scale: number; focusX: number; focusY: number }>;
  blurFilterRef: React.MutableRefObject<BlurFilter | null>;
  isDraggingFocusRef: React.MutableRefObject<boolean>;
  stageSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  videoSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  baseScaleRef: React.MutableRefObject<number>;
  baseOffsetRef: React.MutableRefObject<{ x: number; y: number }>;
  baseMaskRef: React.MutableRefObject<{ x: number; y: number; width: number; height: number }>;
  cropBoundsRef: React.MutableRefObject<{ startX: number; endX: number; startY: number; endY: number }>;
  maskGraphicsRef: React.MutableRefObject<Graphics | null>;
  isPlayingRef: React.MutableRefObject<boolean>;
  isSeekingRef: React.MutableRefObject<boolean>;
  allowPlaybackRef: React.MutableRefObject<boolean>;
  lockedVideoDimensionsRef: React.MutableRefObject<{ width: number; height: number } | null>;
  layoutVideoContentRef: React.MutableRefObject<(() => void) | null>;
  trimRegionsRef: React.MutableRefObject<TrimRegion[]>;
  speedRegionsRef: React.MutableRefObject<SpeedRegion[]>;
  motionBlurEnabledRef: React.MutableRefObject<boolean>;
  videoReadyRafRef: React.MutableRefObject<number | null>;
}

export function useVideoRefs(isPlaying: boolean, motionBlurEnabled: boolean): VideoRefs {
  return {
    videoRef: useRef<HTMLVideoElement | null>(null),
    containerRef: useRef<HTMLDivElement | null>(null),
    appRef: useRef<Application | null>(null),
    videoSpriteRef: useRef<Sprite | null>(null),
    videoContainerRef: useRef<Container | null>(null),
    cameraContainerRef: useRef<Container | null>(null),
    timeUpdateAnimationRef: useRef<number | null>(null),
    overlayRef: useRef<HTMLDivElement | null>(null),
    focusIndicatorRef: useRef<HTMLDivElement | null>(null),
    currentTimeRef: useRef(0),
    zoomRegionsRef: useRef<ZoomRegion[]>([]),
    selectedZoomIdRef: useRef<string | null>(null),
    animationStateRef: useRef({ scale: 1, focusX: DEFAULT_FOCUS.cx, focusY: DEFAULT_FOCUS.cy }),
    blurFilterRef: useRef<BlurFilter | null>(null),
    isDraggingFocusRef: useRef(false),
    stageSizeRef: useRef({ width: 0, height: 0 }),
    videoSizeRef: useRef({ width: 0, height: 0 }),
    baseScaleRef: useRef(1),
    baseOffsetRef: useRef({ x: 0, y: 0 }),
    baseMaskRef: useRef({ x: 0, y: 0, width: 0, height: 0 }),
    cropBoundsRef: useRef({ startX: 0, endX: 0, startY: 0, endY: 0 }),
    maskGraphicsRef: useRef<Graphics | null>(null),
    isPlayingRef: useRef(isPlaying),
    isSeekingRef: useRef(false),
    allowPlaybackRef: useRef(false),
    lockedVideoDimensionsRef: useRef<{ width: number; height: number } | null>(null),
    layoutVideoContentRef: useRef<(() => void) | null>(null),
    trimRegionsRef: useRef<TrimRegion[]>([]),
    speedRegionsRef: useRef<SpeedRegion[]>([]),
    motionBlurEnabledRef: useRef(motionBlurEnabled),
    videoReadyRafRef: useRef<number | null>(null),
  };
}
