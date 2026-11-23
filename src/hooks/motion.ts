import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mui/material';

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });

/** True once the element has scrolled into view; it stays true so content never hides again. */
export function useInView<T extends Element>(threshold = 0.06) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [seen, setSeen] = useState(reduced || typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Counts up to the target the first time it is shown, then follows later changes directly. */
export function useCountUp(target: number, duration = 700) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced || target < 2 ? target : 0);
  const current = useRef(value);
  const done = useRef(reduced);
  useEffect(() => {
    if (done.current) {
      current.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    const from = current.current; // resume from wherever an interrupted run stopped
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / duration)); // a frame stamp can predate t0
      current.current = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
      setValue(current.current);
      if (k < 1) raf = requestAnimationFrame(step);
      else done.current = true;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
