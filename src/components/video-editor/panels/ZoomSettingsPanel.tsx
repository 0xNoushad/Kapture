import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, ZoomIn, ChevronLeft } from "lucide-react";
import type { ZoomDepth, ZoomRegion } from "../types";
import { formatTime } from "../utils/formatTime";

const ZOOM_DEPTH_OPTIONS: Array<{ depth: ZoomDepth; label: string }> = [
  { depth: 1, label: "1.25×" },
  { depth: 2, label: "1.5×" },
  { depth: 3, label: "1.8×" },
  { depth: 4, label: "2.2×" },
  { depth: 5, label: "3.5×" },
  { depth: 6, label: "5×" },
];

interface ZoomSettingsPanelProps {
  selectedDepth: ZoomDepth;
  selectedZoomId: string;
  zoomRegions: ZoomRegion[];
  onDepthChange: (depth: ZoomDepth) => void;
  onDelete: () => void;
  onClose: () => void;
  onSelectZoom: (id: string) => void;
  onDeleteZoom: (id: string) => void;
  onSeek: (time: number) => void;
}

export function ZoomSettingsPanel({ 
  selectedDepth, 
  selectedZoomId,
  zoomRegions,
  onDepthChange, 
  onDelete, 
  onClose,
  onSelectZoom,
  onDeleteZoom,
  onSeek,
}: ZoomSettingsPanelProps) {
  return (
    <div className="flex-[2] min-w-0 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Settings
      </button>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#34B27B]/20 flex items-center justify-center">
          <ZoomIn className="w-4 h-4 text-[#34B27B]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-200">Zoom Settings</h3>
          <p className="text-xs text-slate-500">Adjust zoom level</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-xs font-medium text-slate-400 mb-3 block">Zoom Level</span>
        <div className="grid grid-cols-3 gap-2">
          {ZOOM_DEPTH_OPTIONS.map((option) => {
            const isActive = selectedDepth === option.depth;
            return (
              <Button
                key={option.depth}
                type="button"
                onClick={() => onDepthChange(option.depth)}
                className={cn(
                  "h-auto w-full rounded-xl border px-2 py-3 text-center shadow-sm transition-all",
                  "duration-200 ease-out",
                  isActive
                    ? "border-[#34B27B] bg-[#34B27B] text-white shadow-[#34B27B]/20 scale-105 ring-2 ring-[#34B27B]/20"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10 hover:text-slate-200"
                )}
              >
                <span className="text-sm font-semibold tracking-tight">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {zoomRegions.length > 0 && (
        <div className="mb-6">
          <span className="text-xs font-medium text-slate-400 mb-3 block">All Zooms ({zoomRegions.length})</span>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {zoomRegions.map((zoom) => (
              <div
                key={zoom.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border cursor-pointer group transition-all",
                  zoom.id === selectedZoomId
                    ? "bg-[#34B27B]/10 border-[#34B27B]/30"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
                onClick={() => {
                  onSelectZoom(zoom.id);
                  onSeek(zoom.startMs / 1000);
                }}
              >
                <div className="w-5 h-5 rounded bg-[#34B27B]/20 flex items-center justify-center flex-shrink-0">
                  <ZoomIn className="w-3 h-3 text-[#34B27B]" />
                </div>
                <span className="text-xs text-slate-300 flex-1">{zoom.depth}×</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatTime(zoom.startMs)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteZoom(zoom.id);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-white/5">
        <Button
          onClick={onDelete}
          variant="destructive"
          size="sm"
          className="w-full gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete Zoom
        </Button>
      </div>
    </div>
  );
}
