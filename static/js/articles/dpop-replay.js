import { loadAnime, prefersReducedMotion } from '../anime-runtime.js';

const root = document.querySelector('[data-anime-demo="dpop-replay"]');

if (root && !prefersReducedMotion()) {
  const token = root.querySelector('.dpop-motion__token');
  const track = root.querySelector('.dpop-motion__track');
  const stage = root.querySelector('.dpop-motion__stage');
  const replay = root.querySelector('[data-anime-replay]');

  const start = async () => {
    const { animate } = await loadAnime();
    if (!token || !track || !stage) return;
    const endX = Math.max(120, stage.clientWidth - token.offsetWidth - 24);
    token.style.transform = 'translateX(0)';
    track.style.transform = 'scaleX(0)';
    animate(token, {
      translateX: endX,
      duration: 1400,
      ease: 'inOut(2)',
    });
    animate(track, {
      scaleX: [0, 1],
      duration: 1100,
      delay: 160,
      ease: 'out(2)',
    });
  };

  root.classList.add('is-ready');
  replay?.addEventListener('click', () => start().catch(() => {}));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, current) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      current.disconnect();
      start().catch(() => {});
    }, { rootMargin: '160px 0px' });
    observer.observe(root);
  } else {
    start().catch(() => {});
  }
}
