import { useEffect } from 'react';
import type { Application, Container, Sprite, Graphics, BlurFilter } from 'pixi.js';
import { Sprite as PixiSprite, Graphics as PixiGraphics, BlurFilter as PixiBlurFilter, Texture, VideoSource } from 'pixi.js';
import { DEFAULT_FOCUS } from '../constants';
import { createVideoEventHandlers } from '../videoEventHandlers';
import type { TrimRegion } from '../../types';

interface UseVideoSpriteSetupProps {
  pixiReady: boolean;
  videoReady: boolean;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  appRef: React.MutableRefObject<Application | null>;
  videoContainerRef: React.MutableRefObject<Container | null>;
  videoSpriteRef: React.MutableRefObject<Sprite | null>;
  maskGraphicsRef: React.MutableRefObject<Graphics | null>;
  blurFilterRef: React.MutableRefObject<BlurFilter | null>;
  animationStateRef: React.MutableRefObject<{ scale: number; focusX: number; focusY: number }>;
  isSeekingRef: React.MutableRefObject<boolean>;
  isPlayingRef: React.MutableRefObject<boolean>;
  allowPlaybackRef: React.MutableRefObject<boolean>;
  currentTimeRef: React.MutableRefObject<number>;
  timeUpdateAnimationRef: React.MutableRefObject<number | null>;
  trimRegionsRef: React.MutableRefObject<TrimRegion[]>;
  layoutVideoContentRef: React.MutableRefObject<() => void>;
  onPlayStateChange: (playing: boolean) => void;
  onTimeUpdate: (time: number) => void;
}

export function useVideoSpriteSetup({
  pixiReady, videoReady, videoRef, appRef, videoContainerRef, videoSpriteRef,
  maskGraphicsRef, blurFilterRef, animationStateRef, isSeekingRef, isPlayingRef,
  allowPlaybackRef, currentTimeRef, timeUpdateAnimationRef, trimRegionsRef,
  layoutVideoContentRef, onPlayStateChange, onTimeUpdate,
}: UseVideoSpriteSetupProps): void {
  useEffect(() => {
    if (!pixiReady || !videoReady) return;
    const video = videoRef.current;
    const app = appRef.current;
    const videoContainer = videoContainerRef.current;
    if (!video || !app || !videoContainer || video.videoWidth === 0 || video.videoHeight === 0) return;

    const source = VideoSource.from(video);
    if ('autoPlay' in source) (source as { autoPlay?: boolean }).autoPlay = false;
    if ('autoUpdate' in source) (source as { autoUpdate?: boolean }).autoUpdate = true;
    const videoTexture = Texture.from(source);

    const videoSprite = new PixiSprite(videoTexture);
    videoSpriteRef.current = videoSprite;

    const maskGraphics = new PixiGraphics();
    videoContainer.addChild(videoSprite);
    videoContainer.addChild(maskGraphics);
    videoContainer.mask = maskGraphics;
    maskGraphicsRef.current = maskGraphics;

    animationStateRef.current = { scale: 1, focusX: DEFAULT_FOCUS.cx, focusY: DEFAULT_FOCUS.cy };

    const blurFilter = new PixiBlurFilter();
    blurFilter.quality = 3;
    blurFilter.resolution = app.renderer.resolution;
    blurFilter.strength = 0;
    videoContainer.filters = [blurFilter];
    blurFilterRef.current = blurFilter;

    layoutVideoContentRef.current();
    video.pause();

    const { handlePlay, handlePause, handleSeeked, handleSeeking } = createVideoEventHandlers({
      video, isSeekingRef, isPlayingRef, allowPlaybackRef, currentTimeRef, timeUpdateAnimationRef,
      onPlayStateChange, onTimeUpdate, trimRegionsRef,
    });

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handlePause);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('seeking', handleSeeking);

    // Capture ref value for cleanup
    const timeUpdateAnimation = timeUpdateAnimationRef.current;

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handlePause);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('seeking', handleSeeking);
      if (timeUpdateAnimation) cancelAnimationFrame(timeUpdateAnimation);
      videoContainer.removeChild(videoSprite);
      videoSprite.destroy();
      videoContainer.removeChild(maskGraphics);
      maskGraphics.destroy();
      videoContainer.mask = null;
      maskGraphicsRef.current = null;
      if (blurFilterRef.current) { videoContainer.filters = []; blurFilterRef.current.destroy(); blurFilterRef.current = null; }
      videoTexture.destroy(true);
      videoSpriteRef.current = null;
    };
  }, [pixiReady, videoReady, videoRef, appRef, videoContainerRef, videoSpriteRef, maskGraphicsRef, blurFilterRef, animationStateRef, isSeekingRef, isPlayingRef, allowPlaybackRef, currentTimeRef, timeUpdateAnimationRef, trimRegionsRef, layoutVideoContentRef, onPlayStateChange, onTimeUpdate]);
}
