import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CropControl } from "../CropControl";
import type { CropRegion } from "../types";
import { type AspectRatio } from "@/utils/aspectRatioUtils";

interface CropDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoElement: HTMLVideoElement | null;
  cropRegion: CropRegion;
  onCropChange: (region: CropRegion) => void;
  aspectRatio: AspectRatio;
}

export function CropDialog({ isOpen, onClose, videoElement, cropRegion, onCropChange, aspectRatio }: CropDialogProps) {
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    if (!videoElement) return;
    
    if (isOpen) {
      wasPlayingRef.current = !videoElement.paused;
      if (!videoElement.paused) {
        videoElement.pause();
      }
    } else {
      if (wasPlayingRef.current) {
        videoElement.play().catch(() => {});
      }
    }
  }, [isOpen, videoElement]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] bg-[#09090b] rounded-2xl shadow-2xl border border-white/10 p-6 w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <span className="text-xl font-bold text-slate-200">Crop Video</span>
            <p className="text-sm text-slate-400 mt-1">Drag on each side to adjust the crop area</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <CropControl
            videoElement={videoElement}
            cropRegion={cropRegion}
            onCropChange={onCropChange}
            aspectRatio={aspectRatio}
          />
        </div>
        <div className="mt-4 flex justify-end flex-shrink-0">
          <Button
            onClick={onClose}
            size="lg"
            className="bg-[#34B27B] hover:bg-[#34B27B]/90 text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}
