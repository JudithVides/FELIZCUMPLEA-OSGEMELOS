/* gallery-intro.js — Página de inicio */

// ── BUGS FLOTANTES ──
const bugsContainer = document.getElementById('bugsContainer');
const bugEmojis = ['🐛','🐜','🦟','🐞','🦗','🐝'];

for (let i = 0; i < 18; i++) {
  const bug = document.createElement('div');
  bug.className = 'bug';
  bug.textContent = bugEmojis[Math.floor(Math.random() * bugEmojis.length)];
  bug.style.left     = Math.random() * 100 + 'vw';
  bug.style.top      = Math.random() * 100 + 'vh';
  bug.style.setProperty('--dur', (4 + Math.random() * 5) + 's');
  bug.style.animationDelay = (Math.random() * 4) + 's';
  bug.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
  bugsContainer.appendChild(bug);
}

// ── CONFETTI ──
const canvas = document.getElementById('confetti');
const ctx    = canvas.getContext('2d');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});

const COLORS = ['#e0161a','#f5c518','#1db954','#ff6b9d','#fff','#ff9f43'];
const pieces = Array.from({ length: 80 }, () => ({
  x:    Math.random() * canvas.width,
  y:    Math.random() * canvas.height,
  w:    6 + Math.random() * 8,
  h:    10 + Math.random() * 12,
  r:    Math.random() * Math.PI * 2,
  vx:   (Math.random() - .5) * 1.5,
  vy:   .5 + Math.random() * 1.5,
  vr:   (Math.random() - .5) * .08,
  color: COLORS[Math.floor(Math.random() * COLORS.length)]
}));

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.r += p.vr;
    if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = .8;
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    ctx.restore();
  });
  requestAnimationFrame(drawConfetti);
}
drawConfetti();
