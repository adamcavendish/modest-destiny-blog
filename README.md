# Zola prototype

This is an isolated Markdown-first prototype. The existing Nikola/Typora site remains unchanged.

## Local preview

Install Zola, then run:

```sh
zola serve
```

from this directory. `zola build` writes the static site to `public/`.

The prototype demonstrates Markdown, KaTeX-compatible math syntax, a Tera ECharts component, local article assets, and a Giscus placeholder. Replace the placeholder in `templates/page.html` with the Giscus embed after enabling GitHub Discussions.

## Optional interactive articles

Zola 0.23 removed the old shortcode API, so the site uses a Tera component instead. Add a chart in an article with:

```md
{{ <echarts id="latency" title="Latency by percentile" data="[12, 18, 31, 55]" /> }}
```

`js/charts.js` loads ECharts only when the rendered page contains a chart, and delays the import until a chart is close to the viewport. Pages without charts do not request the ECharts bundle.

Anime.js is deliberately article-local because its animations usually need procedural DOM or SVG code. Declare the module in that article's front matter:

```toml
[extra]
article_scripts = ["js/articles/proof-animation.js"]
```

Keep the animated markup in the article so it remains meaningful without JavaScript:

```md
<figure class="animation-figure" data-anime-demo="proof-animation">
  <div class="animation-figure__stage">
    <div class="my-animation-target">The proof follows the request.</div>
  </div>
  <figcaption>The proof follows the request.</figcaption>
</figure>
```

Import `loadAnime` from `js/anime-runtime.js` inside the article module. This keeps Anime.js out of every other page and avoids fetching it when reduced motion is enabled:

```js
import { loadAnime, prefersReducedMotion } from '../anime-runtime.js';

const target = document.querySelector('[data-anime-demo="proof-animation"] .my-animation-target');
if (target && !prefersReducedMotion()) {
  const { animate } = await loadAnime();
  animate(target, { translateX: 120, duration: 700, ease: 'out(3)' });
}
```

Keep the static markup meaningful without JavaScript, prefer transforms and opacity, and provide a reduced-motion path. Do not add the article module to `base.html`.

## Series

Use the `series` taxonomy when several posts should be read as one ordered work. Keep the order explicit in front matter so it remains stable if publication dates change:

```toml
[taxonomies]
tags = ["Zola", "Web"]
series = ["Building a Blog with Zola"]

[extra]
series_order = 3
```

Once at least one post has a `series`, the navigation exposes `/series/`. The Series index groups works, each Series page lists its parts in `series_order`, and an article shows its position plus Previous/Next links.

## DPoP series design

The first editorial series is **Proof-Carrying HTTP: Understanding DPoP**. It is a six-part line of thought:

1. **The Token That Cannot Tell You Who Holds It** — establish the replay problem through one ordinary request.
2. **From Possession to Proof** — introduce the key, token binding, and per-request proof.
3. **One Request, Three Checks** — make verification visible as a sequence of gates.
4. **DPoP in the Industrial Neighborhood** — compare bearer tokens, mTLS, platform keys, and custom signing.
5. **Where the Proof Gets Sharp** — follow the operational pain at keys, URLs, clocks, proxies, and replay state.
6. **The Shape of the Tradeoff** — explain why DPoP chooses application-layer deployability and where that choice stops helping.

The voice is neutral and essayistic: start with a concrete incident, make one invariant visible, then earn the protocol detail. The visual language follows 3Blue1Brown's explanatory instinct—progressive construction, stable objects, and one question per figure—while keeping references at the end of each article. SVGs remain the static explanation; Anime.js is an optional enhancement for short reveals and is disabled for reduced-motion users or when JavaScript is unavailable.

Rust appears throughout as compact pseudocode that maps the conceptual objects to ownership and request construction. It is explanatory rather than a reference implementation, and the series deliberately avoids a long code appendix.
