import { useEffect, useRef } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  once?: boolean;
}

/**
 * useScrollReveal — Devuelve un ref que, al entrar en viewport,
 * añade la clase `.is-visible` al elemento.
 * Combínalo con la clase `.sr` (scroll-reveal) en el SCSS.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
) {
  const { threshold = 0.15, once = true } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if (once) observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}
