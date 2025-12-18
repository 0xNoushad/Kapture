import type React from "react";
import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useMemo, useCallback } from "react";
import type { Application, Container, Sprite, Graphics, BlurFilter } from 'pixi.js';
import { type ZoomRegion, type ZoomFocus, type ZoomDepth, type TrimRegion, type AnnotationRegion, type SpeedRegion, type CropRegion } from "./types";
import { DEFAULT_FOCUS } from "./videoPlayback/constants";
import { clampFocusToStage as clampFocusToStageUtil } from "./videoPlayback/focusUtils";
import { updateOverlayIndicator } from "./videoPlayback/overlayUtils";
import { layoutVideoContent as layoutVideoContentUtil } from "./videoPlayback/layoutUtils";
import { type AspectRatio, formatAspectRatioForCSS } from "@/utils/aspectRatioUtils";
import { AnnotationOverlay } from "./AnnotationOverlay";
import { useWallpaperResolver, useVideoSpriteSetup, useZoomAnimation, usePixiSetup, useFocusDrag, useSpeedControl } from "./videoPlayback/hooks";
import type { MockupType } from "@/App";

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
  mockupType?: MockupType;
  browserUrl?: string;
  onBrowserUrlChange?: (url: string) => void;
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
  mockupType, browserUrl = "kapture.app", onBrowserUrlChange,
}, ref) => {
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(browserUrl);
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
  const mockupTypeRef = useRef(mockupType);

  // State & hooks
  const [videoReady, setVideoReady] = useState(false);
  const mockupFrameRef = useRef<HTMLDivElement | null>(null);
  const resolvedWallpaper = useWallpaperResolver(wallpaper);
  const { appRef, cameraContainerRef, videoContainerRef, pixiReady } = usePixiSetup(containerRef);

  // Sync refs
  useEffect(() => { zoomRegionsRef.current = zoomRegions; }, [zoomRegions]);
  useEffect(() => { selectedZoomIdRef.current = selectedZoomId; }, [selectedZoomId]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { trimRegionsRef.current = trimRegions; }, [trimRegions]);
  useEffect(() => { motionBlurEnabledRef.current = motionBlurEnabled; }, [motionBlurEnabled]);
  useEffect(() => { mockupTypeRef.current = mockupType; }, [mockupType]);

  const clampFocusToStage = useCallback((focus: ZoomFocus, depth: ZoomDepth) => clampFocusToStageUtil(focus, depth, stageSizeRef.current), []);

  const updateOverlayForRegion = useCallback((region: ZoomRegion | null, focusOverride?: ZoomFocus) => {
    const overlayEl = overlayRef.current, indicatorEl = focusIndicatorRef.current;
    if (!overlayEl || !indicatorEl) return;
    if (overlayEl.clientWidth && overlayEl.clientHeight) stageSizeRef.current = { width: overlayEl.clientWidth, height: overlayEl.clientHeight };
    // For mockups, the overlay covers the whole area, so use overlay size as video size with scale 1
    const effectiveVideoSize = mockupTypeRef.current ? stageSizeRef.current : videoSizeRef.current;
    const effectiveBaseScale = mockupTypeRef.current ? 1 : baseScaleRef.current;
    updateOverlayIndicator({ overlayEl, indicatorEl, region, focusOverride, videoSize: effectiveVideoSize, baseScale: effectiveBaseScale, isPlaying: isPlayingRef.current });
  }, []);

  // Store settings in refs to avoid re-creating layoutVideoContent on every change
  const borderRadiusRef = useRef(borderRadius);
  const paddingRef = useRef(padding);
  const cropRegionRef = useRef(cropRegion);
  useEffect(() => { borderRadiusRef.current = borderRadius; }, [borderRadius]);
  useEffect(() => { paddingRef.current = padding; }, [padding]);
  useEffect(() => { cropRegionRef.current = cropRegion; }, [cropRegion]);

  const layoutVideoContent = useCallback(() => {
    const container = containerRef.current, app = appRef.current, videoSprite = videoSpriteRef.current;
    const maskGraphics = maskGraphicsRef.current, videoElement = videoRef.current, cameraContainer = cameraContainerRef.current;
    if (!container || !app || !videoSprite || !maskGraphics || !videoElement || !cameraContainer) return;

    if (!lockedVideoDimensionsRef.current && videoElement.videoWidth > 0 && videoElement.videoHeight > 0)
      lockedVideoDimensionsRef.current = { width: videoElement.videoWidth, height: videoElement.videoHeight };

    // For mockups, video fills the screen area (no padding/radius on video itself)
    const isMockup = mockupTypeRef.current;
    const effectiveBorderRadius = isMockup ? 0 : borderRadiusRef.current;
    const effectivePadding = isMockup ? 0 : paddingRef.current;
    const result = layoutVideoContentUtil({ container, app, videoSprite, maskGraphics, videoElement, cropRegion: cropRegionRef.current, lockedVideoDimensions: lockedVideoDimensionsRef.current, borderRadius: effectiveBorderRadius, padding: effectivePadding });
    if (result) {
      stageSizeRef.current = result.stageSize; videoSizeRef.current = result.videoSize;
      baseScaleRef.current = result.baseScale; baseMaskRef.current = result.maskRect;
      cameraContainer.scale.set(1); cameraContainer.position.set(0, 0);
      const activeRegion = selectedZoomIdRef.current ? zoomRegionsRef.current.find((r) => r.id === selectedZoomIdRef.current) ?? null : null;
      updateOverlayForRegion(activeRegion);
    }
  }, [updateOverlayForRegion, appRef, cameraContainerRef]);

  // Store layoutVideoContent in a ref so useVideoSpriteSetup doesn't re-run when it changes
  const layoutVideoContentRef = useRef(layoutVideoContent);
  useEffect(() => { layoutVideoContentRef.current = layoutVideoContent; }, [layoutVideoContent]);

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
  useVideoSpriteSetup({ pixiReady, videoReady, videoRef, appRef, videoContainerRef, videoSpriteRef, maskGraphicsRef, blurFilterRef, animationStateRef, isSeekingRef, isPlayingRef, allowPlaybackRef, currentTimeRef, timeUpdateAnimationRef, trimRegionsRef, layoutVideoContentRef, onPlayStateChange, onTimeUpdate });

  // Zoom animation (for non-mockup mode, PixiJS handles zoom; for mockup mode, CSS handles it)
  useZoomAnimation({ pixiReady, videoReady, appRef, videoSpriteRef, videoContainerRef, cameraContainerRef, zoomRegionsRef, selectedZoomIdRef, isPlayingRef, animationStateRef, blurFilterRef, stageSizeRef, baseMaskRef, currentTimeRef, motionBlurEnabledRef, clampFocusToStage, mockupTypeRef });

  // CSS zoom for mockups - direct DOM manipulation (no React re-renders)
  useEffect(() => {
    if (!mockupType || !pixiReady || !videoReady) return;
    let rafId: number;
    const update = () => {
      const el = mockupFrameRef.current;
      if (el) {
        const state = animationStateRef.current;
        const offsetX = (0.5 - state.focusX) * (state.scale - 1) * 100;
        const offsetY = (0.5 - state.focusY) * (state.scale - 1) * 100;
        el.style.transform = `scale(${state.scale}) translate(${offsetX}%, ${offsetY}%)`;
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [mockupType, pixiReady, videoReady]);

  // Crop change - just re-layout, don't mess with video playback
  useEffect(() => {
    if (!pixiReady || !videoReady) return;
    layoutVideoContent();
  }, [pixiReady, videoReady, cropRegion, layoutVideoContent]);

  // Resize - observe container for size changes (including mockup padding changes)
  useEffect(() => { 
    if (!pixiReady || !videoReady) return; 
    const c = containerRef.current; 
    if (!c || typeof ResizeObserver === 'undefined') return; 
    let timeout: ReturnType<typeof setTimeout>;
    const o = new ResizeObserver(() => {
      // Debounce to avoid excessive re-layouts during transitions
      clearTimeout(timeout);
      timeout = setTimeout(() => layoutVideoContent(), 50);
    }); 
    o.observe(c); 
    return () => { o.disconnect(); clearTimeout(timeout); }; 
  }, [pixiReady, videoReady, layoutVideoContent]);

  // Re-layout when borderRadius or padding changes (non-mockup only)
  useEffect(() => { if (!pixiReady || !videoReady || mockupTypeRef.current) return; layoutVideoContent(); }, [pixiReady, videoReady, borderRadius, padding, layoutVideoContent]);

  // Overlay updates
  useEffect(() => { if (pixiReady && videoReady) updateOverlayForRegion(selectedZoom); }, [selectedZoom, pixiReady, videoReady, updateOverlayForRegion]);
  useEffect(() => { 
    const el = overlayRef.current; 
    if (!el) return; 
    if (!selectedZoom) { 
      el.style.cursor = 'default'; 
      el.style.pointerEvents = 'none'; 
      return; 
    } 
    el.style.cursor = isPlaying ? 'not-allowed' : 'grab'; 
    el.style.pointerEvents = isPlaying ? 'none' : 'auto'; 
  }, [selectedZoom, isPlaying]);
  useEffect(() => () => { if (videoReadyRafRef.current) { cancelAnimationFrame(videoReadyRafRef.current); videoReadyRafRef.current = null; } }, []);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget; onDurationChange(video.duration); video.currentTime = 0; video.pause(); allowPlaybackRef.current = false; currentTimeRef.current = 0;
    if (videoReadyRafRef.current) { cancelAnimationFrame(videoReadyRafRef.current); videoReadyRafRef.current = null; }
    const wait = () => { if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) { videoReadyRafRef.current = null; setVideoReady(true); return; } videoReadyRafRef.current = requestAnimationFrame(wait); };
    videoReadyRafRef.current = requestAnimationFrame(wait);
  };

  const isImageUrl = Boolean(resolvedWallpaper && (resolvedWallpaper.startsWith('file://') || resolvedWallpaper.startsWith('http') || resolvedWallpaper.startsWith('/') || resolvedWallpaper.startsWith('data:')));
  const bgStyle = isImageUrl ? { backgroundImage: `url(${resolvedWallpaper || ''})` } : { background: resolvedWallpaper || '' };
  const shadowFilter = (showShadow && shadowIntensity > 0) ? `drop-shadow(0 ${shadowIntensity * 12}px ${shadowIntensity * 48}px rgba(0,0,0,${shadowIntensity * 0.7})) drop-shadow(0 ${shadowIntensity * 4}px ${shadowIntensity * 16}px rgba(0,0,0,${shadowIntensity * 0.5})) drop-shadow(0 ${shadowIntensity * 2}px ${shadowIntensity * 8}px rgba(0,0,0,${shadowIntensity * 0.3}))` : 'none';

  // Render browser mockup
  if (mockupType === "browser") {
    // padding 0-100 maps to scale 1.0-0.7 (more padding = smaller mockup)
    const mockupScale = 1 - (padding / 100) * 0.3;
    // Get video aspect ratio to size the mockup properly
    const videoAspect = lockedVideoDimensionsRef.current 
      ? lockedVideoDimensionsRef.current.width / lockedVideoDimensionsRef.current.height 
      : 16 / 9;
    return (
      <div className="relative rounded-sm overflow-hidden w-full h-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ ...bgStyle, filter: showBlur ? 'blur(2px)' : 'none' }} />
        {/* Overlay for zoom focus - covers entire area */}
        <div ref={overlayRef} className="absolute inset-0 select-none z-20" style={{ pointerEvents: selectedZoom && !isPlaying ? 'auto' : 'none' }} onPointerDown={handleOverlayPointerDown} onPointerMove={handleOverlayPointerMove} onPointerUp={handleOverlayPointerUp} onPointerLeave={handleOverlayPointerLeave}>
          <div ref={focusIndicatorRef} className="absolute rounded-md border-2 border-[#34B27B] bg-[#34B27B]/20 shadow-[0_0_0_1px_rgba(52,178,123,0.5)]" style={{ display: 'none', pointerEvents: 'none' }} />
        </div>
        {/* Browser mockup */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div 
            ref={mockupFrameRef}
            className="flex flex-col overflow-hidden border border-black/20 bg-[#1a1a1a] transition-all duration-150 ease-out" 
            style={{ 
              width: `${mockupScale * 100}%`,
              maxHeight: `${mockupScale * 100}%`,
              aspectRatio: `${videoAspect}`,
              borderRadius: borderRadius + 4, 
              filter: shadowFilter 
            }}
          >
            {/* Browser Title Bar */}
            <div className="h-9 bg-[#363636] flex items-center px-3 gap-2 flex-shrink-0 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ED6A5E] border border-black/10" />
                <div className="w-3 h-3 rounded-full bg-[#F4BD50] border border-black/10" />
                <div className="w-3 h-3 rounded-full bg-[#61C454] border border-black/10" />
              </div>
              <div className="flex-1 mx-4">
                {isEditingUrl ? (
                  <input type="text" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)}
                    onBlur={() => { setIsEditingUrl(false); onBrowserUrlChange?.(tempUrl); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setIsEditingUrl(false); onBrowserUrlChange?.(tempUrl); } if (e.key === "Escape") { setIsEditingUrl(false); setTempUrl(browserUrl); } }}
                    autoFocus className="w-full h-5 bg-[#434343] rounded px-3 text-xs text-white/80 outline-none border border-white/10 focus:border-violet-500/50 relative z-30" />
                ) : (
                  <div onClick={() => setIsEditingUrl(true)} className="h-5 bg-[#434343] rounded px-3 text-[10px] text-white/50 flex items-center justify-center cursor-text hover:bg-[#4a4a4a] transition-colors relative z-30">
                    <span className="text-white/30 mr-1">🔒</span>{browserUrl}
                  </div>
                )}
              </div>
              <div className="w-12" />
            </div>
            {/* Video Content - fills remaining space below title bar */}
            <div className="flex-1 relative min-h-0 overflow-hidden">
              <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
            </div>
          </div>
        </div>
        {/* Annotations */}
        {pixiReady && videoReady && (() => {
          const filtered = annotationRegions.filter((a) => { if (typeof a.startMs !== 'number' || typeof a.endMs !== 'number') return false; if (a.id === selectedAnnotationId) return true; const t = Math.round(currentTime * 1000); return t >= a.startMs && t <= a.endMs; });
          const sorted = [...filtered].sort((a, b) => a.zIndex - b.zIndex);
          const onClick = (id: string) => { if (!onSelectAnnotation) return; if (id === selectedAnnotationId && sorted.length > 1) { const i = sorted.findIndex(a => a.id === id); onSelectAnnotation(sorted[(i + 1) % sorted.length].id); } else onSelectAnnotation(id); };
          return sorted.map((a) => <AnnotationOverlay key={a.id} annotation={a} isSelected={a.id === selectedAnnotationId} containerWidth={overlayRef.current?.clientWidth || 800} containerHeight={overlayRef.current?.clientHeight || 600} onPositionChange={(id, pos) => onAnnotationPositionChange?.(id, pos)} onSizeChange={(id, size) => onAnnotationSizeChange?.(id, size)} onClick={onClick} zIndex={a.zIndex} isSelectedBoost={a.id === selectedAnnotationId} />);
        })()}
        <video ref={videoRef} src={videoPath} className="hidden" preload="metadata" playsInline onLoadedMetadata={handleLoadedMetadata} onDurationChange={e => onDurationChange(e.currentTarget.duration)} onError={() => onError('Failed to load video')} />
      </div>
    );
  }

  // Render device mockup
  if (mockupType === "device") {
    // padding 0-100 maps to scale 1.0-0.7 (more padding = smaller mockup)
    const mockupScale = 1 - (padding / 100) * 0.3;
    return (
      <div className="relative rounded-sm overflow-hidden w-full h-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ ...bgStyle, filter: showBlur ? 'blur(2px)' : 'none' }} />
        {/* Overlay for zoom focus - covers entire area */}
        <div ref={overlayRef} className="absolute inset-0 select-none z-20" style={{ pointerEvents: selectedZoom && !isPlaying ? 'auto' : 'none' }} onPointerDown={handleOverlayPointerDown} onPointerMove={handleOverlayPointerMove} onPointerUp={handleOverlayPointerUp} onPointerLeave={handleOverlayPointerLeave}>
          <div ref={focusIndicatorRef} className="absolute rounded-md border-2 border-[#34B27B] bg-[#34B27B]/20 shadow-[0_0_0_1px_rgba(52,178,123,0.5)]" style={{ display: 'none', pointerEvents: 'none' }} />
        </div>
        {/* Device mockup */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div 
            ref={mockupFrameRef}
            className="relative transition-[height] duration-150 ease-out" 
            style={{ height: `${mockupScale * 100}%`, aspectRatio: '9/19.5', filter: shadowFilter }}
          >
            {/* iPhone Frame */}
            <div className="absolute inset-0 bg-black border-[3px] border-[#333] overflow-hidden" style={{ borderRadius: Math.max(borderRadius, 44) }}>
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[28%] h-[2.5%] bg-black rounded-full z-10" />
              {/* Screen Content */}
              <div className="absolute overflow-hidden bg-black" style={{ borderRadius: Math.max(borderRadius - 3, 40), top: '0.5%', left: '1.5%', right: '1.5%', bottom: '0.5%' }}>
                <div ref={containerRef} className="absolute inset-0" />
              </div>
            </div>
          </div>
        </div>
        {/* Annotations */}
        {pixiReady && videoReady && (() => {
          const filtered = annotationRegions.filter((a) => { if (typeof a.startMs !== 'number' || typeof a.endMs !== 'number') return false; if (a.id === selectedAnnotationId) return true; const t = Math.round(currentTime * 1000); return t >= a.startMs && t <= a.endMs; });
          const sorted = [...filtered].sort((a, b) => a.zIndex - b.zIndex);
          const onClick = (id: string) => { if (!onSelectAnnotation) return; if (id === selectedAnnotationId && sorted.length > 1) { const i = sorted.findIndex(a => a.id === id); onSelectAnnotation(sorted[(i + 1) % sorted.length].id); } else onSelectAnnotation(id); };
          return sorted.map((a) => <AnnotationOverlay key={a.id} annotation={a} isSelected={a.id === selectedAnnotationId} containerWidth={overlayRef.current?.clientWidth || 800} containerHeight={overlayRef.current?.clientHeight || 600} onPositionChange={(id, pos) => onAnnotationPositionChange?.(id, pos)} onSizeChange={(id, size) => onAnnotationSizeChange?.(id, size)} onClick={onClick} zIndex={a.zIndex} isSelectedBoost={a.id === selectedAnnotationId} />);
        })()}
        <video ref={videoRef} src={videoPath} className="hidden" preload="metadata" playsInline onLoadedMetadata={handleLoadedMetadata} onDurationChange={e => onDurationChange(e.currentTarget.duration)} onError={() => onError('Failed to load video')} />
      </div>
    );
  }

  // Default render (no mockup)
  return (
    <div className="relative rounded-sm overflow-hidden" style={{ width: '100%', aspectRatio: formatAspectRatioForCSS(aspectRatio) }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ ...bgStyle, filter: showBlur ? 'blur(2px)' : 'none' }} />
      <div ref={containerRef} className="absolute inset-0" style={{ filter: shadowFilter }} />
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
