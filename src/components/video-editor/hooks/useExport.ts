import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { VideoExporter, type ExportProgress, type ExportQuality } from "@/lib/exporter";
import { getAspectRatioValue, type AspectRatio } from "@/utils/aspectRatioUtils";
import type { ZoomRegion, TrimRegion, AnnotationRegion, CropRegion } from "../types";

interface UseExportProps {
  videoPath: string | null;
  wallpaper: string;
  zoomRegions: ZoomRegion[];
  trimRegions: TrimRegion[];
  annotationRegions: AnnotationRegion[];
  shadowIntensity: number;
  showBlur: boolean;
  motionBlurEnabled: boolean;
  borderRadius: number;
  padding: number;
  cropRegion: CropRegion;
  aspectRatio: AspectRatio;
  exportQuality: ExportQuality;
  isPlaying: boolean;
  videoRef: React.RefObject<{ video: HTMLVideoElement | null; containerRef?: React.RefObject<HTMLDivElement>; pause: () => void; play: () => Promise<void> } | null>;
}

export function useExport({
  videoPath, wallpaper, zoomRegions, trimRegions, annotationRegions,
  shadowIntensity, showBlur, motionBlurEnabled, borderRadius, padding, cropRegion,
  aspectRatio, exportQuality, isPlaying, videoRef,
}: UseExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const exporterRef = useRef<VideoExporter | null>(null);

  const handleExport = useCallback(async () => {
    if (!videoPath) { toast.error('No video loaded'); return; }
    const video = videoRef.current?.video;
    if (!video) { toast.error('Video not ready'); return; }

    setShowExportDialog(true);
    setIsExporting(true);
    setExportProgress(null);
    setExportError(null);

    try {
      const wasPlaying = isPlaying;
      if (wasPlaying) videoRef.current?.pause();

      const aspectRatioValue = getAspectRatioValue(aspectRatio);
      const sourceWidth = video.videoWidth || 1920;
      const sourceHeight = video.videoHeight || 1080;
      
      let exportWidth: number, exportHeight: number, bitrate: number;

      if (exportQuality === 'source') {
        exportWidth = sourceWidth;
        exportHeight = sourceHeight;

        if (aspectRatioValue === 1) {
          const baseDimension = Math.floor(Math.min(sourceWidth, sourceHeight) / 2) * 2;
          exportWidth = exportHeight = baseDimension;
        } else if (aspectRatioValue > 1) {
          const baseWidth = Math.floor(sourceWidth / 2) * 2;
          let found = false;
          for (let w = baseWidth; w >= 100 && !found; w -= 2) {
            const h = Math.round(w / aspectRatioValue);
            if (h % 2 === 0 && Math.abs((w / h) - aspectRatioValue) < 0.0001) {
              exportWidth = w; exportHeight = h; found = true;
            }
          }
          if (!found) { exportWidth = baseWidth; exportHeight = Math.floor((baseWidth / aspectRatioValue) / 2) * 2; }
        } else {
          const baseHeight = Math.floor(sourceHeight / 2) * 2;
          let found = false;
          for (let h = baseHeight; h >= 100 && !found; h -= 2) {
            const w = Math.round(h * aspectRatioValue);
            if (w % 2 === 0 && Math.abs((w / h) - aspectRatioValue) < 0.0001) {
              exportWidth = w; exportHeight = h; found = true;
            }
          }
          if (!found) { exportHeight = baseHeight; exportWidth = Math.floor((baseHeight * aspectRatioValue) / 2) * 2; }
        }

        const totalPixels = exportWidth * exportHeight;
        bitrate = totalPixels > 2560 * 1440 ? 80_000_000 : totalPixels > 1920 * 1080 ? 50_000_000 : 30_000_000;
      } else {
        const targetHeight = exportQuality === 'medium' ? 720 : 1080;
        exportHeight = Math.floor(targetHeight / 2) * 2;
        exportWidth = Math.floor((exportHeight * aspectRatioValue) / 2) * 2;
        const totalPixels = exportWidth * exportHeight;
        bitrate = totalPixels <= 1280 * 720 ? 10_000_000 : totalPixels <= 1920 * 1080 ? 20_000_000 : 30_000_000;
      }

      const containerElement = videoRef.current?.containerRef?.current;
      const previewWidth = containerElement?.clientWidth || 1920;
      const previewHeight = containerElement?.clientHeight || 1080;

      const exporter = new VideoExporter({
        videoUrl: videoPath, width: exportWidth, height: exportHeight, frameRate: 60, bitrate, codec: 'avc1.640033',
        wallpaper, zoomRegions, trimRegions, showShadow: shadowIntensity > 0, shadowIntensity, showBlur, motionBlurEnabled,
        borderRadius, padding, cropRegion, annotationRegions, previewWidth, previewHeight,
        onProgress: (progress: ExportProgress) => setExportProgress(progress),
      });

      exporterRef.current = exporter;
      const result = await exporter.export();

      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url; a.download = `export-${Date.now()}.mp4`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Video exported! Check your downloads.');
      } else {
        setExportError(result.error || 'Export failed');
        toast.error(result.error || 'Export failed');
      }

      if (wasPlaying) videoRef.current?.play();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setExportError(errorMessage);
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
      exporterRef.current = null;
    }
  }, [videoPath, wallpaper, zoomRegions, trimRegions, shadowIntensity, showBlur, motionBlurEnabled, borderRadius, padding, cropRegion, annotationRegions, isPlaying, aspectRatio, exportQuality, videoRef]);

  const handleCancelExport = useCallback(() => {
    if (exporterRef.current) {
      exporterRef.current.cancel();
      toast.info('Export cancelled');
      setShowExportDialog(false);
      setIsExporting(false);
      setExportProgress(null);
      setExportError(null);
    }
  }, []);

  return {
    isExporting, exportProgress, exportError, showExportDialog, setShowExportDialog,
    handleExport, handleCancelExport,
  };
}
