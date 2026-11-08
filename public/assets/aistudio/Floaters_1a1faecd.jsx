import { useEffect, useRef } from 'react';

export default function Floaters() {
  const ref = useRef(null);
  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const glyphs = ['✨', '⭐', '💫', '🌟'];
    const count = window.innerWidth < 640 ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = 0.7 + Math.random() * 1.3 + 'rem';
      el.style.animationDuration = 10 + Math.random() * 14 + 's';
      el.style.animationDelay = Math.random() * 14 + 's';
      layer.appendChild(el);
    }
    return () => { layer.innerHTML = ''; };
  }, []);
  return <div id="floaters" ref={ref} />;
}