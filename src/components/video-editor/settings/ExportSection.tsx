import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ExportQuality } from "@/lib/exporter";

interface ExportSectionProps {
  exportQuality: ExportQuality;
  onExportQualityChange?: (quality: ExportQuality) => void;
  onExport?: () => void;
}

export function ExportSection({ exportQuality, onExportQualityChange, onExport }: ExportSectionProps) {
  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="mb-2 text-xs font-medium text-slate-400">Export Quality</div>
      <div className="mb-2.5 bg-white/5 border border-white/5 p-1 w-full grid grid-cols-3 h-auto rounded-xl">
        <button
          onClick={() => onExportQualityChange?.('medium')}
          className={cn(
            "py-2 rounded-lg transition-all text-xs font-medium",
            exportQuality === 'medium' ? "bg-white text-black" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Low
        </button>
        <button
          onClick={() => onExportQualityChange?.('good')}
          className={cn(
            "py-2 rounded-lg transition-all text-xs font-medium",
            exportQuality === 'good' ? "bg-white text-black" : "text-slate-400 hover:text-slate-200"
          )}
        >
          Medium
        </button>
        <button
          onClick={() => onExportQualityChange?.('source')}
          className={cn(
            "py-2 rounded-lg transition-all text-xs font-medium",
            exportQuality === 'source' ? "bg-white text-black" : "text-slate-400 hover:text-slate-200"
          )}
        >
          High
        </button>
      </div>
      
      <Button
        type="button"
        size="lg"
        onClick={onExport}
        className="w-full py-6 text-lg font-semibold flex items-center justify-center gap-3 bg-[#34B27B] text-white rounded-xl shadow-lg shadow-[#34B27B]/20 hover:bg-[#34B27B]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <Download className="w-5 h-5" />
        <span>Export Video</span>
      </Button>
    </div>
  );
}
