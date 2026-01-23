// 自定义光标效果
document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 768) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.id = 'main-cursor';
  cursor.innerHTML = '<div class="cursor-core"></div>';
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  let isMoving = false, moveTimer;
  let lastTrailTime = 0, lastGlowTime = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;

    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => isMoving = false, 100);
  });

  document.addEventListener('click', e => {
    const click = document.createElement('div');
    click.className = 'cursor-click';
    click.style.left = e.clientX + 'px';
    click.style.top = e.clientY + 'px';
    document.body.appendChild(click);

    for (let i = 0; i < 8; i++) {
      setTimeout(() => createParticle(e.clientX, e.clientY, i), i * 20);
    }

    setTimeout(() => click.remove(), 600);
  });

  function createParticle(x, y, index) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';

    const angle = (index / 8) * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }

  function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 800);
  }

  function createGlow(x, y) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.left = x + 'px';
    glow.style.top = y + 'px';
    document.body.appendChild(glow);
    setTimeout(() => glow.remove(), 1000);
  }

  function animate() {
    const now = Date.now();

    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    if (isMoving) {
      if (now - lastTrailTime > 40) {
        createTrail(mouseX, mouseY);
        lastTrailTime = now;
      }

      if (now - lastGlowTime > 150) {
        createGlow(mouseX, mouseY);
        lastGlowTime = now;
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
});
