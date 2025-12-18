import { Button } from "@/components/ui/button";
import { Scissors, ZoomIn, MessageSquare, ChevronDown, Check, Play, Pause, ChevronLeft, ChevronRight, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AspectRatio, getAspectRatioLabel } from "@/utils/aspectRatioUtils";

interface TimelineToolbarProps {
  onAddZoom: () => void;
  onAddTrim: () => void;
  onAddAnnotation: () => void;
  onAddSpeed: () => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  isPlaying: boolean;
  onTogglePlayPause?: () => void;
  currentTime: number;
  videoDuration: number;
  onSeek?: (time: number) => void;
  totalMs: number;
  range: { start: number; end: number };
  onRangeChange: (range: { start: number; end: number }) => void;
  hideAspectRatio?: boolean;
}

export function TimelineToolbar({
  onAddZoom,
  onAddTrim,
  onAddAnnotation,
  onAddSpeed,
  aspectRatio,
  onAspectRatioChange,
  isPlaying,
  onTogglePlayPause,
  currentTime,
  videoDuration,
  onSeek,
  totalMs,
  range,
  onRangeChange,
  hideAspectRatio = false,
}: TimelineToolbarProps) {
  const visibleRange = range.end - range.start;

  return (
    <div className="flex items-center px-4 py-2 border-b border-white/5 bg-[transparent]">
      {/* Left section */}
      <div className="flex items-center gap-1 flex-1">
        <Button onClick={onAddZoom} variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-[#34B27B] hover:bg-[#34B27B]/10 transition-all" title="Add Zoom (Z)">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button onClick={onAddTrim} variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all" title="Add Trim (\)">
          <Scissors className="w-4 h-4" />
        </Button>
        <Button onClick={onAddAnnotation} variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-[#B4A046] hover:bg-[#B4A046]/10 transition-all" title="Add Annotation (A)">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button onClick={onAddSpeed} variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-all" title="Add Speed (S)">
          <Gauge className="w-4 h-4" />
        </Button>
        {!hideAspectRatio && (
          <div className="ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-white/50 hover:text-slate-200 hover:bg-white/10 transition-all gap-1">
                  <span className="font-medium">{getAspectRatioLabel(aspectRatio)}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-white/10">
                {(['16:9', '9:16', '1:1', '4:3', '4:5'] as AspectRatio[]).map((ratio) => (
                  <DropdownMenuItem key={ratio} onClick={() => onAspectRatioChange(ratio)} className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer flex items-center justify-between gap-3">
                    <span>{getAspectRatioLabel(ratio)}</span>
                    {aspectRatio === ratio && <Check className="w-3 h-3 text-[#34B27B]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Center section - Playback Controls */}
      <div className="flex items-center gap-1">
        <Button onClick={() => onSeek?.(Math.max(0, currentTime - 5))} variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Back 5s">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button onClick={onTogglePlayPause} variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full transition-all", isPlaying ? "text-white/70 hover:text-white hover:bg-white/10" : "bg-white text-black hover:bg-white/90")} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </Button>
        <Button onClick={() => onSeek?.(Math.min(videoDuration, currentTime + 5))} variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 transition-all" title="Forward 5s">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 flex-1 justify-end">
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <Button
            onClick={() => {
              const center = (range.start + range.end) / 2;
              const newRange = visibleRange * 0.5;
              const minRange = 3000;
              if (newRange < minRange) return;
              const newStart = Math.max(0, center - newRange / 2);
              const newEnd = Math.min(totalMs, newStart + newRange);
              onRangeChange({ start: newStart, end: newEnd });
            }}
            variant="ghost" size="sm" className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10 transition-all" title="Zoom In"
          >+</Button>
          <Button
            onClick={() => {
              const center = (range.start + range.end) / 2;
              const newRange = Math.min(visibleRange * 2, totalMs);
              const newStart = Math.max(0, center - newRange / 2);
              const newEnd = Math.min(totalMs, newStart + newRange);
              onRangeChange({ start: newStart, end: newEnd });
            }}
            variant="ghost" size="sm" className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10 transition-all" title="Zoom Out"
          >−</Button>
          <Button
            onClick={() => {
              const padding = Math.max(100, totalMs * 0.02);
              onRangeChange({ start: -padding, end: totalMs + padding });
            }}
            variant="ghost" size="sm" className="h-7 px-2 text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all" title="Reset View"
          >Fit</Button>
        </div>
      </div>
    </div>
  );
}
