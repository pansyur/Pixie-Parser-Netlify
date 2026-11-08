import { useEffect, useRef } from 'react';

export default function Floaters() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;

    const glyphs = ['✨', '⭐', '💫', '🌟', '🧚‍♀️', '🦋', '🌸'];
    const count = typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 24;

    layer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = `${Math.random() * 98}vw`;
      el.style.fontSize = `${0.7 + Math.random() * 1.2}rem`;
      el.style.animationDuration = `${9 + Math.random() * 14}s`;
      el.style.animationDelay = `${Math.random() * 12}s`;
      layer.appendChild(el);
    }

    return () => {
      if (layer) layer.innerHTML = '';
    };
  }, []);

  return <div id="floaters" ref={ref} aria-hidden="true" />;
}
