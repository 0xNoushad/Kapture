import { Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "../../utils/formatTime";
import type { AnnotationRegion } from "../../types";

interface AnnotationListProps {
  annotations: AnnotationRegion[];
  selectedId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSeek: (time: number) => void;
}

export function AnnotationList({ annotations, selectedId, onSelect, onDelete, onSeek }: AnnotationListProps) {
  if (annotations.length === 0) return null;

  return (
    <div className="mt-4">
      <span className="text-xs font-medium text-slate-400 mb-3 block">All Annotations ({annotations.length})</span>
      <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
        {annotations.map((ann) => (
          <div
            key={ann.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg border cursor-pointer group transition-all",
              ann.id === selectedId ? "bg-[#B4A046]/10 border-[#B4A046]/30" : "bg-white/5 border-white/5 hover:bg-white/10"
            )}
            onClick={() => { onSelect(ann.id); onSeek(ann.startMs / 1000); }}
          >
            <div className="w-5 h-5 rounded bg-[#B4A046]/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-3 h-3 text-[#B4A046]" />
            </div>
            <span className="text-xs text-slate-300 flex-1 truncate">
              {ann.type === 'text' ? (ann.textContent || ann.content || 'Text').slice(0, 12) : ann.type === 'image' ? 'Image' : 'Arrow'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{formatTime(ann.startMs)}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(ann.id); }} className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
