import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import type { Range, Span } from "dnd-timeline";
import type { ZoomRegion, TrimRegion, AnnotationRegion, SpeedRegion } from "../types";
import type { AspectRatio } from "@/utils/aspectRatioUtils";
import TimelineWrapper from "./TimelineWrapper";
import KeyframeMarkers from "./KeyframeMarkers";
import { Timeline, TimelineToolbar } from "./components";
import { calculateTimelineScale, createInitialRange } from "./utils";
import { useTimelineItems, useAddRegionHandlers, useTimelineKeyboard } from "./hooks";

interface TimelineEditorProps {
  videoDuration: number;
  currentTime: number;
  onSeek?: (time: number) => void;
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
  zoomRegions: ZoomRegion[];
  onZoomAdded: (span: Span) => void;
  onZoomSpanChange: (id: string, span: Span) => void;
  onZoomDelete: (id: string) => void;
  selectedZoomId: string | null;
  onSelectZoom: (id: string | null) => void;
  trimRegions?: TrimRegion[];
  onTrimAdded?: (span: Span) => void;
  onTrimSpanChange?: (id: string, span: Span) => void;
  onTrimDelete?: (id: string) => void;
  selectedTrimId?: string | null;
  onSelectTrim?: (id: string | null) => void;
  annotationRegions?: AnnotationRegion[];
  onAnnotationAdded?: (span: Span) => void;
  onAnnotationSpanChange?: (id: string, span: Span) => void;
  onAnnotationDelete?: (id: string) => void;
  selectedAnnotationId?: string | null;
  onSelectAnnotation?: (id: string | null) => void;
  speedRegions?: SpeedRegion[];
  onSpeedAdded?: (span: Span) => void;
  onSpeedSpanChange?: (id: string, span: Span) => void;
  onSpeedDelete?: (id: string) => void;
  selectedSpeedId?: string | null;
  onSelectSpeed?: (id: string | null) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (aspectRatio: AspectRatio) => void;
  hideAspectRatio?: boolean;
}

export default function TimelineEditor({
  videoDuration,
  currentTime,
  onSeek,
  zoomRegions,
  onZoomAdded,
  onZoomSpanChange,
  onZoomDelete,
  selectedZoomId,
  onSelectZoom,
  trimRegions = [],
  onTrimAdded,
  onTrimSpanChange,
  onTrimDelete,
  selectedTrimId,
  onSelectTrim,
  annotationRegions = [],
  onAnnotationAdded,
  onAnnotationSpanChange,
  onAnnotationDelete,
  selectedAnnotationId,
  onSelectAnnotation,
  speedRegions = [],
  onSpeedAdded,
  onSpeedSpanChange,
  onSpeedDelete,
  selectedSpeedId,
  onSelectSpeed,
  aspectRatio,
  onAspectRatioChange,
  isPlaying = false,
  onTogglePlayPause,
  hideAspectRatio = false,
}: TimelineEditorProps) {
  const totalMs = useMemo(() => Math.max(0, Math.round(videoDuration * 1000)), [videoDuration]);
  const currentTimeMs = useMemo(() => Math.round(currentTime * 1000), [currentTime]);
  const [range, setRange] = useState<Range>(() => createInitialRange(totalMs));
  
  const visibleDurationSeconds = (range.end - range.start) / 1000;
  const timelineScale = useMemo(() => calculateTimelineScale(visibleDurationSeconds), [visibleDurationSeconds]);
  const safeMinDurationMs = useMemo(
    () => (totalMs > 0 ? Math.min(timelineScale.minItemDurationMs, totalMs) : timelineScale.minItemDurationMs),
    [timelineScale.minItemDurationMs, totalMs],
  );

  const [keyframes, setKeyframes] = useState<{ id: string; time: number }[]>([]);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);

  // Hooks
  const timelineItems = useTimelineItems({ zoomRegions, trimRegions, annotationRegions, speedRegions });
  
  const { handleAddZoom, handleAddTrim, handleAddAnnotation, handleAddSpeed } = useAddRegionHandlers({
    videoDuration, totalMs, currentTimeMs, zoomRegions, trimRegions, annotationRegions, speedRegions,
    onZoomAdded, onTrimAdded, onAnnotationAdded, onSpeedAdded,
  });

  // Keyframe handlers
  const addKeyframe = useCallback(() => {
    if (totalMs === 0) return;
    const time = Math.max(0, Math.min(currentTimeMs, totalMs));
    if (keyframes.some(kf => Math.abs(kf.time - time) < 1)) return;
    setKeyframes(prev => [...prev, { id: uuidv4(), time }]);
  }, [currentTimeMs, totalMs, keyframes]);

  const deleteSelectedKeyframe = useCallback(() => {
    if (!selectedKeyframeId) return;
    setKeyframes(prev => prev.filter(kf => kf.id !== selectedKeyframeId));
    setSelectedKeyframeId(null);
  }, [selectedKeyframeId]);

  // Delete handlers
  const deleteSelectedZoom = useCallback(() => {
    if (!selectedZoomId) return;
    onZoomDelete(selectedZoomId);
    onSelectZoom(null);
  }, [selectedZoomId, onZoomDelete, onSelectZoom]);

  const deleteSelectedTrim = useCallback(() => {
    if (!selectedTrimId || !onTrimDelete || !onSelectTrim) return;
    onTrimDelete(selectedTrimId);
    onSelectTrim(null);
  }, [selectedTrimId, onTrimDelete, onSelectTrim]);

  const deleteSelectedAnnotation = useCallback(() => {
    if (!selectedAnnotationId || !onAnnotationDelete || !onSelectAnnotation) return;
    onAnnotationDelete(selectedAnnotationId);
    onSelectAnnotation(null);
  }, [selectedAnnotationId, onAnnotationDelete, onSelectAnnotation]);

  const deleteSelectedSpeed = useCallback(() => {
    if (!selectedSpeedId || !onSpeedDelete || !onSelectSpeed) return;
    onSpeedDelete(selectedSpeedId);
    onSelectSpeed(null);
  }, [selectedSpeedId, onSpeedDelete, onSelectSpeed]);

  // Keyboard shortcuts
  useTimelineKeyboard({
    addKeyframe, handleAddZoom, handleAddTrim, handleAddAnnotation, handleAddSpeed,
    deleteSelectedKeyframe, deleteSelectedZoom, deleteSelectedTrim, deleteSelectedAnnotation, deleteSelectedSpeed,
    selectedKeyframeId, selectedZoomId, selectedTrimId: selectedTrimId ?? null, selectedAnnotationId: selectedAnnotationId ?? null, selectedSpeedId: selectedSpeedId ?? null,
    annotationRegions, currentTime, onSelectAnnotation,
  });

  // Effects
  useEffect(() => { setRange(createInitialRange(totalMs)); }, [totalMs]);

  // Auto-scroll timeline
  useEffect(() => {
    if (totalMs === 0) return;
    const visibleRange = range.end - range.start;
    const fullRange = totalMs * 1.04;
    if (visibleRange >= fullRange * 0.95 || currentTimeMs <= 0) return;
    
    const padding = visibleRange * 0.1;
    if (currentTimeMs > range.end - padding) {
      const newStart = Math.max(0, Math.min(currentTimeMs - visibleRange + padding, totalMs - visibleRange));
      setRange({ start: newStart, end: newStart + visibleRange });
    } else if (currentTimeMs < range.start + padding && currentTimeMs > 0) {
      const newStart = Math.max(0, currentTimeMs - padding);
      setRange({ start: newStart, end: newStart + visibleRange });
    }
  }, [currentTimeMs, range.end, range.start, totalMs]);

  // Normalize regions
  useEffect(() => {
    if (totalMs === 0 || safeMinDurationMs <= 0) return;

    const normalizeRegion = (region: { id: string; startMs: number; endMs: number }, onChange: (id: string, span: Span) => void) => {
      const clampedStart = Math.max(0, Math.min(region.startMs, totalMs));
      const minEnd = clampedStart + safeMinDurationMs;
      const clampedEnd = Math.min(totalMs, Math.max(minEnd, region.endMs));
      const normalizedStart = Math.max(0, Math.min(clampedStart, totalMs - safeMinDurationMs));
      const normalizedEnd = Math.max(minEnd, Math.min(clampedEnd, totalMs));
      if (normalizedStart !== region.startMs || normalizedEnd !== region.endMs) {
        onChange(region.id, { start: normalizedStart, end: normalizedEnd });
      }
    };

    zoomRegions.forEach(r => normalizeRegion(r, onZoomSpanChange));
    trimRegions.forEach(r => onTrimSpanChange && normalizeRegion(r, onTrimSpanChange));
  }, [zoomRegions, trimRegions, totalMs, safeMinDurationMs, onZoomSpanChange, onTrimSpanChange]);

  const hasOverlap = useCallback((newSpan: Span, excludeId?: string): boolean => {
    const isZoomItem = zoomRegions.some(r => r.id === excludeId);
    const isTrimItem = trimRegions.some(r => r.id === excludeId);
    const isAnnotationItem = annotationRegions.some(r => r.id === excludeId);
    const isSpeedItem = speedRegions.some(r => r.id === excludeId);

    if (isAnnotationItem) return false;

    const checkOverlap = (regions: (ZoomRegion | TrimRegion | SpeedRegion)[]) => {
      return regions.some((region) => {
        if (region.id === excludeId) return false;
        const gapBefore = newSpan.start - region.endMs;
        const gapAfter = region.startMs - newSpan.end;
        if (gapBefore > 0 && gapBefore <= 2) return true;
        if (gapAfter > 0 && gapAfter <= 2) return true;
        return !(newSpan.end <= region.startMs || newSpan.start >= region.endMs);
      });
    };

    if (isZoomItem) return checkOverlap(zoomRegions);
    if (isTrimItem) return checkOverlap(trimRegions);
    if (isSpeedItem) return checkOverlap(speedRegions);
    return false;
  }, [zoomRegions, trimRegions, annotationRegions, speedRegions]);

  const handleItemSpanChange = useCallback((id: string, span: Span) => {
    if (zoomRegions.some(r => r.id === id)) onZoomSpanChange(id, span);
    else if (trimRegions.some(r => r.id === id)) onTrimSpanChange?.(id, span);
    else if (annotationRegions.some(r => r.id === id)) onAnnotationSpanChange?.(id, span);
    else if (speedRegions.some(r => r.id === id)) onSpeedSpanChange?.(id, span);
  }, [zoomRegions, trimRegions, annotationRegions, speedRegions, onZoomSpanChange, onTrimSpanChange, onAnnotationSpanChange, onSpeedSpanChange]);

  const clampedRange = useMemo<Range>(() => {
    if (totalMs === 0) return range;
    return { start: Math.max(0, Math.min(range.start, totalMs)), end: Math.min(range.end, totalMs) };
  }, [range, totalMs]);

  if (!videoDuration || videoDuration === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center rounded-lg bg-[transparent] gap-3">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <Plus className="w-6 h-6 text-white/30" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white/70">No Video Loaded</p>
          <p className="text-xs text-white/40 mt-1">Drag and drop a video to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col bg-[transparent] overflow-hidden"
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const visibleRange = range.end - range.start;
        
        if (e.ctrlKey || e.metaKey) {
          const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;
          const center = (range.start + range.end) / 2;
          const newRange = Math.max(3000, Math.min(visibleRange * zoomFactor, totalMs));
          const newStart = Math.max(0, center - newRange / 2);
          setRange({ start: newStart, end: Math.min(totalMs, newStart + newRange) });
          return;
        }
        
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const panAmount = visibleRange * 0.003 * delta;
        const newStart = Math.max(0, Math.min(range.start + panAmount, totalMs - visibleRange));
        setRange({ start: newStart, end: newStart + visibleRange });
      }}
    >
      <TimelineToolbar
        onAddZoom={handleAddZoom}
        onAddTrim={handleAddTrim}
        onAddAnnotation={handleAddAnnotation}
        onAddSpeed={handleAddSpeed}
        aspectRatio={aspectRatio}
        onAspectRatioChange={onAspectRatioChange}
        isPlaying={isPlaying}
        onTogglePlayPause={onTogglePlayPause}
        currentTime={currentTime}
        videoDuration={videoDuration}
        onSeek={onSeek}
        totalMs={totalMs}
        range={range}
        onRangeChange={setRange}
        hideAspectRatio={hideAspectRatio}
      />
      <div className="flex-1 overflow-hidden bg-[transparent] relative px-4" onClick={() => setSelectedKeyframeId(null)}>
        <TimelineWrapper
          range={clampedRange}
          videoDuration={videoDuration}
          hasOverlap={hasOverlap}
          onRangeChange={setRange}
          minItemDurationMs={timelineScale.minItemDurationMs}
          minVisibleRangeMs={timelineScale.minVisibleRangeMs}
          gridSizeMs={timelineScale.gridMs}
          onItemSpanChange={handleItemSpanChange}
        >
          <KeyframeMarkers keyframes={keyframes} selectedKeyframeId={selectedKeyframeId} setSelectedKeyframeId={setSelectedKeyframeId} />
          <Timeline
            items={timelineItems}
            videoDurationMs={totalMs}
            currentTimeMs={currentTimeMs}
            onSeek={onSeek}
            onSelectZoom={onSelectZoom}
            onSelectTrim={onSelectTrim}
            onSelectAnnotation={onSelectAnnotation}
            onSelectSpeed={onSelectSpeed}
            selectedZoomId={selectedZoomId}
            selectedTrimId={selectedTrimId}
            selectedAnnotationId={selectedAnnotationId}
            selectedSpeedId={selectedSpeedId}
          />
        </TimelineWrapper>
      </div>
    </div>
  );
}
