import type { Range } from "dnd-timeline";

export const ZOOM_ROW_ID = "row-zoom";
export const TRIM_ROW_ID = "row-trim";
export const ANNOTATION_ROW_1_ID = "row-annotation-1";
export const ANNOTATION_ROW_2_ID = "row-annotation-2";
export const ANNOTATION_ROW_3_ID = "row-annotation-3";
export const SPEED_ROW_ID = "row-speed";
export const FALLBACK_RANGE_MS = 1000;
export const TARGET_MARKER_COUNT = 12;

export interface TimelineScaleConfig {
  intervalMs: number;
  gridMs: number;
  minItemDurationMs: number;
  defaultItemDurationMs: number;
  minVisibleRangeMs: number;
}

const SCALE_CANDIDATES = [
  { intervalSeconds: 1, gridSeconds: 1 },
  { intervalSeconds: 2, gridSeconds: 1 },
  { intervalSeconds: 5, gridSeconds: 1 },
  { intervalSeconds: 10, gridSeconds: 1 },
  { intervalSeconds: 30, gridSeconds: 1 },
  { intervalSeconds: 60, gridSeconds: 1 },
];

export function calculateTimelineScale(durationSeconds: number): TimelineScaleConfig {
  const totalMs = Math.max(0, Math.round(durationSeconds * 1000));

  const selectedCandidate = SCALE_CANDIDATES.find((candidate) => {
    if (durationSeconds <= 0) return true;
    const markers = durationSeconds / candidate.intervalSeconds;
    return markers <= TARGET_MARKER_COUNT;
  }) ?? SCALE_CANDIDATES[SCALE_CANDIDATES.length - 1];

  const intervalMs = Math.round(selectedCandidate.intervalSeconds * 1000);
  const gridMs = Math.round(selectedCandidate.gridSeconds * 1000);
  const minItemDurationMs = 1;
  const defaultItemDurationMs = Math.min(
    Math.max(minItemDurationMs, intervalMs * 2),
    totalMs > 0 ? totalMs : intervalMs * 2,
  );

  const minVisibleRangeMs = totalMs > 0
    ? Math.min(Math.max(intervalMs * 3, minItemDurationMs * 6, 1000), totalMs)
    : Math.max(intervalMs * 3, minItemDurationMs * 6, 1000);

  return { intervalMs, gridMs, minItemDurationMs, defaultItemDurationMs, minVisibleRangeMs };
}

export function createInitialRange(totalMs: number): Range {
  if (totalMs > 0) {
    const padding = Math.max(100, totalMs * 0.02);
    return { start: -padding, end: totalMs + padding };
  }
  return { start: 0, end: FALLBACK_RANGE_MS };
}

export function formatTimeLabel(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
