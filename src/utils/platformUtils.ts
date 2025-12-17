/**
 * Detects if the current platform is macOS
 */
export const isMac = (): boolean => {
  if (typeof navigator !== "undefined") {
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  }
  return false;
};

/**
 * Gets the modifier key symbol based on the platform
 */
export const getModifierKey = (): string => {
  return isMac() ? "⌘" : "Ctrl";
};

/**
 * Gets the shift key symbol based on the platform
 */
export const getShiftKey = (): string => {
  return isMac() ? "⇧" : "Shift";
};

/**
 * Formats a keyboard shortcut for display based on the platform
 * @param keys Array of key combinations (e.g., ['mod', 'D'] or ['shift', 'mod', 'Scroll'])
 */
export const formatShortcut = (keys: string[]): string => {
  const isMacPlatform = isMac();
  return keys
    .map((key) => {
      if (key.toLowerCase() === "mod") return isMacPlatform ? "⌘" : "Ctrl";
      if (key.toLowerCase() === "shift") return isMacPlatform ? "⇧" : "Shift";
      return key;
    })
    .join(" + ");
};
