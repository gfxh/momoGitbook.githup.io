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
  // 第二部分：自定义光标效果（已禁用以提升性能）
  // ========================================
  // 自定义光标效果已禁用以减少鼠标延迟

});

