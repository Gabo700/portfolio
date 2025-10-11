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
      data.items.slice(0, 5).forEach(item => {
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

(function snakeBackground() {
  const canvas = document.getElementById('snake-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const grid = 20;
  const numSnakes = 3;
  let fruits = [];
  let enemies = [];
  let particles = [];
  let tick = 0;

  let snakes = Array.from({ length: numSnakes }, (_, i) => ({
    body: [{ x: 5 + i * 5, y: 5 + i * 3 }],
    dir: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 }
    ][i % 4],
    hue: i * 120,
    isDead: false
  }));

  function randomGridPosition() {
    return {
      x: Math.floor(Math.random() * (canvas.width / grid)),
      y: Math.floor(Math.random() * (canvas.height / grid))
    };
  }

  for (let i = 0; i < 8; i++) fruits.push(randomGridPosition());
  for (let i = 0; i < 4; i++) enemies.push({ ...randomGridPosition(), target: randomGridPosition() });

  function resetSnake(snake) {
    snake.isDead = true; 
    setTimeout(() => {
      snake.body = [{ x: Math.floor(Math.random() * (canvas.width / grid)), y: Math.floor(Math.random() * (canvas.height / grid)) }];
      snake.dir = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 }
      ][Math.floor(Math.random() * 4)];
      snake.isDead = false;
    }, 1000); 
  }

  function resetEnemy(enemyIndex) {
    enemies[enemyIndex] = { ...randomGridPosition(), target: randomGridPosition() };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.25;

    snakes.forEach(snake => {
      if (snake.isDead) return; 
      
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, `hsl(${snake.hue}, 90%, 55%)`);
      grad.addColorStop(1, `hsl(${(snake.hue + 60) % 360}, 90%, 55%)`);
      ctx.fillStyle = grad;

      snake.body.forEach(s => {
        ctx.fillRect(s.x * grid, s.y * grid, grid - 2, grid - 2);
      });
    });

    ctx.globalAlpha = 0.6;
    fruits.forEach(f => {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${(f.x * 15 + f.y * 15 + tick * 2) % 360}, 100%, 60%)`;
      ctx.arc(f.x * grid + grid / 2, f.y * grid + grid / 2, grid / 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'hsl(0, 80%, 50%)';
    enemies.forEach(e => {
      const size = grid / 2.2 + Math.sin(tick * 0.1) * (grid / 8);
      ctx.beginPath();
      ctx.arc(e.x * grid + grid / 2, e.y * grid + grid / 2, size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 0.8;
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  function update() {
    tick++;

    snakes.forEach(snake => {
      if (snake.isDead) return;

      if (tick % 8 !== 0) return; 

      const head = { x: snake.body[0].x + snake.dir.x, y: snake.body[0].y + snake.dir.y };

      if (head.x < 0) head.x = Math.floor(canvas.width / grid) - 1;
      if (head.y < 0) head.y = Math.floor(canvas.height / grid) - 1;
      if (head.x * grid >= canvas.width) head.x = 0;
      if (head.y * grid >= canvas.height) head.y = 0;

      const fruitIndex = fruits.findIndex(f => f.x === head.x && f.y === head.y);
      if (fruitIndex !== -1) {
        const eatenFruit = fruits.splice(fruitIndex, 1)[0];
        fruits.push(randomGridPosition());
        snake.body.unshift(head);
        for (let i = 0; i < 8; i++) {
          particles.push({
            x: eatenFruit.x * grid + grid / 2,
            y: eatenFruit.y * grid + grid / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            color: `hsl(${snake.hue}, 100%, 60%)`,
            alpha: 1
          });
        }
      } else {
        snake.body.unshift(head);
        snake.body.pop();
      }

      const hitEnemyIndex = enemies.findIndex(e => Math.abs(e.x - head.x) < 1 && Math.abs(e.y - head.y) < 1);
      const hitSelf = snake.body.slice(1).some(s => s.x === head.x && s.y === head.y);

      if (hitEnemyIndex !== -1) {
        resetSnake(snake);
        resetEnemy(hitEnemyIndex);
      } else if (hitSelf) {
        resetSnake(snake);
      }
    });

    particles = particles.filter(p => p.alpha > 0.1);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      p.size *= 0.96;
    });

    draw();
  }

  setInterval(() => {
    snakes.forEach(snake => {
      if (snake.isDead) return;

      const head = snake.body[0];
      let closestFruit = null;
      let minDist = Infinity;

      fruits.forEach(f => {
        const dist = Math.sqrt((f.x - head.x) ** 2 + (f.y - head.y) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closestFruit = f;
        }
      });

      if (!closestFruit) return;
      let newDir = { ...snake.dir };
      if (Math.abs(head.x - closestFruit.x) > Math.abs(head.y - closestFruit.y)) {
        newDir.x = Math.sign(closestFruit.x - head.x);
        newDir.y = 0;
      } else {
        newDir.x = 0;
        newDir.y = Math.sign(closestFruit.y - head.y);
      }
      if (!(newDir.x === -snake.dir.x && newDir.y === -snake.dir.y)) {
        snake.dir = newDir;
      }
    });
  }, 400);

  function loop() {
    update();
    requestAnimationFrame(loop);
  }
  loop();
})();
