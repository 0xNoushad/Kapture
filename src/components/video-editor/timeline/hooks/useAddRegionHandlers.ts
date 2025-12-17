import { useCallback } from "react";
import { toast } from "sonner";
import type { Span } from "dnd-timeline";
import type { ZoomRegion, TrimRegion, AnnotationRegion, SpeedRegion } from "../../types";

interface UseAddRegionHandlersProps {
  videoDuration: number;
  totalMs: number;
  currentTimeMs: number;
  zoomRegions: ZoomRegion[];
  trimRegions: TrimRegion[];
  annotationRegions: AnnotationRegion[];
  speedRegions: SpeedRegion[];
  onZoomAdded: (span: Span) => void;
  onTrimAdded?: (span: Span) => void;
  onAnnotationAdded?: (span: Span) => void;
  onSpeedAdded?: (span: Span) => void;
}

export function useAddRegionHandlers({
  videoDuration,
  totalMs,
  currentTimeMs,
  zoomRegions,
  trimRegions,
  annotationRegions,
  speedRegions,
  onZoomAdded,
  onTrimAdded,
  onAnnotationAdded,
  onSpeedAdded,
}: UseAddRegionHandlersProps) {
  const handleAddZoom = useCallback(() => {
    if (!videoDuration || videoDuration === 0 || totalMs === 0) return;
    const defaultDuration = Math.min(1000, totalMs);
    if (defaultDuration <= 0) return;

    const startPos = Math.max(0, Math.min(currentTimeMs, totalMs));
    const sorted = [...zoomRegions].sort((a, b) => a.startMs - b.startMs);
    const nextRegion = sorted.find(region => region.startMs > startPos);
    const gapToNext = nextRegion ? nextRegion.startMs - startPos : totalMs - startPos;
    const isOverlapping = sorted.some(region => startPos >= region.startMs && startPos < region.endMs);
    
    if (isOverlapping || gapToNext <= 0) {
      toast.error("Cannot place zoom here", { description: "Zoom already exists at this location or not enough space available." });
      return;
    }
    onZoomAdded({ start: startPos, end: startPos + Math.min(1000, gapToNext) });
  }, [videoDuration, totalMs, currentTimeMs, zoomRegions, onZoomAdded]);

  const handleAddTrim = useCallback(() => {
    if (!videoDuration || videoDuration === 0 || totalMs === 0 || !onTrimAdded) return;
    const defaultDuration = Math.min(1000, totalMs);
    if (defaultDuration <= 0) return;

    const startPos = Math.max(0, Math.min(currentTimeMs, totalMs));
    const sorted = [...trimRegions].sort((a, b) => a.startMs - b.startMs);
    const nextRegion = sorted.find(region => region.startMs > startPos);
    const gapToNext = nextRegion ? nextRegion.startMs - startPos : totalMs - startPos;
    const isOverlapping = sorted.some(region => startPos >= region.startMs && startPos < region.endMs);
    
    if (isOverlapping || gapToNext <= 0) {
      toast.error("Cannot place trim here", { description: "Trim already exists at this location or not enough space available." });
      return;
    }
    onTrimAdded({ start: startPos, end: startPos + Math.min(1000, gapToNext) });
  }, [videoDuration, totalMs, currentTimeMs, trimRegions, onTrimAdded]);

  const handleAddAnnotation = useCallback(() => {
    if (!videoDuration || videoDuration === 0 || totalMs === 0 || !onAnnotationAdded) return;
    const defaultDuration = Math.min(1000, totalMs);
    if (defaultDuration <= 0) return;

    let startPos = Math.max(0, Math.min(currentTimeMs, totalMs));
    if (startPos + 100 > totalMs) startPos = Math.max(0, totalMs - defaultDuration);
    
    const overlappingCount = annotationRegions.filter(region => startPos >= region.startMs && startPos < region.endMs).length;
    if (overlappingCount >= 3) {
      toast.error("Too many annotations", { description: "Maximum 3 annotations can overlap at the same time." });
      return;
    }
    onAnnotationAdded({ start: startPos, end: Math.min(startPos + defaultDuration, totalMs) });
  }, [videoDuration, totalMs, currentTimeMs, annotationRegions, onAnnotationAdded]);

  const handleAddSpeed = useCallback(() => {
    if (!videoDuration || videoDuration === 0 || totalMs === 0 || !onSpeedAdded) return;
    const defaultDuration = Math.min(1000, totalMs);
    if (defaultDuration <= 0) return;

    const startPos = Math.max(0, Math.min(currentTimeMs, totalMs));
    const sorted = [...speedRegions].sort((a, b) => a.startMs - b.startMs);
    const nextRegion = sorted.find(region => region.startMs > startPos);
    const gapToNext = nextRegion ? nextRegion.startMs - startPos : totalMs - startPos;
    const isOverlapping = sorted.some(region => startPos >= region.startMs && startPos < region.endMs);
    
    if (isOverlapping || gapToNext <= 0) {
      toast.error("Cannot place speed here", { description: "Speed already exists at this location or not enough space available." });
      return;
    }
    onSpeedAdded({ start: startPos, end: startPos + Math.min(1000, gapToNext) });
  }, [videoDuration, totalMs, currentTimeMs, speedRegions, onSpeedAdded]);

  return { handleAddZoom, handleAddTrim, handleAddAnnotation, handleAddSpeed };
}
