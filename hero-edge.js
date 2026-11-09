// Clip one photograph. The roof and the scene share exactly the same pixels,
// scale and position; there is no separately overlaid building cutout.
const heroFigure = document.querySelector('.hero-photo');
const heroPhoto = heroFigure?.querySelector('.hero-scene');
if (heroFigure && heroPhoto) {
  function fitHeroEdge() {
    const cardWidth = heroFigure.clientWidth, height = heroFigure.clientHeight;
    if (!cardWidth || !height || !heroPhoto.naturalWidth) return;
    if (window.matchMedia('(max-width: 700px)').matches) { heroPhoto.removeAttribute('style'); return; }
    const bleed = Math.min(76, cardWidth * .14);
    const width = cardWidth + bleed;
    const scale = Math.max(width / heroPhoto.naturalWidth, height / heroPhoto.naturalHeight);
    // Left alignment keeps the cantilever visible at narrow aspect ratios.
    const offsetY = -Math.min(70, Math.max(0, heroPhoto.naturalHeight * scale - height));
    const radius = 27;
    const n = value => Math.round(value * 100) / 100;
    const rect = `M ${n(bleed + radius)} 0 H ${n(width - radius)} Q ${n(width)} 0 ${n(width)} ${radius} V ${n(height - radius)} Q ${n(width)} ${n(height)} ${n(width - radius)} ${n(height)} H ${n(bleed + radius)} Q ${n(bleed)} ${n(height)} ${n(bleed)} ${n(height - radius)} V ${radius} Q ${n(bleed)} 0 ${n(bleed + radius)} 0 Z`;
    // Traced inside the two straight overhang edges to exclude the sky fringe.
    const edges = [
      [[22,572],[270,472],[270,676],[22,611]],
      [[30,1009],[270,984],[270,1042],[30,1023]]
    ];
    const outline = edges.map(edge => edge.map((point,index) => `${index ? 'L' : 'M'} ${n(point[0] * scale)} ${n(point[1] * scale + offsetY)}`).join(' ') + ' Z').join(' ');
    Object.assign(heroPhoto.style, {left: -bleed + 'px', width: width + 'px', height: height + 'px', objectPosition: `left ${offsetY}px`, clipPath: `path('${rect} ${outline}')`});
  }
  new ResizeObserver(fitHeroEdge).observe(heroFigure);
  heroPhoto.addEventListener('load', fitHeroEdge);
  if (heroPhoto.complete) fitHeroEdge();
}
