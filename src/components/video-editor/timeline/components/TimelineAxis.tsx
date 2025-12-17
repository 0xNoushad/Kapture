import { useMemo } from "react";
import { useTimelineContext } from "dnd-timeline";
import { cn } from "@/lib/utils";
import { formatTimeLabel } from "../utils";

interface TimelineAxisProps {
  videoDurationMs: number;
  currentTimeMs: number;
}

export function TimelineAxis({ videoDurationMs, currentTimeMs }: TimelineAxisProps) {
  const { sidebarWidth, direction, range, valueToPixels } = useTimelineContext();
  const sideProperty = direction === "rtl" ? "right" : "left";

  const markers = useMemo(() => {
    const maxTime = videoDurationMs > 0 ? videoDurationMs : range.end;
    const visibleDuration = range.end - range.start;
    const markerTimes = new Set<number>();

    const TARGET_MARKERS = 10;
    const idealIntervalMs = visibleDuration / TARGET_MARKERS;

    const NICE_INTERVALS = [
      1000, 2000, 5000, 10000, 15000, 30000,
      60000, 120000, 300000, 600000,
    ];

    const markerInterval = NICE_INTERVALS.find(i => i >= idealIntervalMs) || NICE_INTERVALS[NICE_INTERVALS.length - 1];
    const firstMarker = Math.max(0, Math.ceil(Math.max(0, range.start) / markerInterval) * markerInterval);

    for (let time = firstMarker; time <= Math.min(maxTime, range.end); time += markerInterval) {
      markerTimes.add(time);
    }

    if (range.start <= 0 && range.end >= 0) {
      markerTimes.add(0);
    }

    const sorted = Array.from(markerTimes)
      .filter(time => time >= 0 && time <= maxTime)
      .sort((a, b) => a - b);

    return {
      markers: sorted.map((time) => ({ time, label: formatTimeLabel(time) })),
      minorTicks: [] as number[],
    };
  }, [range.end, range.start, videoDurationMs]);

  return (
    <div
      className="h-8 bg-[transparent] border-b border-white/5 relative overflow-hidden select-none"
      style={{ [sideProperty === "right" ? "marginRight" : "marginLeft"]: `${sidebarWidth}px` }}
    >
      {markers.minorTicks.map((time) => {
        const offset = valueToPixels(time - range.start);
        return (
          <div
            key={`minor-${time}`}
            className="absolute bottom-0 h-1 w-[1px] bg-white/5"
            style={{ [sideProperty]: `${offset}px` }}
          />
        );
      })}

      {markers.markers.map((marker) => {
        const offset = valueToPixels(marker.time - range.start);
        return (
          <div
            key={marker.time}
            className="absolute bottom-0 h-full flex flex-row items-end"
            style={{ [sideProperty]: `${offset}px` }}
          >
            <div className="flex flex-col items-center pb-1">
              <div className="h-2 w-px bg-white/30 mb-1" />
              <span
                className={cn(
                  "text-[10px] font-medium tabular-nums tracking-tight",
                  marker.time === currentTimeMs ? "text-[#34B27B]" : "text-white/40"
                )}
              >
                {marker.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
