import { useEffect, useState } from 'react';
import { getAssetPath } from '@/lib/assetPath';

export function useWallpaperResolver(wallpaper?: string): string | null {
  const [resolvedWallpaper, setResolvedWallpaper] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        if (!wallpaper) {
          const def = await getAssetPath('wallpapers/wallpaper1.jpg');
          if (mounted) setResolvedWallpaper(def);
          return;
        }

        // CSS gradients and colors - use as-is
        if (wallpaper.startsWith('#') || wallpaper.startsWith('linear-gradient') || wallpaper.startsWith('radial-gradient')) {
          if (mounted) setResolvedWallpaper(wallpaper);
          return;
        }

        // Data URLs (custom uploaded images) - use as-is
        if (wallpaper.startsWith('data:')) {
          if (mounted) setResolvedWallpaper(wallpaper);
          return;
        }

        // HTTP/HTTPS URLs - use as-is
        if (wallpaper.startsWith('http') || wallpaper.startsWith('file://')) {
          if (mounted) setResolvedWallpaper(wallpaper);
          return;
        }

        // Absolute server paths - resolve via getAssetPath
        if (wallpaper.startsWith('/')) {
          const rel = wallpaper.replace(/^\//, '');
          const p = await getAssetPath(rel);
          if (mounted) setResolvedWallpaper(p);
          return;
        }

        // Relative paths - resolve via getAssetPath
        const p = await getAssetPath(wallpaper.replace(/^\//, ''));
        if (mounted) setResolvedWallpaper(p);
      } catch {
        if (mounted) setResolvedWallpaper(wallpaper || '/wallpapers/wallpaper1.jpg');
      }
    })();

    return () => { mounted = false };
  }, [wallpaper]);

  return resolvedWallpaper;
}
