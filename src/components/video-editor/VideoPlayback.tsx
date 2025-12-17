import type React from "react";
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useMemo, useCallback } from "react";
import type { Application, Container, Sprite, Graphics, BlurFilter } from 'pixi.js';
import { type ZoomRegion, type ZoomFocus, type ZoomDepth, type TrimRegion, type AnnotationRegion, type SpeedRegion, type CropRegion } from "./types";
import { DEFAULT_FOCUS } from "./videoPlayback/constants";
import { clampFocusToStage as clampFocusToStageUtil } from "./videoPlayback/focusUtils";
import { updateOverlayIndicator } from "./videoPlayback/overlayUtils";
import { layoutVideoContent as layoutVideoContentUtil } from "./videoPlayback/layoutUtils";
import { applyZoomTransform } from "./videoPlayback/zoomTransform";
import { type AspectRatio, formatAspectRatioForCSS } from "@/utils/aspectRatioUtils";
import { AnnotationOverlay } from "./AnnotationOverlay";
import { useWallpaperResolver, useVideoSpriteSetup, useZoomAnimation, usePixiSetup, useFocusDrag, useSpeedControl } from "./videoPlayback/hooks";

interface VideoPlaybackProps {
  videoPath: string;
  onDurationChange: (duration: number) => void;
  onTimeUpdate: (time: number) => void;
  currentTime: number;
  onPlayStateChange: (playing: boolean) => void;
  onError: (error: string) => void;
  wallpaper?: string;
  zoomRegions: ZoomRegion[];
  selectedZoomId: string | null;
  onSelectZoom: (id: string | null) => void;
  onZoomFocusChange: (id: string, focus: ZoomFocus) => void;
  isPlaying: boolean;
  showShadow?: boolean;
  shadowIntensity?: number;
  showBlur?: boolean;
  motionBlurEnabled?: boolean;
  borderRadius?: number;
  padding?: number;
  cropRegion?: CropRegion;
  trimRegions?: TrimRegion[];
  speedRegions?: SpeedRegion[];
  aspectRatio: AspectRatio;
  annotationRegions?: AnnotationRegion[];
  selectedAnnotationId?: string | null;
  onSelectAnnotation?: (id: string | null) => void;
  onAnnotationPositionChange?: (id: string, position: { x: number; y: number }) => void;
  onAnnotationSizeChange?: (id: string, size: { width: number; height: number }) => void;
}

export interface VideoPlaybackRef {
  video: HTMLVideoElement | null;
  app: Application | null;
  videoSprite: Sprite | null;
  videoContainer: Container | null;
  containerRef: React.RefObject<HTMLDivElement>;
  play: () => Promise<void>;
  pause: () => void;
}

const VideoPlayback = forwardRef<VideoPlaybackRef, VideoPlaybackProps>(({
  videoPath, onDurationChange, onTimeUpdate, currentTime, onPlayStateChange, onError,
  wallpaper, zoomRegions, selectedZoomId, onSelectZoom, onZoomFocusChange, isPlaying,
  showShadow, shadowIntensity = 0, showBlur, motionBlurEnabled = true,
  borderRadius = 0, padding = 50, cropRegion, trimRegions = [], speedRegions = [],
  aspectRatio, annotationRegions = [], selectedAnnotationId, onSelectAnnotation,
  onAnnotationPositionChange, onAnnotationSizeChange,
}, ref) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoSpriteRef = useRef<Sprite | null>(null);
  const timeUpdateAnimationRef = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const focusIndicatorRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef(0);
  const zoomRegionsRef = useRef<ZoomRegion[]>([]);
  const selectedZoomIdRef = useRef<string | null>(null);
  const animationStateRef = useRef({ scale: 1, focusX: DEFAULT_FOCUS.cx, focusY: DEFAULT_FOCUS.cy });
  const blurFilterRef = useRef<BlurFilter | null>(null);
  const isDraggingFocusRef = useRef(false);
  const stageSizeRef = useRef({ width: 0, height: 0 });
  const videoSizeRef = useRef({ width: 0, height: 0 });
  const baseScaleRef = useRef(1);
  const baseMaskRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const maskGraphicsRef = useRef<Graphics | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const isSeekingRef = useRef(false);
  const allowPlaybackRef = useRef(false);
  const lockedVideoDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const trimRegionsRef = useRef<TrimRegion[]>([]);
  const motionBlurEnabledRef = useRef(motionBlurEnabled);
  const videoReadyRafRef = useRef<number | null>(null);

  // State & hooks
  const [videoReady, setVideoReady] = useState(false);
  const resolvedWallpaper = useWallpaperResolver(wallpaper);
  const { appRef, cameraContainerRef, videoContainerRef, pixiReady } = usePixiSetup(containerRef);

  // Sync refs
  useEffect(() => { zoomRegionsRef.current = zoomRegions; }, [zoomRegions]);
  useEffect(() => { selectedZoomIdRef.current = selectedZoomId; }, [selectedZoomId]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { trimRegionsRef.current = trimRegions; }, [trimRegions]);
  useEffect(() => { motionBlurEnabledRef.current = motionBlurEnabled; }, [motionBlurEnabled]);

  const clampFocusToStage = useCallback((focus: ZoomFocus, depth: ZoomDepth) => clampFocusToStageUtil(focus, depth, stageSizeRef.current), []);

  const updateOverlayForRegion = useCallback((region: ZoomRegion | null, focusOverride?: ZoomFocus) => {
    const overlayEl = overlayRef.current, indicatorEl = focusIndicatorRef.current;
    if (!overlayEl || !indicatorEl) return;
    if (overlayEl.clientWidth && overlayEl.clientHeight) stageSizeRef.current = { width: overlayEl.clientWidth, height: overlayEl.clientHeight };
    updateOverlayIndicator({ overlayEl, indicatorEl, region, focusOverride, videoSize: videoSizeRef.current, baseScale: baseScaleRef.current, isPlaying: isPlayingRef.current });
  }, []);

  const layoutVideoContent = useCallback(() => {
    const container = containerRef.current, app = appRef.current, videoSprite = videoSpriteRef.current;
    const maskGraphics = maskGraphicsRef.current, videoElement = videoRef.current, cameraContainer = cameraContainerRef.current;
    if (!container || !app || !videoSprite || !maskGraphics || !videoElement || !cameraContainer) return;

    if (!lockedVideoDimensionsRef.current && videoElement.videoWidth > 0 && videoElement.videoHeight > 0)
      lockedVideoDimensionsRef.current = { width: videoElement.videoWidth, height: videoElement.videoHeight };

    const result = layoutVideoContentUtil({ container, app, videoSprite, maskGraphics, videoElement, cropRegion, lockedVideoDimensions: lockedVideoDimensionsRef.current, borderRadius, padding });
    if (result) {
      stageSizeRef.current = result.stageSize; videoSizeRef.current = result.videoSize;
      baseScaleRef.current = result.baseScale; baseMaskRef.current = result.maskRect;
      cameraContainer.scale.set(1); cameraContainer.position.set(0, 0);
      const activeRegion = selectedZoomIdRef.current ? zoomRegionsRef.current.find((r) => r.id === selectedZoomIdRef.current) ?? null : null;
      updateOverlayForRegion(activeRegion);
    }
  }, [updateOverlayForRegion, cropRegion, borderRadius, padding, appRef, cameraContainerRef]);

  const selectedZoom = useMemo(() => selectedZoomId ? zoomRegions.find((r) => r.id === selectedZoomId) ?? null : null, [zoomRegions, selectedZoomId]);

  useImperativeHandle(ref, () => ({
    video: videoRef.current, app: appRef.current, videoSprite: videoSpriteRef.current, videoContainer: videoContainerRef.current, containerRef,
    play: async () => { if (!videoRef.current) return; allowPlaybackRef.current = true; try { await videoRef.current.play(); } catch { allowPlaybackRef.current = false; throw new Error('Playback failed'); } },
    pause: () => { allowPlaybackRef.current = false; videoRef.current?.pause(); },
  }));

  // Focus drag
  const { handleOverlayPointerDown, handleOverlayPointerMove, handleOverlayPointerUp, handleOverlayPointerLeave } = useFocusDrag({
    overlayRef, selectedZoomIdRef, zoomRegionsRef, isPlayingRef, isDraggingFocusRef, stageSizeRef,
    onSelectZoom, onZoomFocusChange, clampFocusToStage, updateOverlayForRegion,
  });

  // Speed control
  useSpeedControl({ videoRef, currentTime, speedRegions });

  // Video path change
  useEffect(() => { const video = videoRef.current; if (!video) return; video.pause(); video.currentTime = 0; allowPlaybackRef.current = false; lockedVideoDimensionsRef.current = null; setVideoReady(false); if (videoReadyRafRef.current) { cancelAnimationFrame(videoReadyRafRef.current); videoReadyRafRef.current = null; } }, [videoPath]);

  // Video sprite setup
  useVideoSpriteSetup({ pixiReady, videoReady, videoRef, appRef, videoContainerRef, videoSpriteRef, maskGraphicsRef, blurFilterRef, animationStateRef, isSeekingRef, isPlayingRef, allowPlaybackRef, currentTimeRef, timeUpdateAnimationRef, trimRegionsRef, layoutVideoContent, onPlayStateChange, onTimeUpdate });

  // Zoom animation
  useZoomAnimation({ pixiReady, videoReady, appRef, videoSpriteRef, videoContainerRef, cameraContainerRef, zoomRegionsRef, selectedZoomIdRef, isPlayingRef, animationStateRef, blurFilterRef, stageSizeRef, baseMaskRef, currentTimeRef, motionBlurEnabledRef, clampFocusToStage });

  // Crop change
  useEffect(() => {
    if (!pixiReady || !videoReady) return; const app = appRef.current, cam = cameraContainerRef.current, video = videoRef.current; if (!app || !cam || !video) return;
    const tickerWas = app.ticker?.started || false; if (tickerWas) app.ticker.stop(); const wasPlaying = !video.paused; if (wasPlaying) video.pause();
    animationStateRef.current = { scale: 1, focusX: DEFAULT_FOCUS.cx, focusY: DEFAULT_FOCUS.cy }; if (blurFilterRef.current) blurFilterRef.current.blur = 0;
    requestAnimationFrame(() => { layoutVideoContent(); applyZoomTransform({ cameraContainer: cam, blurFilter: blurFilterRef.current, stageSize: stageSizeRef.current, baseMask: baseMaskRef.current, zoomScale: 1, focusX: DEFAULT_FOCUS.cx, focusY: DEFAULT_FOCUS.cy, motionIntensity: 0, isPlaying: false, motionBlurEnabled: motionBlurEnabledRef.current }); requestAnimationFrame(() => { if (wasPlaying) video.play().catch(() => {}); if (tickerWas && appRef.current?.ticker) appRef.current.ticker.start(); }); });
  }, [pixiReady, videoReady, layoutVideoContent, cropRegion, appRef, cameraContainerRef]);

  // Resize
  useEffect(() => { if (!pixiReady || !videoReady) return; const c = containerRef.current; if (!c || typeof ResizeObserver === 'undefined') return; const o = new ResizeObserver(() => layoutVideoContent()); o.observe(c); return () => o.disconnect(); }, [pixiReady, videoReady, layoutVideoContent]);

  // Overlay updates
  useEffect(() => { if (pixiReady && videoReady) updateOverlayForRegion(selectedZoom); }, [selectedZoom, pixiReady, videoReady, updateOverlayForRegion]);
  useEffect(() => { const el = overlayRef.current; if (!el) return; if (!selectedZoom) { el.style.cursor = 'default'; el.style.pointerEvents = 'none'; return; } el.style.cursor = isPlaying ? 'not-allowed' : 'grab'; el.style.pointerEvents = isPlaying ? 'none' : 'auto'; }, [selectedZoom, isPlaying]);
  useEffect(() => () => { if (videoReadyRafRef.current) { cancelAnimationFrame(videoReadyRafRef.current); videoReadyRafRef.current = null; } }, []);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget; onDurationChange(video.duration); video.currentTime = 0; video.pause(); allowPlaybackRef.current = false; currentTimeRef.current = 0;
    if (videoReadyRafRef.current) { cancelAnimationFrame(videoReadyRafRef.current); videoReadyRafRef.current = null; }
    const wait = () => { if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) { videoReadyRafRef.current = null; setVideoReady(true); return; } videoReadyRafRef.current = requestAnimationFrame(wait); };
    videoReadyRafRef.current = requestAnimationFrame(wait);
  };

  const isImageUrl = Boolean(resolvedWallpaper && (resolvedWallpaper.startsWith('file://') || resolvedWallpaper.startsWith('http') || resolvedWallpaper.startsWith('/') || resolvedWallpaper.startsWith('data:')));
  const bgStyle = isImageUrl ? { backgroundImage: `url(${resolvedWallpaper || ''})` } : { background: resolvedWallpaper || '' };

  return (
    <div className="relative rounded-sm overflow-hidden" style={{ width: '100%', aspectRatio: formatAspectRatioForCSS(aspectRatio) }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ ...bgStyle, filter: showBlur ? 'blur(2px)' : 'none' }} />
      <div ref={containerRef} className="absolute inset-0" style={{ filter: (showShadow && shadowIntensity > 0) ? `drop-shadow(0 ${shadowIntensity * 12}px ${shadowIntensity * 48}px rgba(0,0,0,${shadowIntensity * 0.7})) drop-shadow(0 ${shadowIntensity * 4}px ${shadowIntensity * 16}px rgba(0,0,0,${shadowIntensity * 0.5})) drop-shadow(0 ${shadowIntensity * 2}px ${shadowIntensity * 8}px rgba(0,0,0,${shadowIntensity * 0.3}))` : 'none' }} />
      {pixiReady && videoReady && (
        <div ref={overlayRef} className="absolute inset-0 select-none" style={{ pointerEvents: 'none' }} onPointerDown={handleOverlayPointerDown} onPointerMove={handleOverlayPointerMove} onPointerUp={handleOverlayPointerUp} onPointerLeave={handleOverlayPointerLeave}>
          <div ref={focusIndicatorRef} className="absolute rounded-md border border-[#34B27B]/80 bg-[#34B27B]/20 shadow-[0_0_0_1px_rgba(52,178,123,0.35)]" style={{ display: 'none', pointerEvents: 'none' }} />
          {(() => {
            const filtered = annotationRegions.filter((a) => { if (typeof a.startMs !== 'number' || typeof a.endMs !== 'number') return false; if (a.id === selectedAnnotationId) return true; const t = Math.round(currentTime * 1000); return t >= a.startMs && t <= a.endMs; });
            const sorted = [...filtered].sort((a, b) => a.zIndex - b.zIndex);
            const onClick = (id: string) => { if (!onSelectAnnotation) return; if (id === selectedAnnotationId && sorted.length > 1) { const i = sorted.findIndex(a => a.id === id); onSelectAnnotation(sorted[(i + 1) % sorted.length].id); } else onSelectAnnotation(id); };
            return sorted.map((a) => <AnnotationOverlay key={a.id} annotation={a} isSelected={a.id === selectedAnnotationId} containerWidth={overlayRef.current?.clientWidth || 800} containerHeight={overlayRef.current?.clientHeight || 600} onPositionChange={(id, pos) => onAnnotationPositionChange?.(id, pos)} onSizeChange={(id, size) => onAnnotationSizeChange?.(id, size)} onClick={onClick} zIndex={a.zIndex} isSelectedBoost={a.id === selectedAnnotationId} />);
          })()}
        </div>
      )}
      <video ref={videoRef} src={videoPath} className="hidden" preload="metadata" playsInline onLoadedMetadata={handleLoadedMetadata} onDurationChange={e => onDurationChange(e.currentTarget.duration)} onError={() => onError('Failed to load video')} />
    </div>
  );
});

VideoPlayback.displayName = 'VideoPlayback';
export default VideoPlayback;
