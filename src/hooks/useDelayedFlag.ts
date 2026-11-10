import { useEffect, useRef, useState } from 'react';

/**
 * Turns a fast-changing boolean into one that is calmer to show in the UI.
 *
 * - It only becomes true after `active` has stayed true for `delay` ms,
 *   so very short loads never flash a spinner.
 * - Once true, it stays true for at least `minDuration` ms,
 *   so the animation gets time to be seen.
 */
export default function useDelayedFlag(active: boolean, delay = 150, minDuration = 300) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (active && !visible) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }

    if (!active && visible) {
      const remaining = Math.max(0, minDuration - (Date.now() - shownAt.current));
      const timer = setTimeout(() => setVisible(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [active, visible, delay, minDuration]);

  return visible;
}
