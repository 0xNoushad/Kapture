import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crop } from "lucide-react";
import type { ZoomRegion, TrimRegion, AnnotationRegion, AnnotationType, FigureData, SpeedRegion, SpeedMultiplier, CropRegion, ZoomDepth } from "./types";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { AnnotationSettingsPanel, ZoomSettingsPanel, TrimSettingsPanel, SpeedSettingsPanel } from "./panels";
import { BackgroundPicker, VideoControls, ExportSection, CropDialog } from "./settings";
import { type AspectRatio } from "@/utils/aspectRatioUtils";
import type { ExportQuality } from "@/lib/exporter";

interface SettingsPanelProps {
  selected: string;
  onWallpaperChange: (path: string) => void;
  selectedZoomDepth?: ZoomDepth | null;
  onZoomDepthChange?: (depth: ZoomDepth) => void;
  selectedZoomId?: string | null;
  zoomRegions?: ZoomRegion[];
  onZoomDelete?: (id: string) => void;
  onSelectZoom?: (id: string | null) => void;
  selectedTrimId?: string | null;
  trimRegions?: TrimRegion[];
  onTrimDelete?: (id: string) => void;
  onSelectTrim?: (id: string | null) => void;
  shadowIntensity?: number;
  onShadowChange?: (intensity: number) => void;
  showBlur?: boolean;
  onBlurChange?: (showBlur: boolean) => void;
  motionBlurEnabled?: boolean;
  onMotionBlurChange?: (enabled: boolean) => void;
  borderRadius?: number;
  onBorderRadiusChange?: (radius: number) => void;
  padding?: number;
  onPaddingChange?: (padding: number) => void;
  cropRegion?: CropRegion;
  onCropChange?: (region: CropRegion) => void;
  aspectRatio: AspectRatio;
  videoElement?: HTMLVideoElement | null;
  exportQuality?: ExportQuality;
  onExportQualityChange?: (quality: ExportQuality) => void;
  onExport?: () => void;
  selectedAnnotationId?: string | null;
  annotationRegions?: AnnotationRegion[];
  onAnnotationContentChange?: (id: string, content: string) => void;
  onAnnotationTypeChange?: (id: string, type: AnnotationType) => void;
  onAnnotationStyleChange?: (id: string, style: Partial<AnnotationRegion['style']>) => void;
  onAnnotationFigureDataChange?: (id: string, figureData: FigureData) => void;
  onAnnotationDelete?: (id: string) => void;
  onSelectAnnotation?: (id: string | null) => void;
  selectedSpeedId?: string | null;
  speedRegions?: SpeedRegion[];
  onSpeedChange?: (speed: SpeedMultiplier) => void;
  onSpeedDelete?: (id: string) => void;
  onSelectSpeed?: (id: string | null) => void;
  onDeselectZoom?: () => void;
  onDeselectTrim?: () => void;
  onDeselectSpeed?: () => void;
  onDeselectAnnotation?: () => void;
  onSeek?: (time: number) => void;
}

export default SettingsPanel;

export function SettingsPanel({ 
  selected, 
  onWallpaperChange, 
  selectedZoomDepth, 
  onZoomDepthChange, 
  selectedZoomId,
  zoomRegions = [],
  onZoomDelete,
  onSelectZoom,
  selectedTrimId,
  trimRegions = [],
  onTrimDelete,
  onSelectTrim,
  shadowIntensity = 0, 
  onShadowChange, 
  showBlur, 
  onBlurChange, 
  motionBlurEnabled = true, 
  onMotionBlurChange, 
  borderRadius = 0, 
  onBorderRadiusChange, 
  padding = 50, 
  onPaddingChange, 
  cropRegion, 
  onCropChange, 
  aspectRatio, 
  videoElement, 
  exportQuality = 'good',
  onExportQualityChange,
  onExport,
  selectedAnnotationId,
  annotationRegions = [],
  onAnnotationContentChange,
  onAnnotationTypeChange,
  onAnnotationStyleChange,
  onAnnotationFigureDataChange,
  onAnnotationDelete,
  onSelectAnnotation,
  selectedSpeedId,
  speedRegions = [],
  onSpeedChange,
  onSpeedDelete,
  onSelectSpeed,
  onDeselectZoom,
  onDeselectTrim,
  onDeselectSpeed,
  onDeselectAnnotation,
  onSeek,
}: SettingsPanelProps) {
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  const selectedSpeed = selectedSpeedId ? speedRegions.find(s => s.id === selectedSpeedId) : null;
  const selectedAnnotation = selectedAnnotationId ? annotationRegions.find(a => a.id === selectedAnnotationId) : null;

  // If a zoom is selected, show zoom settings
  if (selectedZoomId && selectedZoomDepth && onZoomDepthChange && onZoomDelete && onSelectZoom && onSeek) {
    return (
      <ZoomSettingsPanel
        selectedDepth={selectedZoomDepth}
        selectedZoomId={selectedZoomId}
        zoomRegions={zoomRegions}
        onDepthChange={onZoomDepthChange}
        onDelete={() => onZoomDelete(selectedZoomId)}
        onClose={() => onDeselectZoom?.()}
        onSelectZoom={onSelectZoom}
        onDeleteZoom={onZoomDelete}
        onSeek={onSeek}
      />
    );
  }

  // If a trim is selected, show trim settings
  if (selectedTrimId && onTrimDelete && onSelectTrim && onSeek) {
    return (
      <TrimSettingsPanel
        selectedTrimId={selectedTrimId}
        trimRegions={trimRegions}
        onDelete={() => onTrimDelete(selectedTrimId)}
        onClose={() => onDeselectTrim?.()}
        onSelectTrim={onSelectTrim}
        onDeleteTrim={onTrimDelete}
        onSeek={onSeek}
      />
    );
  }

  // If a speed is selected, show speed settings
  if (selectedSpeed && onSpeedChange && onSpeedDelete && onSelectSpeed && onSeek) {
    return (
      <SpeedSettingsPanel
        selectedSpeed={selectedSpeed.speed}
        selectedSpeedId={selectedSpeed.id}
        speedRegions={speedRegions}
        onSpeedChange={onSpeedChange}
        onDelete={() => onSpeedDelete(selectedSpeed.id)}
        onClose={() => onDeselectSpeed?.()}
        onSelectSpeed={onSelectSpeed}
        onDeleteSpeed={onSpeedDelete}
        onSeek={onSeek}
      />
    );
  }

  // If an annotation is selected, show annotation settings
  if (selectedAnnotation && onAnnotationContentChange && onAnnotationTypeChange && onAnnotationStyleChange && onAnnotationDelete) {
    return (
      <AnnotationSettingsPanel
        annotation={selectedAnnotation}
        annotationRegions={annotationRegions}
        onContentChange={(content) => onAnnotationContentChange(selectedAnnotation.id, content)}
        onTypeChange={(type) => onAnnotationTypeChange(selectedAnnotation.id, type)}
        onStyleChange={(style) => onAnnotationStyleChange(selectedAnnotation.id, style)}
        onFigureDataChange={onAnnotationFigureDataChange ? (figureData) => onAnnotationFigureDataChange(selectedAnnotation.id, figureData) : undefined}
        onDelete={() => onAnnotationDelete(selectedAnnotation.id)}
        onClose={() => onDeselectAnnotation?.()}
        onSelectAnnotation={onSelectAnnotation}
        onDeleteAnnotation={onAnnotationDelete}
        onSeek={onSeek}
      />
    );
  }

  return (
    <div className="flex-[2] min-w-0 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-200">Video Settings</span>
        <KeyboardShortcutsHelp />
      </div>

      <VideoControls
        shadowIntensity={shadowIntensity}
        onShadowChange={onShadowChange}
        showBlur={showBlur}
        onBlurChange={onBlurChange}
        motionBlurEnabled={motionBlurEnabled}
        onMotionBlurChange={onMotionBlurChange}
        borderRadius={borderRadius}
        onBorderRadiusChange={onBorderRadiusChange}
        padding={padding}
        onPaddingChange={onPaddingChange}
      />

      <div className="mb-4">
        <Button
          onClick={() => setShowCropDropdown(!showCropDropdown)}
          variant="outline"
          className="w-full gap-2 bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white h-9 transition-all"
        >
          <Crop className="w-4 h-4" />
          Crop Video
        </Button>
      </div>

      {cropRegion && onCropChange && (
        <CropDialog
          isOpen={showCropDropdown}
          onClose={() => setShowCropDropdown(false)}
          videoElement={videoElement || null}
          cropRegion={cropRegion}
          onCropChange={onCropChange}
          aspectRatio={aspectRatio}
        />
      )}

      <BackgroundPicker
        selected={selected}
        onWallpaperChange={onWallpaperChange}
        videoElement={videoElement}
      />

      <ExportSection
        exportQuality={exportQuality}
        onExportQualityChange={onExportQualityChange}
        onExport={onExport}
      />
    </div>
  );
}
