/**
 * ========================================
 * 背景特效模块
 * ========================================
 * 包含：黑客帝国数字雨背景、自定义光标效果
 * ========================================
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {

  // ========================================
  // 第一部分：黑客帝国数字雨背景
  // ========================================
  (function initMatrixBackground() {
    'use strict';

    const canvasElement = document.getElementById('matrix-canvas');
    if (!canvasElement) {
      console.error('Matrix canvas element not found');
      return;
    }

    const ctx = canvasElement.getContext('2d');

  // 配置参数
  const config = {
    characters: '01',
    fontSize: 18,
    animationSpeed: 35,
    resetProbability: 0.985
  };

    let drops = [];
    let columns = 0;

    // 设置画布大小
    function resizeCanvas() {
      canvasElement.width = window.innerWidth;
      canvasElement.height = window.innerHeight;

      const newColumns = Math.floor(canvasElement.width / config.fontSize);

      if (newColumns !== columns) {
        columns = newColumns;
        drops = [];
        for (let i = 0; i < columns; i++) {
          drops[i] = Math.random() * -100;
        }
      }
    }

    // 绘制数字雨
    function drawMatrix() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

      ctx.fillStyle = '#0f0';
      ctx.font = config.fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = config.characters.charAt(Math.floor(Math.random() * config.characters.length));
        ctx.fillText(text, i * config.fontSize, drops[i] * config.fontSize);

        if (drops[i] * config.fontSize > canvasElement.height && Math.random() > config.resetProbability) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    // 初始化
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setInterval(drawMatrix, config.animationSpeed);

  })();

  // ========================================
  // 第二部分：自定义光标效果
  // ========================================
  (function initCustomCursor() {
    'use strict';

    // 移动端不启用自定义光标
    if (window.innerWidth <= 768) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.id = 'main-cursor';
    cursor.innerHTML = '<div class="cursor-core"></div>';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    let isMoving = false, moveTimer;
    let lastTrailTime = 0, lastGlowTime = 0;

    // 鼠标移动事件
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => isMoving = false, 100);
    });

    // 鼠标点击事件
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

    // 创建粒子效果
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

    // 创建拖尾效果
    function createTrail(x, y) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 800);
    }

    // 创建光晕效果
    function createGlow(x, y) {
      const glow = document.createElement('div');
      glow.className = 'cursor-glow';
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
      document.body.appendChild(glow);
      setTimeout(() => glow.remove(), 1000);
    }

    // 动画循环
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
  })();

});

