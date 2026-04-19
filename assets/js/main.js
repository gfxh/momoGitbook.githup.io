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

  } catch (error) {
    content.innerHTML = '<div class="loading"><h2>加载失败</h2><p>' + error.message + '</p></div>';
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
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function () {
  // 加载默认内容
  loadMarkdown('README.md');
});
