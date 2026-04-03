(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  const themes = ['light', 'dark', 'jurassic'];
  const themeIcons = { light: '☀️', dark: '🌙', jurassic: '🦖' };
  const themeNames = { light: 'Light', dark: 'Dark', jurassic: 'Jurassic' };

  /* ===== Page Loader ===== */
  const loader = $('#pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 800);
  });

  /* ===== Theme ===== */
  const themeToggle = $('#themeToggle');
  const themeDropdown = $('#themeDropdown');
  const themePicker = $('.theme-picker');
  const themeBadge = $('#themeBadge');
  const themeIcon = $('#themeIcon');
  const themeName = $('#themeName');
  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) themeIcon.textContent = themeIcons[theme];
    if (themeName) themeName.textContent = themeNames[theme];
    showThemeBadge();
  };

  const showThemeBadge = () => {
    if (!themeBadge) return;
    themeBadge.classList.add('visible');
    setTimeout(() => themeBadge.classList.remove('visible'), 2000);
  };

  if (themeToggle && themePicker) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      themePicker.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!themePicker.contains(e.target)) themePicker.classList.remove('open');
    });
  }

  $$('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      if (themePicker) themePicker.classList.remove('open');
    });
  });

  /* ===== Time-based greeting ===== */
  const greetingEl = $('#greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    let text = 'Hello,';
    if (hour < 12) text = 'Good morning,';
    else if (hour < 18) text = 'Good afternoon,';
    else text = 'Good evening,';
    greetingEl.textContent = text;
  }

  /* ===== Typewriter ===== */
  const typewriterEl = $('#typewriter');
  const phrases = [
    'Software Engineer Intern',
    'React & Next.js Developer',
    'Tech Enthusiast',
    'Lifelong Learner'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  const typeLoop = () => {
    if (!typewriterEl) return;
    const current = phrases[phraseIndex];
    if (isDeleting) {
      typewriterEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      typewriterEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      typeSpeed = 1500;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500;
    }
    setTimeout(typeLoop, typeSpeed);
  };
  setTimeout(typeLoop, 600);

  /* ===== Cursor ===== */
  const cursor = $('#cursor');
  const follower = $('#cursorFollower');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my, fx = mx, fy = my;

  if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const loop = () => {
      cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2);
      fx = lerp(fx, mx, 0.1); fy = lerp(fy, my, 0.1);
      cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`;
      follower.style.left = `${fx}px`; follower.style.top = `${fy}px`;
      requestAnimationFrame(loop);
    };
    loop();

    $$('[data-cursor-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        follower.style.width = '46px'; follower.style.height = '46px';
        follower.style.borderColor = 'var(--cursor-border)';
        follower.style.background = 'var(--cursor-hover-bg)';
      });
      el.addEventListener('mouseleave', () => {
        follower.style.width = '32px'; follower.style.height = '32px';
        follower.style.borderColor = 'var(--cursor-border)';
        follower.style.background = 'transparent';
      });
    });
  }

  /* ===== Header hide/show ===== */
  const header = $('#header');
  let lastY = 0, ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (header) {
          header.classList.toggle('scrolled', y > 20);
          header.classList.toggle('hidden', y > lastY && y > 120);
        }
        lastY = y; ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ===== Mobile menu ===== */
  const menuToggle = $('#menuToggle');
  const nav = $('#nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', open);
    });
    $$('#nav a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ===== Command Palette ===== */
  const palette = $('#commandPalette');
  const paletteInput = $('#paletteInput');
  const paletteList = $('#paletteList');
  const paletteOverlay = $('#paletteOverlay');
  const kbdHint = $('#kbdHint');

  const scrollTo = (sel) => {
    const el = $(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentThemeIndex = () => {
    const current = root.getAttribute('data-theme') || 'light';
    return themes.indexOf(current);
  };

  const cycleTheme = (dir = 1) => {
    const idx = getCurrentThemeIndex();
    const next = themes[(idx + dir + themes.length) % themes.length];
    applyTheme(next);
  };

  const setTheme = (t) => applyTheme(t);

  const commands = [
    { name: 'Go to About', action: () => scrollTo('#about'), shortcut: 'A' },
    { name: 'Go to Skills', action: () => scrollTo('#skills'), shortcut: 'S' },
    { name: 'Go to Projects', action: () => scrollTo('#projects'), shortcut: 'P' },
    { name: 'Go to Now', action: () => scrollTo('#now'), shortcut: 'N' },
    { name: 'Go to Contact', action: () => scrollTo('#contact'), shortcut: 'C' },
    { name: 'Toggle Theme (cycle)', action: () => cycleTheme(1), shortcut: 'T' },
    { name: 'Set Theme: Light', action: () => setTheme('light'), shortcut: '1' },
    { name: 'Set Theme: Dark', action: () => setTheme('dark'), shortcut: '2' },
    { name: 'Set Theme: Jurassic', action: () => setTheme('jurassic'), shortcut: '3' },
    { name: 'Copy Email', action: () => copyEmail(), shortcut: 'E' },
    { name: 'Back to Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }), shortcut: '↑' },
  ];

  const openPalette = () => {
    if (!palette) return;
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    if (paletteInput) {
      paletteInput.value = '';
      paletteInput.focus();
    }
    renderCommands(commands);
    if (kbdHint) kbdHint.classList.remove('visible');
  };

  const closePalette = () => {
    if (!palette) return;
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
  };

  const renderCommands = (list) => {
    if (!paletteList) return;
    paletteList.innerHTML = '';
    if (list.length === 0) {
      paletteList.innerHTML = '<div class="palette-empty">No commands found</div>';
      return;
    }
    list.forEach((cmd, i) => {
      const div = document.createElement('div');
      div.className = 'palette-item' + (i === 0 ? ' active' : '');
      div.innerHTML = `<span>${escapeHtml(cmd.name)}</span><kbd>${escapeHtml(cmd.shortcut)}</kbd>`;
      div.addEventListener('click', () => { closePalette(); cmd.action(); });
      paletteList.appendChild(div);
    });
  };

  const escapeHtml = (str) => str.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

  if (paletteInput) {
    paletteInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = commands.filter(c => c.name.toLowerCase().includes(q));
      renderCommands(filtered);
    });
    paletteInput.addEventListener('keydown', (e) => {
      const items = $$('.palette-item');
      let activeIdx = items.findIndex(it => it.classList.contains('active'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[activeIdx]?.classList.remove('active');
        activeIdx = (activeIdx + 1) % items.length;
        items[activeIdx]?.classList.add('active');
        items[activeIdx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[activeIdx]?.classList.remove('active');
        activeIdx = (activeIdx - 1 + items.length) % items.length;
        items[activeIdx]?.classList.add('active');
        items[activeIdx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = $('.palette-item.active');
        if (active) active.click();
      }
    });
  }

  if (paletteOverlay) paletteOverlay.addEventListener('click', closePalette);

  /* ===== Keyboard shortcuts ===== */
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = tag === 'input' || tag === 'textarea';
    const isOpen = palette && palette.classList.contains('open');

    if (e.key === 'Escape') {
      if (isOpen) closePalette();
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle && menuToggle.classList.remove('open');
      }
      if (themePicker && themePicker.classList.contains('open')) {
        themePicker.classList.remove('open');
      }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? closePalette() : openPalette();
      return;
    }

    if (e.key === '/' && !isTyping && !isOpen) {
      e.preventDefault();
      openPalette();
      return;
    }

    if (isOpen) return;

    if (!isTyping) {
      const k = e.key.toLowerCase();
      if (k === 't') {
        e.preventDefault();
        cycleTheme(1);
      } else if (k === 'e') {
        e.preventDefault();
        copyEmail();
      } else if (['1','2','3'].includes(e.key)) {
        e.preventDefault();
        const map = {'1':'light','2':'dark','3':'jurassic'};
        setTheme(map[e.key]);
      }
    }
  });

  /* Show keyboard hint after delay */
  setTimeout(() => {
    if (kbdHint && window.innerWidth > 860 && !palette?.classList.contains('open')) {
      kbdHint.classList.add('visible');
      setTimeout(() => kbdHint.classList.remove('visible'), 6000);
    }
  }, 2500);

  /* ===== Scroll reveal ===== */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('revealed');
        reveal.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  $$('[data-reveal]').forEach(el => reveal.observe(el));

  /* ===== Counter animation ===== */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const label = el.getAttribute('data-label') || '';
      const isFloat = target % 1 !== 0;
      const duration = 1500;
      const start = performance.now();

      const step = (now) => {
        const p = clamp((now - start) / duration, 0, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const val = lerp(0, target, ease);
        const text = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
        el.textContent = text + suffix;
        if (label) el.setAttribute('data-label', label);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-counter]').forEach(el => countObserver.observe(el));

  /* ===== Skill bars ===== */
  $$('.skill-bar').forEach(bar => {
    const skill = bar.dataset.skill;
    const level = bar.dataset.level;
    bar.innerHTML = `
      <div class="skill-bar-label"><span>${escapeHtml(skill)}</span><span>${escapeHtml(level)}%</span></div>
      <div class="skill-bar-track"><div class="skill-bar-fill" data-level="${escapeHtml(level)}"></div></div>
    `;
  });

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const fill = en.target.querySelector('.skill-bar-fill');
        if (fill) fill.style.width = fill.dataset.level + '%';
        skillObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  $$('.skill-bar').forEach(bar => skillObserver.observe(bar));

  /* ===== Tilt & glow on cards ===== */
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const glow = card.querySelector('.project-glow');
      if (glow) { glow.style.setProperty('--x', `${x}px`); glow.style.setProperty('--y', `${y}px`); }
      const cx = rect.width / 2, cy = rect.height / 2;
      const rx = (y - cy) / cy * -3, ry = (x - cx) / cx * 3;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ===== Magnetic buttons ===== */
  $$('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.2}px, ${(e.clientY - rect.top - rect.height / 2) * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ===== Orbit parallax ===== */
  const orbitScene = $('#orbitScene');
  const heroVisual = $('.hero-visual');
  if (orbitScene && heroVisual && window.matchMedia('(pointer: fine)').matches) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      orbitScene.style.transform = `rotateY(${x * 16}deg) rotateX(${y * -16}deg)`;
    });
    heroVisual.addEventListener('mouseleave', () => { orbitScene.style.transform = ''; });
  }

  /* ===== Copy email ===== */
  const copyEmailBtn = $('#copyEmail');
  const toast = $('#toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const copyEmail = async () => {
    const email = 'arief_danial@outlook.com';
    try {
      await navigator.clipboard.writeText(email);
      showToast('📧 Email copied to clipboard!');
    } catch {
      showToast('Could not copy email.');
    }
  };

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', copyEmail);
  }

  /* ===== Back to top ===== */
  const backToTop = $('#backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ===== Year ===== */
  const yearSpan = $('#year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
})();
