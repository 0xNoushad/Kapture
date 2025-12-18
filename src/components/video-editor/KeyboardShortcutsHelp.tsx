import { HelpCircle } from "lucide-react";

export function KeyboardShortcutsHelp() {
  return (
    <div className="relative group">
      <HelpCircle className="w-4 h-4 text-slate-500 hover:text-violet-400 transition-colors cursor-help" />
      <div className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-white/10 rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50">
        <div className="text-xs font-medium text-white/80 mb-2">
          Keyboard Shortcuts
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-white/50">Play/Pause</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              Space
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Add Zoom</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              Z
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Add Annotation</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              A
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Add Speed</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              S
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Add Trim</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              \
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Delete Selected</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              Del
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Deselect All</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              Esc
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Seek ±1s</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              ← →
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50">Seek ±5s</span>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-violet-400 font-mono">
              ⇧ ← →
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
