(function () {
  const key = 'blog-theme';
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-theme-toggle]');
  const icons = document.querySelectorAll('[data-theme-icon]');
  const saved = localStorage.getItem(key);
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  const update = () => { const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); icons.forEach((icon) => { icon.textContent = dark ? '☀' : '☾'; }); buttons.forEach((button) => { button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); }); };
  update();
  buttons.forEach((button) => button.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem(key, root.dataset.theme); update(); }));
}());
