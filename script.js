// ============================================================
//   GitHub Mastery Guide — Interactive JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ── Elements ──
  const sidebar     = document.getElementById('sidebar');
  const overlay     = document.getElementById('overlay');
  const hamburger   = document.getElementById('hamburger');
  const sidebarClose= document.getElementById('sidebarClose');
  const searchInput = document.getElementById('searchInput');
  const navLinks    = document.querySelectorAll('.nav-link');
  const progressFill= document.getElementById('progressFill');
  const progressPct = document.getElementById('progressPct');
  const sections    = document.querySelectorAll('.module-section, #hero, #cheatsheet, #roadmap30, #projects, #interviews, #mastery');

  // ── Back-to-top button (inject dynamically) ──
  const btt = document.createElement('button');
  btt.className = 'back-to-top';
  btt.innerHTML = '↑';
  btt.title = 'Back to top';
  document.body.appendChild(btt);
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Sidebar toggle ──
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Close sidebar on nav link click (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  // ── Tab switching ──
  window.switchTab = function(btn, targetId) {
    const parent = btn.closest('.topic-card');
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');
  };

  // ── Copy code ──
  window.copyCode = function(btn) {
    const block = btn.closest('.code-block');
    const pre   = block.querySelector('pre');
    const text  = pre ? pre.innerText : '';

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    }
  };

  // ── Search filter ──
  searchInput.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    navLinks.forEach(link => {
      const text = link.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        link.classList.remove('hidden');
      } else {
        link.classList.add('hidden');
      }
    });
  });

  // ── Scroll tracking: progress bar + active nav link ──
  const allSections = Array.from(document.querySelectorAll('[id]')).filter(el => {
    return el.matches('.module-section, #hero, #cheatsheet, #roadmap30, #projects, #interviews, #mastery');
  });

  function onScroll() {
    const scrollY   = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = Math.min(100, Math.round((scrollY / docHeight) * 100));

    progressFill.style.width = progress + '%';
    progressPct.textContent  = progress + '%';

    // Back to top button
    if (scrollY > 400) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }

    // Active nav link — find the section closest to the top of viewport
    let currentId = '';
    allSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === '#' + currentId) {
        link.classList.add('active');
        // Scroll the active link into view in sidebar
        const navList = document.getElementById('sidebarNav');
        if (navList) {
          const linkTop = link.offsetTop;
          const navScroll = navList.scrollTop;
          const navHeight = navList.clientHeight;
          if (linkTop < navScroll || linkTop > navScroll + navHeight - 40) {
            navList.scrollTo({ top: linkTop - navHeight / 2, behavior: 'smooth' });
          }
        }
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  // ── Intersection Observer for section animations ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.module-section').forEach(sec => {
    sec.style.animationPlayState = 'paused';
    observer.observe(sec);
  });

  // ── Q&A toggle (click question to expand/collapse answer) ──
  document.querySelectorAll('.question').forEach(q => {
    q.style.cursor = 'pointer';
    q.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      if (answer && answer.classList.contains('answer')) {
        const isHidden = answer.style.display === 'none';
        answer.style.display = isHidden ? 'block' : 'none';
        this.style.borderBottomColor = isHidden ? 'var(--border-glass)' : 'transparent';
      }
    });
  });

  // ── Checklist persistence with localStorage ──
  const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');

  function saveChecklist() {
    const state = {};
    checkboxes.forEach(cb => {
      state[cb.id] = cb.checked;
    });
    try { localStorage.setItem('gh-guide-checklist', JSON.stringify(state)); } catch (e) {}
  }

  function loadChecklist() {
    try {
      const saved = localStorage.getItem('gh-guide-checklist');
      if (!saved) return;
      const state = JSON.parse(saved);
      checkboxes.forEach(cb => {
        if (state[cb.id]) cb.checked = true;
      });
    } catch (e) {}
  }

  checkboxes.forEach(cb => cb.addEventListener('change', saveChecklist));
  loadChecklist();

  // ── Keyboard shortcut: '/' focuses search ──
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      if (window.innerWidth <= 900) openSidebar();
    }
    if (e.key === 'Escape') {
      closeSidebar();
      searchInput.blur();
    }
  });

  // ── Hero animation trigger ──
  const hero = document.getElementById('hero');
  if (hero) {
    // Git commit dots random colors
    const dots = hero.querySelectorAll('.git-commit-dots span');
    const colors = ['#68d391', '#63b3ed', '#b794f4', '#f6ad55', '#fc8181'];
    dots.forEach((dot, i) => {
      dot.style.background = colors[i % colors.length];
    });
  }

  // ── Dynamic typing indicator in hero subtitle ──
  const subtitle = document.querySelector('.hero-subtitle');
  if (subtitle) {
    const phrases = [
      'Basic → Intermediate → Advanced',
      'From Zero to GitHub Hero',
      'Learn. Build. Contribute. Grow.',
      'Your Developer Career Starts Here 🚀'
    ];
    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;
    let typeTimeout;

    function typeWriter() {
      const current = phrases[phraseIndex];

      if (!isDeleting) {
        subtitle.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          typeTimeout = setTimeout(typeWriter, 2500);
          return;
        }
      } else {
        subtitle.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          typeTimeout = setTimeout(typeWriter, 400);
          return;
        }
      }

      const speed = isDeleting ? 40 : 70;
      typeTimeout = setTimeout(typeWriter, speed);
    }

    setTimeout(typeWriter, 2000);
  }

  // ── Module number gradient cycling ──
  const moduleNums = document.querySelectorAll('.module-number');
  const gradients  = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #a18cd1)',
    'linear-gradient(135deg, #43e97b, #667eea)',
    'linear-gradient(135deg, #f6d365, #fda085)',
    'linear-gradient(135deg, #89f7fe, #66a6ff)',
    'linear-gradient(135deg, #fddb92, #d1fdff)',
    'linear-gradient(135deg, #f5576c, #f093fb)',
    'linear-gradient(135deg, #4facfe, #fa709a)',
  ];

  moduleNums.forEach((num, i) => {
    if (gradients[i]) {
      num.style.backgroundImage = gradients[i];
    }
  });

  // ── Stat card counter animation ──
  const statNums = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.textContent.replace(/\D/g, ''));
        const suffix = el.textContent.replace(/[0-9]/g, '');
        let current = 0;
        const step = Math.ceil(target / 30);
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current + suffix;
          if (current >= target) clearInterval(interval);
        }, 40);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  console.log('%cGitHub Mastery Guide', 'color:#667eea;font-size:20px;font-weight:bold;');
  console.log('%cPress "/" to search. Enjoy learning! 🚀', 'color:#94a3b8;font-size:14px;');

});
