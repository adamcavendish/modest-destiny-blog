(function () {
  const charts = Array.from(document.querySelectorAll('[data-chart]'));
  if (!charts.length) return;

  // Keep ECharts out of the initial page payload. Every chart on a page shares
  // this promise, so a page with several figures still makes one request.
  let echartsPromise;
  const loadECharts = () => {
    if (!echartsPromise) {
      echartsPromise = import('https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.esm.min.js');
    }
    return echartsPromise;
  };

  const render = async () => {
    let echarts;
    try {
      echarts = await loadECharts();
    } catch (error) {
      console.error('Unable to load ECharts.', error);
      charts.forEach((node) => node.closest('.chart')?.classList.add('chart--unavailable'));
      return;
    }

    charts.forEach((node) => {
      if (node.dataset.chartReady === 'true') return;

      let spec;
      try {
        spec = JSON.parse(node.dataset.chart);
      } catch (error) {
        console.error('Invalid chart data.', error);
        return;
      }

      const chart = echarts.init(node);
      chart.setOption({
        title: { text: spec.title },
        tooltip: {},
        xAxis: { type: 'category', data: spec.data.map((_, i) => `p${i + 1}`) },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: spec.data }]
      });
      node.dataset.chartReady = 'true';
      window.addEventListener('resize', () => chart.resize(), { passive: true });
    });
  };

  // Delay the import until a figure is close to the viewport. This keeps a
  // chart-heavy article cheap to open while preserving the normal component.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      currentObserver.disconnect();
      render();
    }, { rootMargin: '400px 0px' });
    charts.forEach((chart) => observer.observe(chart));
  } else {
    render();
  }
}());
