document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.prose img').forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
  });
  if (window.mediumZoom) {
    window.mediumZoom('.prose img', {
      background: 'rgba(15, 17, 21, 0.94)',
      margin: 24,
      scrollOffset: 0
    });
  }
});
