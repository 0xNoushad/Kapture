import { Button } from "../ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
}

export default function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onTogglePlayPause,
  onSeek,
}: PlaybackControlsProps) {
  function formatTime(seconds: number) {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function handleSeekChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSeek(parseFloat(e.target.value));
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
      <Button
        onClick={onTogglePlayPause}
        size="icon"
        className={cn(
          "w-7 h-7 rounded-full transition-all duration-200",
          isPlaying
            ? "bg-white/10 text-white/80 hover:bg-white/15"
            : "bg-white text-black hover:bg-white/90"
        )}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 fill-current" />
        ) : (
          <Play className="w-3 h-3 fill-current ml-0.5" />
        )}
      </Button>

      <span className="text-[10px] font-medium text-white/40 tabular-nums w-[28px] text-right">
        {formatTime(currentTime)}
      </span>

      <div className="flex-1 relative h-5 flex items-center group">
        {/* Track Background */}
        <div className="absolute left-0 right-0 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Interactive Input */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          step="0.01"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Custom Thumb */}
        <div
          className="absolute w-2 h-2 bg-white rounded-full shadow-sm pointer-events-none group-hover:scale-125 transition-transform duration-100"
          style={{
            left: `${progress}%`,
            transform: "translateX(-50%)",
          }}
        />
      </div>

      <span className="text-[10px] font-medium text-white/20 tabular-nums w-[28px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
