import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Block from '@uiw/react-color-block';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { getArrowComponent } from "../../ArrowSvgs";
import type { ArrowDirection, FigureData } from "../../types";

const COLOR_PALETTE = [
  '#FF0000', '#FFD700', '#00FF00', '#FFFFFF', '#0000FF', '#FF6B00',
  '#9B59B6', '#E91E63', '#00BCD4', '#FF5722', '#8BC34A', '#FFC107',
  '#34B27B', '#000000', '#607D8B', '#795548',
];

const ARROW_DIRECTIONS: ArrowDirection[] = ['up', 'down', 'left', 'right', 'up-right', 'up-left', 'down-right', 'down-left'];

interface ArrowSettingsProps {
  figureData?: FigureData;
  onFigureDataChange?: (figureData: FigureData) => void;
}

export function ArrowSettings({ figureData, onFigureDataChange }: ArrowSettingsProps) {
  if (!figureData || !onFigureDataChange) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-200 mb-3 block">Arrow Direction</label>
        <div className="grid grid-cols-4 gap-2">
          {ARROW_DIRECTIONS.map((direction) => {
            const ArrowComponent = getArrowComponent(direction);
            return (
              <button
                key={direction}
                onClick={() => onFigureDataChange({ ...figureData, arrowDirection: direction })}
                className={cn(
                  "h-16 rounded-lg border flex items-center justify-center transition-all p-2",
                  figureData.arrowDirection === direction
                    ? "bg-[#34B27B] border-[#34B27B]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
              >
                <ArrowComponent color={figureData.arrowDirection === direction ? "#ffffff" : "#94a3b8"} strokeWidth={3} />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-200 mb-2 block">Stroke Width: {figureData.strokeWidth || 4}px</label>
        <Slider value={[figureData.strokeWidth || 4]} onValueChange={([value]) => onFigureDataChange({ ...figureData, strokeWidth: value })} min={1} max={6} step={1} className="w-full" />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-200 mb-2 block">Arrow Color</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full h-10 justify-start gap-2 bg-white/5 border-white/10 hover:bg-white/10">
              <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: figureData.color || '#34B27B' }} />
              <span className="text-xs text-slate-300 truncate flex-1 text-left">{figureData.color || '#34B27B'}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-3 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl">
            <Block color={figureData.color || '#34B27B'} colors={COLOR_PALETTE} onChange={(color) => onFigureDataChange({ ...figureData, color: color.hex })} style={{ borderRadius: '8px' }} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
