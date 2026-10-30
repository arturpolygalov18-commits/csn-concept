const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const dialog = document.querySelector('#contact-dialog');
function closeMenu() { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
function showContact(service, description) {
  closeMenu();
  document.querySelector('#contact-title').textContent = service || 'Обсудим ваш объект';
  document.querySelector('#contact-description').textContent = description || 'Расскажите, что планируете построить и на каком этапе находится проект.';
  document.querySelector('.contact-mail').href = service ? 'mailto:mail@csnstroy.ru?subject=' + encodeURIComponent(service) : 'mailto:mail@csnstroy.ru';
  document.body.classList.add('contact-is-open');
  dialog.showModal();
}
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => showContact()));
const serviceDetails = {
  'Технический заказчик': {
    intro: 'Представляем интересы застройщика и координируем участников проекта: от подготовки исходных документов до приёмки и ввода объекта.',
    scope: ['Подготовка технического задания, организация изысканий и проектирования.', 'Выбор подрядчиков и согласование их работы между собой.', 'Контроль графика, бюджета и соответствия работ проекту.', 'Взаимодействие с экспертными и надзорными органами, подготовка к приёмке.'],
    result: 'У вас есть единый координатор проекта и понятная картина по срокам, затратам и готовности объекта.',
    start: 'Для начала расскажите об объекте, текущем этапе и задачах, которые хотите передать.'
  },
  'Проектирование': {
    intro: 'Разрабатываем проектную и рабочую документацию для жилых, общественных, производственных и складских объектов.',
    scope: ['Сбор исходных данных и уточнение технического задания.', 'Архитектурные, конструктивные и инженерные решения.', 'Проектная документация стадии «П» и рабочие чертежи стадии «РД».', 'Сопровождение экспертизы и проработка изменений в проекте.'],
    result: 'Проектные решения прорабатываются с учётом строительства, стоимости и дальнейшей эксплуатации объекта.',
    start: 'Обсудим назначение объекта, параметры участка и документацию, которая уже есть.'
  },
  'Строительный контроль': {
    intro: 'Проверяем, как выполняются работы на площадке: качество, объёмы и соответствие проектной и сметной документации.',
    scope: ['Проверка применяемых материалов и выполненных работ.', 'Сопоставление фактических объёмов с проектом и сметой.', 'Контроль сроков и фиксация выявленных несоответствий.', 'Проверка исполнительной документации и участие в приёмке работ.'],
    result: 'Вы получаете информацию о ходе работ и отклонениях, которые нужно устранить до приёмки.',
    start: 'Расскажите, что строится, на каком этапе находится объект и какие вопросы возникли к работам подрядчика.'
  },
  'Судебная экспертиза': {
    intro: 'Исследуем строительные объекты и документацию для судебных и досудебных споров о качестве, объёмах и стоимости работ.',
    scope: ['Проверка фактических объёмов и качества выполненных работ.', 'Исследование дефектов, повреждений и причин их возникновения.', 'Определение стоимости строительства и устранения недостатков.', 'Оценка готовности объекта и соответствия работ проекту и смете.'],
    result: 'По результатам исследования готовим заключение с выводами, расчётами и ответами на поставленные вопросы.',
    start: 'Кратко опишите спор и вопросы для экспертизы. Обсудим имеющиеся документы и необходимость обследования объекта.'
  }
};
const servicePanel = document.querySelector('#service-detail');
const serviceCards = [...document.querySelectorAll('[data-service]')];
const generalServiceAction = document.querySelector('.directions-bottom [data-contact]');
let activeServiceCard = null;
function scrollToService(element, position = 'start') {
  element.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: position});
}
function closeService() {
  const card = activeServiceCard;
  servicePanel.hidden = true;
  generalServiceAction.hidden = false;
  serviceCards.forEach(button => button.setAttribute('aria-expanded', 'false'));
  activeServiceCard = null;
  if (card) { card.focus({preventScroll: true}); scrollToService(card, 'center'); }
}
serviceCards.forEach(button => {
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'service-detail');
  button.addEventListener('click', () => {
    if (activeServiceCard === button) { closeService(); return; }
    const name = button.dataset.service, details = serviceDetails[name];
    if (!details) return;
    activeServiceCard = button;
    serviceCards.forEach(card => card.setAttribute('aria-expanded', String(card === button)));
    document.querySelector('#service-detail-title').textContent = name;
    document.querySelector('#service-detail-intro').textContent = details.intro;
    document.querySelector('#service-detail-result').textContent = details.result;
    document.querySelector('#service-detail-start').textContent = details.start;
    document.querySelector('#service-detail-image').src = button.querySelector('img').getAttribute('src');
    const scope = document.querySelector('#service-detail-scope');
    scope.replaceChildren(...details.scope.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    servicePanel.hidden = false;
    generalServiceAction.hidden = true;
    scrollToService(servicePanel);
    // Focus follows the revealed content for keyboard and screen-reader users.
    document.querySelector('.service-detail-close').focus({preventScroll: true});
  });
});
document.querySelector('.service-detail-close').addEventListener('click', closeService);
document.querySelector('#service-detail-contact').addEventListener('click', () => {
  if (activeServiceCard) showContact(activeServiceCard.dataset.service, serviceDetails[activeServiceCard.dataset.service].start);
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('contact-is-open'));
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const carousel = document.querySelector('#service-carousel');
const carouselViewport = document.querySelector('.directions-viewport');
const carouselControls = [...document.querySelectorAll('.carousel-arrow')];
let carouselMoving = false;
function moveCarousel(direction) {
  if (carouselMoving) return;
  carouselMoving = true;
  carouselControls.forEach(button => button.disabled = true);
  const first = carousel.firstElementChild, last = carousel.lastElementChild;
  const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).columnGap);
  const item = direction > 0 ? first : last;
  // The temporary copy is visual only; the original keeps its click handler
  // and focus state when the track wraps around.
  const copy = item.cloneNode(true);
  copy.inert = true;
  copy.tabIndex = -1;
  copy.removeAttribute('data-service');
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('aria-expanded', 'false');
  direction > 0 ? carousel.append(copy) : carousel.prepend(copy);
  const finish = () => {
    direction > 0 ? carousel.append(item) : carousel.prepend(item);
    copy.remove();
    carousel.style.transform = '';
    carouselMoving = false;
    carouselControls.forEach(button => button.disabled = false);
    document.querySelector('#carousel-status').textContent = 'Первая услуга: ' + carousel.firstElementChild.dataset.service;
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduced) { finish(); return; }
  gsap.fromTo(carousel, {x: direction > 0 ? 0 : -step}, {x: direction > 0 ? -step : 0, duration: .38, ease: 'power2.inOut', onComplete: finish});
}
document.querySelector('[data-carousel-prev]').addEventListener('click', () => moveCarousel(-1));
document.querySelector('[data-carousel-next]').addEventListener('click', () => moveCarousel(1));
let swipeStart = null, suppressCardClickUntil = 0;
carouselViewport.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse') swipeStart = {x: event.clientX, y: event.clientY};
});
carouselViewport.addEventListener('pointercancel', () => swipeStart = null);
carouselViewport.addEventListener('pointerup', event => {
  if (!swipeStart) return;
  const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    suppressCardClickUntil = performance.now() + 350;
    moveCarousel(dx < 0 ? 1 : -1);
  }
});
carouselViewport.addEventListener('click', event => {
  if (performance.now() < suppressCardClickUntil || carouselMoving) { event.preventDefault(); event.stopPropagation(); }
}, true);

