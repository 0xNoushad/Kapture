import { useEffect } from "react";
import type { AnnotationRegion } from "../../types";

interface UseTimelineKeyboardProps {
  addKeyframe: () => void;
  handleAddZoom: () => void;
  handleAddTrim: () => void;
  handleAddAnnotation: () => void;
  handleAddSpeed: () => void;
  deleteSelectedKeyframe: () => void;
  deleteSelectedZoom: () => void;
  deleteSelectedTrim: () => void;
  deleteSelectedAnnotation: () => void;
  deleteSelectedSpeed: () => void;
  selectedKeyframeId: string | null;
  selectedZoomId: string | null;
  selectedTrimId: string | null;
  selectedAnnotationId: string | null;
  selectedSpeedId: string | null;
  annotationRegions: AnnotationRegion[];
  currentTime: number;
  onSelectAnnotation?: (id: string | null) => void;
}

export function useTimelineKeyboard({
  addKeyframe,
  handleAddZoom,
  handleAddTrim,
  handleAddAnnotation,
  handleAddSpeed,
  deleteSelectedKeyframe,
  deleteSelectedZoom,
  deleteSelectedTrim,
  deleteSelectedAnnotation,
  deleteSelectedSpeed,
  selectedKeyframeId,
  selectedZoomId,
  selectedTrimId,
  selectedAnnotationId,
  selectedSpeedId,
  annotationRegions,
  currentTime,
  onSelectAnnotation,
}: UseTimelineKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'f' || e.key === 'F') addKeyframe();
      if (e.key === 'z' || e.key === 'Z') handleAddZoom();
      if (e.key === '\\') handleAddTrim();
      if (e.key === 'a' || e.key === 'A') handleAddAnnotation();
      if (e.key === 's' || e.key === 'S') handleAddSpeed();
      
      if (e.key === 'Tab' && annotationRegions.length > 0) {
        const currentTimeMs = Math.round(currentTime * 1000);
        const overlapping = annotationRegions
          .filter(a => currentTimeMs >= a.startMs && currentTimeMs <= a.endMs)
          .sort((a, b) => a.zIndex - b.zIndex);
        
        if (overlapping.length > 0) {
          e.preventDefault();
          if (!selectedAnnotationId || !overlapping.some(a => a.id === selectedAnnotationId)) {
            onSelectAnnotation?.(overlapping[0].id);
          } else {
            const currentIndex = overlapping.findIndex(a => a.id === selectedAnnotationId);
            const nextIndex = e.shiftKey 
              ? (currentIndex - 1 + overlapping.length) % overlapping.length
              : (currentIndex + 1) % overlapping.length;
            onSelectAnnotation?.(overlapping[nextIndex].id);
          }
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedKeyframeId) { e.preventDefault(); deleteSelectedKeyframe(); }
        else if (selectedZoomId) { e.preventDefault(); deleteSelectedZoom(); }
        else if (selectedTrimId) { e.preventDefault(); deleteSelectedTrim(); }
        else if (selectedAnnotationId) { e.preventDefault(); deleteSelectedAnnotation(); }
        else if (selectedSpeedId) { e.preventDefault(); deleteSelectedSpeed(); }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addKeyframe, handleAddZoom, handleAddTrim, handleAddAnnotation, handleAddSpeed, deleteSelectedKeyframe, deleteSelectedZoom, deleteSelectedTrim, deleteSelectedAnnotation, deleteSelectedSpeed, selectedKeyframeId, selectedZoomId, selectedTrimId, selectedAnnotationId, selectedSpeedId, annotationRegions, currentTime, onSelectAnnotation]);
}
