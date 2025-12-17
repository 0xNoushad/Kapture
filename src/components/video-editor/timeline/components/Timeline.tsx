import { useCallback, useRef } from "react";
import { useTimelineContext } from "dnd-timeline";
import Row from "../Row";
import Item from "../Item";
import { PlaybackCursor } from "./PlaybackCursor";
import { TimelineAxis } from "./TimelineAxis";
import {
  ZOOM_ROW_ID,
  TRIM_ROW_ID,
  ANNOTATION_ROW_1_ID,
  ANNOTATION_ROW_2_ID,
  ANNOTATION_ROW_3_ID,
  SPEED_ROW_ID,
} from "../utils";
import type { Span } from "dnd-timeline";

export interface TimelineRenderItem {
  id: string;
  rowId: string;
  span: Span;
  label: string;
  zoomDepth?: number;
  speedMultiplier?: number;
  variant: 'zoom' | 'trim' | 'annotation' | 'speed';
}

interface TimelineProps {
  items: TimelineRenderItem[];
  videoDurationMs: number;
  currentTimeMs: number;
  onSeek?: (time: number) => void;
  onSelectZoom?: (id: string | null) => void;
  onSelectTrim?: (id: string | null) => void;
  onSelectAnnotation?: (id: string | null) => void;
  onSelectSpeed?: (id: string | null) => void;
  selectedZoomId: string | null;
  selectedTrimId?: string | null;
  selectedAnnotationId?: string | null;
  selectedSpeedId?: string | null;
}

export function Timeline({
  items,
  videoDurationMs,
  currentTimeMs,
  onSeek,
  onSelectZoom,
  onSelectTrim,
  onSelectAnnotation,
  onSelectSpeed,
  selectedZoomId,
  selectedTrimId,
  selectedAnnotationId,
  selectedSpeedId,
}: TimelineProps) {
  const { setTimelineRef, style, sidebarWidth, range, pixelsToValue } = useTimelineContext();
  const localTimelineRef = useRef<HTMLDivElement | null>(null);

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    setTimelineRef(node);
    localTimelineRef.current = node;
  }, [setTimelineRef]);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || videoDurationMs <= 0) return;
    
    onSelectZoom?.(null);
    onSelectTrim?.(null);
    onSelectAnnotation?.(null);
    onSelectSpeed?.(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - sidebarWidth;
    
    if (clickX < 0) return;
    
    const relativeMs = pixelsToValue(clickX);
    const absoluteMs = Math.max(0, Math.min(range.start + relativeMs, videoDurationMs));
    onSeek(absoluteMs / 1000);
  }, [onSeek, onSelectZoom, onSelectTrim, onSelectAnnotation, onSelectSpeed, videoDurationMs, sidebarWidth, range.start, pixelsToValue]);

  const zoomItems = items.filter(item => item.rowId === ZOOM_ROW_ID);
  const trimItems = items.filter(item => item.rowId === TRIM_ROW_ID);
  const annotationRow1Items = items.filter(item => item.rowId === ANNOTATION_ROW_1_ID);
  const annotationRow2Items = items.filter(item => item.rowId === ANNOTATION_ROW_2_ID);
  const annotationRow3Items = items.filter(item => item.rowId === ANNOTATION_ROW_3_ID);
  const speedItems = items.filter(item => item.rowId === SPEED_ROW_ID);

  return (
    <div
      ref={setRefs}
      style={style}
      className="select-none bg-[transparent] min-h-[140px] relative group"
      onClick={handleTimelineClick}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px)] bg-[length:20px_100%] pointer-events-none" />
      <TimelineAxis videoDurationMs={videoDurationMs} currentTimeMs={currentTimeMs} />
      <PlaybackCursor 
        currentTimeMs={currentTimeMs} 
        videoDurationMs={videoDurationMs} 
        onSeek={onSeek}
        timelineRef={localTimelineRef}
      />
      
      <Row id={ZOOM_ROW_ID}>
        {zoomItems.map((item) => (
          <Item key={item.id} id={item.id} rowId={item.rowId} span={item.span} isSelected={item.id === selectedZoomId} onSelect={() => onSelectZoom?.(item.id)} zoomDepth={item.zoomDepth} variant="zoom">{item.label}</Item>
        ))}
        {trimItems.map((item) => (
          <Item key={item.id} id={item.id} rowId={item.rowId} span={item.span} isSelected={item.id === selectedTrimId} onSelect={() => onSelectTrim?.(item.id)} variant="trim">{item.label}</Item>
        ))}
      </Row>

      <Row id={SPEED_ROW_ID}>
        {speedItems.map((item) => (
          <Item key={item.id} id={item.id} rowId={item.rowId} span={item.span} isSelected={item.id === selectedSpeedId} onSelect={() => onSelectSpeed?.(item.id)} variant="speed" speedMultiplier={item.speedMultiplier}>{item.label}</Item>
        ))}
      </Row>

      <Row id={ANNOTATION_ROW_1_ID}>
        {annotationRow1Items.map((item) => (
          <Item key={item.id} id={item.id} rowId={item.rowId} span={item.span} isSelected={item.id === selectedAnnotationId} onSelect={() => onSelectAnnotation?.(item.id)} variant="annotation">{item.label}</Item>
        ))}
      </Row>

      {annotationRow2Items.length > 0 && (
        <Row id={ANNOTATION_ROW_2_ID}>
          {annotationRow2Items.map((item) => (
            <Item key={item.id} id={item.id} rowId={item.rowId} span={item.span} isSelected={item.id === selectedAnnotationId} onSelect={() => onSelectAnnotation?.(item.id)} variant="annotation">{item.label}</Item>
          ))}
        </Row>
      )}

      {annotationRow3Items.length > 0 && (
        <Row id={ANNOTATION_ROW_3_ID}>
          {annotationRow3Items.map((item) => (
            <Item key={item.id} id={item.id} rowId={item.rowId} span={item.span} isSelected={item.id === selectedAnnotationId} onSelect={() => onSelectAnnotation?.(item.id)} variant="annotation">{item.label}</Item>
          ))}
        </Row>
      )}
    </div>
  );
}
