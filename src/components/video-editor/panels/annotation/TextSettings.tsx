import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react";
import Block from '@uiw/react-color-block';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AnnotationRegion } from "../../types";

const FONT_FAMILIES = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'Classic' },
  { value: 'Georgia, serif', label: 'Editor' },
  { value: 'Impact, Arial Black, sans-serif', label: 'Strong' },
  { value: 'Courier New, monospace', label: 'Typewriter' },
  { value: 'Brush Script MT, cursive', label: 'Deco' },
  { value: 'Arial, sans-serif', label: 'Simple' },
  { value: 'Verdana, sans-serif', label: 'Modern' },
  { value: 'Trebuchet MS, sans-serif', label: 'Clean' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 128];

const COLOR_PALETTE = [
  '#FF0000', '#FFD700', '#00FF00', '#FFFFFF', '#0000FF', '#FF6B00',
  '#9B59B6', '#E91E63', '#00BCD4', '#FF5722', '#8BC34A', '#FFC107',
  '#34B27B', '#000000', '#607D8B', '#795548',
];

interface TextSettingsProps {
  annotation: AnnotationRegion;
  onContentChange: (content: string) => void;
  onStyleChange: (style: Partial<AnnotationRegion['style']>) => void;
}

export function TextSettings({ annotation, onContentChange, onStyleChange }: TextSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-200 mb-2 block">Text Content</label>
        <textarea
          value={annotation.textContent || annotation.content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Enter your text..."
          rows={5}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#34B27B] focus:border-transparent resize-none"
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-200 mb-2 block">Font Style</label>
            <Select value={annotation.style.fontFamily} onValueChange={(value) => onStyleChange({ fontFamily: value })}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-200 h-9 text-xs">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1c] border-white/10 text-slate-200">
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-200 mb-2 block">Size</label>
            <Select value={annotation.style.fontSize.toString()} onValueChange={(value) => onStyleChange({ fontSize: parseInt(value) })}>
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-slate-200 h-9 text-xs">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1c] border-white/10 text-slate-200 max-h-[200px]">
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <ToggleGroup type="multiple" className="justify-start bg-white/5 p-1 rounded-lg border border-white/5">
            <ToggleGroupItem value="bold" aria-label="Toggle bold" data-state={annotation.style.fontWeight === 'bold' ? 'on' : 'off'} onClick={() => onStyleChange({ fontWeight: annotation.style.fontWeight === 'bold' ? 'normal' : 'bold' })} className="h-8 w-8 data-[state=on]:bg-[#34B27B] data-[state=on]:text-white text-slate-400 hover:bg-white/5 hover:text-slate-200">
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic" data-state={annotation.style.fontStyle === 'italic' ? 'on' : 'off'} onClick={() => onStyleChange({ fontStyle: annotation.style.fontStyle === 'italic' ? 'normal' : 'italic' })} className="h-8 w-8 data-[state=on]:bg-[#34B27B] data-[state=on]:text-white text-slate-400 hover:bg-white/5 hover:text-slate-200">
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline" data-state={annotation.style.textDecoration === 'underline' ? 'on' : 'off'} onClick={() => onStyleChange({ textDecoration: annotation.style.textDecoration === 'underline' ? 'none' : 'underline' })} className="h-8 w-8 data-[state=on]:bg-[#34B27B] data-[state=on]:text-white text-slate-400 hover:bg-white/5 hover:text-slate-200">
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup type="single" value={annotation.style.textAlign} className="justify-start bg-white/5 p-1 rounded-lg border border-white/5">
            <ToggleGroupItem value="left" aria-label="Align left" onClick={() => onStyleChange({ textAlign: 'left' })} className="h-8 w-8 data-[state=on]:bg-[#34B27B] data-[state=on]:text-white text-slate-400 hover:bg-white/5 hover:text-slate-200">
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center" onClick={() => onStyleChange({ textAlign: 'center' })} className="h-8 w-8 data-[state=on]:bg-[#34B27B] data-[state=on]:text-white text-slate-400 hover:bg-white/5 hover:text-slate-200">
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right" onClick={() => onStyleChange({ textAlign: 'right' })} className="h-8 w-8 data-[state=on]:bg-[#34B27B] data-[state=on]:text-white text-slate-400 hover:bg-white/5 hover:text-slate-200">
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-200 mb-2 block">Text Color</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-9 justify-start gap-2 bg-white/5 border-white/10 hover:bg-white/10 px-2">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: annotation.style.color }} />
                  <span className="text-xs text-slate-300 truncate flex-1 text-left">{annotation.style.color}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-3 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl">
                <Block color={annotation.style.color} colors={COLOR_PALETTE} onChange={(color) => onStyleChange({ color: color.hex })} style={{ borderRadius: '8px' }} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-200 mb-2 block">Background</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-9 justify-start gap-2 bg-white/5 border-white/10 hover:bg-white/10 px-2">
                  <div className="w-4 h-4 rounded-full border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 checkerboard-bg opacity-50" />
                    <div className="absolute inset-0" style={{ backgroundColor: annotation.style.backgroundColor }} />
                  </div>
                  <span className="text-xs text-slate-300 truncate flex-1 text-left">{annotation.style.backgroundColor === 'transparent' ? 'None' : 'Color'}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-3 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl">
                <Block color={annotation.style.backgroundColor === 'transparent' ? '#000000' : annotation.style.backgroundColor} colors={COLOR_PALETTE} onChange={(color) => onStyleChange({ backgroundColor: color.hex })} style={{ borderRadius: '8px' }} />
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-7 hover:bg-white/5 text-slate-400" onClick={() => onStyleChange({ backgroundColor: 'transparent' })}>
                  Clear Background
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
