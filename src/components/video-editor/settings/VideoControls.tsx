import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface VideoControlsProps {
  shadowIntensity: number;
  onShadowChange?: (intensity: number) => void;
  showBlur?: boolean;
  onBlurChange?: (showBlur: boolean) => void;
  motionBlurEnabled: boolean;
  onMotionBlurChange?: (enabled: boolean) => void;
  borderRadius: number;
  onBorderRadiusChange?: (radius: number) => void;
  padding: number;
  onPaddingChange?: (padding: number) => void;
}

export function VideoControls({
  shadowIntensity,
  onShadowChange,
  showBlur,
  onBlurChange,
  motionBlurEnabled,
  onMotionBlurChange,
  borderRadius,
  onBorderRadiusChange,
  padding,
  onPaddingChange,
}: VideoControlsProps) {
  return (
    <>
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs font-medium text-slate-200">Motion Blur</div>
            <Switch
              checked={motionBlurEnabled}
              onCheckedChange={onMotionBlurChange}
              className="data-[state=checked]:bg-[#34B27B]"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs font-medium text-slate-200">Blur</div>
            <Switch
              checked={showBlur}
              onCheckedChange={onBlurChange}
              className="data-[state=checked]:bg-[#34B27B]"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-400 w-20 shrink-0">Shadow</div>
          <Slider
            value={[shadowIntensity]}
            onValueChange={(values) => onShadowChange?.(values[0])}
            min={0}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <span className="text-xs text-slate-400 font-mono w-12 text-right">{Math.round(shadowIntensity * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-400 w-20 shrink-0">Roundness</div>
          <Slider
            value={[borderRadius]}
            onValueChange={(values) => onBorderRadiusChange?.(values[0])}
            min={0}
            max={16}
            step={0.5}
            className="flex-1"
          />
          <span className="text-xs text-slate-400 font-mono w-12 text-right">{borderRadius}px</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-400 w-20 shrink-0">Padding</div>
          <Slider
            value={[padding]}
            onValueChange={(values) => onPaddingChange?.(values[0])}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-slate-400 font-mono w-12 text-right">{padding}%</span>
        </div>
      </div>
    </>
  );
}
