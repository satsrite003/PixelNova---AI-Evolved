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

// ==================== ROBOT MOUSE TRACKING ====================
const robotWrap = document.getElementById('robot-wrap');
let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;

document.addEventListener('mousemove', e => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  targetRX = ((e.clientY - cy) / cy) * -10;
  targetRY = ((e.clientX - cx) / cx) * 10;
});

function animateRobot() {
  curRX += (targetRX - curRX) * 0.08;
  curRY += (targetRY - curRY) * 0.08;
  if (robotWrap) {
    robotWrap.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg)`;
  }
  requestAnimationFrame(animateRobot);
}
animateRobot();

// ==================== 3D ROBOT SCENE ====================
const robotCanvas = document.getElementById('robot-canvas');
let robotScene, robotCamera, robotRenderer, robotControls, robotGroup;

function initRobotScene() {
  if (!robotCanvas || !THREE || !THREE.OrbitControls) return;

  robotRenderer = new THREE.WebGLRenderer({ canvas: robotCanvas, antialias: true, alpha: true });
  robotRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  robotRenderer.setClearColor(0x030711, 0);

  robotScene = new THREE.Scene();
  robotScene.fog = new THREE.Fog(0x030711, 4, 14);

  robotCamera = new THREE.PerspectiveCamera(38, robotWrap.clientWidth / robotWrap.clientHeight, 0.1, 100);
  robotCamera.position.set(0, 1.4, 4.8);

  robotControls = new THREE.OrbitControls(robotCamera, robotCanvas);
  robotControls.enableDamping = true;
  robotControls.dampingFactor = 0.08;
  robotControls.enablePan = false;
  robotControls.minDistance = 3.4;
  robotControls.maxDistance = 7;
  robotControls.minPolarAngle = Math.PI * 0.2;
  robotControls.maxPolarAngle = Math.PI * 0.9;
  robotControls.rotateSpeed = 0.65;
  robotControls.zoomSpeed = 0.8;
  robotControls.target.set(0, 1.25, 0);
  robotControls.update();

  const ambientLight = new THREE.HemisphereLight(0x88dff8, 0x06101d, 0.85);
  robotScene.add(ambientLight);

  const fillLight = new THREE.PointLight(0x00e5ff, 1.1, 20);
  fillLight.position.set(2.5, 3, 4);
  robotScene.add(fillLight);

  const accentLight = new THREE.PointLight(0xa020f0, 1.1, 20);
  accentLight.position.set(-2.7, 1.6, 3);
  robotScene.add(accentLight);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d2035,
    roughness: 0.28,
    metalness: 0.9,
    emissive: 0x001822,
    emissiveIntensity: 0.45
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    roughness: 0.18,
    metalness: 0.7,
    emissive: 0x00b8ff,
    emissiveIntensity: 0.9
  });

  const violetMaterial = new THREE.MeshStandardMaterial({
    color: 0xa020f0,
    roughness: 0.18,
    metalness: 0.7,
    emissive: 0x5a1270,
    emissiveIntensity: 0.85
  });

  robotGroup = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.45, 0.65), bodyMaterial);
  body.position.set(0, 1.1, 0);
  body.rotation.y = 0.08;
  robotGroup.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.65), bodyMaterial);
  head.position.set(0, 2.05, 0);
  robotGroup.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.2, 0.02), accentMaterial);
  visor.position.set(0, 2.05, 0.34);
  robotGroup.add(visor);

  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 28), violetMaterial);
  core.position.set(0, 1.17, 0.33);
  core.rotation.x = Math.PI / 2;
  robotGroup.add(core);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.0, 0.28), bodyMaterial);
  leftArm.position.set(-0.84, 1.05, 0);
  leftArm.rotation.z = 0.12;
  robotGroup.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.set(0.84, 1.05, 0);
  rightArm.rotation.z = -0.12;
  robotGroup.add(rightArm);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.03, 0.32), bodyMaterial);
  leftLeg.position.set(-0.27, 0.08, 0);
  robotGroup.add(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.set(0.27, 0.08, 0);
  robotGroup.add(rightLeg);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.16, 40), new THREE.MeshStandardMaterial({
    color: 0x001122,
    roughness: 0.3,
    metalness: 0.75,
    emissive: 0x001f33,
    emissiveIntensity: 0.18
  }));
  base.position.set(0, -0.48, 0);
  robotGroup.add(base);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02, 16, 80), new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.18
  }));
  ring.position.set(0, -0.48, 0);
  ring.rotation.x = Math.PI / 2;
  robotScene.add(ring);

  robotScene.add(robotGroup);

  function resizeRobot() {
    const width = robotWrap.clientWidth;
    const height = robotWrap.clientHeight;
    robotRenderer.setSize(width, height);
    robotCamera.aspect = width / height;
    robotCamera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resizeRobot);
  resizeRobot();

  function renderRobot() {
    robotControls.update();
    robotGroup.rotation.y += 0.0014;
    robotRenderer.render(robotScene, robotCamera);
    requestAnimationFrame(renderRobot);
  }
  renderRobot();
}
initRobotScene();

// ==================== BUTTON INTERACTIONS ====================
function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.hero-action').forEach(btn => {
  btn.addEventListener('click', () => scrollToSection(btn.dataset.target || 'pricing'));
});
const launchApp = document.querySelector('.nav-cta');
if (launchApp) {
  launchApp.addEventListener('click', () => scrollToSection('contact'));
}

document.querySelectorAll('.plan-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.dataset.plan;
    if (plan === 'enterprise') {
      scrollToSection('contact');
      return;
    }
    const urls = {
      starter: 'https://example.com/checkout?plan=starter',
      pro: 'https://example.com/checkout?plan=pro'
    };
    window.open(urls[plan] || 'https://example.com/checkout', '_blank');
  });
});

// ==================== CONTACT FORM ====================
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
