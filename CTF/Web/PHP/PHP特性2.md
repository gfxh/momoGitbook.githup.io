**123**
![image copy 10.png](https://img.xobear.cn/file/CTF/WEB/PHP/1781272105766_image_copy_10.png)
`CTF_SHOW=1&CTF[SHOW.COM=2&fun=echo $flag`
突破到eval时就可以拿到flag了
**125**
![image copy 11.png](https://img.xobear.cn/file/CTF/WEB/PHP/1781272107370_image_copy_11.png)
`CTF_SHOW=1&CTF[SHOW.COM=2&fun=extract($_POST)&fl0g=flag_give_me`
 
`$c=$_POST['fun'];`，所以我们让` fun=extract($_POST)`
检查正则：`preg_match("/.../i", $c)`，我们的 `extract($_POST)` 里没有被禁止的关键词（flag、echo 等），且长度 <=16，可以通过。
执行 `eval("$c;")`
`eval("extract($_POST);");` 执行后，$_POST 里的所有参数都会被注册为变量。
执行 `extract($_POST)` 后，就会自动创建 `$fl0g = "flag_give_me"`


**126**
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


**127**
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1781924612479_image.png)
直接尝试变量覆盖
?ctf_show=ilove36d  下划线被过滤了，加号是空格，但是加号也被过滤了，点也被过滤了。
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1781925249210_image.png)
空格没有被过滤
`?ctf show=ilove36d`

**128**
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783555348429_image.png)
[call_user_func](https://www.php.net/manual/zh/function.call-user-func.php):第一个参数是被调用的回调函数，其余参数是回调函数的参数。

f1是无数字无大小写字母，f2可控
有一个特殊函数 [gettext](https://www.php.net/manual/zh/function.gettext.php) 可以被`_`调用，这个函数可以输出一个字符串。
f2：可以先用phpinfo来判断能不能继续re，[get_defined_vars](https://www.php.net/manual/zh/function.get-defined-vars.php) 可以泄露变量


**129** 目录穿越
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783556029823_image.png)
[stripos](https://www.php.net/manual/zh/function.stripos.php):第二个字符串在第一个字符串首次出现的位置。stripos不区分大小写，strpos区分大小写
`/var/www/html/`默认目录。
f=`/ctfshow/../../var/www/html/flag.php `

也可以直接 `php://filter/read=convert.base64-encode/resource=ctfshow/../flag.php`


**130**
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783557591858_image.png)

```
if(preg_match('/.+?ctfshow/is', $f)){       /i是匹配大小写，s是匹配换行  这里的正则 前面至少有一个问号，没有问号直接过
        die('bye!');
    }
    if(stripos($f, 'ctfshow') === FALSE){   /stripos返回的是int型   === 全等不转换类型，int不全等bool型
        die('bye!!');
    }

```
**131**
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783558578878_image.png)
这一题要使用正则溢出来绕过第一个。也就是说正则匹配超过一定字符数就会自动返回0（false）
字符串长度大于 **[100014](https://www.laruence.com/2010/06/08/1579.html)** 的时候, 就不会得出正确结果
```
<?php
echo str_repeat('very', '250000').'36Dctfshow';
```
pyload就是 复制结果

**132**
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783561954676_image.png)
先是进一个页面，去看/robots.txt能找到 /admin
第一层存在username code password
第二层 `||`满足后面的username=admin就行（或：一个为真就为真）
第三层 code=admin
pyload:`?username=admin&code=admin&password=1;`

**133**

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1783564626435_image.png)

























