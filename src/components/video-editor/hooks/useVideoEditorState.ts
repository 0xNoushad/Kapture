import { useState, useRef } from 'react';
import {
  DEFAULT_CROP_REGION,
  type ZoomRegion,
  type TrimRegion,
  type AnnotationRegion,
  type CropRegion,
  type SpeedRegion,
  type Keyframe,
} from '../types';
import type { AspectRatio } from '@/utils/aspectRatioUtils';
import type { ExportQuality } from '@/lib/exporter';

export interface VideoEditorState {
  videoPath: string | null;
  loading: boolean;
  error: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  wallpaper: string;
  shadowIntensity: number;
  showBlur: boolean;
  motionBlurEnabled: boolean;
  borderRadius: number;
  padding: number;
  cropRegion: CropRegion;
  zoomRegions: ZoomRegion[];
  selectedZoomId: string | null;
  trimRegions: TrimRegion[];
  selectedTrimId: string | null;
  annotationRegions: AnnotationRegion[];
  speedRegions: SpeedRegion[];
  selectedSpeedId: string | null;
  selectedAnnotationId: string | null;
  keyframes: Keyframe[];
  selectedKeyframeId: string | null;
  aspectRatio: AspectRatio;
  exportQuality: ExportQuality;
}

export function useVideoEditorState(initialVideoUrl?: string) {
  // Core state
  const [videoPath, setVideoPath] = useState<string | null>(initialVideoUrl || null);
  const [loading, setLoading] = useState(!initialVideoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Visual settings
  const [wallpaper, setWallpaper] = useState<string>('/wallpapers/wallpaper1.jpg');
  const [shadowIntensity, setShadowIntensity] = useState(0);
  const [showBlur, setShowBlur] = useState(false);
  const [motionBlurEnabled, setMotionBlurEnabled] = useState(true);
  const [borderRadius, setBorderRadius] = useState(0);
  const [padding, setPadding] = useState(50);
  const [cropRegion, setCropRegion] = useState<CropRegion>(DEFAULT_CROP_REGION);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [exportQuality, setExportQuality] = useState<ExportQuality>('good');

  // Regions
  const [zoomRegions, setZoomRegions] = useState<ZoomRegion[]>([]);
  const [selectedZoomId, setSelectedZoomId] = useState<string | null>(null);
  const [trimRegions, setTrimRegions] = useState<TrimRegion[]>([]);
  const [selectedTrimId, setSelectedTrimId] = useState<string | null>(null);
  const [annotationRegions, setAnnotationRegions] = useState<AnnotationRegion[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [speedRegions, setSpeedRegions] = useState<SpeedRegion[]>([]);
  const [selectedSpeedId, setSelectedSpeedId] = useState<string | null>(null);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);

  // Refs for ID generation
  const nextZoomIdRef = useRef(1);
  const nextTrimIdRef = useRef(1);
  const nextAnnotationIdRef = useRef(1);
  const nextAnnotationZIndexRef = useRef(1);
  const nextSpeedIdRef = useRef(1);
  const nextKeyframeIdRef = useRef(1);

  return {
    // State
    videoPath, setVideoPath,
    loading, setLoading,
    error, setError,
    isPlaying, setIsPlaying,
    currentTime, setCurrentTime,
    duration, setDuration,
    wallpaper, setWallpaper,
    shadowIntensity, setShadowIntensity,
    showBlur, setShowBlur,
    motionBlurEnabled, setMotionBlurEnabled,
    borderRadius, setBorderRadius,
    padding, setPadding,
    cropRegion, setCropRegion,
    aspectRatio, setAspectRatio,
    exportQuality, setExportQuality,
    zoomRegions, setZoomRegions,
    selectedZoomId, setSelectedZoomId,
    trimRegions, setTrimRegions,
    selectedTrimId, setSelectedTrimId,
    annotationRegions, setAnnotationRegions,
    selectedAnnotationId, setSelectedAnnotationId,
    speedRegions, setSpeedRegions,
    selectedSpeedId, setSelectedSpeedId,
    keyframes, setKeyframes,
    selectedKeyframeId, setSelectedKeyframeId,
    // Refs
    nextZoomIdRef,
    nextTrimIdRef,
    nextAnnotationIdRef,
    nextAnnotationZIndexRef,
    nextSpeedIdRef,
    nextKeyframeIdRef,
  };
}
