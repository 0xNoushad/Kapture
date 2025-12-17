import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Span } from 'dnd-timeline';
import {
  DEFAULT_ZOOM_DEPTH,
  clampFocusToDepth,
  DEFAULT_ANNOTATION_POSITION,
  DEFAULT_ANNOTATION_SIZE,
  DEFAULT_ANNOTATION_STYLE,
  DEFAULT_FIGURE_DATA,
  DEFAULT_SPEED,
  DEFAULT_VIDEO_TRANSFORM,
  type ZoomDepth,
  type ZoomFocus,
  type ZoomRegion,
  type TrimRegion,
  type AnnotationRegion,
  type FigureData,
  type SpeedRegion,
  type SpeedMultiplier,
  type Keyframe,
  type VideoTransform,
} from '../types';

interface UseRegionHandlersProps {
  // Zoom
  zoomRegions: ZoomRegion[];
  setZoomRegions: React.Dispatch<React.SetStateAction<ZoomRegion[]>>;
  selectedZoomId: string | null;
  setSelectedZoomId: React.Dispatch<React.SetStateAction<string | null>>;
  nextZoomIdRef: React.MutableRefObject<number>;
  // Trim
  trimRegions: TrimRegion[];
  setTrimRegions: React.Dispatch<React.SetStateAction<TrimRegion[]>>;
  selectedTrimId: string | null;
  setSelectedTrimId: React.Dispatch<React.SetStateAction<string | null>>;
  nextTrimIdRef: React.MutableRefObject<number>;
  // Annotation
  annotationRegions: AnnotationRegion[];
  setAnnotationRegions: React.Dispatch<React.SetStateAction<AnnotationRegion[]>>;
  selectedAnnotationId: string | null;
  setSelectedAnnotationId: React.Dispatch<React.SetStateAction<string | null>>;
  nextAnnotationIdRef: React.MutableRefObject<number>;
  nextAnnotationZIndexRef: React.MutableRefObject<number>;
  // Speed
  speedRegions: SpeedRegion[];
  setSpeedRegions: React.Dispatch<React.SetStateAction<SpeedRegion[]>>;
  selectedSpeedId: string | null;
  setSelectedSpeedId: React.Dispatch<React.SetStateAction<string | null>>;
  nextSpeedIdRef: React.MutableRefObject<number>;
  // Keyframe
  keyframes: Keyframe[];
  setKeyframes: React.Dispatch<React.SetStateAction<Keyframe[]>>;
  selectedKeyframeId: string | null;
  setSelectedKeyframeId: React.Dispatch<React.SetStateAction<string | null>>;
  nextKeyframeIdRef: React.MutableRefObject<number>;
}

export function useRegionHandlers(props: UseRegionHandlersProps) {
  const {
    setZoomRegions, selectedZoomId, setSelectedZoomId, nextZoomIdRef,
    setTrimRegions, selectedTrimId, setSelectedTrimId, nextTrimIdRef,
    setAnnotationRegions, selectedAnnotationId, setSelectedAnnotationId, nextAnnotationIdRef, nextAnnotationZIndexRef,
    setSpeedRegions, selectedSpeedId, setSelectedSpeedId, nextSpeedIdRef,
    keyframes, setKeyframes, selectedKeyframeId, setSelectedKeyframeId, nextKeyframeIdRef,
  } = props;

  // Selection handlers
  const handleSelectZoom = useCallback((id: string | null) => {
    setSelectedZoomId(id);
    if (id) {
      setSelectedTrimId(null);
      setSelectedAnnotationId(null);
      setSelectedSpeedId(null);
      setSelectedKeyframeId(null);
    }
  }, [setSelectedZoomId, setSelectedTrimId, setSelectedAnnotationId, setSelectedSpeedId, setSelectedKeyframeId]);

  const handleSelectTrim = useCallback((id: string | null) => {
    setSelectedTrimId(id);
    if (id) {
      setSelectedZoomId(null);
      setSelectedAnnotationId(null);
      setSelectedSpeedId(null);
      setSelectedKeyframeId(null);
    }
  }, [setSelectedZoomId, setSelectedTrimId, setSelectedAnnotationId, setSelectedSpeedId, setSelectedKeyframeId]);

  const handleSelectAnnotation = useCallback((id: string | null) => {
    setSelectedAnnotationId(id);
    if (id) {
      setSelectedZoomId(null);
      setSelectedTrimId(null);
      setSelectedSpeedId(null);
      setSelectedKeyframeId(null);
    }
  }, [setSelectedZoomId, setSelectedTrimId, setSelectedAnnotationId, setSelectedSpeedId, setSelectedKeyframeId]);

  const handleSelectSpeed = useCallback((id: string | null) => {
    setSelectedSpeedId(id);
    if (id) {
      setSelectedZoomId(null);
      setSelectedTrimId(null);
      setSelectedAnnotationId(null);
      setSelectedKeyframeId(null);
    }
  }, [setSelectedZoomId, setSelectedTrimId, setSelectedAnnotationId, setSelectedSpeedId, setSelectedKeyframeId]);

  const handleSelectKeyframe = useCallback((id: string | null) => {
    setSelectedKeyframeId(id);
    if (id) {
      setSelectedZoomId(null);
      setSelectedTrimId(null);
      setSelectedAnnotationId(null);
      setSelectedSpeedId(null);
    }
  }, [setSelectedZoomId, setSelectedTrimId, setSelectedAnnotationId, setSelectedSpeedId, setSelectedKeyframeId]);

  // Zoom handlers
  const handleZoomAdded = useCallback((span: Span) => {
    const id = `zoom-${nextZoomIdRef.current++}`;
    const newRegion: ZoomRegion = {
      id,
      startMs: Math.round(span.start),
      endMs: Math.round(span.end),
      depth: DEFAULT_ZOOM_DEPTH,
      focus: { cx: 0.5, cy: 0.5 },
    };
    setZoomRegions((prev) => [...prev, newRegion]);
    handleSelectZoom(id);
  }, [setZoomRegions, handleSelectZoom, nextZoomIdRef]);

  const handleZoomSpanChange = useCallback((id: string, span: Span) => {
    setZoomRegions((prev) =>
      prev.map((region) =>
        region.id === id
          ? { ...region, startMs: Math.round(span.start), endMs: Math.round(span.end) }
          : region
      )
    );
  }, [setZoomRegions]);

  const handleZoomFocusChange = useCallback((id: string, focus: ZoomFocus) => {
    setZoomRegions((prev) =>
      prev.map((region) =>
        region.id === id
          ? { ...region, focus: clampFocusToDepth(focus) }
          : region
      )
    );
  }, [setZoomRegions]);

  const handleZoomDepthChange = useCallback((depth: ZoomDepth) => {
    if (!selectedZoomId) return;
    setZoomRegions((prev) =>
      prev.map((region) =>
        region.id === selectedZoomId
          ? { ...region, depth, focus: clampFocusToDepth(region.focus) }
          : region
      )
    );
  }, [selectedZoomId, setZoomRegions]);

  const handleZoomDelete = useCallback((id: string) => {
    setZoomRegions((prev) => prev.filter((region) => region.id !== id));
    if (selectedZoomId === id) setSelectedZoomId(null);
  }, [selectedZoomId, setZoomRegions, setSelectedZoomId]);

  // Trim handlers
  const handleTrimAdded = useCallback((span: Span) => {
    const id = `trim-${nextTrimIdRef.current++}`;
    const newRegion: TrimRegion = {
      id,
      startMs: Math.round(span.start),
      endMs: Math.round(span.end),
    };
    setTrimRegions((prev) => [...prev, newRegion]);
    handleSelectTrim(id);
  }, [setTrimRegions, handleSelectTrim, nextTrimIdRef]);

  const handleTrimSpanChange = useCallback((id: string, span: Span) => {
    setTrimRegions((prev) =>
      prev.map((region) =>
        region.id === id
          ? { ...region, startMs: Math.round(span.start), endMs: Math.round(span.end) }
          : region
      )
    );
  }, [setTrimRegions]);

  const handleTrimDelete = useCallback((id: string) => {
    setTrimRegions((prev) => prev.filter((region) => region.id !== id));
    if (selectedTrimId === id) setSelectedTrimId(null);
  }, [selectedTrimId, setTrimRegions, setSelectedTrimId]);

  // Speed handlers
  const handleSpeedAdded = useCallback((span: Span) => {
    const id = `speed-${nextSpeedIdRef.current++}`;
    const newRegion: SpeedRegion = {
      id,
      startMs: Math.round(span.start),
      endMs: Math.round(span.end),
      speed: DEFAULT_SPEED,
    };
    setSpeedRegions((prev) => [...prev, newRegion]);
    handleSelectSpeed(id);
  }, [setSpeedRegions, handleSelectSpeed, nextSpeedIdRef]);

  const handleSpeedSpanChange = useCallback((id: string, span: Span) => {
    setSpeedRegions((prev) =>
      prev.map((region) =>
        region.id === id
          ? { ...region, startMs: Math.round(span.start), endMs: Math.round(span.end) }
          : region
      )
    );
  }, [setSpeedRegions]);

  const handleSpeedChange = useCallback((speed: SpeedMultiplier) => {
    if (!selectedSpeedId) return;
    setSpeedRegions((prev) =>
      prev.map((region) =>
        region.id === selectedSpeedId ? { ...region, speed } : region
      )
    );
  }, [selectedSpeedId, setSpeedRegions]);

  const handleSpeedDelete = useCallback((id: string) => {
    setSpeedRegions((prev) => prev.filter((region) => region.id !== id));
    if (selectedSpeedId === id) setSelectedSpeedId(null);
  }, [selectedSpeedId, setSpeedRegions, setSelectedSpeedId]);

  // Annotation handlers
  const handleAnnotationAdded = useCallback((span: Span) => {
    const id = `annotation-${nextAnnotationIdRef.current++}`;
    const zIndex = nextAnnotationZIndexRef.current++;
    const newRegion: AnnotationRegion = {
      id,
      startMs: Math.round(span.start),
      endMs: Math.round(span.end),
      type: 'text',
      content: 'Enter text...',
      position: { ...DEFAULT_ANNOTATION_POSITION },
      size: { ...DEFAULT_ANNOTATION_SIZE },
      style: { ...DEFAULT_ANNOTATION_STYLE },
      zIndex,
    };
    setAnnotationRegions((prev) => [...prev, newRegion]);
    handleSelectAnnotation(id);
  }, [setAnnotationRegions, handleSelectAnnotation, nextAnnotationIdRef, nextAnnotationZIndexRef]);

  const handleAnnotationSpanChange = useCallback((id: string, span: Span) => {
    setAnnotationRegions((prev) =>
      prev.map((region) =>
        region.id === id
          ? { ...region, startMs: Math.round(span.start), endMs: Math.round(span.end) }
          : region
      )
    );
  }, [setAnnotationRegions]);

  const handleAnnotationDelete = useCallback((id: string) => {
    setAnnotationRegions((prev) => prev.filter((region) => region.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  }, [selectedAnnotationId, setAnnotationRegions, setSelectedAnnotationId]);

  const handleAnnotationContentChange = useCallback((id: string, content: string) => {
    setAnnotationRegions((prev) =>
      prev.map((region) => {
        if (region.id !== id) return region;
        if (region.type === 'text') {
          return { ...region, content, textContent: content };
        } else if (region.type === 'image') {
          return { ...region, content, imageContent: content };
        }
        return { ...region, content };
      })
    );
  }, [setAnnotationRegions]);

  const handleAnnotationTypeChange = useCallback((id: string, type: AnnotationRegion['type']) => {
    setAnnotationRegions((prev) =>
      prev.map((region) => {
        if (region.id !== id) return region;
        const updatedRegion = { ...region, type };
        if (type === 'text') {
          updatedRegion.content = region.textContent || 'Enter text...';
        } else if (type === 'image') {
          updatedRegion.content = region.imageContent || '';
        } else if (type === 'figure') {
          updatedRegion.content = '';
          if (!region.figureData) {
            updatedRegion.figureData = { ...DEFAULT_FIGURE_DATA };
          }
        }
        return updatedRegion;
      })
    );
  }, [setAnnotationRegions]);

  const handleAnnotationStyleChange = useCallback((id: string, style: Partial<AnnotationRegion['style']>) => {
    setAnnotationRegions((prev) =>
      prev.map((region) =>
        region.id === id ? { ...region, style: { ...region.style, ...style } } : region
      )
    );
  }, [setAnnotationRegions]);

  const handleAnnotationFigureDataChange = useCallback((id: string, figureData: FigureData) => {
    setAnnotationRegions((prev) =>
      prev.map((region) => (region.id === id ? { ...region, figureData } : region))
    );
  }, [setAnnotationRegions]);

  const handleAnnotationPositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    setAnnotationRegions((prev) =>
      prev.map((region) => (region.id === id ? { ...region, position } : region))
    );
  }, [setAnnotationRegions]);

  const handleAnnotationSizeChange = useCallback((id: string, size: { width: number; height: number }) => {
    setAnnotationRegions((prev) =>
      prev.map((region) => (region.id === id ? { ...region, size } : region))
    );
  }, [setAnnotationRegions]);

  // Keyframe handlers
  const handleKeyframeAdded = useCallback((timeMs: number) => {
    if (keyframes.some((kf) => Math.abs(kf.timeMs - timeMs) < 100)) {
      toast.error('Keyframe already exists at this position');
      return;
    }
    const id = `keyframe-${nextKeyframeIdRef.current++}`;
    const newKeyframe: Keyframe = {
      id,
      timeMs: Math.round(timeMs),
      transform: { ...DEFAULT_VIDEO_TRANSFORM },
    };
    setKeyframes((prev) => [...prev, newKeyframe].sort((a, b) => a.timeMs - b.timeMs));
    handleSelectKeyframe(id);
  }, [keyframes, setKeyframes, handleSelectKeyframe, nextKeyframeIdRef]);

  const handleKeyframeDelete = useCallback((id: string) => {
    setKeyframes((prev) => prev.filter((kf) => kf.id !== id));
    if (selectedKeyframeId === id) setSelectedKeyframeId(null);
  }, [selectedKeyframeId, setKeyframes, setSelectedKeyframeId]);

  const handleKeyframeTransformChange = useCallback((id: string, transform: Partial<VideoTransform>) => {
    setKeyframes((prev) =>
      prev.map((kf) => (kf.id === id ? { ...kf, transform: { ...kf.transform, ...transform } } : kf))
    );
  }, [setKeyframes]);

  return {
    // Selection
    handleSelectZoom,
    handleSelectTrim,
    handleSelectAnnotation,
    handleSelectSpeed,
    handleSelectKeyframe,
    // Zoom
    handleZoomAdded,
    handleZoomSpanChange,
    handleZoomFocusChange,
    handleZoomDepthChange,
    handleZoomDelete,
    // Trim
    handleTrimAdded,
    handleTrimSpanChange,
    handleTrimDelete,
    // Speed
    handleSpeedAdded,
    handleSpeedSpanChange,
    handleSpeedChange,
    handleSpeedDelete,
    // Annotation
    handleAnnotationAdded,
    handleAnnotationSpanChange,
    handleAnnotationDelete,
    handleAnnotationContentChange,
    handleAnnotationTypeChange,
    handleAnnotationStyleChange,
    handleAnnotationFigureDataChange,
    handleAnnotationPositionChange,
    handleAnnotationSizeChange,
    // Keyframe
    handleKeyframeAdded,
    handleKeyframeDelete,
    handleKeyframeTransformChange,
  };
}
