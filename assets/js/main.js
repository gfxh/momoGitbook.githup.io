// 初始化markdown-it
const md = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    return '<pre><code class="language-' + lang + '">' + str + '</code></pre>';
  }
});

// 修复图片路径为 GitHub raw 链接
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');

  if (srcIndex >= 0) {
    const src = token.attrs[srcIndex][1];

    // 处理相对路径图片，转换为 GitHub raw 链接
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      // GitHub raw 链接基础地址
      const rawBaseUrl = 'https://raw.githubusercontent.com/gfxh/momoGitbook.githup.io/refs/heads/main/';

      // 获取当前 Markdown 文件的目录路径
      let directoryPath = '';
      if (window.currentMarkdownPath) {
        const pathParts = window.currentMarkdownPath.split('/');
        // 移除文件名，保留目录
        pathParts.pop();
        directoryPath = pathParts.join('/') + '/';
      }

      // 处理相对路径中的 ./ 和 ../
      let relativePath = src.replace(/^\.\//, '');
      if (relativePath.startsWith('../')) {
        // 处理上级目录引用
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

// 加载Markdown文件
async function loadMarkdown(filePath) {
  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading">正在加载文档...</div>';

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('文件不存在或无法访问');
    }

    const markdownText = await response.text();

    // 在渲染前保存当前文件路径，用于图片路径解析
    window.currentMarkdownPath = filePath;

    const html = md.render(markdownText);
    content.innerHTML = html;

    // 更新页面标题
    const title = filePath.split('/').pop().replace('.md', '');
    document.title = title + ' - mo技术博客';

  } catch (error) {
    content.innerHTML = '<div class="loading"><h2>加载失败</h2><p>' + error.message + '</p></div>';
  }
}

// 设置PDF.js的worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// PDF阅读相关变量
let pdfDoc = null;
const scale = 1.2;

// 加载PDF文件
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
    document.title = title + ' - mo技术博客';

  } catch (error) {
    content.innerHTML = '<div class="pdf-loading"><h2>PDF加载失败</h2><p>' + error.message + '</p></div>';
  }
}

// 渲染所有PDF页面
async function renderAllPages() {
  const container = document.getElementById('pdf-container');
  container.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });

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

// 侧边栏切换功能
document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('active');
      sidebarToggle.classList.toggle('active');
    });
  }
});
