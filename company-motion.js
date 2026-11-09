(() => {
  const menuButton = document.querySelector('.hero-menu-toggle');
  const menuPanel = document.querySelector('.hero-menu-panel');
  if (menuButton && menuPanel) {
    const hero = menuButton.closest('.home-hero');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let closeTimer;
    const closeMenu = (restoreFocus = false) => {
      clearTimeout(closeTimer);
      hero.classList.remove('menu-open');
      menuPanel.inert = true;
      menuPanel.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Открыть меню');
      if (restoreFocus) menuButton.focus({preventScroll: true});
      closeTimer = setTimeout(() => {menuPanel.hidden = true;}, reduced.matches ? 0 : 280);
    };
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      if (expanded) {closeMenu(); return;}
      clearTimeout(closeTimer);
      menuPanel.hidden = false;
      menuPanel.inert = false;
      menuPanel.setAttribute('aria-hidden', 'false');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Закрыть меню');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (menuButton.getAttribute('aria-expanded') === 'true') hero.classList.add('menu-open');
      }));
    });
    menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (menuButton.getAttribute('aria-expanded') === 'true' && !menuPanel.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    document.addEventListener('focusin', event => {
      if (menuButton.getAttribute('aria-expanded') === 'true' && !menuPanel.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();

  // Smooth native wheel scrolling while keeping sticky elements in document flow.
  media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
    if (!window.Lenis) return;
    const smooth = new Lenis({lerp: .04, smoothWheel: true, syncTouch: false, anchors: true});
    window.siteScroll = smooth;
    smooth.on('scroll', ScrollTrigger.update);
    const tick = time => smooth.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      smooth.destroy();
      delete window.siteScroll;
    };
  });

  const title = document.querySelector('[data-scroll-words]');
  const note = document.querySelector('[data-scroll-note]');
  const split = element => {
    const chars = [];
    if (!element) return chars;
    element.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(document.createTextNode(' ')));
    const text = element.textContent.trim();
    element.setAttribute('aria-label', text);
    element.replaceChildren();
    text.split(/\s+/).forEach((word, index, words) => {
      const group = document.createElement('span');
      group.className = 'scroll-word';
      group.setAttribute('aria-hidden', 'true');
      [...word].forEach(char => {
        const span = document.createElement('span');
        span.className = 'scroll-char';
        span.textContent = char;
        chars.push(span);
        group.append(span);
      });
      element.append(group);
      if (index < words.length - 1) element.append(document.createTextNode(' '));
    });
    return chars;
  };
  const chars = split(title);
  const noteChars = split(note);
  const processSteps = [...document.querySelectorAll('.process-step')].map(step => {
    const textElements = step.querySelectorAll('.process-copy h3, .process-copy > p:not(.process-label), .process-result > p');
    return {step, chars: [...textElements].flatMap(element => split(element))};
  });

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const rivosBackground = document.querySelector('.rivos-background');
    if (rivosBackground) gsap.fromTo(rivosBackground, {scale: 1.045}, {
      scale: 1, duration: 5, ease: 'power2.out'
    });
    // Entrance motion does not transform the sticky collage's ancestors.
    document.querySelectorAll('.hero-copy, .hero-photo, .royal-banner, .story-copy, .support-intro, .haven-copy h2, .haven-copy>p, .haven-form, [data-reveal]').forEach(el => {
      gsap.fromTo(el, {autoAlpha: 0}, {
        autoAlpha: 1, duration: .8, ease: 'power2.out', force3D: false,
        scrollTrigger: {trigger: el, start: 'top 92%', once: true}
      });
    });
    document.querySelectorAll('.story-image').forEach((el, index) => {
      gsap.fromTo(el, {autoAlpha: 0, x: index % 2 ? 36 : -36}, {
        autoAlpha: 1, x: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: {trigger: el, start: 'top 92%', once: true}
      });
    });
    // The fixed trigger stays in document flow while its photograph opens.
    document.querySelectorAll('.project-tile').forEach(item => {
      const picture = item.querySelector('figure');
      const image = picture.querySelector('img');
      const caption = item.querySelector('.project-caption');
      gsap.timeline({
        scrollTrigger: {
          trigger: item, start: 'top 94%', end: 'top 38%', scrub: .65
        }
      })
        .fromTo(picture, {y: 65, clipPath: 'inset(18% 0% 0% 0% round 28px)'}, {
          y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1, ease: 'power2.out'
        }, 0)
        .fromTo(image, {scale: 1.12}, {
          scale: 1, duration: 1.15, ease: 'power2.out'
        }, 0)
        .fromTo(caption, {autoAlpha: 0, y: 16}, {
          autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out', force3D: false
        }, .25);
    });
    document.querySelectorAll('.hero-project-link, .story-button, .support-action').forEach(el => {
      gsap.fromTo(el, {autoAlpha: 0}, {
        autoAlpha: 1, duration: .85, ease: 'power2.out', force3D: false,
        scrollTrigger: {trigger: el, start: 'top 95%', once: true}
      });
    });
    const supportImage = document.querySelector('.support-background');
    if (supportImage) gsap.fromTo(supportImage, {scale: 1.09}, {
      scale: 1, ease: 'none',
      scrollTrigger: {trigger: '.support-scene', start: 'top bottom', end: 'bottom top', scrub: .6}
    });
    if (title) gsap.fromTo(chars, {color: '#555652'}, {
      color: '#f7f5f2', duration: .12, stagger: .025, ease: 'none',
      scrollTrigger: {trigger: title, start: 'top 90%', end: 'bottom 48%', scrub: .3}
    });
    if (note) {
      gsap.fromTo(note, {autoAlpha: 0}, {
        autoAlpha: 1, ease: 'none',
        scrollTrigger: {trigger: '.collage-body', start: 'top 78%', end: 'top 52%', scrub: .35}
      });
      gsap.fromTo(noteChars, {color: '#65615f'}, {
        color: '#f7f5f2', duration: .1, stagger: .025, ease: 'none',
        scrollTrigger: {trigger: '.collage-body', start: 'top 58%', end: 'bottom 85%', scrub: .4}
      });
    }
    document.querySelectorAll('.collage-card img').forEach(img => {
      gsap.fromTo(img, {scale: 1.12}, {
        scale: 1, ease: 'none',
        scrollTrigger: {trigger: img.parentElement, start: 'top bottom', end: 'top 24%', scrub: .4}
      });
    });
    const building = document.querySelector('.haven-building img');
    if (building) gsap.fromTo(building, {y: 80, opacity: .65}, {
      y: 0, opacity: 1, ease: 'none',
      scrollTrigger: {trigger: '.haven-contact', start: 'top 70%', end: 'bottom bottom', scrub: .5}
    });
  });

  media.add({
    pinned: '(min-width: 1000px) and (min-height: 760px), (min-width: 701px) and (min-height: 950px)',
    reduced: '(prefers-reduced-motion: reduce)'
  }, context => {
    if (context.conditions.reduced || !processSteps.length) return;
    const section = document.querySelector('.process-story');
    const scene = section.querySelector('.process-scene');
    if (!context.conditions.pinned) {
      processSteps.forEach(({step, chars: stepChars}) => {
        gsap.fromTo(step.querySelector('.process-visual'), {y: 50, autoAlpha: .3}, {
          y: 0, autoAlpha: 1, ease: 'power2.out',
          scrollTrigger: {trigger: step, start: 'top 94%', end: 'top 40%', scrub: .6}
        });
        gsap.fromTo(stepChars, {color: '#74716e'}, {
          color: '#f7f5f2', duration: .12, stagger: .02, ease: 'none',
          scrollTrigger: {trigger: step, start: 'top 85%', end: 'bottom 70%', scrub: .35}
        });
      });
      return;
    }

    section.classList.add('process-pinned');
    const pictures = [...section.querySelectorAll('.workflow-shot')];
    gsap.set(processSteps.map(item => item.step), {autoAlpha: 0});
    gsap.set(processSteps[0].step, {autoAlpha: 1});
    gsap.set(processSteps.flatMap(item => item.chars), {color: '#7f7d79'});
    gsap.set(pictures.slice(1), {autoAlpha: 0, y: 52});
    const sequence = gsap.timeline({
      scrollTrigger: {
        id: 'process-sequence', trigger: scene, start: 'top 28px',
        end: () => '+=' + Math.max(3100, window.innerHeight * 4.2),
        pin: true, scrub: .95, anticipatePin: 1,
        invalidateOnRefresh: true, refreshPriority: 1
      }
    });
    processSteps.forEach(({step, chars: stepChars}, index) => {
      const copy = step.querySelector('.process-copy');
      const picture = pictures[index];
      if (index) {
        const previous = processSteps[index - 1].step;
        const transition = sequence.duration();
        sequence
          .to(previous.querySelector('.process-copy'), {autoAlpha: 0, duration: .55, ease: 'power2.inOut'}, transition)
          .set(previous, {autoAlpha: 0}, transition + .55)
          .set(step, {autoAlpha: 1}, transition + .55)
          .fromTo(copy, {autoAlpha: 0}, {autoAlpha: 1, duration: .8, ease: 'power2.out'}, transition + .55)
          .to(picture, {y: 0, autoAlpha: 1, duration: 1.5, ease: 'power2.out'}, transition)
          .fromTo(picture.querySelector('img'), {scale: 1.08}, {scale: 1, duration: 1.5, ease: 'power2.out'}, transition);
      }
      sequence.to(stepChars, {color: '#f7f5f2', duration: .14, stagger: {amount: 1.55}, ease: 'none'});
      sequence.to({}, {duration: .7});
    });
    return () => section.classList.remove('process-pinned');
  });

  media.add('(min-width: 1101px) and (prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('.story-image').forEach((image, index) => {
      gsap.fromTo(image, {y: index ? -20 : 20}, {
        y: index ? 20 : -20, ease: 'none',
        scrollTrigger: {trigger: '.royal-story', start: 'top bottom', end: 'bottom top', scrub: .7}
      });
    });
  });

  const viewer = document.querySelector('#project-dialog');
  const viewerImage = viewer?.querySelector('.project-dialog-image');
  const previousOverflow = document.body.style.overflow;
  document.querySelectorAll('.project-card').forEach(button => {
    button.addEventListener('click', () => {
      if (!viewer || !viewerImage) return;
      const source = button.querySelector('img');
      viewerImage.src = source.dataset.full || source.currentSrc || source.src;
      viewerImage.alt = source.alt;
      viewer.querySelector('h2').textContent = button.dataset.title;
      viewer.querySelector('.project-dialog-service').textContent = button.dataset.service;
      viewer.querySelector('.project-dialog-description').textContent = button.dataset.description;
      const tasks = button.dataset.tasks.split(';').map(text => {
        const item = document.createElement('li'); item.textContent = text; return item;
      });
      viewer.querySelector('.project-dialog-tasks').replaceChildren(...tasks);
      viewer.showModal();
      window.siteScroll?.stop();
      document.body.style.overflow = 'hidden';
    });
  });
  viewer?.querySelector('.project-close')?.addEventListener('click', () => viewer.close());
  viewer?.addEventListener('click', event => {
    const r = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) viewer.close();
  });
  viewer?.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    window.siteScroll?.start();
  });
  viewer?.querySelector('.project-dialog-contact')?.addEventListener('click', event => {
    event.preventDefault(); viewer.close();
    if (window.siteScroll) window.siteScroll.scrollTo('#contacts');
    else document.querySelector('#contacts').scrollIntoView({behavior: 'smooth'});
    history.replaceState(null, '', '#contacts');
  });

  const form = document.querySelector('.haven-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const phone = form.elements.phone.value.trim();
    document.querySelector('.haven-form-status').textContent = 'Откроется письмо с Вашим номером для связи.';
    location.href = `mailto:mail@csnstroy.ru?subject=${encodeURIComponent('Обсуждение проекта')}&body=${encodeURIComponent('Здравствуйте! Хочу обсудить проект. Мой телефон: ' + phone)}`;
  });

  const refresh = () => {
    window.siteScroll?.resize();
    ScrollTrigger.refresh();
  };
  ScrollTrigger.sort();
  document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh, {once: true});
  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(refresh);
  });
})();
