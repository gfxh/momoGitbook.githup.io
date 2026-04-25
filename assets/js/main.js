/**
 * ========================================
 * 主业务逻辑模块
 * ========================================
 * 包含：Markdown渲染、PDF阅读
 * ========================================
 */

// ========================================
// 第一部分：Markdown配置与渲染
// ========================================

// 初始化markdown-it
const md = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    // 对代码内容进行HTML转义，防止<和>被解析为HTML标签
    const escapedStr = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    return '<pre><code class="language-' + lang + '">' + escapedStr + '</code></pre>';
  }
});

// 修复图片路径为 GitHub raw 链接
md.renderer.rules.image = function (tokens, idx, options, _env, self) {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');

  if (srcIndex >= 0) {
    const src = token.attrs[srcIndex][1];

    // 处理相对路径图片，转换为 GitHub raw 链接
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      const rawBaseUrl = 'https://raw.githubusercontent.com/gfxh/momoGitbook.githup.io/refs/heads/main/';
      let directoryPath = '';

      // 获取当前 Markdown 文件的目录路径
      if (window.currentMarkdownPath) {
        const pathParts = window.currentMarkdownPath.split('/');
        pathParts.pop();
        directoryPath = pathParts.join('/') + '/';
      }

      // 处理相对路径中的 ./ 和 ../
      let relativePath = src.replace(/^\.\//, '');
      if (relativePath.startsWith('../')) {
        const upLevels = (relativePath.match(/\.\.\//g) || []).length;
        let pathParts = directoryPath.split('/').filter(p => p);

        for (let i = 0; i < upLevels && pathParts.length > 0; i++) {
          pathParts.pop();
        }

        directoryPath = pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
        relativePath = relativePath.replace(/^(\.\.\/)+/, '');
      }

      const fullSrc = rawBaseUrl + directoryPath + relativePath;
      token.attrs[srcIndex][1] = fullSrc;
    }
  }

  return self.renderToken(tokens, idx, options);
};

// 修复链接路径为 GitHub raw 链接（对于 PHP 等文件）
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');

  if (hrefIndex >= 0) {
    const href = token.attrs[hrefIndex][1];

    // 处理相对路径链接，转换为 GitHub raw 链接（针对 PHP、PY、JS 等代码文件）
    // HTML 文件保持相对路径，在 GitHub Pages 上直接访问
    if (href && !href.startsWith('http') && !href.startsWith('#') && (href.endsWith('.php') || href.endsWith('.py') || href.endsWith('.js') || href.endsWith('.txt'))) {
      const rawBaseUrl = 'https://raw.githubusercontent.com/gfxh/momoGitbook.githup.io/refs/heads/main/';
      let directoryPath = '';

      // 获取当前 Markdown 文件的目录路径
      if (window.currentMarkdownPath) {
        const pathParts = window.currentMarkdownPath.split('/');
        pathParts.pop();
        directoryPath = pathParts.join('/') + '/';
      }

      // 处理相对路径中的 ./ 和 ../
      let relativePath = href.replace(/^\.\//, '');
      if (relativePath.startsWith('../')) {
        const upLevels = (relativePath.match(/\.\.\//g) || []).length;
        let pathParts = directoryPath.split('/').filter(p => p);

        for (let i = 0; i < upLevels && pathParts.length > 0; i++) {
          pathParts.pop();
        }

        directoryPath = pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
        relativePath = relativePath.replace(/^(\.\.\/)+/, '');
      }

      const fullHref = rawBaseUrl + directoryPath + relativePath;
      token.attrs[hrefIndex][1] = fullHref;
    }
  }

  return self.renderToken(tokens, idx, options, env, self);
};

/**
 * 加载Markdown文件
 * @param {string} filePath - Markdown文件路径
 */
async function loadMarkdown(filePath) {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading">正在加载文档...</div>';

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('文件不存在或无法访问');
    }

    const markdownText = await response.text();

    // 保存当前文件路径，用于图片路径解析
    window.currentMarkdownPath = filePath;

    // 渲染Markdown
    const html = md.render(markdownText);
    content.innerHTML = html;

    // 更新页面标题
    const title = filePath.split('/').pop().replace('.md', '');
    document.title = title + ' - Bear随笔';

    // 显示粒子效果
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      canvas.style.display = 'block';
    }

    // 延迟更新粒子canvas大小，确保内容已完全加载
    setTimeout(() => {
      const canvas = document.getElementById('particle-canvas');
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    }, 100);

  } catch (error) {
    content.innerHTML = '<div class="loading"><h2>加载失败</h2><p>' + error.message + '</p></div>';
    
    // 即使加载失败，也更新粒子canvas大小
    setTimeout(() => {
      const canvas = document.getElementById('particle-canvas');
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    }, 100);
  }
}

// ========================================
// 第二部分：PDF阅读器
// ========================================

// 设置PDF.js的worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// PDF阅读相关变量
let pdfDoc = null;
const PDF_SCALE = 1.2;

/**
 * 加载PDF文件
 * @param {string} filePath - PDF文件路径
 */
async function loadPDF(filePath) {
  // 立即隐藏粒子效果
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    canvas.style.display = 'none';
  }

  const content = document.getElementById('content');
  content.innerHTML = '<div class="pdf-loading">正在加载PDF...</div>';

  try {
    // 加载PDF文档
    const loadingTask = pdfjsLib.getDocument(filePath);
    pdfDoc = await loadingTask.promise;

    // 创建PDF查看器界面
    content.innerHTML = '<div class="pdf-container" id="pdf-container"></div>';

    // 渲染所有页面
    await renderAllPages();

    // 更新页面标题
    const title = filePath.split('/').pop().replace('.pdf', '');
    document.title = title + ' - Bear随笔';

  } catch (error) {
    content.innerHTML = '<div class="pdf-loading"><h2>PDF加载失败</h2><p>' + error.message + '</p></div>';
  }
}

/**
 * 渲染所有PDF页面
 */
async function renderAllPages() {
  const container = document.getElementById('pdf-container');
  container.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: PDF_SCALE });

      // 创建页面容器
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page';
      pageDiv.setAttribute('data-page', pageNum);

      // 创建canvas
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');

      // 渲染页面
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      pageDiv.appendChild(canvas);
      container.appendChild(pageDiv);

    } catch (error) {
      console.error(`渲染第${pageNum}页时出错:`, error);
    }
  }
}

// ========================================
// 第三部分：页面初始化
// ========================================

/**
 * 显示首页内容
 */
function showHome() {
  const content = document.getElementById('content');
  
  // 显示首页内容
  content.innerHTML = `
    <div class="home-content">
      <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20avatar%20of%20a%20white%20haired%20girl%20with%20blue%20eyes%20drawing%20on%20a%20notebook&image_size=square" alt="Avatar" class="home-avatar">
      <h1 class="home-title">Hi, I Am I</h1>
      <p class="home-subtitle">Full Stack Developer</p>
      <p class="home-description">I love coding, but they don't like me...</p>
    </div>
  `;
  
  // 更新页面标题
  document.title = 'Home - Bear随笔';
  
  // 显示粒子效果
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    canvas.style.display = 'block';
  }
  
  // 延迟更新粒子canvas大小，确保内容已完全加载
  setTimeout(() => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, 100);
}

/**
 * 切换深色/浅色模式
 */
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  
  // 切换主题类
  body.classList.toggle('light-mode');
  
  // 更新图标和文本
  if (body.classList.contains('light-mode')) {
    themeIcon.textContent = '☀️';
    themeText.textContent = '浅色模式';
    // 保存主题偏好到localStorage
    localStorage.setItem('theme', 'light');
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = '深色模式';
    // 保存主题偏好到localStorage
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * 加载保存的主题偏好
 */
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  
  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = '浅色模式';
  } else {
    body.classList.remove('light-mode');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = '深色模式';
  }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function () {
  // 加载保存的主题偏好
  loadSavedTheme();
  
  // 显示首页内容
  showHome();
  
  // 延迟初始化粒子系统，确保DOM完全加载
  setTimeout(() => {
    initParticleSystem();
  }, 100);
});

/**
 * 初始化粒子系统
 */
function initParticleSystem() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) {
    // 如果canvas元素不存在，直接返回，不初始化粒子系统
    return;
  }
  const ctx = canvas.getContext('2d');
  
  // 适配窗口
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 配置
  const config = {
    initialPointCount: 100,       // 初始粒子数量
    maxPointCount: 400,          // 最大粒子数量
    addPerSecond: 20,            // 每秒增加的粒子数量
    speed: 1,           // 移动速度
    connectDist: 100,      // 粒子连线距离
    boxSize: 100,          // 鼠标吸附矩形大小
    attractForce: 0.1,     // 吸附强度
  };
  
  // 鼠标
  const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  
  // 粒子
  class Particle {
    constructor(x, y) {
      this.x = x ?? Math.random() * canvas.width;
      this.y = y ?? Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.hue = Math.random() * 360;
    }
    
    update(mouse) {
      // 基础移动
      this.x += this.vx;
      this.y += this.vy;
      
      // 判断：是否在鼠标矩形范围内
      const inBox = 
          this.x > mouse.x - config.boxSize/2 &&
          this.x < mouse.x + config.boxSize/2 &&
          this.y > mouse.y - config.boxSize/2 &&
          this.y < mouse.y + config.boxSize/2;
      
      // 只有在盒子里才被鼠标吸引
      if (inBox) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          this.vx += dx * config.attractForce;
          this.vy += dy * config.attractForce;
      }
      
      // 边界反弹
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1.5;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1.5;
      
      // 速度限制
      const maxSpeed = 1.5;
      const sp = Math.hypot(this.vx, this.vy);
      if (sp > maxSpeed) {
          this.vx = this.vx / sp * maxSpeed;
          this.vy = this.vy / sp * maxSpeed;
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue}, 85%, 65%)`;
      ctx.fill();
    }
  }
  
  // 初始化粒子
  const particles = Array.from({ length: config.initialPointCount }, () => new Particle());
  
  // 定时添加粒子
  const addParticleInterval = setInterval(() => {
    if (particles.length < config.maxPointCount) {
      // 每秒添加20个粒子
      for (let i = 0; i < config.addPerSecond / 10; i++) { // 每100毫秒添加2个粒子，确保每秒添加20个
        particles.push(new Particle());
      }
    } else {
      // 达到最大数量后停止添加
      clearInterval(addParticleInterval);
    }
  }, 100); // 每100毫秒执行一次
  
  // 鼠标移动
  window.addEventListener('mousemove', e => {
      mouse.x = e.pageX;
      mouse.y = e.pageY;
  });
  
  // 点击生成新粒子
  window.addEventListener('click', e => {
      particles.push(new Particle(e.pageX, e.pageY));
  });
  
  // 主循环
  function draw() {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新粒子位置
      particles.forEach(p => p.update(mouse));
      
      // 粒子之间互相连线
      for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
              
              if (dist < config.connectDist) {
                  const alpha = 1 - dist / config.connectDist;
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = `hsla(${(p1.hue + p2.hue) / 2}, 80%, 70%, ${alpha * 0.6})`;
                  ctx.lineWidth = 1;
                  ctx.stroke();
              }
          }
      }
      
      // 绘制所有粒子
      particles.forEach(p => p.draw());
      
      requestAnimationFrame(draw);
  }
  
  draw();
}
