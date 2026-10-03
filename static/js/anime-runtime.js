// Article scripts import this helper instead of shipping Anime.js in the base
// template. The library is fetched only when an article actually starts an
// animation.
let animePromise;

export function loadAnime() {
  if (!animePromise) {
    animePromise = import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm');
  }
  return animePromise;
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}
