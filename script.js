// ==================== CURSOR ====================
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
function animateCursor() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();
document.querySelectorAll('a,button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
    cursorRing.style.width = '60px'; cursorRing.style.height = '60px';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursorRing.style.width = '40px'; cursorRing.style.height = '40px';
  });
});

// ==================== PARTICLES ====================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() < 0.6 ? '#00e5ff' : Math.random() < 0.5 ? '#a020f0' : '#ff2d78';
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color; ctx.globalAlpha = this.alpha; ctx.fill();
  }
}

function initParticles() {
  particles = Array.from({length: 140}, () => new Particle());
}
initParticles();

function drawGrid() {
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 0.5;
  const spacing = 60;
  for (let x = 0; x < W; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

function drawConnections() {
  const MAX_DIST = 120;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        ctx.globalAlpha = (1 - dist / MAX_DIST) * 0.12;
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
      }
    }
  }
}

let glitchTimer = 0;
function maybeGlitch() {
  glitchTimer++;
  if (glitchTimer > 300 && Math.random() < 0.004) {
    glitchTimer = 0;
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#00e5ff';
    const gy = Math.random() * H;
    const gh = Math.random() * 4 + 1;
    ctx.fillRect(0, gy, W, gh);
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  drawGrid();
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  maybeGlitch();
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ==================== ROBOT FINAL BOSS SYSTEM ====================
const robotWrap = document.getElementById('robot-wrap');
const leftEye = document.getElementById('eye-left');
const rightEye = document.getElementById('eye-right');
const layers = document.querySelectorAll(
  '.orbit-ring, .data-panel, .robot-platform'
);
const eyes = document.getElementById('eyes');

let lastMove = Date.now();
let lastX = 0;
let speed = 0;

function updateRobotState(e) {
  lastMove = Date.now();

  const x = (e.clientX / window.innerWidth - 0.5);
  const y = (e.clientY / window.innerHeight - 0.5);

  const rotX = x * 16;
  const rotY = y * 16;

  if (robotWrap) {
    robotWrap.style.transform = `
      rotateY(${rotX}deg)
      rotateX(${-rotY}deg)
      scale(1.02)
    `;
  }

  const moveX = x * 5;
  const moveY = y * 5;

  if (leftEye) {
    leftEye.setAttribute('cx', 194 + moveX);
    leftEye.setAttribute('cy', 113 + moveY);
  }

  if (rightEye) {
    rightEye.setAttribute('cx', 226 + moveX);
    rightEye.setAttribute('cy', 113 + moveY);
  }

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const distX = e.clientX - centerX;
  const distY = e.clientY - centerY;
  const distance = Math.sqrt(distX * distX + distY * distY);
  const glow = Math.max(0.6, 1.2 - distance / 600);

  speed = Math.abs(e.clientX - lastX);
  lastX = e.clientX;
  const intensity = Math.min(speed / 50, 1.5);

  if (robotWrap) {
    robotWrap.style.filter = `brightness(${Math.max(glow, 1 + intensity)}) drop-shadow(0 0 ${glow * 20}px #00e5ff)`;
  }

  layers.forEach((layer, i) => {
    const depth = (i + 1) * 6;
    layer.style.transform = `
      translate(${x * depth}px, ${y * depth}px)
    `;
  });
}

document.addEventListener('mousemove', updateRobotState);

function blink() {
  if (!eyes) return;

  eyes.style.transition = 'transform 0.1s ease';
  eyes.style.transform = 'scaleY(0.1)';

  setTimeout(() => {
    eyes.style.transform = 'scaleY(1)';
  }, 120);

  setTimeout(blink, Math.random() * 4000 + 2000);
}

blink();

setInterval(() => {
  if (!robotWrap) return;
  robotWrap.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.015)' },
    { transform: 'scale(1)' }
  ], {
    duration: 3000,
    easing: 'ease-in-out'
  });
}, 3000);

const buttons = document.querySelectorAll('button, .btn-primary, .btn-ghost');

buttons.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    robotWrap.style.transform += ' scale(1.05)';
    robotWrap.style.filter = 'brightness(1.4) drop-shadow(0 0 25px #00e5ff)';
  });

  btn.addEventListener('mouseleave', () => {
    robotWrap.style.transform = robotWrap.style.transform.replace(' scale(1.05)', '');
    robotWrap.style.filter = '';
  });
});

function idleMotion() {
  const x = (Math.random() - 0.5) * 6;
  const y = (Math.random() - 0.5) * 6;

  robotWrap.style.transform += `
    rotateY(${x}deg)
    rotateX(${y}deg)
  `;

  setTimeout(idleMotion, 3000 + Math.random() * 2000);
}

idleMotion();

let tiltX = 0, tiltY = 0, scale = 1;

function updateTransform() {
  robotWrap.style.transform = `
    rotateY(${tiltX}deg)
    rotateX(${tiltY}deg)
    scale(${scale})
  `;
}

setInterval(() => {
  if (Date.now() - lastMove > 1000) {
    // stop eye wandering → lock position
  }
}, 200);

let state = 'idle';

function setState(newState) {
  state = newState;

  switch(state) {
    case 'idle':
      scale = 1;
      break;
    case 'active':
      scale = 1.02;
      break;
    case 'focus':
      scale = 1.06;
      break;
  }

  updateTransform();
}

// ==================== SCROLL ANIMATIONS ====================
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.12 });
fadeEls.forEach(el => observer.observe(el));

// ==================== HEX GRID ANIMATION ====================
const hexes = document.querySelectorAll('.hex');
let hexIdx = 0;
setInterval(() => {
  hexes.forEach(h => h.classList.remove('active'));
  const count = Math.floor(Math.random() * 4) + 3;
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * hexes.length);
    hexes[idx].classList.add('active');
  }
}, 900);

// ==================== STAT COUNTER ANIMATION ====================
function animateCounter(el, target, suffix, decimals = 0) {
  let start = 0; const dur = 2000; const step = 16;
  const inc = target / (dur / step);
  const interval = setInterval(() => {
    start += inc;
    if (start >= target) { start = target; clearInterval(interval); }
    el.textContent = decimals > 0 ? start.toFixed(decimals) : Math.floor(start).toLocaleString();
  }, step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statVals = entry.target.querySelectorAll('.stat-val');
      statVals.forEach(sv => {
        const text = sv.textContent;
        if (text.includes('99')) animateCounter(sv.querySelector ? sv : sv, 99.8, '%', 1);
        if (text.includes('2.1')) animateCounter(sv, 2.1, 'ms', 1);
        if (text.includes('840')) animateCounter(sv, 840, 'K+', 0);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

const scrollButtons = document.querySelectorAll('.hero-action');
scrollButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (!target) return;
    const section = document.getElementById(target);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const planButtons = document.querySelectorAll('.plan-button');
const planUrls = {
  starter: 'https://example.com/checkout?plan=starter',
  pro: 'https://example.com/checkout?plan=pro',
  enterprise: '#contact'
};
planButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.dataset.plan;
    const url = planUrls[plan];
    if (!url) return;
    if (plan === 'enterprise') {
      const section = document.getElementById('contact');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.open(url, '_blank');
    }
  });
});

const contactForm = document.getElementById('contact-form');
const contactFeedback = document.getElementById('contact-feedback');
if (contactForm) {
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    contactFeedback.classList.remove('error');
    contactFeedback.textContent = '';

    const name = contactForm.querySelector('[name="name"]').value.trim();
    const email = contactForm.querySelector('[name="email"]').value.trim();
    const message = contactForm.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      contactFeedback.textContent = 'Please complete all fields before sending.';
      contactFeedback.classList.add('error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      contactFeedback.textContent = 'Please enter a valid email address.';
      contactFeedback.classList.add('error');
      return;
    }

    const formData = new FormData(contactForm);
    formData.set('_replyto', email);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset();
        contactFeedback.textContent = 'Message sent successfully — we will be in touch soon.';
        contactFeedback.classList.remove('error');
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed.');
      }
    } catch (err) {
      contactFeedback.textContent = 'Unable to send message right now. Please try again later.';
      contactFeedback.classList.add('error');
    }
  });
}
