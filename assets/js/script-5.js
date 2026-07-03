(() => {
  const DESIGN_WIDTH = 976;
  const page = document.getElementById('about-page');
  const shell = document.getElementById('aboutScaleShell');
  const stage = document.getElementById('aboutOpenStage');
  const bookArt = stage?.querySelector('.about-open-book-art');

  if (!page || !shell || !stage) return;

  function fitAboutBookToViewport() {
    if (!page.classList.contains('active') || !page.classList.contains('about-book-open')) return;

    const naturalHeight = stage.offsetHeight;
    if (!naturalHeight) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const availableWidth = Math.max(1, shell.clientWidth - 2);
    const availableHeight = Math.max(1, viewportHeight - 16);
    const scale = Math.max(0.05, Math.min(
      availableWidth / DESIGN_WIDTH,
      availableHeight / naturalHeight
    ));

    window.aboutBookLayoutScale = scale;
    stage.style.setProperty('--about-book-scale', String(scale));
    shell.style.height = `${Math.ceil(naturalHeight * scale)}px`;
  }

  function scheduleAboutFit() {
    window.requestAnimationFrame(() => {
      fitAboutBookToViewport();
      window.requestAnimationFrame(fitAboutBookToViewport);
    });
  }

  const classObserver = new MutationObserver(scheduleAboutFit);
  classObserver.observe(page, { attributes: true, attributeFilter: ['class'] });

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(scheduleAboutFit);
    resizeObserver.observe(shell);
    resizeObserver.observe(stage);
  }

  bookArt?.addEventListener('load', scheduleAboutFit);
  window.addEventListener('resize', scheduleAboutFit, { passive: true });
  window.addEventListener('orientationchange', scheduleAboutFit, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleAboutFit, { passive: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleAboutFit).catch(() => {});
  }

  scheduleAboutFit();
})();
