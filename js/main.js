(() => {
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Loader ---------- */
  const finishLoading = () => {
    body.classList.add('loaded');
    setTimeout(() => body.classList.remove('is-loading'), reduce ? 0 : 900);
  };
  if (reduce) finishLoading();
  else window.addEventListener('load', () => setTimeout(finishLoading, 1700));
  // Fallback in case 'load' is slow (fonts etc.)
  setTimeout(() => { if (!body.classList.contains('loaded')) finishLoading(); }, 3500);

  /* ---------- Split text (section titles) ---------- */
  document.querySelectorAll('.split').forEach(el => {
    let i = 0;
    const words = el.textContent.trim().split(' ');
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w =>
      `<span class="word" aria-hidden="true">${[...w].map(c => `<span class="ch" style="--i:${i++}">${c}</span>`).join('')}</span>`
    ).join(' ');
  });

  /* ---------- 未設定のプロジェクトリンクを「未公開」に ---------- */
  document.querySelectorAll('.business-card .text-link').forEach(a => {
    const href = (a.getAttribute('href') || '').trim();
    if (href && href !== '#') return;
    const label = document.createElement('span');
    label.className = 'text-link is-unpublished';
    label.textContent = '未公開';
    a.replaceWith(label);
  });

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-group, .split').forEach(el => io.observe(el));

  /* ---------- Header / progress ---------- */
  const header = document.getElementById('header');
  const progress = document.querySelector('.progress');
  const nav = document.getElementById('nav');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 40);
    const navOpen = nav.classList.contains('open');
    header.classList.toggle('hide', !navOpen && y > lastY && y > 300);
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const links = [...nav.querySelectorAll('a')];
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) sectionIO.observe(s); });

  /* ---------- Mobile menu ---------- */
  const menu = document.getElementById('menu');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open);
  };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Hero caption rotation ---------- */
  const captionWords = document.querySelectorAll('#caption .cw');
  const orbTones = document.querySelectorAll('.orb .tone');
  const orbWords = document.querySelectorAll('.orb .orb-word');
  const stageGroups = [captionWords, orbTones, orbWords];
  let wi = 0;
  if (!reduce) setInterval(() => {
    stageGroups.forEach(g => g[wi].classList.remove('on'));
    wi = (wi + 1) % captionWords.length;
    stageGroups.forEach(g => g[wi].classList.add('on'));
  }, 2400);

  /* ---------- ADREE ⇄ READ+E アナグラム ---------- */
  const anagram = document.getElementById('anagram');
  if (anagram && !reduce) {
    let timer = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) {
        // ADREE → Add + Agree → ADREE → READ + E → …
        const states = ['split', '', 'flip', ''];
        let si = 0;
        timer = setInterval(() => {
          anagram.classList.remove('split', 'flip');
          if (states[si]) anagram.classList.add(states[si]);
          si = (si + 1) % states.length;
        }, 2400);
      } else if (!e.isIntersecting && timer) {
        clearInterval(timer); timer = null;
      }
    }, { threshold: 0.3 }).observe(anagram);
  }

  /* ---------- 舞い落ちる桜の花びら ---------- */
  const petals = document.getElementById('petals');
  if (petals && !reduce) {
    const count = window.innerWidth < 760 ? 12 : 22;
    const rand = (min, max) => Math.random() * (max - min) + min;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const t = rand(9, 18);
      p.style.setProperty('--x', `${rand(0, 100)}%`);
      p.style.setProperty('--s', `${rand(9, 17)}px`);
      p.style.setProperty('--t', `${t}s`);
      p.style.setProperty('--delay', `${-rand(0, t)}s`);
      p.style.setProperty('--drift', `${rand(-120, 180)}px`);
      p.innerHTML = '<i></i>';
      petals.appendChild(p);
    }
  }

  if (reduce || !finePointer) return;

  /* ---------- Hero parallax ---------- */
  const art = document.getElementById('heroArt');
  const layers = art.querySelectorAll('[data-depth]');
  art.addEventListener('mousemove', e => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach(l => {
      const d = +l.dataset.depth;
      l.style.transform = `translate(${x * d}px, ${y * d}px)`;
    });
  });
  art.addEventListener('mouseleave', () => layers.forEach(l => (l.style.transform = '')));

  /* ---------- Card tilt + spotlight ---------- */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => (card.style.transform = ''));
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.magnetic').forEach(btn => {
    const inner = btn.querySelector('span');
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      if (inner) inner.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      if (inner) inner.style.transform = '';
    });
  });

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('show'); });
  document.addEventListener('mouseleave', () => cursor.classList.remove('show'));
  document.querySelectorAll('a, button, .business-card, .project').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
  const loop = () => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
})();
