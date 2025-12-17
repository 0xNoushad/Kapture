import { useMemo } from "react";
import type { ZoomRegion, TrimRegion, AnnotationRegion, SpeedRegion } from "../../types";
import type { TimelineRenderItem } from "../components/Timeline";
import {
  ZOOM_ROW_ID,
  TRIM_ROW_ID,
  ANNOTATION_ROW_1_ID,
  ANNOTATION_ROW_2_ID,
  ANNOTATION_ROW_3_ID,
  SPEED_ROW_ID,
} from "../utils";

interface UseTimelineItemsProps {
  zoomRegions: ZoomRegion[];
  trimRegions: TrimRegion[];
  annotationRegions: AnnotationRegion[];
  speedRegions: SpeedRegion[];
}

export function useTimelineItems({
  zoomRegions,
  trimRegions,
  annotationRegions,
  speedRegions,
}: UseTimelineItemsProps): TimelineRenderItem[] {
  return useMemo(() => {
    const zooms: TimelineRenderItem[] = zoomRegions.map((region, index) => ({
      id: region.id,
      rowId: ZOOM_ROW_ID,
      span: { start: region.startMs, end: region.endMs },
      label: `Zoom ${index + 1}`,
      zoomDepth: region.depth,
      variant: 'zoom',
    }));

    const trims: TimelineRenderItem[] = trimRegions.map((region, index) => ({
      id: region.id,
      rowId: TRIM_ROW_ID,
      span: { start: region.startMs, end: region.endMs },
      label: `Trim ${index + 1}`,
      variant: 'trim',
    }));

    const annotationRows = [ANNOTATION_ROW_1_ID, ANNOTATION_ROW_2_ID, ANNOTATION_ROW_3_ID];
    const rowAssignments: { rowId: string; endMs: number }[] = annotationRows.map(rowId => ({ rowId, endMs: 0 }));
    const sortedAnnotations = [...annotationRegions].sort((a, b) => a.startMs - b.startMs);
    
    const annotations: TimelineRenderItem[] = sortedAnnotations.map((region) => {
      let label: string;
      if (region.type === 'text') {
        const preview = region.content.trim() || 'Empty text';
        label = preview.length > 20 ? `${preview.substring(0, 20)}...` : preview;
      } else if (region.type === 'image') {
        label = 'Image';
      } else {
        label = 'Annotation';
      }
      
      const availableRow = rowAssignments.find(r => r.endMs <= region.startMs) || rowAssignments[0];
      availableRow.endMs = region.endMs;
      
      return {
        id: region.id,
        rowId: availableRow.rowId,
        span: { start: region.startMs, end: region.endMs },
        label,
        variant: 'annotation',
      };
    });

    const speeds: TimelineRenderItem[] = speedRegions.map((region) => ({
      id: region.id,
      rowId: SPEED_ROW_ID,
      span: { start: region.startMs, end: region.endMs },
      label: `${region.speed}×`,
      speedMultiplier: region.speed,
      variant: 'speed',
    }));

    return [...zooms, ...trims, ...annotations, ...speeds];
  }, [zoomRegions, trimRegions, annotationRegions, speedRegions]);
}
