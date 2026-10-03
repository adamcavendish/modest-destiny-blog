(function () {
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const searchPage = document.querySelector('[data-search-index]');
  if (!input || !results) return;
  const script = document.createElement('script'); script.src = searchPage.dataset.searchIndex; script.onload = () => {
    const index = elasticlunr.Index.load(window.searchIndex);
    const render = () => { const query = input.value.trim(); results.innerHTML = ''; if (!query) return; index.search(query, { expand: true }).slice(0, 20).forEach((hit) => { const a = document.createElement('a'); a.className = 'search-result'; a.href = hit.ref; a.innerHTML = `<strong>${hit.doc.title}</strong><span>${hit.doc.description || ''}</span>`; results.appendChild(a); }); };
    input.addEventListener('input', render); input.focus();
  }; document.head.appendChild(script);
}());

document.querySelectorAll('pre').forEach((block) => {
  const button = document.createElement('button');
  button.className = 'copy-code';
  button.type = 'button';
  button.setAttribute('aria-label', 'Copy code');
  button.setAttribute('title', 'Copy code');
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  block.classList.add('code-block');
  block.appendChild(button);
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(block.innerText);
    button.classList.add('is-copied');
    button.setAttribute('aria-label', 'Copied');
    button.setAttribute('title', 'Copied');
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>';
    setTimeout(() => {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', 'Copy code');
      button.setAttribute('title', 'Copy code');
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }, 1200);
  });
});
