# 学习的第一性原理是自学
**[PHP测试页](Test.php)**// 修复链接路径为 GitHub raw 链接（对于 PHP 等文件）
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');

  if (hrefIndex >= 0) {
    const href = token.attrs[hrefIndex][1];

    // 处理相对路径链接，转换为 GitHub raw 链接（针对 PHP、PY、JS 等代码文件）
    // HTML 文件保持相对路径，在 GitHub Pages 上直接访问
    if (href && !href.startsWith('http') && !href.startsWith('#') && (href.endsWith('.php') || href.endsWith('.py') || href.endsWith('.js') || href.endsWith('.txt'))) {
      const rawBaseUrl = 'https://raw.githubusercontent.com/gfxh/momoGitbook.githup.io/refs/heads/main/';
      // ... 路径处理逻辑 ...
      const fullHref = rawBaseUrl + directoryPath + relativePath;
      token.attrs[hrefIndex][1] = fullHref;
    }
  }
  return self.renderToken(tokens, idx, options, env, self);
};
> CTFshow题库 https://ctf.show/user
> 好靶场 http://www.loveli.com.cn/learn
>
> 锤子在线工具 https://www.toolhelper.cn/
> CTF广场 https://www.ctfplus.cn/square
> 
> CTFwiki https://ctf-wiki.org/ 
> 青岑题库 https://ctf.qingcen.net/challenges
> 
> CTFwiki_web https://ctf-wiki.org/web/php/php/
>
> 
> 菜鸟教程 https://www.runoob.com/
> 
> 
> 优课达 https://apps.youkeda.com/learn