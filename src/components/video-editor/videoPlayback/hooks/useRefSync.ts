import { useEffect } from 'react';
import type { ZoomRegion, TrimRegion, SpeedRegion } from '../../types';

interface UseRefSyncProps {
  zoomRegions: ZoomRegion[];
  zoomRegionsRef: React.MutableRefObject<ZoomRegion[]>;
  selectedZoomId: string | null;
  selectedZoomIdRef: React.MutableRefObject<string | null>;
  isPlaying: boolean;
  isPlayingRef: React.MutableRefObject<boolean>;
  trimRegions: TrimRegion[];
  trimRegionsRef: React.MutableRefObject<TrimRegion[]>;
  speedRegions: SpeedRegion[];
  speedRegionsRef: React.MutableRefObject<SpeedRegion[]>;
  motionBlurEnabled: boolean;
  motionBlurEnabledRef: React.MutableRefObject<boolean>;
}

export function useRefSync({
  zoomRegions,
  zoomRegionsRef,
  selectedZoomId,
  selectedZoomIdRef,
  isPlaying,
  isPlayingRef,
  trimRegions,
  trimRegionsRef,
  speedRegions,
  speedRegionsRef,
  motionBlurEnabled,
  motionBlurEnabledRef,
}: UseRefSyncProps): void {
  useEffect(() => {
    zoomRegionsRef.current = zoomRegions;
  }, [zoomRegions, zoomRegionsRef]);

  useEffect(() => {
    selectedZoomIdRef.current = selectedZoomId;
  }, [selectedZoomId, selectedZoomIdRef]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying, isPlayingRef]);

  useEffect(() => {
    trimRegionsRef.current = trimRegions;
  }, [trimRegions, trimRegionsRef]);

  useEffect(() => {
    speedRegionsRef.current = speedRegions;
  }, [speedRegions, speedRegionsRef]);

  useEffect(() => {
    motionBlurEnabledRef.current = motionBlurEnabled;
  }, [motionBlurEnabled, motionBlurEnabledRef]);
}
