import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, inView] where inView becomes true once the element
 * enters the observed area and never goes back to false (once-only trigger).
 * rootMargin pre-loads elements before they're fully visible.
 */
const useInView = ({ rootMargin = '0px', threshold = 0 } = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [rootMargin, threshold]);

  return [ref, inView];
};

export default useInView;
