import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Gauge, ChevronLeft } from "lucide-react";
import type { SpeedMultiplier, SpeedRegion } from "../types";
import { formatTime } from "../utils/formatTime";

const SPEED_OPTIONS: SpeedMultiplier[] = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

interface SpeedSettingsPanelProps {
  selectedSpeed: SpeedMultiplier;
  selectedSpeedId: string;
  speedRegions: SpeedRegion[];
  onSpeedChange: (speed: SpeedMultiplier) => void;
  onDelete: () => void;
  onClose: () => void;
  onSelectSpeed: (id: string) => void;
  onDeleteSpeed: (id: string) => void;
  onSeek: (time: number) => void;
}

export function SpeedSettingsPanel({ 
  selectedSpeed, 
  selectedSpeedId,
  speedRegions,
  onSpeedChange, 
  onDelete, 
  onClose,
  onSelectSpeed,
  onDeleteSpeed,
  onSeek,
}: SpeedSettingsPanelProps) {
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
        <div className="w-8 h-8 rounded-lg bg-[#f97316]/20 flex items-center justify-center">
          <Gauge className="w-4 h-4 text-[#f97316]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-200">Speed Settings</h3>
          <p className="text-xs text-slate-500">Adjust playback speed</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-xs font-medium text-slate-400 mb-3 block">Playback Speed</span>
        <div className="grid grid-cols-4 gap-2">
          {SPEED_OPTIONS.map((speed) => {
            const isActive = selectedSpeed === speed;
            const isSlowMo = speed < 1;
            const isFast = speed > 1;
            return (
              <Button
                key={speed}
                type="button"
                onClick={() => onSpeedChange(speed)}
                className={cn(
                  "h-auto w-full rounded-xl border px-1 py-3 text-center shadow-sm transition-all flex flex-col items-center gap-1",
                  "duration-200 ease-out",
                  isActive
                    ? "border-[#f97316] bg-[#f97316] text-white shadow-[#f97316]/20 scale-105 ring-2 ring-[#f97316]/20"
                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10 hover:text-slate-200"
                )}
              >
                <span className="text-sm font-semibold tracking-tight">{speed}×</span>
                {isSlowMo && <span className="text-[9px] opacity-60">Slow</span>}
                {speed === 1 && <span className="text-[9px] opacity-60">Normal</span>}
                {isFast && <span className="text-[9px] opacity-60">Fast</span>}
              </Button>
            );
          })}
        </div>
      </div>

      {speedRegions.length > 0 && (
        <div className="mb-6">
          <span className="text-xs font-medium text-slate-400 mb-3 block">All Speed Effects ({speedRegions.length})</span>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {speedRegions.map((speed) => (
              <div
                key={speed.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border cursor-pointer group transition-all",
                  speed.id === selectedSpeedId
                    ? "bg-[#f97316]/10 border-[#f97316]/30"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
                onClick={() => {
                  onSelectSpeed(speed.id);
                  onSeek(speed.startMs / 1000);
                }}
              >
                <div className="w-5 h-5 rounded bg-[#f97316]/20 flex items-center justify-center flex-shrink-0">
                  <Gauge className="w-3 h-3 text-[#f97316]" />
                </div>
                <span className="text-xs text-slate-300 flex-1">{speed.speed}×</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatTime(speed.startMs)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSpeed(speed.id);
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
          Delete Speed
        </Button>
      </div>
    </div>
  );
}
