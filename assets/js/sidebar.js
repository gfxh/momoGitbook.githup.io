document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebarNavToc = document.querySelector('.sidebar-nav-toc');
  const sidebarNavOverview = document.querySelector('.sidebar-nav-overview');
  const sidebarToc = document.querySelector('.sidebar-toc');
  
  // 初始化
  sidebarNavToc.classList.add('active');
  
  // 侧边栏切换功能
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      sidebarToggle.classList.toggle('active');
    });
  }
  
  // 目录/概览切换功能
  if (sidebarNavToc && sidebarNavOverview) {
    sidebarNavToc.addEventListener('click', function() {
      sidebarNavToc.classList.add('active');
      sidebarNavOverview.classList.remove('active');
      sidebarToc.style.display = 'block';
    });
    
    sidebarNavOverview.addEventListener('click', function() {
      sidebarNavOverview.classList.add('active');
      sidebarNavToc.classList.remove('active');
      sidebarToc.style.display = 'none';
    });
  }
  
  // 响应式处理
  function handleResize() {
    if (window.innerWidth > 992) {
      sidebar.classList.remove('active');
      sidebarToggle.classList.remove('active');
    }
  }
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  // 高亮当前页面
  highlightCurrentPage();
});

function highlightCurrentPage() {
  const currentPath = window.location.pathname;
  const tocLinks = document.querySelectorAll('.toc a');
  
  tocLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || linkPath === currentPath.replace(/\/$/, '') + '/') {
      link.style.fontWeight = 'bold';
      link.style.color = '#d9534f';
    }
  });
}