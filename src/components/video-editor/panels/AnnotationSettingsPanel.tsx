import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trash2, Type, Image as ImageIcon, ChevronLeft, Info } from "lucide-react";
import type { AnnotationRegion, AnnotationType, FigureData } from "../types";
import { TextSettings, ImageSettings, ArrowSettings, AnnotationList } from "./annotation";

interface AnnotationSettingsPanelProps {
  annotation: AnnotationRegion;
  annotationRegions?: AnnotationRegion[];
  onContentChange: (content: string) => void;
  onTypeChange: (type: AnnotationType) => void;
  onStyleChange: (style: Partial<AnnotationRegion['style']>) => void;
  onFigureDataChange?: (figureData: FigureData) => void;
  onDelete: () => void;
  onClose?: () => void;
  onSelectAnnotation?: (id: string) => void;
  onDeleteAnnotation?: (id: string) => void;
  onSeek?: (time: number) => void;
}

export function AnnotationSettingsPanel({
  annotation,
  annotationRegions = [],
  onContentChange,
  onTypeChange,
  onStyleChange,
  onFigureDataChange,
  onDelete,
  onClose,
  onSelectAnnotation,
  onDeleteAnnotation,
  onSeek,
}: AnnotationSettingsPanelProps) {
  return (
    <div className="flex-[2] min-w-0 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
      {onClose && (
        <button onClick={onClose} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </button>
      )}
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-200">Annotation Settings</span>
          <span className="text-[10px] uppercase tracking-wider font-medium text-[#B4A046] bg-[#B4A046]/10 px-2 py-1 rounded-full">Active</span>
        </div>
        
        <Tabs value={annotation.type} onValueChange={(value) => onTypeChange(value as AnnotationType)} className="mb-6">
          <TabsList className="mb-4 bg-white/5 border border-white/5 p-1 w-full grid grid-cols-3 h-auto rounded-xl">
            <TabsTrigger value="text" className="data-[state=active]:bg-[#34B27B] data-[state=active]:text-white text-slate-400 py-2 rounded-lg transition-all gap-2">
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-[#34B27B] data-[state=active]:text-white text-slate-400 py-2 rounded-lg transition-all gap-2">
              <ImageIcon className="w-4 h-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="figure" className="data-[state=active]:bg-[#34B27B] data-[state=active]:text-white text-slate-400 py-2 rounded-lg transition-all gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Arrow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-0">
            <TextSettings annotation={annotation} onContentChange={onContentChange} onStyleChange={onStyleChange} />
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            <ImageSettings annotation={annotation} onContentChange={onContentChange} />
          </TabsContent>

          <TabsContent value="figure" className="mt-0">
            <ArrowSettings figureData={annotation.figureData} onFigureDataChange={onFigureDataChange} />
          </TabsContent>
        </Tabs>

        {onSelectAnnotation && onDeleteAnnotation && onSeek && (
          <AnnotationList
            annotations={annotationRegions}
            selectedId={annotation.id}
            onSelect={onSelectAnnotation}
            onDelete={onDeleteAnnotation}
            onSeek={onSeek}
          />
        )}

        <Button onClick={onDelete} variant="destructive" size="sm" className="w-full gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all mt-4">
          <Trash2 className="w-4 h-4" />
          Delete Annotation
        </Button>

        <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-slate-300">
            <Info className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Shortcuts & Tips</span>
          </div>
          <ul className="text-[10px] text-slate-400 space-y-1.5 list-disc pl-3 leading-relaxed">
            <li>Move playhead to overlapping annotation section and select an item.</li>
            <li>Use <kbd className="px-1 py-0.5 bg-white/10 rounded text-slate-300 font-mono">Tab</kbd> to cycle through overlapping items.</li>
            <li>Use <kbd className="px-1 py-0.5 bg-white/10 rounded text-slate-300 font-mono">Shift+Tab</kbd> to cycle backwards.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
