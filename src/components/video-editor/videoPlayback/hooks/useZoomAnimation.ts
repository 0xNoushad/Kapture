import { useEffect } from 'react';
import type { Application, Container, Sprite, BlurFilter } from 'pixi.js';
import { ZOOM_DEPTH_SCALES, type ZoomRegion, type ZoomFocus, type ZoomDepth } from '../../types';
import { DEFAULT_FOCUS, SMOOTHING_FACTOR, MIN_DELTA } from '../constants';
import { findDominantRegion } from '../zoomRegionUtils';
import { applyZoomTransform } from '../zoomTransform';

interface UseZoomAnimationProps {
  pixiReady: boolean;
  videoReady: boolean;
  appRef: React.MutableRefObject<Application | null>;
  videoSpriteRef: React.MutableRefObject<Sprite | null>;
  videoContainerRef: React.MutableRefObject<Container | null>;
  cameraContainerRef: React.MutableRefObject<Container | null>;
  zoomRegionsRef: React.MutableRefObject<ZoomRegion[]>;
  selectedZoomIdRef: React.MutableRefObject<string | null>;
  isPlayingRef: React.MutableRefObject<boolean>;
  animationStateRef: React.MutableRefObject<{ scale: number; focusX: number; focusY: number }>;
  blurFilterRef: React.MutableRefObject<BlurFilter | null>;
  stageSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  baseMaskRef: React.MutableRefObject<{ x: number; y: number; width: number; height: number }>;
  currentTimeRef: React.MutableRefObject<number>;
  motionBlurEnabledRef: React.MutableRefObject<boolean>;
  clampFocusToStage: (focus: ZoomFocus, depth: ZoomDepth) => ZoomFocus;
}

export function useZoomAnimation({
  pixiReady, videoReady, appRef, videoSpriteRef, videoContainerRef, cameraContainerRef,
  zoomRegionsRef, selectedZoomIdRef, isPlayingRef, animationStateRef, blurFilterRef,
  stageSizeRef, baseMaskRef, currentTimeRef, motionBlurEnabledRef, clampFocusToStage,
}: UseZoomAnimationProps): void {
  useEffect(() => {
    if (!pixiReady || !videoReady) return;
    const app = appRef.current;
    const videoSprite = videoSpriteRef.current;
    const videoContainer = videoContainerRef.current;
    if (!app || !videoSprite || !videoContainer) return;

    const ticker = () => {
      const { region, strength } = findDominantRegion(zoomRegionsRef.current, currentTimeRef.current);
      let targetScaleFactor = 1;
      let targetFocus = DEFAULT_FOCUS;

      const selectedId = selectedZoomIdRef.current;
      const shouldShowUnzoomedView = selectedId !== null && !isPlayingRef.current;

      if (region && strength > 0 && !shouldShowUnzoomedView) {
        const zoomScale = ZOOM_DEPTH_SCALES[region.depth];
        const regionFocus = clampFocusToStage(region.focus, region.depth);
        targetScaleFactor = 1 + (zoomScale - 1) * strength;
        targetFocus = {
          cx: DEFAULT_FOCUS.cx + (regionFocus.cx - DEFAULT_FOCUS.cx) * strength,
          cy: DEFAULT_FOCUS.cy + (regionFocus.cy - DEFAULT_FOCUS.cy) * strength,
        };
      }

      const state = animationStateRef.current;
      const prevScale = state.scale, prevFocusX = state.focusX, prevFocusY = state.focusY;

      state.scale = Math.abs(targetScaleFactor - state.scale) > MIN_DELTA
        ? state.scale + (targetScaleFactor - state.scale) * SMOOTHING_FACTOR : targetScaleFactor;
      state.focusX = Math.abs(targetFocus.cx - state.focusX) > MIN_DELTA
        ? state.focusX + (targetFocus.cx - state.focusX) * SMOOTHING_FACTOR : targetFocus.cx;
      state.focusY = Math.abs(targetFocus.cy - state.focusY) > MIN_DELTA
        ? state.focusY + (targetFocus.cy - state.focusY) * SMOOTHING_FACTOR : targetFocus.cy;

      const motionIntensity = Math.max(
        Math.abs(state.scale - prevScale), Math.abs(state.focusX - prevFocusX), Math.abs(state.focusY - prevFocusY)
      );

      const cameraContainer = cameraContainerRef.current;
      if (cameraContainer) {
        applyZoomTransform({
          cameraContainer, blurFilter: blurFilterRef.current, stageSize: stageSizeRef.current,
          baseMask: baseMaskRef.current, zoomScale: state.scale, focusX: state.focusX, focusY: state.focusY,
          motionIntensity, isPlaying: isPlayingRef.current, motionBlurEnabled: motionBlurEnabledRef.current,
        });
      }
    };

    app.ticker.add(ticker);
    return () => { app?.ticker?.remove(ticker); };
  }, [pixiReady, videoReady, appRef, videoSpriteRef, videoContainerRef, cameraContainerRef, zoomRegionsRef, selectedZoomIdRef, isPlayingRef, animationStateRef, blurFilterRef, stageSizeRef, baseMaskRef, currentTimeRef, motionBlurEnabledRef, clampFocusToStage]);
}
