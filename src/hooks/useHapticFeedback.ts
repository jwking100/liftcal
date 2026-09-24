import { useCallback } from "react";

export function useHapticFeedback() {
  return useCallback((pattern: number | number[] = 15) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);
}
