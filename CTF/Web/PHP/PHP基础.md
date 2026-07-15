# PHP基础（CTF Web 速查）

>[PHP 官方中文手册](https://www.php.net/manual/zh/index.php)

这篇主要服务于 CTF Web 做题：先掌握 PHP 语法、输入来源、类型转换、危险函数和运行环境，再去看专项绕过。

相关笔记：

- [PHP特性](./PHP特性.md)
- [PHP特性2](./PHP特性2.md)
- [PHP伪协议](./PHP伪协议.md)
- [PHP命令执行](./PHP命令执行.md)

## PHP 标签

PHP 代码通常写在 `<?php ... ?>` 中：

```php
<?php
echo "Hello CTF";
?>
```

常见写法：

```php
<?php echo $name; ?>
<?= $name ?>
```

`<?= $name ?>` 是 `<?php echo $name; ?>` 的短 echo 形式。

PHP 可以和 HTML 混写，标签外的内容会直接交给浏览器：

```php
<p>HTML 内容</p>
<?php echo "PHP 输出"; ?>
```

纯 PHP 文件建议省略结尾的 `?>`，避免末尾空格或换行导致提前输出，影响 `header()`、`setcookie()`、`session_start()` 等函数。

## 注释

```php
// 单行注释
# 单行注释
/*
多行注释
*/
```

## 变量

PHP 变量以 `$` 开头，变量名区分大小写。

```php
<?php
$name = "admin";
$Name = "guest";
echo $name; // admin
```

变量名规则：

- 以字母或下划线开头。
- 后面可以跟字母、数字、下划线。
- 不能以数字开头。
- 不推荐使用中文变量名，CTF 环境和编辑器编码容易出问题。

可变变量在 CTF 中常见：

```php
<?php
$a = "flag";
$flag = "ctfshow";
echo $$a; // 等价于 echo $flag
```

复杂变量名可以使用 `{}`：

```php
<?php
${"a-b"} = "test";
echo ${"a-b"};
```

## 数据类型

PHP 是动态类型语言，变量本身不用提前声明类型。

| 类型 | 示例 | CTF 中的关注点 |
| --- | --- | --- |
| `bool` | `true`, `false` | 弱比较、`empty()` 判断 |
| `int` | `123`, `0xff`, `010` | 进制、`intval()` |
| `float` | `1.2`, `1e3` | 科学计数法、`0e` 魔术哈希 |
| `string` | `"admin"` | 数字字符串、单双引号 |
| `array` | `[1, 2]` | 传数组绕过、函数参数类型错误 |
| `object` | `new User()` | 反序列化、魔术方法 |
| `null` | `NULL` | `isset()`、函数错误返回 |
| `resource` | `fopen()` 返回值 | 文件、数据库、流 |

调试类型和值：

```php
var_dump($a);    // 类型和值
print_r($arr);   // 适合看数组
var_export($arr);// 输出接近 PHP 代码的结构
```

## 赋值与引用

普通赋值是传值：

```php
<?php
$a = "one";
$b = $a;
$b = "two";
echo $a; // one
```

引用赋值使用 `&`，两个变量指向同一个值：

```php
<?php
$foo = "Bob";
$bar = &$foo;
$bar = "My name is $bar";
echo $foo; // My name is Bob
```

只有变量可以被引用赋值：

```php
$a = &$b;      // 可以
// $a = &(1+2); // 不可以
```

## 字符串

单引号不会解析变量，双引号会解析变量：

```php
<?php
$name = "admin";
echo '$name'; // $name
echo "$name"; // admin
```

字符串拼接使用 `.`：

```php
<?php
$file = "flag" . ".php";
```

常见转义：

| 写法 | 含义 |
| --- | --- |
| `\n` | 换行，双引号内生效 |
| `\r` | 回车，双引号内生效 |
| `\t` | 制表符，双引号内生效 |
| `\"` | 双引号 |
| `\\` | 反斜杠 |

CTF 常见点：

- `md5("240610708")` 和 `md5("QNKCDZO")` 都是 `0e` 开头的数字字符串，使用 `==` 可能相等。
- `strpos()` 找到的位置可能是 `0`，不能直接用 `if (strpos(...))` 判断。
- 过滤关键字时，大小写、拼接、编码、换行、数组输入都可能影响结果。

## 数组

创建数组：

```php
<?php
$a = array("Hello", "CTF");
$b = ["user" => "admin", "id" => 1];
echo $a[0];
echo $b["user"];
```

索引数组：

```php
$arr = ["a", "b", "c"];
echo $arr[0]; // a
```

关联数组：

```php
$user = [
    "name" => "admin",
    "role" => "root"
];
echo $user["name"];
```

GET/POST 传数组：

```text
?a[]=1&a[]=2
?user[name]=admin&user[role]=root
```

PHP 接收到：

```php
$_GET["a"] = ["1", "2"];
$_GET["user"] = [
    "name" => "admin",
    "role" => "root"
];
```

CTF 常见用法：

- `preg_match()`、`md5()`、`strcmp()` 等函数传入数组，在 PHP 7 及以前常出现 Warning 并返回异常值；PHP 8 通常会抛出 `TypeError`。
- 题目如果只过滤字符串，可以尝试数组参数：`?id[]=1`。
- 外部参数名中的 `.` 和空格会被 PHP 转成 `_`，例如 `a.b=1` 进入 PHP 后通常是 `$_GET["a_b"]`。

## 常量

普通常量：

```php
<?php
define("SITE", "CTF");
const VERSION = "1.0";
echo SITE;
```

魔术常量：

| 常量 | 描述 |
| --- | --- |
| `__LINE__` | 当前行号 |
| `__FILE__` | 当前文件完整路径 |
| `__DIR__` | 当前文件所在目录 |
| `__FUNCTION__` | 当前函数名 |
| `__CLASS__` | 当前类名 |
| `__TRAIT__` | 当前 Trait 名 |
| `__METHOD__` | 当前类方法名 |
| `__NAMESPACE__` | 当前命名空间 |
| `ClassName::class` | 完整类名 |

`__PROPERTY__` 是 PHP 8.4 属性钩子相关魔术常量，旧环境里不要默认认为可用。

## 运算符

赋值运算符：

| 运算符 | 等价写法 | 说明 |
| --- | --- | --- |
| `$x = $y` | `$x = $y` | 赋值 |
| `$x += $y` | `$x = $x + $y` | 加后赋值 |
| `$x -= $y` | `$x = $x - $y` | 减后赋值 |
| `$x *= $y` | `$x = $x * $y` | 乘后赋值 |
| `$x /= $y` | `$x = $x / $y` | 除后赋值 |
| `$x %= $y` | `$x = $x % $y` | 取模后赋值 |
| `$x .= $y` | `$x = $x . $y` | 拼接后赋值 |
| `$x ??= $y` | `$x = $x ?? $y` | 如果左边为 `null`，赋右边的值 |

比较运算符：

| 运算符 | 含义 |
| --- | --- |
| `==` | 松散比较，只比较转换后的值 |
| `===` | 严格比较，值和类型都要相同 |
| `!=`, `<>` | 松散不等 |
| `!==` | 严格不等 |
| `<`, `>`, `<=`, `>=` | 大小比较 |
| `<=>` | 太空船运算符，返回 `-1`、`0`、`1` |

例子：

```php
var_dump(0 == false);   // true
var_dump(0 === false);  // false
var_dump("0e123" == "0e456"); // true，两个都像科学计数法数字 0
```

逻辑运算符：

| 运算符 | 含义 |
| --- | --- |
| `$x && $y` | 与 |
| `$x || $y` | 或 |
| `$x and $y` | 与，优先级低于 `&&` |
| `$x or $y` | 或，优先级低于 `||` |
| `$x xor $y` | 异或 |
| `!$x` | 非 |

优先级坑点：

```php
<?php
$a = false || true; // true
$b = false or true; // 先执行 $b = false，再执行 or true，所以 $b 是 false
var_dump($a, $b);
```

常用简写：

```php
$name = $_GET["name"] ?? "guest"; // null 合并
$msg = $ok ? "yes" : "no";        // 三元运算符
```

执行运算符：

```php
<?php
$out = `id`;
echo $out;
```

反引号会把内容作为 shell 命令执行，效果类似 `shell_exec()`。如果 `shell_exec()` 被禁用，反引号通常也不可用。

## 弱类型与类型转换

CTF 中看到 `==`、`intval()`、`is_numeric()`、`md5()`、`strcmp()`、`empty()` 时要敏感。

### `==` 与 `===`

```php
<?php
var_dump("123" == 123);   // true
var_dump("123" === 123);  // false
```

旧版本 PHP 中，数字和非数字字符串比较容易出现意外结果：

```php
// PHP 7 及以前常见结果
var_dump(0 == "abc"); // true
```

PHP 8 修改了部分字符串和数字的比较规则，所以 CTF 做题时要先看版本。

### 数字字符串

```php
var_dump("0e12345" == "0");      // true
var_dump("0e12345" == "0e6789"); // true
```

常见魔术哈希：

| 原文 | MD5 |
| --- | --- |
| `240610708` | `0e462097431906509019562988736854` |
| `QNKCDZO` | `0e830400451993494058024219903391` |
| `s878926199a` | `0e545993274517709034328855841020` |

如果代码使用 `md5($a) == md5($b)`，可以考虑 `0e` 绕过；如果使用 `===`，则不能只靠数字字符串转换。

### `intval()`

```php
intval("123abc");     // 123
intval("abc123");     // 0
intval("010", 0);     // 8，base 为 0 时可识别八进制
intval("0x10", 0);    // 16，base 为 0 时可识别十六进制
intval([]);           // 0
intval([1]);          // 1
```

### `empty()` 与 `isset()`

```php
isset($a);  // 变量存在且不是 null
empty($a);  // 不存在，或值为空
```

`empty()` 认为这些值为空：

```text
""  "0"  0  0.0  false  null  []
```

`"0"` 被 `empty()` 判断为空，在登录、验证码、参数存在性判断里容易出坑。

### 函数返回值判断

`strpos()` 找到字符串开头时返回 `0`，没找到返回 `false`：

```php
<?php
$pos = strpos("flag.php", "flag");
var_dump($pos); // int(0)

if ($pos !== false) {
    echo "found";
}
```

审计时优先看有没有把 `0` 和 `false` 混在一起判断。

## 输入来源

超全局变量：

| 变量 | 来源 |
| --- | --- |
| `$_GET` | URL 查询字符串 |
| `$_POST` | POST 表单或请求体 |
| `$_REQUEST` | GET、POST、Cookie 的合并，顺序受配置影响 |
| `$_COOKIE` | Cookie |
| `$_FILES` | 文件上传 |
| `$_SERVER` | 请求头、路径、服务器信息 |
| `$_SESSION` | Session |
| `$GLOBALS` | 全局变量表 |

GET 示例：

```text
/index.php?book=HELLOCTF
```

```php
echo $_GET["book"];
```

POST 示例：

```php
echo $_POST["book"];
```

读取原始请求体：

```php
$raw = file_get_contents("php://input");
```

CTF 常见点：

- `$_REQUEST` 不建议当作精确来源，GET、POST、Cookie 覆盖顺序受 `request_order` 或 `variables_order` 影响。
- 部分环境开启 `register_argc_argv` 时，`$_SERVER["argv"]` 可能拿到 query string 切分结果。
- 请求头可以从 `$_SERVER` 中读取，例如 `User-Agent` 通常是 `$_SERVER["HTTP_USER_AGENT"]`。
- PHP 会把外部变量名中的点和空格转成下划线。

## 流程控制

```php
if ($a) {
    echo "yes";
} elseif ($b) {
    echo "maybe";
} else {
    echo "no";
}
```

```php
switch ($x) {
    case "admin":
        echo "admin";
        break;
    default:
        echo "guest";
}
```

PHP 8 支持 `match`，使用严格比较：

```php
$role = match ($id) {
    1 => "admin",
    2 => "guest",
    default => "unknown",
};
```

循环：

```php
for ($i = 0; $i < 3; $i++) {
    echo $i;
}

foreach ($arr as $key => $value) {
    echo $key . ":" . $value;
}
```

常见控制结构：

```text
if / else / elseif
while / do-while / for / foreach
break / continue
switch / match
return / include / require
goto
```

## 函数

定义函数：

```php
<?php
function add($a, $b) {
    return $a + $b;
}
echo add(1, 2);
```

匿名函数：

```php
$fn = function ($x) {
    return $x + 1;
};
echo $fn(1);
```

箭头函数：

```php
$fn = fn($x) => $x + 1;
```

可变函数：

```php
<?php
$f = "phpinfo";
$f(); // 调用 phpinfo()
```

回调函数：

```php
call_user_func("system", "id");
```

CTF 中用户可控函数名很危险，例如：

```php
$_GET["f"]($_GET["x"]);
call_user_func($_GET["f"], $_GET["x"]);
```

## 文件操作与包含

常见文件函数：

| 函数 | 作用 |
| --- | --- |
| `include()` | 包含并执行文件，失败时 Warning，脚本继续 |
| `require()` | 包含并执行文件，失败时 Fatal Error，脚本终止 |
| `include_once()` | 只包含一次 |
| `require_once()` | 只包含一次，失败终止 |
| `file_get_contents()` | 读取文件或 URL 到字符串 |
| `file_put_contents()` | 写文件 |
| `fopen()` / `fread()` / `fwrite()` | 文件指针读写 |
| `readfile()` | 读取并直接输出 |
| `highlight_file()` / `show_source()` | 高亮显示源码 |
| `scandir()` | 列目录 |
| `glob()` | 按模式找文件 |

文件包含漏洞示例：

```php
<?php
include $_GET["file"];
```

常见利用方向：

- 读源码：`php://filter/convert.base64-encode/resource=index.php`
- 包含日志：访问日志、错误日志、Session 文件。
- 包含上传文件。
- 远程包含：依赖 `allow_url_include=On`。

伪协议细节看：[PHP伪协议](./PHP伪协议.md)

路径相关：

```php
__DIR__;          // 当前文件目录
__FILE__;         // 当前文件完整路径
getcwd();         // 当前工作目录
dirname(__FILE__);
realpath($path);  // 解析真实路径
```

CTF 常见点：

- `../` 目录穿越。
- 过滤 `../` 时尝试双写、编码、绝对路径、软链接、伪协议。
- `open_basedir` 会限制可访问目录。
- Windows 和 Linux 路径分隔符不同：`\` 和 `/`。

## 代码执行与命令执行

代码执行函数：

| 函数 | 说明 |
| --- | --- |
| `eval()` | 执行 PHP 代码字符串 |
| `assert()` | PHP 7.2 起字符串断言弃用，PHP 8 起不再执行字符串代码 |
| `preg_replace('/e')` | PHP 7 已移除，只在老环境可能出现 |
| `create_function()` | PHP 7.2 弃用，PHP 8 移除 |

示例：

```php
eval($_GET["code"]);
```

命令执行函数：

| 函数/写法 | 说明 |
| --- | --- |
| `system()` | 执行命令并直接输出 |
| `exec()` | 执行命令，默认返回最后一行 |
| `shell_exec()` | 执行命令，返回完整输出 |
| `passthru()` | 执行命令并输出原始结果 |
| `popen()` | 打开进程管道 |
| `proc_open()` | 更灵活的进程控制 |
| 反引号 <code>`id`</code> | 类似 `shell_exec("id")` |

示例：

```php
system($_GET["cmd"]);
$out = shell_exec("id");
```

CTF 做题先看：

- `disable_functions` 禁用了哪些函数。
- 是否有回显；无回显考虑写文件、DNS、HTTP 外带。
- 过滤了哪些字符：空格、分号、管道、反引号、美元符、斜杠等。
- Web 用户权限和当前目录。

绕过细节看：[PHP命令执行](./PHP命令执行.md)

## 正则与过滤

常用函数：

| 函数 | 说明 |
| --- | --- |
| `preg_match()` | 正则匹配，返回 `1`、`0` 或 `false` |
| `preg_match_all()` | 匹配所有 |
| `preg_replace()` | 正则替换 |
| `str_replace()` | 普通字符串替换 |
| `strpos()` | 区分大小写查找 |
| `stripos()` | 不区分大小写查找 |
| `trim()` | 去除首尾空白 |
| `strtolower()` / `strtoupper()` | 大小写转换 |

正则修饰符：

| 修饰符 | 含义 |
| --- | --- |
| `i` | 忽略大小写 |
| `m` | 多行模式，影响 `^` 和 `$` |
| `s` | 让 `.` 匹配换行 |
| `U` | 非贪婪模式 |

例子：

```php
preg_match("/^php$/i", $a);
```

CTF 常见点：

- `^` 和 `$` 在多行模式下可能只匹配某一行。
- `.` 默认不匹配换行。
- `preg_match()` 参数如果传数组，PHP 7 及以前可能 Warning 并返回异常值；PHP 8 通常 TypeError。
- 过滤黑名单通常比白名单更容易绕。
- 判断 `strpos()` 结果必须用 `!== false`。

## 序列化与反序列化

序列化：

```php
<?php
$arr = ["name" => "admin"];
echo serialize($arr);
```

输出类似：

```text
a:1:{s:4:"name";s:5:"admin";}
```

反序列化：

```php
$data = unserialize($_GET["data"]);
```

对象序列化示例：

```php
class User {
    public $name = "admin";
}

echo serialize(new User());
```

输出类似：

```text
O:4:"User":1:{s:4:"name";s:5:"admin";}
```

常见魔术方法：

| 方法 | 触发时机 |
| --- | --- |
| `__construct()` | 对象创建 |
| `__destruct()` | 对象销毁 |
| `__wakeup()` | `unserialize()` 时 |
| `__sleep()` | `serialize()` 时 |
| `__toString()` | 对象被当作字符串 |
| `__invoke()` | 对象被当作函数调用 |
| `__call()` | 调用不存在的方法 |
| `__get()` / `__set()` | 读写不可访问属性 |
| `__isset()` / `__unset()` | `isset()` / `unset()` 作用于不可访问属性 |

CTF 审计思路：

- 找 `unserialize()` 的用户输入。
- 找类里的魔术方法。
- 找危险函数调用点：文件读写、命令执行、代码执行、SQL。
- 看属性是否可控，能否组成 POP 链。
- 注意私有属性和受保护属性在序列化字符串里的特殊格式。

更安全的写法：

```php
unserialize($data, ["allowed_classes" => false]);
```

## 面向对象基础

```php
<?php
class User {
    public $name;
    private $password;
    protected $role;

    public function __construct($name) {
        $this->name = $name;
    }

    public function hello() {
        return "hi " . $this->name;
    }
}

$u = new User("admin");
echo $u->hello();
```

访问控制：

| 关键字 | 含义 |
| --- | --- |
| `public` | 类内外都可访问 |
| `protected` | 当前类和子类可访问 |
| `private` | 只有当前类可访问 |

静态成员：

```php
class Config {
    public static $debug = true;
}

var_dump(Config::$debug);
```

命名空间：

```php
namespace App;

class User {}
```

反序列化题中类名、命名空间、属性名必须对得上。

## 文件上传

上传表单：

```html
<form method="post" enctype="multipart/form-data">
  <input type="file" name="file">
  <button type="submit">upload</button>
</form>
```

PHP 接收：

```php
<?php
var_dump($_FILES["file"]);
```

`$_FILES["file"]` 常见字段：

| 字段 | 含义 |
| --- | --- |
| `name` | 原始文件名，用户可控 |
| `type` | 浏览器提交的 MIME，用户可控 |
| `tmp_name` | 临时文件路径 |
| `error` | 上传错误码 |
| `size` | 文件大小 |

保存文件：

```php
move_uploaded_file($_FILES["file"]["tmp_name"], "./upload/" . $_FILES["file"]["name"]);
```

CTF 常见检查：

- 后缀检查：`.php`、`.phtml`、`.phar`、大小写、双后缀。
- MIME 检查：`Content-Type` 可伪造。
- 内容检查：文件头、图片马、短标签。
- 路径拼接：文件名是否可控，能否目录穿越。
- Web 服务器解析规则：Apache、Nginx、IIS 行为不同。
- 上传目录是否可执行 PHP。

相关配置：

```text
file_uploads
upload_max_filesize
post_max_size
upload_tmp_dir
```

## Cookie 与 Session

Cookie：

```php
setcookie("user", "admin", time() + 3600);
echo $_COOKIE["user"] ?? "";
```

`setcookie()` 必须在页面输出前调用。

Session：

```php
session_start();
$_SESSION["user"] = "admin";
echo $_SESSION["user"];
```

CTF 常见点：

- Session 文件默认存在服务器上，路径受 `session.save_path` 影响。
- Session ID 通常来自 Cookie：`PHPSESSID=...`。
- 如果能控制 Session 内容，又存在文件包含，可能包含 Session 文件。
- Session 反序列化处理器配置不同时，可能出现特殊利用方式。

## 数据库基础

老代码可能出现：

```php
mysql_query("SELECT * FROM users");
```

`mysql_*` 扩展在 PHP 5.5 弃用，PHP 7.0 移除。现代 PHP 使用 `mysqli` 或 `PDO`。

mysqli 示例：

```php
$conn = mysqli_connect("localhost", "root", "root", "test");
$result = mysqli_query($conn, "SELECT * FROM users WHERE id=" . $_GET["id"]);
```

PDO 示例：

```php
$pdo = new PDO("mysql:host=localhost;dbname=test", "root", "root");
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET["id"]]);
```

CTF 审计时看到字符串拼接 SQL，就要考虑 SQL 注入。SQL 专项看仓库里的 SQL 笔记。

## 常见危险函数速查

| 类型 | 函数 |
| --- | --- |
| 代码执行 | `eval`, `assert`, `preg_replace /e`, `create_function` |
| 命令执行 | `system`, `exec`, `shell_exec`, `passthru`, `popen`, `proc_open`, 反引号 |
| 文件包含 | `include`, `require`, `include_once`, `require_once` |
| 文件读取 | `file_get_contents`, `readfile`, `fopen`, `fread`, `highlight_file`, `show_source` |
| 文件写入 | `file_put_contents`, `fwrite`, `move_uploaded_file` |
| 目录操作 | `scandir`, `glob`, `opendir`, `readdir` |
| 反序列化 | `unserialize` |
| 变量覆盖 | `extract`, `parse_str`, `import_request_variables` |
| 信息泄露 | `phpinfo`, `var_dump`, `print_r`, `get_defined_vars` |
| 动态调用 | 可变函数、`call_user_func`, `call_user_func_array` |

`import_request_variables()` 已在 PHP 5.4 移除，通常只会在老环境资料里见到。

## 常见配置速查

```php
phpinfo();
ini_get("disable_functions");
ini_set("display_errors", "1");
error_reporting(E_ALL);
```

| 配置 | 影响 |
| --- | --- |
| `display_errors` | 是否显示错误信息 |
| `error_reporting` | 报错级别 |
| `disable_functions` | 禁用危险函数 |
| `open_basedir` | 限制文件访问目录 |
| `allow_url_fopen` | 是否允许 URL 形式打开文件 |
| `allow_url_include` | 是否允许 URL 形式包含文件 |
| `file_uploads` | 是否允许文件上传 |
| `upload_max_filesize` | 单文件上传大小限制 |
| `post_max_size` | POST 总大小限制 |
| `max_execution_time` | 脚本最大执行时间 |
| `memory_limit` | 内存限制 |
| `variables_order` | EGPCS 变量注册顺序 |
| `request_order` | `$_REQUEST` 变量顺序 |
| `register_argc_argv` | 是否注册 `$argv` / `$argc` |
| `session.save_path` | Session 文件保存目录 |
| `phar.readonly` | 是否禁止创建 Phar |
| `short_open_tag` | 是否允许 `<?` 短标签 |

老版本配置：

| 配置 | 状态 |
| --- | --- |
| `register_globals` | PHP 5.4 移除 |
| `magic_quotes_gpc` | PHP 5.4 移除 |
| `safe_mode` | PHP 5.4 移除 |

老 CTF 环境里可能会出现这些历史配置，需要按题目环境判断。

## 版本差异速查

| 特性 | 版本变化 | 做题影响 |
| --- | --- | --- |
| `mysql_*` | PHP 5.5 弃用，PHP 7.0 移除 | 老题可能有，新环境不可用 |
| `create_function()` | PHP 7.2 弃用，PHP 8.0 移除 | 老题代码执行点 |
| `assert("php code")` | PHP 7.2 弃用，PHP 8.0 起不再执行字符串代码 | 老题可执行，新环境不行 |
| `preg_replace /e` | PHP 5.5 弃用，PHP 7.0 移除 | 老题代码执行点 |
| `each()` | PHP 7.2 弃用，PHP 8.0 移除 | 老代码兼容性 |
| 数字和字符串弱比较 | PHP 8 改了部分规则 | `0 == "abc"` 等老绕过可能失效 |
| 数组传字符串函数 | PHP 8 多数抛 `TypeError` | PHP 7 的 Warning/NULL 绕过可能失效 |
| `__PROPERTY__` | PHP 8.4 新增 | 旧环境不可用 |

做题时优先看：

```php
phpversion();
phpinfo();
```

## CTF 审计路线

拿到 PHP 代码后按这个顺序看：

1. 找输入：`$_GET`、`$_POST`、`$_REQUEST`、`$_COOKIE`、`$_FILES`、`php://input`、请求头。
2. 找输出：`echo`、`print`、`var_dump`、`highlight_file`、报错信息。
3. 找危险点：代码执行、命令执行、文件包含、文件读写、反序列化、SQL 拼接、上传。
4. 看过滤：黑名单、正则、长度、类型、大小写、编码、数组处理。
5. 看比较：`==`、`===`、`empty()`、`isset()`、`strpos()`、`strcmp()`、哈希比较。
6. 看环境：PHP 版本、`disable_functions`、`open_basedir`、`allow_url_include`、Web 服务器解析规则。
7. 拼利用链：输入能不能到危险函数，过滤能不能绕，结果有没有回显。

## 常用小片段

显示错误：

```php
ini_set("display_errors", "1");
error_reporting(E_ALL);
```

查看环境：

```php
phpinfo();
echo phpversion();
echo getcwd();
```

读取源码：

```php
highlight_file(__FILE__);
echo file_get_contents(__FILE__);
```

列目录：

```php
print_r(scandir("."));
```

读取 POST 原始数据：

```php
echo file_get_contents("php://input");
```

老环境变量覆盖示例：

```php
parse_str("a=1&b=2");
echo $a; // 1

extract(["flag" => "test"]);
echo $flag; // test
```

注意：`parse_str()` 单参数形式在 PHP 8 已不再支持，现代写法需要第二个参数：

```php
parse_str("a=1&b=2", $out);
print_r($out);
```
