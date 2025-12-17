import { useRef, useEffect } from 'react';

type GradientOrigin = 
  | 'top-left' | 'top-middle' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-middle' | 'bottom-right';

interface ColorStop {
  color: string;
  stop: string;
}

interface GradientBackgroundProps {
  gradientOrigin?: GradientOrigin;
  colors?: ColorStop[];
  noiseIntensity?: number;
  noisePatternSize?: number;
  noisePatternRefreshInterval?: number;
  className?: string;
}

const originToPosition: Record<GradientOrigin, string> = {
  'top-left': 'at 0% 0%',
  'top-middle': 'at 50% 0%',
  'top-right': 'at 100% 0%',
  'middle-left': 'at 0% 50%',
  'center': 'at 50% 50%',
  'middle-right': 'at 100% 50%',
  'bottom-left': 'at 0% 100%',
  'bottom-middle': 'at 50% 100%',
  'bottom-right': 'at 100% 100%',
};

const GradientBackground = ({
  gradientOrigin = 'center',
  colors = [
    { color: 'rgba(17,17,17,1)', stop: '0%' },
    { color: 'rgba(30,30,30,1)', stop: '100%' },
  ],
  noiseIntensity = 1,
  noisePatternSize = 128,
  className = '',
}: GradientBackgroundProps) => {
  const noiseRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = noiseRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    canvas.width = noisePatternSize;
    canvas.height = noisePatternSize;

    const imageData = ctx.createImageData(noisePatternSize, noisePatternSize);
    const data = imageData.data;
    const alpha = Math.round(noiseIntensity * 15);

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = alpha;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [noiseIntensity, noisePatternSize]);

  const gradientStops = colors.map(c => `${c.color} ${c.stop}`).join(', ');
  const position = originToPosition[gradientOrigin];

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse ${position}, ${gradientStops})`,
        }}
      />
      {/* Noise overlay */}
      <canvas
        ref={noiseRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default GradientBackground;
