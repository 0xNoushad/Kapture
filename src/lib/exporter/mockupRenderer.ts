import type { MockupType } from '@/App';

interface MockupRenderConfig {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  mockupType: MockupType;
  browserUrl?: string;
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
}

// Draw browser mockup frame - matches VideoPlayback browser mockup
function drawBrowserMockup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  borderRadius: number,
  browserUrl: string,
  shadowIntensity: number
): { contentX: number; contentY: number; contentW: number; contentH: number } {
  // In preview, title bar is h-9 (36px) at ~600px height = 6%
  // But the mockup itself is scaled by mockupScale, so title bar is proportional
  const titleBarHeight = 36 * (h / 600); // Scale based on mockup height
  
  // Apply shadow if enabled
  if (shadowIntensity > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${0.5 * shadowIntensity})`;
    ctx.shadowBlur = 48 * shadowIntensity;
    ctx.shadowOffsetY = 12 * shadowIntensity;
  }
  
  // Draw outer frame - bg-[#1a1a1a] with border
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius + 4);
  ctx.fill();
  
  if (shadowIntensity > 0) {
    ctx.restore();
  }
  
  // Draw border
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius + 4);
  ctx.stroke();
  
  // Draw title bar - bg-[#363636]
  ctx.fillStyle = '#363636';
  ctx.beginPath();
  ctx.roundRect(x, y, w, titleBarHeight, [borderRadius + 4, borderRadius + 4, 0, 0]);
  ctx.fill();
  
  // Title bar bottom border
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + titleBarHeight);
  ctx.lineTo(x + w, y + titleBarHeight);
  ctx.stroke();
  
  // Traffic lights - w-3 h-3 (12px) with gap-1.5 (6px), px-3 margin
  const dotScale = h / 600;
  const dotRadius = 6 * dotScale; // 12px diameter / 2
  const dotY = y + titleBarHeight / 2;
  const dotStartX = x + 12 * dotScale; // px-3
  const dotSpacing = 18 * dotScale; // 12px + 6px gap
  
  // Red - bg-[#ED6A5E]
  ctx.fillStyle = '#ED6A5E';
  ctx.beginPath();
  ctx.arc(dotStartX, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Yellow - bg-[#F4BD50]
  ctx.fillStyle = '#F4BD50';
  ctx.beginPath();
  ctx.arc(dotStartX + dotSpacing, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.stroke();
  
  // Green - bg-[#61C454]
  ctx.fillStyle = '#61C454';
  ctx.beginPath();
  ctx.arc(dotStartX + dotSpacing * 2, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.stroke();
  
  // URL bar - h-5 (20px), mx-4 margin, flex-1
  const urlBarHeight = 20 * dotScale;
  const urlBarMargin = 16 * dotScale; // mx-4
  const urlBarX = dotStartX + dotSpacing * 2 + dotRadius + urlBarMargin;
  const urlBarEndMargin = 48 * dotScale; // w-12 spacer on right
  const urlBarW = (x + w - urlBarEndMargin) - urlBarX - urlBarMargin;
  const urlBarY = y + (titleBarHeight - urlBarHeight) / 2;
  
  ctx.fillStyle = '#434343';
  ctx.beginPath();
  ctx.roundRect(urlBarX, urlBarY, urlBarW, urlBarHeight, 4 * dotScale);
  ctx.fill();
  
  // Lock icon + URL text - text-[10px]
  const fontSize = Math.max(8, 10 * dotScale);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🔒 ${browserUrl}`, urlBarX + urlBarW / 2, urlBarY + urlBarHeight / 2);
  
  // Content area - below title bar, fills rest of frame
  const contentX = x;
  const contentY = y + titleBarHeight;
  const contentW = w;
  const contentH = h - titleBarHeight;
  
  return { contentX, contentY, contentW, contentH };
}

// Draw device (iPhone) mockup frame - matches VideoPlayback device mockup
function drawDeviceMockup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  borderRadius: number,
  shadowIntensity: number
): { contentX: number; contentY: number; contentW: number; contentH: number } {
  // Frame uses border-[3px] border-[#333]
  const frameThickness = 3 * (w / 200); // Scale based on width
  const effectiveRadius = Math.max(borderRadius, 44 * (h / 800)); // min ~44px scaled
  
  // Apply shadow if enabled
  if (shadowIntensity > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${0.5 * shadowIntensity})`;
    ctx.shadowBlur = 48 * shadowIntensity;
    ctx.shadowOffsetY = 12 * shadowIntensity;
  }
  
  // Draw outer frame - bg-black
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, effectiveRadius);
  ctx.fill();
  
  if (shadowIntensity > 0) {
    ctx.restore();
  }
  
  // Draw border - border-[#333]
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = frameThickness;
  ctx.beginPath();
  ctx.roundRect(x + frameThickness/2, y + frameThickness/2, w - frameThickness, h - frameThickness, effectiveRadius - frameThickness/2);
  ctx.stroke();
  
  // Screen area - inset by 0.5% top/bottom, 1.5% left/right (from CSS)
  const screenInsetX = w * 0.015;
  const screenInsetY = h * 0.005;
  const screenX = x + screenInsetX;
  const screenY = y + screenInsetY;
  const screenW = w - screenInsetX * 2;
  const screenH = h - screenInsetY * 2;
  const screenRadius = Math.max(effectiveRadius - 3, 40 * (h / 800));
  
  // Draw screen background - bg-black
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenW, screenH, screenRadius);
  ctx.fill();
  
  // Dynamic Island - w-[28%] h-[2.5%] top-2
  const islandWidth = w * 0.28;
  const islandHeight = h * 0.025;
  const islandX = x + (w - islandWidth) / 2;
  const islandY = y + 8 * (h / 800); // top-2 = 8px scaled
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(islandX, islandY, islandWidth, islandHeight, islandHeight / 2);
  ctx.fill();
  
  // Content area is the screen area
  return { 
    contentX: screenX, 
    contentY: screenY, 
    contentW: screenW, 
    contentH: screenH 
  };
}

export function renderMockupFrame(config: MockupRenderConfig): {
  contentX: number;
  contentY: number;
  contentW: number;
  contentH: number;
} | null {
  const { ctx, width, height, mockupType, browserUrl = 'kapture.app', padding, borderRadius, shadowIntensity } = config;
  
  if (!mockupType) return null;
  
  // Calculate mockup size based on padding (0-100 maps to scale 1.0-0.7)
  // This matches: const mockupScale = 1 - (padding / 100) * 0.3;
  const mockupScale = 1 - (padding / 100) * 0.3;
  
  if (mockupType === 'browser') {
    // Browser mockup fills width and height proportionally
    const mockupW = width * mockupScale;
    const mockupH = height * mockupScale;
    const mockupX = (width - mockupW) / 2;
    const mockupY = (height - mockupH) / 2;
    
    return drawBrowserMockup(ctx, mockupX, mockupY, mockupW, mockupH, borderRadius, browserUrl, shadowIntensity);
  }
  
  if (mockupType === 'device') {
    // Device has fixed aspect ratio 9:19.5
    const deviceAspect = 9 / 19.5;
    let mockupH = height * mockupScale;
    let mockupW = mockupH * deviceAspect;
    
    // If too wide, constrain by width
    if (mockupW > width * mockupScale) {
      mockupW = width * mockupScale;
      mockupH = mockupW / deviceAspect;
    }
    
    const mockupX = (width - mockupW) / 2;
    const mockupY = (height - mockupH) / 2;
    
    return drawDeviceMockup(ctx, mockupX, mockupY, mockupW, mockupH, borderRadius, shadowIntensity);
  }
  
  return null;
}
