(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const prototypeNote = qs('.prototype-note');
  const prototypeClose = qs('[data-close-note]');

  prototypeClose?.addEventListener('click', () => {
    prototypeNote?.setAttribute('hidden', '');
  });

  const menuButton = qs('[data-menu-toggle]');
  const mainNav = qs('.main-nav');

  const closeMenu = () => {
    mainNav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mainNav?.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  qsa('.main-nav a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const scenarioData = {
    one: {
      title: 'Нужно восстановить один зуб',
      description: 'Проверяем объём кости, состояние соседних зубов и прикус. Если условий достаточно, планируем установку имплантата Lenmiriot и будущей коронки.',
      steps: ['КЛКТ и осмотр', 'Цифровой план установки', 'Имплантация и контроль приживления'],
      firstStep: 'Начать с консультации имплантолога и КЛКТ.'
    },
    several: {
      title: 'Отсутствует несколько зубов',
      description: 'Оцениваем, можно ли восстановить ряд мостовидной конструкцией на имплантатах и сократить количество хирургических вмешательств.',
      steps: ['Оценка всей зоны дефекта', 'Расчёт числа опор', 'Выбор временной и постоянной конструкции'],
      firstStep: 'Принести предыдущие снимки, если они сделаны недавно.'
    },
    extract: {
      title: 'Зуб предстоит удалить',
      description: 'Врач проверит, возможна ли установка имплантата сразу после удаления. Решение зависит от воспаления, состояния лунки и объёма кости.',
      steps: ['Диагностика причины удаления', 'Оценка одномоментного протокола', 'План временного зуба при необходимости'],
      firstStep: 'Не удалять зуб до консультации имплантолога, если нет срочных показаний.'
    },
    all: {
      title: 'Нет большинства или всех зубов',
      description: 'Рассматриваем комплексное восстановление зубного ряда на нескольких имплантатах. Количество опор и тип протеза врач определяет после диагностики.',
      steps: ['КЛКТ обеих челюстей', 'Функциональный и эстетический план', 'Поэтапная фиксация конструкции'],
      firstStep: 'Записаться на расширенную консультацию с ортопедом и хирургом.'
    },
    bone: {
      title: 'Ранее сказали, что мало кости',
      description: 'Повторно оцениваем объём кости по КЛКТ. В части случаев подходит альтернативная позиция имплантата, в других нужна костная пластика.',
      steps: ['Анализ КЛКТ', 'Сравнение возможных протоколов', 'Расчёт сроков и этапов'],
      firstStep: 'Получить второе мнение по исходному КЛКТ или сделать новое исследование.'
    },
    fear: {
      title: 'Есть страх боли или операции',
      description: 'Заранее обсуждаем обезболивание, продолжительность вмешательства и послеоперационный план. Все решения принимаются только после очной оценки здоровья.',
      steps: ['Спокойная консультация без лечения', 'План обезболивания', 'Памятка и связь с клиникой после процедуры'],
      firstStep: 'Выбрать консультацию-знакомство и сообщить администратору о тревоге.'
    }
  };

  const renderScenario = (key) => {
    const data = scenarioData[key];
    if (!data) return;

    qsa('[data-scenario]').forEach((button) => {
      const active = button.dataset.scenario === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const title = qs('#scenario-title');
    const description = qs('#scenario-description');
    const steps = qs('#scenario-steps');
    const firstStep = qs('#scenario-first-step');

    if (title) title.textContent = data.title;
    if (description) description.textContent = data.description;
    if (steps) {
      steps.replaceChildren(...data.steps.map((step) => {
        const item = document.createElement('li');
        item.textContent = step;
        return item;
      }));
    }
    if (firstStep) firstStep.textContent = data.firstStep;
  };

  qsa('[data-scenario]').forEach((button) => {
    button.addEventListener('click', () => renderScenario(button.dataset.scenario));
  });

  const systemData = {
    lenmiriot: {
      origin: 'Россия',
      name: 'Lenmiriot',
      summary: 'Основная система предложения страницы: подходит для распространённых клинических задач после подтверждения показаний врачом.',
      segment: 'Рациональный',
      format: 'Классический и отдельные одномоментные протоколы',
      warranty: 'По договору клиники и условиям производителя',
      price: 'от 22 000 ₽'
    },
    osstem: {
      origin: 'Южная Корея',
      name: 'Osstem',
      summary: 'Распространённая корейская система с широкой линейкой компонентов. Может рассматриваться как альтернатива по клинической задаче.',
      segment: 'Средний',
      format: 'Широкий выбор хирургических протоколов',
      warranty: 'Зависит от выбранной программы лечения',
      price: 'по расчёту врача'
    },
    neodent: {
      origin: 'Бразилия / Straumann Group',
      name: 'Neodent',
      summary: 'Система для разных вариантов протезирования, в том числе комплексных. Выбор компонентов зависит от плана ортопеда.',
      segment: 'Средний плюс',
      format: 'Одиночные и комплексные реставрации',
      warranty: 'Зависит от комплектации и договора',
      price: 'по расчёту врача'
    },
    straumann: {
      origin: 'Швейцария',
      name: 'Straumann',
      summary: 'Премиальная система с развитой экосистемой компонентов. Может быть рекомендована для отдельных сложных или эстетически значимых задач.',
      segment: 'Премиальный',
      format: 'Широкий выбор решений и компонентов',
      warranty: 'По выбранной программе и условиям производителя',
      price: 'по расчёту врача'
    }
  };

  const renderSystem = (key) => {
    const data = systemData[key];
    if (!data) return;

    qsa('.system-tab').forEach((button) => {
      const active = button.dataset.system === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });

    const fields = {
      '#system-origin': data.origin,
      '#system-name': data.name,
      '#system-summary': data.summary,
      '#system-segment': data.segment,
      '#system-format': data.format,
      '#system-warranty': data.warranty,
      '#system-price': data.price
    };

    Object.entries(fields).forEach(([selector, value]) => {
      const element = qs(selector);
      if (element) element.textContent = value;
    });
  };

  qsa('.system-tab').forEach((button) => {
    button.addEventListener('click', () => renderSystem(button.dataset.system));
  });

  const protocolData = {
    classic: {
      duration: 'Ориентир: 3–6 месяцев',
      description: 'Имплантат устанавливают, затем дают время на приживление и переходят к постоянной коронке. Точный срок зависит от зоны, кости и общего здоровья.'
    },
    immediate: {
      duration: 'В отдельных случаях — за один визит',
      description: 'Имплантат можно установить сразу после удаления, если нет противопоказаний и сохранены необходимые ткани. Возможность временной коронки оценивается отдельно.'
    },
    full: {
      duration: 'Временная конструкция — по индивидуальному протоколу',
      description: 'При комплексном восстановлении заранее планируют позиции имплантатов и нагрузку. Количество опор, сроки и материал конструкции определяет команда врачей.'
    }
  };

  const renderProtocol = (key) => {
    const data = protocolData[key];
    if (!data) return;

    qsa('.process-tab').forEach((button) => {
      const active = button.dataset.protocol === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });

    const duration = qs('#protocol-duration');
    const description = qs('#protocol-description');
    if (duration) duration.textContent = data.duration;
    if (description) description.textContent = data.description;
  };

  qsa('.process-tab').forEach((button) => {
    button.addEventListener('click', () => renderProtocol(button.dataset.protocol));
  });

  const slides = qsa('.case-slide');
  const caseCurrent = qs('#case-current');
  const caseTotal = qs('#case-total');
  let currentCase = 0;

  const renderCase = (index) => {
    if (!slides.length) return;
    currentCase = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentCase;
      slide.hidden = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
    if (caseCurrent) caseCurrent.textContent = String(currentCase + 1).padStart(2, '0');
  };

  if (caseTotal) caseTotal.textContent = String(slides.length).padStart(2, '0');
  renderCase(0);
  qs('[data-case-prev]')?.addEventListener('click', () => renderCase(currentCase - 1));
  qs('[data-case-next]')?.addEventListener('click', () => renderCase(currentCase + 1));

  const caseDialog = qs('#case-dialog');
  qsa('[data-open-case]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!caseDialog) return;
      if (typeof caseDialog.showModal === 'function') caseDialog.showModal();
      else caseDialog.setAttribute('open', '');
    });
  });

  qsa('[data-close-case]').forEach((button) => {
    button.addEventListener('click', () => caseDialog?.close());
  });

  caseDialog?.addEventListener('click', (event) => {
    if (event.target === caseDialog) caseDialog.close();
  });

  qsa('.faq-item > button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = qs('.faq-item__answer', item);
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      item?.classList.toggle('is-open', !expanded);
      if (answer) answer.hidden = expanded;
    });
  });

  const financePrice = qs('#finance-price');
  const financeMonths = qs('#finance-months');
  const financeMonthsLabel = qs('#finance-months-label');
  const financeResult = qs('#finance-result');
  const currency = new Intl.NumberFormat('ru-RU');

  const monthWord = (value) => {
    const remainder100 = value % 100;
    const remainder10 = value % 10;
    if (remainder100 >= 11 && remainder100 <= 14) return 'месяцев';
    if (remainder10 === 1) return 'месяц';
    if (remainder10 >= 2 && remainder10 <= 4) return 'месяца';
    return 'месяцев';
  };

  const renderFinance = () => {
    if (!financePrice || !financeMonths) return;
    const price = Number(financePrice.value);
    const months = Number(financeMonths.value);
    if (financeMonthsLabel) financeMonthsLabel.textContent = `${months} ${monthWord(months)}`;
    if (financeResult) financeResult.textContent = `${currency.format(Math.ceil(price / months))} ₽/мес.`;
  };

  financePrice?.addEventListener('change', renderFinance);
  financeMonths?.addEventListener('input', renderFinance);
  renderFinance();

  const normalizePhone = (input) => {
    let digits = input.value.replace(/\D/g, '');
    if (!digits) return;
    if (digits[0] === '8') digits = `7${digits.slice(1)}`;
    if (digits[0] !== '7') digits = `7${digits}`;
    digits = digits.slice(0, 11);

    const parts = ['+7'];
    if (digits.length > 1) parts.push(` (${digits.slice(1, 4)}`);
    if (digits.length >= 4) parts.push(')');
    if (digits.length > 4) parts.push(` ${digits.slice(4, 7)}`);
    if (digits.length > 7) parts.push(`-${digits.slice(7, 9)}`);
    if (digits.length > 9) parts.push(`-${digits.slice(9, 11)}`);
    input.value = parts.join('');
  };

  qsa('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => normalizePhone(input));
  });

  qsa('.js-demo-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const phone = qs('input[type="tel"]', form);
      const status = qs('.form-status', form);
      const digits = phone?.value.replace(/\D/g, '') || '';

      if (digits.length < 11) {
        phone?.setAttribute('aria-invalid', 'true');
        phone?.focus();
        if (status) {
          status.textContent = 'Введите номер телефона полностью.';
          status.className = 'form-status is-error';
        }
        return;
      }

      phone?.removeAttribute('aria-invalid');
      if (status) {
        status.textContent = 'Готово — это демонстрация формы. В рабочей версии заявка будет отправлена администратору.';
        status.className = 'form-status is-success';
      }
      form.reset();
      renderFinance();
    });
  });

  const observedSections = qsa('main section[id]');
  const anchorLinks = qsa('.anchor-nav a');
  if ('IntersectionObserver' in window && observedSections.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      anchorLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: [0, 0.1, 0.4] });

    observedSections.forEach((section) => observer.observe(section));
  }
})();
