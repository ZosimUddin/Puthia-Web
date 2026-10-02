export const triggerHaptic = (pattern: number | number[] = 10) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // vibration API might be blocked by permission policy or browser settings
    }
  }
};

export const initGlobalHapticFeedback = () => {
  if (typeof window === 'undefined') return;

  const handleGlobalTouchOrClick = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactiveElement = target.closest(
      'button, a, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, .cursor-pointer'
    );

    if (interactiveElement) {
      triggerHaptic(10);
    }
  };

  // Attach passive event listeners for responsive haptic feedback
  window.addEventListener('click', handleGlobalTouchOrClick, { capture: true, passive: true });
};
