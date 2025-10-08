document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const root = document.documentElement;
  const hour = new Date().getHours();
  function applyAutoTheme() {
    const isDay = hour >= 6 && hour < 19;
    if (isDay) {
      root.setAttribute('data-theme', 'light');
      document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
      root.setAttribute('data-theme', 'dark');
      document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  }
  const saved = localStorage.getItem('theme-preference');
  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
    document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else if (saved === 'light') {
    root.setAttribute('data-theme', 'light');
    document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-moon"></i>';
  } else {
    applyAutoTheme();
  }

  const toggle = document.getElementById('theme-toggle');
  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme-preference', next);
    toggle.innerHTML = next === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8; // 8px extra
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  if (window.tsParticles) {
    tsParticles.load('particles-bg', {
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { value: 35 },
        color: { value: [getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1', getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ffd700'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: { min: 1.5, max: 5 } },
        move: {
          enable: true,
          speed: 0.9,
          direction: 'none',
          outModes: { default: 'out' },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          onClick: { enable: true, mode: 'push' }
        },
        modes: { repulse: { distance: 80 }, push: { quantity: 2 } }
      }
    }).catch(e => console.warn('tsParticles error', e));
  }

  const track = document.getElementById('carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  function scrollByCard(delta = 1) {
    const card = track.querySelector('.project-card');
    if (!card) return;
    const gap = parseInt(getComputedStyle(track).gap || 16, 10);
    const cardWidth = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: cardWidth * delta, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', () => scrollByCard(-1));
  nextBtn.addEventListener('click', () => scrollByCard(1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') scrollByCard(1);
    if (e.key === 'ArrowLeft') scrollByCard(-1);
  });

  async function fetchMediumPosts() {
    const postsList = document.getElementById('medium-posts-list');
    if (!postsList) return;
    const rssUrl = 'https://medium.com/feed/@gabrielribeiro_24514';
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const data = await res.json();
      postsList.innerHTML = '';
      data.items.slice(0,5).forEach(item => {
        const pubDate = new Date(item.pubDate);
        const dateStr = pubDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        const desc = item.description.replace(/<[^>]+>/g, '').slice(0, 90) + '...';
        const li = document.createElement('li');
        li.style.marginBottom = '12px';
        li.style.background = 'var(--surface)';
        li.style.borderRadius = '8px';
        li.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
        li.style.padding = '12px 16px';
        li.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="color:var(--accent);font-size:1.2em;"><i class="fa-brands fa-medium"></i></span>
            <a href="${item.link}" target="_blank" rel="noopener" style="font-weight:600;color:var(--primary);text-decoration:none;">
              ${item.title}
            </a>
          </div>
          <div style="font-size:0.95em;color:var(--muted);margin:4px 0 0 2px;">
            <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
          </div>
          <div style="font-size:0.97em;color:var(--text);margin-top:6px;">
            ${desc}
          </div>
        `;
        postsList.appendChild(li);
      });
    } catch (err) {
      postsList.innerHTML = '<li>Não foi possível carregar posts.</li>';
      console.warn('Erro fetch Medium:', err);
    }
  }
  (function createPostsContainer() {
    const about = document.querySelector('#about .section-inner');
    if (!about) return;
    const el = document.createElement('div');
    el.style.marginTop = '14px';
    el.innerHTML = `<h3 style="text-align:center;margin-bottom:8px;color:var(--muted)">Últimos posts</h3><ul id="medium-posts-list" style="list-style:none;padding-left:0;"></ul>`;
    about.appendChild(el);
    fetchMediumPosts();
  })();
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
  }, { once: true });

  console.log('App inicializado — portfólio carregado');
});
