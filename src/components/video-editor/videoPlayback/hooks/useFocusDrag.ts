import type React from 'react';
import { useCallback } from 'react';
import type { ZoomRegion, ZoomFocus, ZoomDepth } from '../../types';
import { clamp01 } from '../mathUtils';

interface UseFocusDragProps {
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
  selectedZoomIdRef: React.MutableRefObject<string | null>;
  zoomRegionsRef: React.MutableRefObject<ZoomRegion[]>;
  isPlayingRef: React.MutableRefObject<boolean>;
  isDraggingFocusRef: React.MutableRefObject<boolean>;
  stageSizeRef: React.MutableRefObject<{ width: number; height: number }>;
  onSelectZoom: (id: string | null) => void;
  onZoomFocusChange: (id: string, focus: ZoomFocus) => void;
  clampFocusToStage: (focus: ZoomFocus, depth: ZoomDepth) => ZoomFocus;
  updateOverlayForRegion: (region: ZoomRegion | null, focusOverride?: ZoomFocus) => void;
}

export function useFocusDrag({
  overlayRef,
  selectedZoomIdRef,
  zoomRegionsRef,
  isPlayingRef,
  isDraggingFocusRef,
  stageSizeRef,
  onSelectZoom,
  onZoomFocusChange,
  clampFocusToStage,
  updateOverlayForRegion,
}: UseFocusDragProps) {
  const updateFocusFromClientPoint = useCallback((clientX: number, clientY: number) => {
    const overlayEl = overlayRef.current;
    if (!overlayEl) return;

    const regionId = selectedZoomIdRef.current;
    if (!regionId) return;

    const region = zoomRegionsRef.current.find((r) => r.id === regionId);
    if (!region) return;

    const rect = overlayEl.getBoundingClientRect();
    const stageWidth = rect.width;
    const stageHeight = rect.height;

    if (!stageWidth || !stageHeight) return;

    stageSizeRef.current = { width: stageWidth, height: stageHeight };

    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    const unclampedFocus: ZoomFocus = {
      cx: clamp01(localX / stageWidth),
      cy: clamp01(localY / stageHeight),
    };
    const clampedFocus = clampFocusToStage(unclampedFocus, region.depth);

    onZoomFocusChange(region.id, clampedFocus);
    updateOverlayForRegion({ ...region, focus: clampedFocus }, clampedFocus);
  }, [overlayRef, selectedZoomIdRef, zoomRegionsRef, stageSizeRef, clampFocusToStage, onZoomFocusChange, updateOverlayForRegion]);

  const handleOverlayPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (isPlayingRef.current) return;
    const regionId = selectedZoomIdRef.current;
    if (!regionId) return;
    const region = zoomRegionsRef.current.find((r) => r.id === regionId);
    if (!region) return;
    onSelectZoom(region.id);
    event.preventDefault();
    isDraggingFocusRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFocusFromClientPoint(event.clientX, event.clientY);
  }, [isPlayingRef, selectedZoomIdRef, zoomRegionsRef, isDraggingFocusRef, onSelectZoom, updateFocusFromClientPoint]);

  const handleOverlayPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingFocusRef.current) return;
    event.preventDefault();
    updateFocusFromClientPoint(event.clientX, event.clientY);
  }, [isDraggingFocusRef, updateFocusFromClientPoint]);

  const endFocusDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingFocusRef.current) return;
    isDraggingFocusRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch { /* empty */ }
  }, [isDraggingFocusRef]);

  return {
    handleOverlayPointerDown,
    handleOverlayPointerMove,
    handleOverlayPointerUp: endFocusDrag,
    handleOverlayPointerLeave: endFocusDrag,
  };
}
