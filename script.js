(() => {
  const progress = document.getElementById('scrollProgress');
  const menuButton = document.getElementById('menuButton');
  const nav = document.getElementById('mainNav');
  const navLinks = [...nav.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const motionToggle = document.getElementById('motionToggle');
  const form = document.getElementById('contactForm');
  const preview = document.getElementById('messagePreview');
  const status = document.getElementById('formStatus');

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    let current = 'accueil';
    for (const section of sections) {
      if (scrollY >= section.offsetTop - 180) current = section.id;
    }
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? '×' : '☰';
  });
  navLinks.forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.textContent = '☰';
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  motionToggle?.addEventListener('click', () => {
    const paused = document.body.classList.toggle('motion-paused');
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.innerHTML = paused ? '<span>▶</span> Reprendre les animations' : '<span>Ⅱ</span> Mettre les animations en pause';
  });

  const fields = ['name','discord','email','subject','message'].map(id => document.getElementById(id));
  const compose = () => {
    const [name, discord, email, subject, message] = fields.map(el => el?.value.trim() || '');
    return [
      '🏴‍☠️ **MESSAGE DU SITE — LES PIRATES DE LA ROUTE**',
      '',
      `**Nom / pseudo :** ${name || '—'}`,
      `**Pseudo Discord :** ${discord || '—'}`,
      `**Adresse email :** ${email || 'Non renseignée'}`,
      `**Sujet :** ${subject || '—'}`,
      '',
      '**Message :**',
      message || '—'
    ].join('\n');
  };
  const updatePreview = () => preview.textContent = compose();
  fields.forEach(el => el?.addEventListener('input', updatePreview));
  fields.forEach(el => el?.addEventListener('change', updatePreview));

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const text = compose();
    preview.textContent = text;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Message copié ! Ouvre Discord et colle-le dans ton ticket.';
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      status.textContent = 'Message copié ! Ouvre Discord et colle-le dans ton ticket.';
    }
  });
})();
