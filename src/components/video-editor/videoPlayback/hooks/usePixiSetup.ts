import { useEffect, useRef, useState } from 'react';
import { Application, Container } from 'pixi.js';

interface UsePixiSetupResult {
  appRef: React.MutableRefObject<Application | null>;
  cameraContainerRef: React.MutableRefObject<Container | null>;
  videoContainerRef: React.MutableRefObject<Container | null>;
  pixiReady: boolean;
}

export function usePixiSetup(containerRef: React.RefObject<HTMLDivElement | null>): UsePixiSetupResult {
  const appRef = useRef<Application | null>(null);
  const cameraContainerRef = useRef<Container | null>(null);
  const videoContainerRef = useRef<Container | null>(null);
  const [pixiReady, setPixiReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    let app: Application | null = null;

    (async () => {
      app = new Application();
      
      await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      app.ticker.maxFPS = 60;

      if (!mounted) {
        app.destroy(true, { children: true, texture: true, textureSource: true });
        return;
      }

      appRef.current = app;
      container.appendChild(app.canvas);

      // Camera container - this will be scaled/positioned for zoom
      const cameraContainer = new Container();
      cameraContainerRef.current = cameraContainer;
      app.stage.addChild(cameraContainer);

      // Video container - holds the masked video sprite
      const videoContainer = new Container();
      videoContainerRef.current = videoContainer;
      cameraContainer.addChild(videoContainer);
      
      setPixiReady(true);
    })();

    return () => {
      mounted = false;
      setPixiReady(false);
      if (app && app.renderer) {
        app.destroy(true, { children: true, texture: true, textureSource: true });
      }
      appRef.current = null;
      cameraContainerRef.current = null;
      videoContainerRef.current = null;
    };
  }, [containerRef]);

  return { appRef, cameraContainerRef, videoContainerRef, pixiReady };
}
