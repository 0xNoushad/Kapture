import { useEffect } from 'react';
import type { SpeedRegion } from '../../types';

interface UseSpeedControlProps {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  currentTime: number;
  speedRegions: SpeedRegion[];
}

export function useSpeedControl({ videoRef, currentTime, speedRegions }: UseSpeedControlProps): void {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const timeMs = Math.round(currentTime * 1000);
    
    const activeSpeedRegion = speedRegions.find(
      region => timeMs >= region.startMs && timeMs < region.endMs
    );

    const targetRate = activeSpeedRegion ? activeSpeedRegion.speed : 1;
    
    if (video.playbackRate !== targetRate) {
      video.playbackRate = targetRate;
    }
  }, [videoRef, currentTime, speedRegions]);
}
