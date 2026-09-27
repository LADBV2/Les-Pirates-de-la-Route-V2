(() => {
  const root = document.documentElement;
  root.classList.add('has-js');
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const motionButton = document.querySelector('.motion-control');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motionPreference.matches;
  let explicitMotionChoice = false;
  function setMotion(enabled) {
    playing = enabled;
    root.classList.toggle('motion-paused', !playing);
    motionButton.setAttribute('aria-pressed', String(playing));
    motionButton.querySelector('.motion-icon').textContent = playing ? 'Ⅱ' : '▶';
    motionButton.querySelector('.motion-label').textContent = playing ? 'Mettre les animations en pause' : 'Activer les animations';
    updateScroll();
  }
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('menu-open');
  }
  menu.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); menu.focus(); } });
  motionButton.addEventListener('click', () => { explicitMotionChoice = true; setMotion(!playing); });
  motionPreference.addEventListener('change', event => { if (!explicitMotionChoice) setMotion(!event.matches); });
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  const sections = [...document.querySelectorAll('section[id]')];
  let queued = false;
  function updateScroll() {
    queued = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? String(Math.min(1, y / max)) : '0');
    header.classList.toggle('scrolled', y > 35);
    if (playing) {
      parallax.forEach(element => {
        const rect = element.parentElement.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const offset = Math.max(-100, Math.min(100, -rect.top * Number(element.dataset.parallax)));
          element.style.transform = `translate3d(0,${offset}px,0)`;
        }
      });
    }
    let current = sections[0].id;
    sections.forEach(section => { if (section.getBoundingClientRect().top < window.innerHeight * .4) current = section.id; });
    nav.querySelectorAll('a').forEach(link => {
      const active = link.hash === '#' + current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(updateScroll); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); onScroll(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  } else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
  setMotion(playing);
})();

// Envoi au relais serveur. Le webhook Discord n'est jamais inclus dans le navigateur.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const status = document.getElementById('contact-status');
    const endpoint = window.PIRATES_CONFIG?.contactEndpoint?.trim();
    if (!endpoint) {
      status.textContent = 'L’envoi du formulaire est en cours de configuration. Contacte-nous sur Discord en attendant.';
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    sending = true;
    button.disabled = true;
    button.textContent = 'ENVOI EN COURS…';
    status.textContent = '';
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: AbortSignal.timeout(20000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'L’envoi a échoué. Réessaie ou contacte-nous sur Discord.');
      status.textContent = 'Ton message a bien été envoyé à l’équipage sur Discord.';
      form.reset();
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'Le délai de réponse a été dépassé. Vérifie auprès de l’équipage avant de réessayer.' : (error.message === 'Failed to fetch' ? 'Connexion impossible. Réessaie plus tard ou contacte-nous sur Discord.' : error.message);
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = 'ENVOYER';
    }
  });
})();
