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

    const endpoint = window.SITE_CONFIG?.contactEndpoint?.trim();
    const submitButton = form.querySelector('button[type="submit"]');
    const [name, discord, email, subject, message] = fields.map(el => el?.value.trim() || '');

    if (!endpoint) {
      status.textContent = 'Envoi non configuré : ajoute l’URL de ton Worker dans config.js.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'ENVOI EN COURS…';
    status.textContent = '';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, discord, email, subject, message})
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l’envoi');

      status.textContent = 'Message envoyé avec succès à l’équipage !';
      form.reset();
      preview.textContent = 'Ton message a bien été envoyé. Merci !';
    } catch (err) {
      status.textContent = `Impossible d’envoyer le message : ${err.message || 'réessaie plus tard'}.`;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'ENVOYER →';
    }
  });
})();
