import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lightbulb } from "lucide-react";

import VideoPlayback, { VideoPlaybackRef } from "./VideoPlayback";
import TimelineEditor from "./timeline/TimelineEditor";
import { SettingsPanel } from "./SettingsPanel";
import { ExportDialog } from "./ExportDialog";
import { FeatureRequestModal } from "./FeatureRequestModal";

import { useVideoEditorState, useRegionHandlers, useExport } from "./hooks";
import { getAspectRatioValue } from "@/utils/aspectRatioUtils";
import { getAssetPath } from "@/lib/assetPath";
import kaptureLogo from "@/assets/kapture.svg";
import GradientBackground from "@/components/GradientBackground";
import type { MockupType } from "@/App";

interface VideoEditorProps {
  videoUrl?: string;
  fileName?: string;
  onReset?: () => void;
  mockupType?: MockupType;
}

export default function VideoEditor({ videoUrl: propVideoUrl, fileName, onReset, mockupType }: VideoEditorProps = {}) {
  const videoPlaybackRef = useRef<VideoPlaybackRef>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("kapture.app");
  const [activeKey, setActiveKey] = useState<{ key: string; label: string } | null>(null);
  const keyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showKeyIndicator = (key: string, label: string) => {
    if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    setActiveKey({ key, label });
    keyTimeoutRef.current = setTimeout(() => setActiveKey(null), 800);
  };

  // Use state hook
  const state = useVideoEditorState(propVideoUrl);
  const {
    videoPath, setVideoPath, loading, setLoading, error, setError,
    isPlaying, setIsPlaying, currentTime, setCurrentTime, duration, setDuration,
    wallpaper, setWallpaper, shadowIntensity, setShadowIntensity,
    showBlur, setShowBlur, motionBlurEnabled, setMotionBlurEnabled,
    borderRadius, setBorderRadius, padding, setPadding,
    cropRegion, setCropRegion, aspectRatio, setAspectRatio, exportQuality, setExportQuality,
    zoomRegions, selectedZoomId, setSelectedZoomId,
    trimRegions, selectedTrimId, setSelectedTrimId,
    annotationRegions, selectedAnnotationId, setSelectedAnnotationId,
    speedRegions, selectedSpeedId, setSelectedSpeedId,
  } = state;

  // Use region handlers hook
  const handlers = useRegionHandlers(state);

  // Export hook
  const exportHook = useExport({
    videoPath, wallpaper, zoomRegions, trimRegions, annotationRegions,
    shadowIntensity, showBlur, motionBlurEnabled, borderRadius, padding, cropRegion,
    aspectRatio, exportQuality, isPlaying, videoRef: videoPlaybackRef,
    mockupType, browserUrl,
  });

  // Initialize
  useEffect(() => {
    if (propVideoUrl) { setVideoPath(propVideoUrl); setLoading(false); }
    else { setError('No video provided'); setLoading(false); }
  }, [propVideoUrl, setVideoPath, setLoading, setError]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolvedPath = await getAssetPath('wallpapers/wallpaper1.jpg');
        if (mounted) setWallpaper(resolvedPath);
      } catch { /* keep fallback */ }
    })();
    return () => { mounted = false };
  }, [setWallpaper]);

  const togglePlayPause = () => {
    const playback = videoPlaybackRef.current;
    if (!playback?.video) return;
    if (isPlaying) playback.pause();
    else playback.play().catch(console.error);
  };

  const handleSeek = (time: number) => {
    const video = videoPlaybackRef.current?.video;
    if (video) video.currentTime = time;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      // Prevent default for Tab
      if (e.key === 'Tab') e.preventDefault();

      // Space - Play/Pause
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const playback = videoPlaybackRef.current;
        if (playback?.video) {
          const wasPlaying = !playback.video.paused;
          playback.video.paused ? playback.play().catch(console.error) : playback.pause();
          showKeyIndicator('Space', wasPlaying ? 'Pause' : 'Play');
        }
      }

      // Z - Add Zoom
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handlers.handleZoomAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) });
        showKeyIndicator('Z', 'Zoom');
      }

      // A - Add Annotation
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlers.handleAnnotationAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) });
        showKeyIndicator('A', 'Annotation');
      }

      // S - Add Speed
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlers.handleSpeedAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) });
        showKeyIndicator('S', 'Speed');
      }

      // \ - Add Trim
      if (e.key === '\\') {
        e.preventDefault();
        handlers.handleTrimAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) });
        showKeyIndicator('\\', 'Trim');
      }

      // Escape - Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedZoomId(null);
        setSelectedTrimId(null);
        setSelectedSpeedId(null);
        setSelectedAnnotationId(null);
        showKeyIndicator('Esc', 'Deselect');
      }

      // Delete/Backspace - Delete selected region
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedZoomId) { handlers.handleZoomDelete(selectedZoomId); showKeyIndicator('Del', 'Delete'); }
        else if (selectedTrimId) { handlers.handleTrimDelete(selectedTrimId); showKeyIndicator('Del', 'Delete'); }
        else if (selectedSpeedId) { handlers.handleSpeedDelete(selectedSpeedId); showKeyIndicator('Del', 'Delete'); }
        else if (selectedAnnotationId) { handlers.handleAnnotationDelete(selectedAnnotationId); showKeyIndicator('Del', 'Delete'); }
      }

      // Arrow keys - Seek
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const video = videoPlaybackRef.current?.video;
        if (video) { video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 5 : 1)); showKeyIndicator('←', e.shiftKey ? '-5s' : '-1s'); }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const video = videoPlaybackRef.current?.video;
        if (video) { video.currentTime = Math.min(duration, video.currentTime + (e.shiftKey ? 5 : 1)); showKeyIndicator('→', e.shiftKey ? '+5s' : '+1s'); }
        if (video) video.currentTime = Math.min(duration, video.currentTime + (e.shiftKey ? 5 : 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [currentTime, duration, handlers, selectedZoomId, selectedTrimId, selectedSpeedId, selectedAnnotationId, setSelectedZoomId, setSelectedTrimId, setSelectedSpeedId, setSelectedAnnotationId]);

  // Cleanup stale selections
  useEffect(() => { if (selectedZoomId && !zoomRegions.some(r => r.id === selectedZoomId)) setSelectedZoomId(null); }, [selectedZoomId, zoomRegions, setSelectedZoomId]);
  useEffect(() => { if (selectedTrimId && !trimRegions.some(r => r.id === selectedTrimId)) setSelectedTrimId(null); }, [selectedTrimId, trimRegions, setSelectedTrimId]);
  useEffect(() => { if (selectedAnnotationId && !annotationRegions.some(r => r.id === selectedAnnotationId)) setSelectedAnnotationId(null); }, [selectedAnnotationId, annotationRegions, setSelectedAnnotationId]);
  useEffect(() => { if (selectedSpeedId && !speedRegions.some(r => r.id === selectedSpeedId)) setSelectedSpeedId(null); }, [selectedSpeedId, speedRegions, setSelectedSpeedId]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-background"><div className="text-foreground">Loading video...</div></div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-background"><div className="text-destructive">{error}</div></div>;

  return (
    <div className="flex flex-col h-screen text-white/90 overflow-hidden selection:bg-white/10 relative">
      <GradientBackground
        gradientOrigin="top-middle"
        colors={[
          { color: "rgba(17,17,17,1)", stop: "0%" },
          { color: "rgba(25,25,30,1)", stop: "40%" },
          { color: "rgba(30,25,35,1)", stop: "70%" },
          { color: "rgba(20,20,25,1)", stop: "100%" },
        ]}
        noiseIntensity={1.2}
      />
      
      {/* Key indicator */}
      {activeKey && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-1 duration-100">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-white/90 font-mono text-[10px] leading-none">{activeKey.key}</span>
            <span className="text-white/50 text-[10px]">{activeKey.label}</span>
          </div>
        </div>
      )}
      <div className="h-11 flex-shrink-0 bg-[#111] border-b border-white/5 flex items-center justify-between px-5 z-50">
        <div className="flex items-center gap-4 flex-1">
          {onReset ? (
            <button onClick={onReset} className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-xs font-medium">← Back</button>
          ) : (
            <div className="flex items-center gap-2">
              <img src={kaptureLogo} alt="Kapture" className="w-6 h-6" />
              <span className="text-white/80 text-sm font-medium">Kapture</span>
            </div>
          )}
        </div>
        {fileName && <span className="text-white/30 text-xs truncate max-w-xs">{fileName}</span>}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => setShowFeatureModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors text-xs font-medium"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Request Feature
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 gap-3 flex min-h-0 relative">
        <div className="flex-[7] flex flex-col gap-3 min-w-0 h-full">
          <PanelGroup direction="vertical" className="gap-3">
            <Panel defaultSize={70} minSize={40}>
              <div className="w-full h-full flex bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                <div className="flex-1 flex justify-center items-center p-4">
                  {mockupType ? (
                    <div className="relative" style={{ width: 'auto', height: '100%', aspectRatio: mockupType === 'device' ? '9/19.5' : '16/10', maxWidth: '100%', margin: '0 auto' }}>
                      <VideoPlayback
                        aspectRatio={mockupType === 'device' ? '9:16' : aspectRatio} ref={videoPlaybackRef} videoPath={videoPath || ''} onDurationChange={setDuration} onTimeUpdate={setCurrentTime}
                        currentTime={currentTime} onPlayStateChange={setIsPlaying} onError={setError} 
                        wallpaper={wallpaper} zoomRegions={zoomRegions}
                        selectedZoomId={selectedZoomId} onSelectZoom={handlers.handleSelectZoom} onZoomFocusChange={handlers.handleZoomFocusChange} isPlaying={isPlaying}
                        showShadow={shadowIntensity > 0} shadowIntensity={shadowIntensity} showBlur={showBlur} motionBlurEnabled={motionBlurEnabled}
                        borderRadius={borderRadius} padding={padding} 
                        cropRegion={cropRegion} trimRegions={trimRegions} speedRegions={speedRegions}
                        annotationRegions={annotationRegions} selectedAnnotationId={selectedAnnotationId} onSelectAnnotation={handlers.handleSelectAnnotation}
                        onAnnotationPositionChange={handlers.handleAnnotationPositionChange} onAnnotationSizeChange={handlers.handleAnnotationSizeChange}
                        mockupType={mockupType} browserUrl={browserUrl} onBrowserUrlChange={setBrowserUrl}
                      />
                    </div>
                  ) : (
                    <div className="relative" style={{ width: 'auto', height: '100%', aspectRatio: getAspectRatioValue(aspectRatio), maxWidth: '100%', margin: '0 auto' }}>
                      <VideoPlayback
                        aspectRatio={aspectRatio} ref={videoPlaybackRef} videoPath={videoPath || ''} onDurationChange={setDuration} onTimeUpdate={setCurrentTime}
                        currentTime={currentTime} onPlayStateChange={setIsPlaying} onError={setError} 
                        wallpaper={wallpaper} zoomRegions={zoomRegions}
                        selectedZoomId={selectedZoomId} onSelectZoom={handlers.handleSelectZoom} onZoomFocusChange={handlers.handleZoomFocusChange} isPlaying={isPlaying}
                        showShadow={shadowIntensity > 0} shadowIntensity={shadowIntensity} showBlur={showBlur} motionBlurEnabled={motionBlurEnabled}
                        borderRadius={borderRadius} padding={padding} 
                        cropRegion={cropRegion} trimRegions={trimRegions} speedRegions={speedRegions}
                        annotationRegions={annotationRegions} selectedAnnotationId={selectedAnnotationId} onSelectAnnotation={handlers.handleSelectAnnotation}
                        onAnnotationPositionChange={handlers.handleAnnotationPositionChange} onAnnotationSizeChange={handlers.handleAnnotationSizeChange}
                      />
                    </div>
                  )}
                </div>
                <TooltipProvider delayDuration={0}>
                  <div className="flex flex-col items-center py-4 px-2 gap-2 border-l border-white/5">
                    <Tooltip><TooltipTrigger asChild><button onClick={() => { setSelectedZoomId(null); setSelectedTrimId(null); setSelectedSpeedId(null); setSelectedAnnotationId(null); }} className="w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg></button></TooltipTrigger><TooltipContent side="left">Settings</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button onClick={() => handlers.handleZoomAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) })} className="w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg></button></TooltipTrigger><TooltipContent side="left">Add Zoom (Z)</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button onClick={() => handlers.handleSpeedAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) })} className="w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button></TooltipTrigger><TooltipContent side="left">Add Speed (S)</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button onClick={() => handlers.handleTrimAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) })} className="w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></button></TooltipTrigger><TooltipContent side="left">Add Trim (\)</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><button onClick={() => handlers.handleAnnotationAdded({ start: currentTime * 1000, end: Math.min(currentTime * 1000 + 2000, duration * 1000) })} className="w-9 h-9 rounded-lg text-white/40 hover:text-white hover:bg-white/5 flex items-center justify-center"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button></TooltipTrigger><TooltipContent side="left">Add Annotation (A)</TooltipContent></Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </Panel>
            <PanelResizeHandle className="h-2 bg-transparent hover:bg-white/5 transition-colors rounded-full mx-4 flex items-center justify-center"><div className="w-8 h-0.5 bg-white/10 rounded-full" /></PanelResizeHandle>
            <Panel defaultSize={30} minSize={20}>
              <div className="h-full bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden flex flex-col">
                <TimelineEditor
                  videoDuration={duration} currentTime={currentTime} onSeek={handleSeek} isPlaying={isPlaying} onTogglePlayPause={togglePlayPause}
                  zoomRegions={zoomRegions} onZoomAdded={handlers.handleZoomAdded} onZoomSpanChange={handlers.handleZoomSpanChange} onZoomDelete={handlers.handleZoomDelete} selectedZoomId={selectedZoomId} onSelectZoom={handlers.handleSelectZoom}
                  trimRegions={trimRegions} onTrimAdded={handlers.handleTrimAdded} onTrimSpanChange={handlers.handleTrimSpanChange} onTrimDelete={handlers.handleTrimDelete} selectedTrimId={selectedTrimId} onSelectTrim={handlers.handleSelectTrim}
                  annotationRegions={annotationRegions} onAnnotationAdded={handlers.handleAnnotationAdded} onAnnotationSpanChange={handlers.handleAnnotationSpanChange} onAnnotationDelete={handlers.handleAnnotationDelete} selectedAnnotationId={selectedAnnotationId} onSelectAnnotation={handlers.handleSelectAnnotation}
                  speedRegions={speedRegions} onSpeedAdded={handlers.handleSpeedAdded} onSpeedSpanChange={handlers.handleSpeedSpanChange} onSpeedDelete={handlers.handleSpeedDelete} selectedSpeedId={selectedSpeedId} onSelectSpeed={handlers.handleSelectSpeed}
                  aspectRatio={aspectRatio} onAspectRatioChange={setAspectRatio} hideAspectRatio={!!mockupType}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>

        <SettingsPanel
          selected={wallpaper} onWallpaperChange={setWallpaper}
          selectedZoomDepth={selectedZoomId ? zoomRegions.find(z => z.id === selectedZoomId)?.depth : null} onZoomDepthChange={handlers.handleZoomDepthChange}
          selectedZoomId={selectedZoomId} zoomRegions={zoomRegions} onZoomDelete={handlers.handleZoomDelete} onSelectZoom={handlers.handleSelectZoom}
          selectedTrimId={selectedTrimId} trimRegions={trimRegions} onTrimDelete={handlers.handleTrimDelete} onSelectTrim={handlers.handleSelectTrim}
          shadowIntensity={shadowIntensity} onShadowChange={setShadowIntensity} showBlur={showBlur} onBlurChange={setShowBlur}
          motionBlurEnabled={motionBlurEnabled} onMotionBlurChange={setMotionBlurEnabled} borderRadius={borderRadius} onBorderRadiusChange={setBorderRadius}
          padding={padding} onPaddingChange={setPadding} cropRegion={cropRegion} onCropChange={setCropRegion} aspectRatio={aspectRatio}
          videoElement={videoPlaybackRef.current?.video || null} exportQuality={exportQuality} onExportQualityChange={setExportQuality} onExport={exportHook.handleExport}
          selectedAnnotationId={selectedAnnotationId} annotationRegions={annotationRegions} onAnnotationContentChange={handlers.handleAnnotationContentChange}
          onAnnotationTypeChange={handlers.handleAnnotationTypeChange} onAnnotationStyleChange={handlers.handleAnnotationStyleChange} onAnnotationFigureDataChange={handlers.handleAnnotationFigureDataChange}
          onAnnotationDelete={handlers.handleAnnotationDelete} onSelectAnnotation={handlers.handleSelectAnnotation}
          selectedSpeedId={selectedSpeedId} speedRegions={speedRegions} onSpeedChange={handlers.handleSpeedChange} onSpeedDelete={handlers.handleSpeedDelete} onSelectSpeed={handlers.handleSelectSpeed}
          onSeek={handleSeek} onDeselectZoom={() => setSelectedZoomId(null)} onDeselectTrim={() => setSelectedTrimId(null)} onDeselectSpeed={() => setSelectedSpeedId(null)} onDeselectAnnotation={() => setSelectedAnnotationId(null)}
        />
      </div>

      <Toaster theme="light" className="pointer-events-auto" />
      <ExportDialog isOpen={exportHook.showExportDialog} onClose={() => exportHook.setShowExportDialog(false)} progress={exportHook.exportProgress} isExporting={exportHook.isExporting} error={exportHook.exportError} onCancel={exportHook.handleCancelExport} />
      <FeatureRequestModal isOpen={showFeatureModal} onClose={() => setShowFeatureModal(false)} />
    </div>
  );
}
