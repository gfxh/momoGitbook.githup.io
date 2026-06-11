/**
 * ========================================
 * 主业务逻辑模块
 * ========================================
 * 包含：Markdown渲染、交互增强
 * ========================================
 */

// ========================================
// 第一部分：Markdown配置与渲染
// ========================================

const md = window.markdownit ? window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    const escapedStr = str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return '<pre><code class="language-' + lang + '">' + escapedStr + '</code></pre>';
  }
}) : null;

// 图片路径修复 → GitHub raw 链接
if (md) {
  md.renderer.rules.image = function (tokens, idx, options, _env, self) {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    if (srcIndex >= 0) {
      const src = token.attrs[srcIndex][1];
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        const rawBaseUrl = 'https://raw.githubusercontent.com/gfxh/momoGitbook.githup.io/main/';
        let directoryPath = '';
        if (window.currentMarkdownPath) {
          const pathParts = window.currentMarkdownPath.split('/');
          pathParts.pop();
          directoryPath = pathParts.join('/') + '/';
        }
        let relativePath = src.replace(/^\.\//, '');
        if (relativePath.startsWith('../')) {
          const upLevels = (relativePath.match(/\.\.\//g) || []).length;
          let pathParts = directoryPath.split('/').filter(p => p);
          for (let i = 0; i < upLevels && pathParts.length > 0; i++) pathParts.pop();
          directoryPath = pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
          relativePath = relativePath.replace(/^(\.\.\/)+/, '');
        }
        token.attrs[srcIndex][1] = rawBaseUrl + directoryPath + relativePath;
      }
    }
    return self.renderToken(tokens, idx, options, self);
  };
}

// 链接路径修复（PHP/PY/JS/TXT 等代码文件）
if (md) {
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1];
      if (href && !href.startsWith('http') && !href.startsWith('#') &&
          (href.endsWith('.php') || href.endsWith('.py') || href.endsWith('.js') || href.endsWith('.txt'))) {
        const rawBaseUrl = 'https://raw.githubusercontent.com/gfxh/momoGitbook.githup.io/main/';
        let directoryPath = '';
        if (window.currentMarkdownPath) {
          const pathParts = window.currentMarkdownPath.split('/');
          pathParts.pop();
          directoryPath = pathParts.join('/') + '/';
        }
        let relativePath = href.replace(/^\.\//, '');
        if (relativePath.startsWith('../')) {
          const upLevels = (relativePath.match(/\.\.\//g) || []).length;
          let pathParts = directoryPath.split('/').filter(p => p);
          for (let i = 0; i < upLevels && pathParts.length > 0; i++) pathParts.pop();
          directoryPath = pathParts.join('/') + (pathParts.length > 0 ? '/' : '');
          relativePath = relativePath.replace(/^(\.\.\/)+/, '');
        }
        token.attrs[hrefIndex][1] = rawBaseUrl + directoryPath + relativePath;
      }
    }
    return self.renderToken(tokens, idx, options, env, self);
  };
}

/**
 * 加载 Markdown 文件（带过渡动画和阅读时间）
 */
async function loadMarkdown(filePath) {
  const content = document.getElementById('content');
  content.classList.remove('is-loaded');
  content.classList.add('is-loading');
  content.innerHTML = '<div class="loading">正在加载文档...</div>';
  setActiveTocItem(filePath);

  try {
    if (!md) throw new Error('Markdown 渲染库加载失败，请刷新页面重试');

    const response = await fetch(filePath);
    if (!response.ok) throw new Error('文件不存在或无法访问');

    const markdownText = await response.text();
    window.currentMarkdownPath = filePath;

    // 渲染
    const html = md.render(markdownText);
    content.innerHTML = html;

    // 阅读时间估算
    addReadingTime(markdownText);

    // 代码复制按钮
    initCopyButtons();

    // 图片 Lightbox
    initLightbox();

    // 标题
    document.title = filePath.split('/').pop().replace('.md', '') + ' - Bear随笔';

    // 过渡动画入场
    requestAnimationFrame(function () {
      content.classList.remove('is-loading');
      content.classList.add('is-loaded');
      scrollToReadingTop();
      updateReadingProgress();
    });

  } catch (error) {
    content.classList.remove('is-loading');
    content.classList.add('is-loaded');
    content.innerHTML = '<div class="loading"><h2>加载失败</h2><p>' + error.message + '</p></div>';
  }
}

// ========================================
// 第二部分：滚动与导航工具
// ========================================

function getReadingTop() {
  const target = document.querySelector('.content-wrap') || document.getElementById('content');
  if (!target) return 0;
  const headerOffset = window.innerWidth >= 1080 ? 96 : 76;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
}

function getReadingBottom() {
  const target = document.querySelector('.content-wrap') || document.getElementById('content');
  if (!target) return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const targetBottom = target.getBoundingClientRect().bottom + window.scrollY;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(maxScroll, Math.max(0, targetBottom - window.innerHeight + 40));
}

function scrollToReadingTop() { window.scrollTo({ top: getReadingTop(), behavior: 'smooth' }); }
function scrollToReadingBottom() { window.scrollTo({ top: getReadingBottom(), behavior: 'smooth' }); }

function setActiveTocItem(filePath) {
  if (!filePath) return;
  document.querySelectorAll('.toc a').forEach(function (link) {
    const handler = link.getAttribute('onclick') || '';
    const isActive = handler.includes(filePath);
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateReadingProgress() {
  const progress = document.getElementById('reading-progress');
  if (!progress) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const value = Math.min(1, Math.max(0, scrollTop / scrollable));
  progress.style.transform = `scaleX(${value})`;
}

/** 滚动感知按钮显隐 */
function initScrollButtons() {
  var topBtn = document.querySelector('.jump-to-top-btn');
  var bottomBtn = document.querySelector('.jump-to-toc-btn');
  if (!topBtn || !bottomBtn) return;

  function update() {
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var atTop = scrollY < 80;
    var atBottom = scrollY > docHeight - 120;

    topBtn.classList.toggle('is-hidden', atTop);
    bottomBtn.classList.toggle('is-hidden', atBottom);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

// ========================================
// 第四部分：交互增强
// ========================================

/** 阅读时间估算 */
function addReadingTime(text) {
  // 中文约350字/分钟，英文约200词/分钟
  var cnLen = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  var enLen = text.length - cnLen;
  var minutes = Math.ceil(cnLen / 350 + enLen / 500);
  var label = minutes < 1 ? '少于1分钟' : minutes + ' 分钟';

  var el = document.createElement('span');
  el.className = 'reading-time';
  el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + label;

  var firstChild = document.getElementById('content').firstElementChild;
  if (firstChild) firstChild.insertBefore(el, firstChild.firstChild);
}

/** 代码块复制按钮 */
function initCopyButtons() {
  document.querySelectorAll('#content pre code').forEach(function (block) {
    var pre = block.parentElement;
    if (pre.querySelector('.copy-btn')) return; // 避免重复

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(block.textContent).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1800);
      });
    });
    pre.appendChild(btn);
  });
}

/** 图片 Lightbox */
function initLightbox() {
  var overlay = document.querySelector('.img-lightbox-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'img-lightbox-overlay';
    overlay.innerHTML = '<img alt="预览"><button class="img-lightbox-close" aria-label="关闭">&times;</button>';
    document.body.appendChild(overlay);

    overlay.querySelector('.img-lightbox-close').addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
  }

  var img = overlay.querySelector('img');
  document.querySelectorAll('#content img').forEach(function (el) {
    el.addEventListener('click', function () {
      img.src = this.src;
      img.alt = this.alt || '';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
  });
}

/** 目录搜索过滤 */
function initTocSearch() {
  var tocContainer = document.querySelector('.toc');
  if (!tocContainer) return;

  var searchWrap = document.createElement('div');
  searchWrap.className = 'toc-search-wrap';
  searchWrap.innerHTML =
    '<svg class="toc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
    '<input type="text" class="toc-search-input" placeholder="搜索目录...">';

  tocContainer.parentElement.insertBefore(searchWrap, tocContainer);

  var input = searchWrap.querySelector('.toc-search-input');
  var links = tocContainer.querySelectorAll('a');
  var noResultMsg = null;

  input.addEventListener('input', function () {
    var keyword = this.value.trim().toLowerCase();
    var visibleCount = 0;

    links.forEach(function (link) {
      var text = link.textContent.toLowerCase();
      var match = !keyword || text.indexOf(keyword) !== -1;
      link.classList.toggle('is-filtered-hidden', !match);
      if (match) visibleCount++;
    });

    if (!noResultMsg) {
      noResultMsg = document.createElement('div');
      noResultMsg.className = 'toc-no-result';
      noResultMsg.textContent = '未找到匹配项';
      tocContainer.appendChild(noResultMsg);
    }
    noResultMsg.style.display = visibleCount > 0 ? 'none' : 'block';
  });
}

// ========================================
// 第五部分：初始化
// ========================================

document.addEventListener('DOMContentLoaded', function () {
  initBlogInteractions();
});

function initBlogInteractions() {
  if (!document.body.classList.contains('blog-page')) return;

  // 目录链接点击高亮
  document.querySelectorAll('.toc a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.querySelectorAll('.toc a').forEach(function (item) {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    });
  });

  // 滚动进度条
  updateReadingProgress();
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);

  // 滚动感知按钮
  initScrollButtons();

  // 目录搜索
  initTocSearch();
}

window.scrollToReadingTop = scrollToReadingTop;
window.scrollToReadingBottom = scrollToReadingBottom;
window.loadMarkdown = loadMarkdown;
