// ══════════════════════════════════════
// TEXT-TO-SPEECH — voz en español (fix corte Chrome)
// ══════════════════════════════════════
let ttsVoice = null;
let keepAliveInterval = null;

function loadVoice() {
  const voices = window.speechSynthesis.getVoices();
  const priorities = ['es-MX','es-419','es-US','es-ES','es'];
  for (const lang of priorities) {
    const found = voices.find(v => v.lang.startsWith(lang));
    if (found) { ttsVoice = found; break; }
  }
  if (!ttsVoice && voices.length > 0) ttsVoice = voices[0];
}

if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = loadVoice;
}
loadVoice();

function cleanForSpeech(text) {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitIntoChunks(text) {
  // Divide por puntos, comas, puntos suspensivos — frases cortas
  return text
    .split(/(?<=[.!?,…])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function speakChunks(chunks, index) {
  if (index >= chunks.length) return;
  const utter    = new SpeechSynthesisUtterance(chunks[index]);
  utter.lang     = 'es-MX';
  utter.rate     = 0.88;
  utter.pitch    = 1.0;
  utter.volume   = 1.0;
  if (ttsVoice) utter.voice = ttsVoice;
  // Cuando termina un chunk, habla el siguiente
  utter.onend = () => speakChunks(chunks, index + 1);
  window.speechSynthesis.speak(utter);
}

function speakText(text) {
  window.speechSynthesis.cancel();
  if (keepAliveInterval) { clearInterval(keepAliveInterval); keepAliveInterval = null; }
  const clean = cleanForSpeech(text);
  if (!clean) return;

  const chunks = splitIntoChunks(clean);
  speakChunks(chunks, 0);

  // Keepalive de respaldo por si acaso
  keepAliveInterval = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
  }, 8000);
}

  utter.onend = () => clearInterval(keepAlive);
  utter.onerror = () => clearInterval(keepAlive);

  window.speechSynthesis.speak(utter);
}

  utter.onend = () => clearInterval(keepAlive);
  utter.onerror = () => clearInterval(keepAlive);

  window.speechSynthesis.speak(utter);
}function speakText(text) {
  window.speechSynthesis.cancel();
  const clean = cleanForSpeech(text);
  if (!clean) return;

  const utter    = new SpeechSynthesisUtterance(clean);
  utter.lang     = 'es-MX';
  utter.rate     = 0.88;
  utter.pitch    = 1.0;
  utter.volume   = 1.0;
  if (ttsVoice) utter.voice = ttsVoice;

  // Fix bug de Chrome: keepalive cada 10 segundos
  const keepAlive = setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      clearInterval(keepAlive);
    }
  }, 10000);

  utter.onend = () => clearInterval(keepAlive);
  utter.onerror = () => clearInterval(keepAlive);

  window.speechSynthesis.speak(utter);
}

// ══════════════════════════════════════
// HISTORIA ANIMADA
// ══════════════════════════════════════
const STORY_SEGMENTS = [
  { text: "Hace 15 años... nacieron dos piojos feos que lloraban mucho.", dur: 4500 },
  { text: "Se les antojaba hacer todo al mismo tiempo... Un piojo era más negrito que el otro...", dur: 4500 },
  { text: "Pero al ir creciendo... fueron tomando el mismo color.", dur: 3500 },
  { text: "El piojito varón siempre fue más llorón que la piojilla... Pero la piojilla siempre fue más tremenda.", dur: 5000 },
  { text: "Un día el piojito iba manejando cuando tenía DOS años de edad... y se fue a estrellar con la puerta de la casa.", dur: 5500 },
  { text: "Otra vez! El piojillo andaba jugando pelota y se cayó... Ya le habían dicho que se quitara las botas.", dur: 4500 },
  { text: "Se rajó la rodilla y lo llevaron a que le cosieran... y ese piojillo arrugaba la cara.", dur: 4500 },
  { text: "En cambio la piojilla... su tragedia fue con un centavo. Con el coche... la dejaron pegada con un carro.", dur: 5000 },
  { text: "Se le torció la patilla y quedó toda panda.", dur: 3500 },
  { text: "También se salió una vez para un baile... le tomaron foto y ella NEGABA que no era ella.", dur: 4500 },
  { text: "En fin... ahora ya han crecido...", dur: 3000 },
  { text: "FELIZ CUMPLEAÑOS PIOJOS FEOS! Que sigan cumpliendo muchos años más!", dur: 5000 },
];

const storyText    = document.getElementById('storyText');
const storyBar     = document.getElementById('storyBar');
const storyOverlay = document.getElementById('storyOverlay');
const galleryStage = document.getElementById('galleryStage');
const skipBtn      = document.getElementById('skipBtn');

// Emojis que se muestran junto a cada segmento (solo visual)
const EMOJIS = [
  '😢😢', '🙈🐛', '🐛🐛', '😭😈', '🚗💥😂', '🏈👢', '🏥😖', '🚗💥', '🐼😂', '💃📸😂', '🌟✨', '🎂🎉🥳'
];

let segIndex = 0;
let totalDur = STORY_SEGMENTS.reduce((a, s) => a + s.dur, 0);
let elapsed  = 0;
let storyTimer;
let typeTimer;

function typeWriter(text, element, speed) {
  clearInterval(typeTimer);
  element.textContent = '';
  let i = 0;
  const chars = [...text];
  typeTimer = setInterval(() => {
    if (i < chars.length) {
      element.textContent += chars[i];
      i++;
    } else {
      clearInterval(typeTimer);
    }
  }, speed);
}

function showSegment(i) {
  if (i >= STORY_SEGMENTS.length) { endStory(); return; }

  const seg   = STORY_SEGMENTS[i];
  const emoji = EMOJIS[i] || '';
  const displayText = seg.text + ' ' + emoji;
  const chars = [...displayText];
  const speed = Math.max(18, Math.min(50, Math.floor(seg.dur * 0.45 / chars.length)));

  // Fade out → in
  storyText.style.opacity   = '0';
  storyText.style.transform = 'translateY(18px)';

  setTimeout(() => {
    storyText.style.transition = 'opacity .5s, transform .5s';
    storyText.style.opacity    = '1';
    storyText.style.transform  = 'translateY(0)';

    // Voz habla el texto limpio
    speakText(seg.text);

    // Texto aparece letra por letra
    typeWriter(displayText, storyText, speed);
  }, 300);

  // Barra de progreso
  elapsed += seg.dur;
  storyBar.style.transition = `width ${seg.dur}ms linear`;
  storyBar.style.width      = ((elapsed / totalDur) * 100) + '%';

  storyTimer = setTimeout(() => {
    segIndex++;
    showSegment(segIndex);
  }, seg.dur);
}

function endStory() {
  clearTimeout(storyTimer);
  clearInterval(typeTimer);
  window.speechSynthesis.cancel();
  storyOverlay.style.transition = 'opacity .8s';
  storyOverlay.style.opacity    = '0';
  setTimeout(() => {
    storyOverlay.style.display = 'none';
    galleryStage.style.display = 'flex';
    startCarousel();
    startConfetti2();
  }, 800);
}

skipBtn.addEventListener('click', endStory);

// ══════════════════════════════════════
// PANTALLA DE INICIO — botón para desbloquear audio/voz
// ══════════════════════════════════════
const startScreen = document.createElement('div');
startScreen.id = 'startScreen';
startScreen.innerHTML = `
  <div class="start-content">
    <div class="start-emoji">🎂🐛🐛🎂</div>
    <h2 class="start-title">¡Haz clic para comenzar!</h2>
    <p class="start-sub">La historia se leerá en voz alta</p>
    <button class="start-play-btn" id="startPlayBtn">▶ Reproducir historia</button>
  </div>
`;

// Estilos inline para la pantalla de inicio
const style = document.createElement('style');
style.textContent = `
  #startScreen {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(5, 0, 20, 0.92);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(6px);
  }
  .start-content {
    text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 20px;
  }
  .start-emoji { font-size: 3.5rem; animation: bounce2 1.2s ease-in-out infinite; }
  @keyframes bounce2 { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
  .start-title {
    font-family: 'Fredoka One', cursive;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    color: #f5c518;
    text-shadow: 0 0 20px rgba(245,197,24,.5);
  }
  .start-sub {
    font-family: 'Nunito', sans-serif;
    font-size: 1rem; color: rgba(255,255,255,.6);
  }
  .start-play-btn {
    padding: 16px 50px;
    background: linear-gradient(135deg, #e0161a, #ff6b9d);
    color: #fff;
    border: none; border-radius: 50px;
    font-family: 'Fredoka One', cursive;
    font-size: 1.5rem; letter-spacing: 2px;
    cursor: pointer;
    box-shadow: 0 8px 30px rgba(224,22,26,.5);
    transition: transform .3s, box-shadow .3s;
  }
  .start-play-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 40px rgba(224,22,26,.7);
  }
`;
document.head.appendChild(style);
document.body.appendChild(startScreen);

document.getElementById('startPlayBtn').addEventListener('click', () => {
  // Desbloquear voz con utterance vacío primero
  const unlock = new SpeechSynthesisUtterance(' ');
  unlock.volume = 0;
  window.speechSynthesis.speak(unlock);

  // Recargar voces por si no estaban listas
  loadVoice();

  // Ocultar pantalla de inicio
  startScreen.style.transition = 'opacity .6s';
  startScreen.style.opacity = '0';
  setTimeout(() => {
    startScreen.remove();
    showSegment(0);
  }, 600);
});


// ══════════════════════════════════════
// CARRUSEL
// ══════════════════════════════════════
function startCarousel() {
  const track = document.getElementById('carouselTrack');
  const items = Array.from(track.querySelectorAll('.carousel-item'));

  items.forEach(item => track.appendChild(item.cloneNode(true)));

  let x = 0, paused = false;

  function getTrackWidth() {
    return items.reduce((sum, el) => sum + el.offsetWidth + 24, 0);
  }

  function animate() {
    if (!paused) {
      x -= 0.7;
      if (Math.abs(x) >= getTrackWidth()) x = 0;
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  }
  animate();

  function bindVideos() {
    track.querySelectorAll('video').forEach(video => {
      video.addEventListener('play',  () => { paused = true; video.scrollIntoView({ behavior:'smooth', block:'center' }); });
      video.addEventListener('ended', () => { paused = false; });
      video.addEventListener('pause', () => {
        if (!Array.from(track.querySelectorAll('video')).some(v => !v.paused)) paused = false;
      });
    });
  }
  bindVideos();
  setTimeout(bindVideos, 500);
}


// ══════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════
function startConfetti2() {
  const canvas = document.getElementById('confetti2');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

  const COLORS = ['#e0161a','#f5c518','#1db954','#ff6b9d','#fff','#ff9f43','#a29bfe'];
  const pieces = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width, y: -20,
    w: 5 + Math.random() * 8, h: 8 + Math.random() * 12,
    r: Math.random() * Math.PI * 2,
    vx: (Math.random() - .5) * 2, vy: 1 + Math.random() * 2,
    vr: (Math.random() - .5) * .1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.color; ctx.globalAlpha = .75;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
