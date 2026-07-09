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
    if (window.hljs) {
      try {
        if (lang && hljs.getLanguage(lang)) {
          const result = hljs.highlight(str, { language: lang, ignoreIllegals: true });
          return '<pre><code class="hljs language-' + lang + '">' + result.value + '</code></pre>';
        }
      } catch (e) { /* fall through to auto-detect */ }
      const result = hljs.highlightAuto(str);
      return '<pre><code class="hljs">' + result.value + '</code></pre>';
    }
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
  clearArticleToc();
  setActiveTocItem(filePath);

  try {
    if (!md) throw new Error('Markdown 渲染库加载失败，请刷新页面重试');

    const response = await fetch(filePath);
    if (!response.ok) throw new Error('文件不存在或无法访问');

    const markdownText = await response.text();
    window.currentMarkdownPath = filePath;

    // 渲染
    var html = md.render(markdownText);
    content.innerHTML = html;

    // 表格包裹滚动容器
    wrapTables();

    // 文章内目录
    buildArticleToc();

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
      updateArticleTocActive();
    });

  } catch (error) {
    content.classList.remove('is-loading');
    content.classList.add('is-loaded');
    clearArticleToc();
    content.innerHTML = '<div class="loading"><h2>加载失败</h2><p>' + error.message + '</p></div>';
  }
}

// ========================================
// 第二部分：滚动与导航工具
// ========================================

function getHeaderOffset() {
  return window.innerWidth >= 1080 ? 96 : 76;
}

function getReadingTop() {
  const target = document.querySelector('.content-wrap') || document.getElementById('content');
  if (!target) return 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset());
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

var articleTocHeadings = [];

function ensureArticleToc() {
  var toc = document.getElementById('article-toc');
  if (toc) return toc;

  var main = document.querySelector('.blog-page .main-container');
  if (!main) return null;

  toc = document.createElement('aside');
  toc.className = 'article-toc is-empty';
  toc.id = 'article-toc';
  toc.setAttribute('aria-label', '文章目录');
  toc.innerHTML =
    '<button class="toc-toggle-btn article-toc-toggle" type="button" aria-expanded="true" title="收起本文目录">&#9776;</button>' +
    '<div class="article-toc-popup">' +
      '<div class="article-toc-title">本文目录</div>' +
      '<nav class="article-toc-list" aria-label="文章标题"></nav>' +
    '</div>';

  toc.querySelector('.article-toc-toggle').addEventListener('click', function (e) {
    e.stopPropagation();
    setArticleTocCollapsed(!toc.classList.contains('is-collapsed'));
  });

  main.appendChild(toc);

  return toc;
}

function clearArticleToc() {
  articleTocHeadings = [];
  document.body.classList.remove('has-article-toc');
  document.body.classList.remove('article-toc-collapsed');

  var toc = document.getElementById('article-toc');
  if (!toc) return;

  toc.classList.add('is-empty');
  toc.classList.remove('is-collapsed');
  var list = toc.querySelector('.article-toc-list');
  if (list) list.innerHTML = '';
}

function setArticleTocCollapsed(collapse) {
  var toc = document.getElementById('article-toc');
  if (!toc) return;

  toc.classList.toggle('is-collapsed', collapse);
  document.body.classList.toggle('article-toc-collapsed', collapse);

  var btn = toc.querySelector('.article-toc-toggle');
  if (!btn) return;

  btn.setAttribute('aria-expanded', String(!collapse));
  btn.setAttribute('title', collapse ? '展开本文目录' : '收起本文目录');
}

function buildArticleToc() {
  var content = document.getElementById('content');
  var toc = ensureArticleToc();
  if (!content || !toc) return;

  var headings = Array.from(content.querySelectorAll('h1, h2, h3')).filter(function (heading) {
    return heading.textContent.trim();
  });

  if (headings.length < 2) {
    clearArticleToc();
    return;
  }

  articleTocHeadings = headings;

  var usedIds = {};
  var listHtml = headings.map(function (heading, index) {
    var level = Number(heading.tagName.substring(1));
    var id = heading.id || 'article-heading-' + (index + 1);

    while (usedIds[id] || (document.getElementById(id) && document.getElementById(id) !== heading)) {
      id = 'article-heading-' + (index + 1) + '-' + Object.keys(usedIds).length;
    }

    usedIds[id] = true;
    heading.id = id;

    return '<a class="article-toc-link article-toc-level-' + level + '" href="#' + id + '">' +
      escapeHtml(heading.textContent.trim()) +
      '</a>';
  }).join('');

  toc.querySelector('.article-toc-list').innerHTML = listHtml;
  toc.classList.remove('is-empty');
  setArticleTocCollapsed(false);
  document.body.classList.add('has-article-toc');

  toc.querySelectorAll('.article-toc-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var target = document.getElementById(id);
      if (!target) return;

      var top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + encodeURIComponent(id));
      }
      setActiveArticleTocLink(id);
    });
  });

  updateArticleTocActive();
}

function setActiveArticleTocLink(id) {
  document.querySelectorAll('.article-toc-link').forEach(function (link) {
    var isActive = link.getAttribute('href') === '#' + id;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function updateArticleTocActive() {
  if (!articleTocHeadings.length) return;

  var offset = getHeaderOffset() + 18;
  var current = articleTocHeadings[0];

  articleTocHeadings.forEach(function (heading) {
    if (heading.getBoundingClientRect().top <= offset) {
      current = heading;
    }
  });

  if (current && current.id) setActiveArticleTocLink(current.id);
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
  if (firstChild) firstChild.prepend(el);
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

/** 表格包裹滚动容器 */
function wrapTables() {
  document.querySelectorAll('#content table').forEach(function (table) {
    if (table.parentElement.classList.contains('table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}

/** 图片 Lightbox */
function initLightbox() {
  var overlay = document.querySelector('.img-lightbox-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'img-lightbox-overlay';
    overlay.innerHTML = '<img alt="预览">';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    var previewImg = overlay.querySelector('img');
    var scale = 1;
    var translateX = 0, translateY = 0;
    var isDragging = false, startX = 0, startY = 0, lastX = 0, lastY = 0;

    function updateTransform() {
      previewImg.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
    }

    function resetView() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      previewImg.style.cursor = scale > 1 ? 'move' : '';
    }

    // 滚轮缩放
    overlay.addEventListener('wheel', function (e) {
      if (!overlay.classList.contains('active')) return;
      e.preventDefault();
      var delta = e.deltaY > 0 ? -0.25 : 0.25;
      scale = Math.min(5, Math.max(0.5, scale + delta));
      if (scale <= 1) { translateX = 0; translateY = 0; }
      updateTransform();
      previewImg.style.cursor = scale > 1 ? 'move' : '';
    }, { passive: false });

    // 双击切换缩放
    previewImg.addEventListener('dblclick', function (e) {
      e.stopPropagation();
      if (scale > 1) {
        resetView();
      } else {
        scale = 2;
        updateTransform();
        previewImg.style.cursor = 'move';
      }
    });

    // 拖拽
    previewImg.addEventListener('mousedown', function (e) {
      if (scale <= 1) return;
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      lastX = translateX;
      lastY = translateY;
      previewImg.style.transition = 'none';
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      translateX = lastX + (e.clientX - startX);
      translateY = lastY + (e.clientY - startY);
      updateTransform();
    });

    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      previewImg.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  }

  var previewImg = overlay.querySelector('img');

  // 点击图片关闭（未缩放时）
  previewImg.addEventListener('click', function (e) {
    e.stopPropagation();
    var currentScale = 1;
    var m = previewImg.style.transform.match(/scale\(([\d.]+)\)/);
    if (m) currentScale = parseFloat(m[1]);
    if (currentScale > 1) return;
    closeLightbox();
  });

  document.querySelectorAll('#content img').forEach(function (el) {
    el.addEventListener('click', function () {
      previewImg.src = this.src;
      previewImg.alt = this.alt || '';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      // 重置所有缩放状态
      previewImg.style.transform = '';
      previewImg.style.cursor = '';
      previewImg.style.transition = '';
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

/** 目录弹层：按钮切换 + 点击链接自动收起 */
function initTocCollapse() {
  var sidebar = document.getElementById('sidebar');
  var btn = sidebar ? sidebar.querySelector('.toc-toggle-btn') : null;
  if (!sidebar || !btn) return;

  function setCollapsed(collapse) {
    sidebar.classList.toggle('sidebar-collapsed', collapse);
    btn.setAttribute('aria-expanded', String(!collapse));
  }

  // 默认收起
  setCollapsed(true);

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setCollapsed(!sidebar.classList.contains('sidebar-collapsed'));
  });

  // 点击外部关闭
  document.addEventListener('click', function (e) {
    if (!sidebar.classList.contains('sidebar-collapsed') && !sidebar.contains(e.target)) {
      setCollapsed(true);
    }
  });

  // 点击目录链接后自动收起
  sidebar.querySelectorAll('.toc a').forEach(function (link) {
    link.addEventListener('click', function () {
      setCollapsed(true);
    });
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
  initActiveNavLink();
  initBlogInteractions();
  initFriendsPage();
});

/** 导航栏当前页高亮 */
function initActiveNavLink() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === '' || page === '/') page = 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href === page || (page === 'index.html' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
}

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
  window.addEventListener('scroll', updateArticleTocActive, { passive: true });
  window.addEventListener('resize', updateReadingProgress);
  window.addEventListener('resize', updateArticleTocActive);

  // 滚动感知按钮
  initScrollButtons();

  // 目录搜索
  initTocSearch();

  // 目录折叠
  initTocCollapse();
}

/** 友链页面：从 friends.json 加载并渲染（分组 + 本站信息 + 申请） */
function initFriendsPage() {
  var root = document.getElementById('friends-root');
  if (!root) return;

  fetch('friends.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var html = '';

      // 本站信息
      if (data.site) {
        var s = data.site;
        var avatarHtml = s.avatar
          ? '<img class="friend-site-avatar" src="' + s.avatar + '" alt="' + escapeHtml(s.name) + '">'
          : '<div class="friend-avatar friend-avatar-placeholder">' + escapeHtml(s.name.charAt(0)) + '</div>';
        html +=
          '<section class="friend-section">' +
            '<h2 class="friend-section-title">本站信息</h2>' +
            '<a class="friend-card friend-card-self" href="' + escapeHtml(s.url || '#') + '" target="_blank" rel="noopener noreferrer">' +
              avatarHtml +
              '<div class="friend-info">' +
                '<span class="friend-name">' + escapeHtml(s.name) + '</span>' +
                '<span class="friend-url">' + escapeHtml(s.url || '') + '</span>' +
                '<span class="friend-desc">' + escapeHtml(s.desc || '') + '</span>' +
              '</div>' +
              '<span class="friend-heart">❤️</span>' +
            '</a>' +
          '</section>';
      }

      // 分组
      if (data.groups && data.groups.length > 0) {
        var globalIndex = 0;
        data.groups.forEach(function (group) {
          if (!group.friends || group.friends.length === 0) return;

          html += '<section class="friend-section"><h2 class="friend-section-title">' + escapeHtml(group.title) + ' 🌐</h2>';

          group.friends.forEach(function (f, i) {
            globalIndex++;
            var badge = String(globalIndex).padStart(2, '0');
            var avatarHtml = f.avatar
              ? '<img class="friend-avatar" src="' + f.avatar + '" alt="' + escapeHtml(f.name) + '" loading="lazy">'
              : '<div class="friend-avatar friend-avatar-placeholder">' + escapeHtml(f.name.charAt(0)) + '</div>';

            html +=
              '<a class="friend-card" href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener noreferrer">' +
                '<div class="friend-badge">#' + badge + '</div>' +
                avatarHtml +
                '<div class="friend-info">' +
                  '<span class="friend-name">' + escapeHtml(f.name) + '</span>' +
                  '<span class="friend-url">' + escapeHtml(f.url) + '</span>' +
                  '<span class="friend-desc">' + escapeHtml(f.desc || '') + '</span>' +
                '</div>' +
              '</a>';
          });

          html += '</section>';
        });
      }

      // 申请区域
      var applyCfg = data.apply || {};
      var applyTitle = applyCfg.title || '申请友链';
      var applyDesc  = applyCfg.description || '如果你有优质的个人网站，欢迎互换友链。请确认满足以下条件：';
      var conditions = applyCfg.conditions || [];
      var emailPh   = applyCfg.emailPlaceholder || '输入邮箱地址';
      var submitTxt = applyCfg.submitText || '提交申请';
      var w3fKey    = applyCfg.web3formsAccessKey || '';
      var note      = applyCfg.note || '提交后博主会通过邮件与你联系。';

      var conditionsHtml = '';
      if (conditions.length > 0) {
        conditionsHtml = '<ul class="apply-conditions">';
        conditions.forEach(function (c) {
          conditionsHtml += '<li class="apply-condition-item">' + escapeHtml(c) + '</li>';
        });
        conditionsHtml += '</ul>';
      }

      html +=
        '<section class="friend-apply-section">' +
          '<div class="apply-header-icon">📬</div>' +
          '<h2 class="apply-title">' + escapeHtml(applyTitle) + '</h2>' +
          '<p class="apply-desc">' + escapeHtml(applyDesc) + '</p>' +
          conditionsHtml +
          '<form class="apply-form" id="apply-form" action="https://api.web3forms.com/submit" method="POST">' +
            '<input type="hidden" name="access_key" value="' + escapeHtml(w3fKey) + '">' +
            '<input type="hidden" name="subject" value="友链申请 - 来自 Bear随笔">' +
            '<input type="hidden" name="from_name" value="Bear随笔友链申请">' +
            '<input type="hidden" name="friend_json" value="">' +
            '<input type="checkbox" name="botcheck" class="apply-botcheck" tabindex="-1" autocomplete="off">' +
            '<input type="email" name="email" class="apply-field-input" placeholder="' + escapeHtml(emailPh) + '" required autocomplete="email">' +
            '<div class="apply-fields-row">' +
              '<input type="text" name="site_url" class="apply-field-input" placeholder="网站网址" required autocomplete="url">' +
              '<input type="text" name="site_name" class="apply-field-input" placeholder="网站名" required>' +
            '</div>' +
            '<div class="apply-fields-row">' +
              '<input type="url" name="avatar_url" class="apply-field-input" placeholder="头像URL（选填）" autocomplete="url">' +
              '<input type="text" name="description" class="apply-field-input" placeholder="网站简介（选填）">' +
            '</div>' +
            '<button type="submit" class="apply-submit-btn apply-submit-btn--full" data-loading="发送中...">' + escapeHtml(submitTxt) + '</button>' +
          '</form>' +
          '<p class="apply-note">' + escapeHtml(note) + '</p>' +
        '</section>';

      root.innerHTML = html;

      // 绑定表单提交事件
      var form = document.getElementById('apply-form');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();

          var submitBtn = form.querySelector('.apply-submit-btn');
          var emailInput = form.querySelector('input[name="email"]');
          var urlInput = form.querySelector('input[name="site_url"]');
          var nameInput = form.querySelector('input[name="site_name"]');

          // 清除所有错误状态
          [emailInput, urlInput, nameInput].forEach(function (el) {
            el.classList.remove('apply-field-input--error');
          });

          var hasError = false;

          if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            emailInput.classList.add('apply-field-input--error');
            emailInput.focus();
            hasError = true;
          }
          if (!urlInput.value.trim()) {
            urlInput.classList.add('apply-field-input--error');
            if (!hasError) urlInput.focus();
            hasError = true;
          }
          if (!nameInput.value.trim()) {
            nameInput.classList.add('apply-field-input--error');
            if (!hasError) nameInput.focus();
            hasError = true;
          }

          if (hasError) {
            var clearError = function (e) { e.target.classList.remove('apply-field-input--error'); };
            [emailInput, urlInput, nameInput].forEach(function (el) {
              el.addEventListener('input', clearError);
            });
            return;
          }

          submitBtn.disabled = true;
          submitBtn.classList.add('apply-submit-btn--loading');
          var originalText = submitBtn.textContent;
          submitBtn.textContent = submitBtn.getAttribute('data-loading') || '发送中...';

          // 拼装友链 JSON
          var friendJson = JSON.stringify({
            name: (form.querySelector('input[name="site_name"]').value || '').trim(),
            url: (form.querySelector('input[name="site_url"]').value || '').trim(),
            avatar: (form.querySelector('input[name="avatar_url"]').value || '').trim(),
            desc: (form.querySelector('input[name="description"]').value || '').trim()
          });
          form.querySelector('input[name="friend_json"]').value = friendJson;

          var formData = new FormData(form);
          fetch(form.action, { method: 'POST', body: formData })
            .then(function (res) { return res.json(); })
            .then(function (resp) {
              if (resp.success) {
                form.innerHTML =
                  '<div class="apply-success">' +
                    '<div class="apply-success-icon">✓</div>' +
                    '<p class="apply-success-text">申请已提交成功！博主会尽快通过邮件与你联系。</p>' +
                  '</div>';
              } else {
                throw new Error(resp.message || '提交失败');
              }
            })
            .catch(function () {
              submitBtn.disabled = false;
              submitBtn.classList.remove('apply-submit-btn--loading');
              submitBtn.textContent = originalText;
              var existing = form.querySelector('.apply-error-msg');
              if (existing) existing.remove();
              var errMsg = document.createElement('p');
              errMsg.className = 'apply-error-msg';
              errMsg.textContent = '提交失败，请稍后重试。如问题持续，可直接发送邮件至 2701581775@qq.com。';
              form.appendChild(errMsg);
            });
        });
      }
    })
    .catch(function () {
      root.innerHTML = '<div class="friends-loading">加载失败，请刷新重试</div>';
    });
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

window.scrollToReadingTop = scrollToReadingTop;
window.scrollToReadingBottom = scrollToReadingBottom;
window.loadMarkdown = loadMarkdown;
