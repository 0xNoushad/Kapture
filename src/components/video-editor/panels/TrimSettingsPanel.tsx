import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, Scissors, ChevronLeft } from "lucide-react";
import type { TrimRegion } from "../types";
import { formatTime } from "../utils/formatTime";

interface TrimSettingsPanelProps {
  selectedTrimId: string;
  trimRegions: TrimRegion[];
  onDelete: () => void;
  onClose: () => void;
  onSelectTrim: (id: string) => void;
  onDeleteTrim: (id: string) => void;
  onSeek: (time: number) => void;
}

export function TrimSettingsPanel({ 
  selectedTrimId,
  trimRegions,
  onDelete, 
  onClose,
  onSelectTrim,
  onDeleteTrim,
  onSeek,
}: TrimSettingsPanelProps) {
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
        <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-[#ef4444]" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-200">Trim Settings</h3>
          <p className="text-xs text-slate-500">Cut out this section</p>
        </div>
      </div>

      <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/5">
        <p className="text-sm text-slate-400 mb-1">This section will be removed from the video</p>
        <p className="text-xs text-slate-500">Drag the edges in the timeline to adjust</p>
      </div>

      {trimRegions.length > 0 && (
        <div className="mb-6">
          <span className="text-xs font-medium text-slate-400 mb-3 block">All Trims ({trimRegions.length})</span>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {trimRegions.map((trim) => (
              <div
                key={trim.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border cursor-pointer group transition-all",
                  trim.id === selectedTrimId
                    ? "bg-[#ef4444]/10 border-[#ef4444]/30"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
                onClick={() => {
                  onSelectTrim(trim.id);
                  onSeek(trim.startMs / 1000);
                }}
              >
                <div className="w-5 h-5 rounded bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-3 h-3 text-[#ef4444]" />
                </div>
                <span className="text-xs text-slate-300 flex-1">Trim</span>
                <span className="text-[10px] text-slate-500 font-mono">{formatTime(trim.startMs)} - {formatTime(trim.endMs)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrim(trim.id);
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
          Delete Trim
        </Button>
      </div>
    </div>
  );
}
