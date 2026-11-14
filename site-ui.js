(() => {
  const dialog = document.querySelector('#inquiry-dialog');
  const form = dialog?.querySelector('form');
  let opener;
  document.querySelectorAll('[data-inquiry]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      const service = button.dataset.inquiry;
      form.elements.service.value = [...form.elements.service.options].some(o => o.value === service) ? service : 'Пока не знаю';
      dialog.showModal();
      window.siteScroll?.stop();
      document.body.style.overflow = 'hidden';
    });
  });
  dialog?.querySelector('.inquiry-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.body.style.overflow = '';
    window.siteScroll?.start();
    opener?.focus({preventScroll: true});
  });
  const fileInput = form?.elements.files;
  let selectedFiles = [];
  const renderFiles = () => {
    const list = dialog.querySelector('.file-list');
    list.replaceChildren();
    selectedFiles.forEach((file, i) => {
      const row = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = `${file.name} · ${Math.ceil(file.size / 1024)} КБ`;
      const remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = 'Удалить';
      remove.setAttribute('aria-label', `Удалить ${file.name}`);
      remove.addEventListener('click', () => {selectedFiles.splice(i, 1); renderFiles();});
      row.append(name, remove); list.append(row);
    });
  };
  fileInput?.addEventListener('change', () => {
    selectedFiles.push(...fileInput.files);
    fileInput.value = '';
    renderFiles();
  });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const contact = form.elements.contact;
    const value = contact.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || (/^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 7);
    contact.setCustomValidity(valid ? '' : 'Укажите телефон или email, чтобы мы могли Вам ответить.');
    if (!form.reportValidity()) return;
    dialog.querySelector('.inquiry-status').textContent = 'Поля заполнены. Это предпросмотр: обращение и файлы не отправлены. Для связи используйте телефон или почту ниже.';
  });
  form?.elements.contact.addEventListener('input', () => form.elements.contact.setCustomValidity(''));

  const menuButton = document.querySelector('.page-menu-toggle');
  const menu = document.querySelector('#page-mobile-nav');
  const closeMenu = (restoreFocus = false) => {if (!menu) return; menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Открыть меню');if(restoreFocus)menuButton.focus({preventScroll:true});};
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      menu.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.2,.65,.3,1)'});
    }
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && menuButton?.getAttribute('aria-expanded')==='true') closeMenu(true);});
  document.addEventListener('click', e => {if (menu && !menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu();});
  document.addEventListener('toggle', event => {
    if (event.target.tagName !== 'DETAILS') return;
    requestAnimationFrame(() => {window.siteScroll?.resize();window.ScrollTrigger?.refresh();});
  }, true);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.2,.65,.3,1)'});
        observer.unobserve(entry.target);
      });
    }, {threshold:.08});
    document.querySelectorAll('[data-enter], .catalog-item, .team-grid article').forEach(el => observer.observe(el));
  }
})();
