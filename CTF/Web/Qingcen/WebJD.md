**basic**
![](TU/image.png)
跟着心法走ctrl+U看源码

**basic2**
![](TU/image%20copy.png)
F12和ctrl+U都被禁了
但是ctrl+shift+j可以打开控制台
也可以禁用JS，关闭反调试再查看源码

看到的flag需要base64解码
**basic_2**
![](TU/image%20copy%202.png)
检查一圈没什么可用的。BP抓包
有一个`is_admin=0`。改为`is_admin=1`在重新发包，发现flag在响应体中

**basic_3**
![](TU/image%20copy%203.png)
检查源码，有js文件。
![](TU/image%20copy%204.png)
复制引号里面的东西，在控制台里执行，发现flag在响应体中。    
![](TU/image%20copy%205.png)
这就是密码，还要给他    
![](TU/image%20copy%206.png)
**basic_4**
![](TU/image%20copy%207.png)

查看源码有js文件
![](TU/image%20copy%208.png)
ASCLL码解密
| 变量 | 字符码 | 解码结果 |
|------|--------|----------|
| `_0` | 81,67,67,84,70,95,86,73,80,95,50,48,50,54 | **`QCCTF_VIP_2026`** |
| `_1` | 47,102,108,97,103 | **`/flag`** |
| `_2` | 86,73,80,95,78,79,84,95,72,69,82,69 | **`VIP_NOT_HERE`** |

**basic_5**
![](TU/image%20copy%209.png)
直接抓包。领取奖励，请求中有base64编码的data。解码是`{"score":0}`
将他修改为`{"score":1000}`然后base64编码再发包。
![](TU/image%20copy%2010.png)
响应中的data再base64解码

**basic_6**
![](TU/image%20copy%2011.png)
检查源码没什么有用的东西
抓包在标头有发现flag
![](TU/image%20copy%2012.png)
![](TU/image%20copy%2013.png)

**basic_7**
![](TU/image%20copy%2014.png)
拼图之后提交会返回你是小猪。flag就在这个返回的响应体中。
这是拼图之后发送的包，flag是不存在的
![](TU/image%20copy%2015.png)
这个包**放行**之后还会有一个包，flag在响应体中。
![](TU/image%20copy%2016.png)

**basic_8**
![](TU/image%20copy%2017.png)
查看源码，抓包，都没什么有用信息
查看index.phps。至于为什么时phps下一题有解释
![](TU/image%20copy%2018.png)
有发现。给了一个GET a  越过if条件就可以获得flag
![](TU/image%20copy%2019.png)
![](TU/image%20copy%2020.png)
**basic_9**
![](TU/image%20copy%2021.png)
没有index.php所以试不了
文章中有提到爬虫排除协议
访问/robots.txt
![](TU/image%20copy%2022.png)
有一个qcq.php
打开文件就是flag
**basic_10**
![](TU/image%20copy%2024.png)
![](TU/image%20copy%2023.png)
好吧都没有用


![](TU/image%20copy%2025.png)
目录扫描，找到一个sitemap.xml ，打开发现一个wqw.php
wqw.php需要Cookie是admin身份
![](TU/image%20copy%2026.png)

**EZ_PHP**
![](TU/image%20copy%2027.png)
GET a和b
 PHP 中 `and` 的优先级比 `==` 低
a构造为0e就可以绕过
b在数字后面加一个字母即可
PHP 的弱类型特性：字符串和数字比较时，会自动从开头提取数字部分，非数字部分会被忽略。
![](TU/image%20copy%2028.png)
**EZ_PHP1**
![](TU/image%20copy%2029.png)

必须传入非空的qc参数
qc必须是合法 JSON，解码后转成数组
array_search("QCCTF", $qc)的结果必须严格等于1

array_search("QCCTF", $qc) 会在数组中搜索值为"QCCTF"的元素，并返回它的键名

`?qc=["1","QCCTF"]`


**ezphp_2**
![](TU/image%20copy%2030.png)
```
$qc是一个包含"n"键的数组，"n"对应的值是一个非空数组
$qc中存在值为0的元素（绕过QCCTF的array_search）
$qc["n"]数组中存在值为0的元素（绕过QCyyds的array_search）
$qc["n"]数组中没有严格等于"QCyyds"的元素
```
![](TU/image%20copy%2031.png)



**第一章**
![](TU/image%20copy%2034.png)

![](TU/image%20copy%2035.png)

![](TU/image%20copy%2039.png)
禁用js就可以粘贴了
![](TU/image%20copy%2040.png)
500次就交给BP吧。第500次有flag
额，可能题目没做好吧
**第二章**
![](TU/image%20copy%2036.png)

藏字了。`前往/golden_trail看看`
![](TU/image%20copy%2037.png)


题目提示http的请求头
![](TU/image%20copy%2038.png)
moectf{0bs3rv3_Th3_Gold3n_traiL}
改成flag{}就行

**第三章**



**第四章**

![](TU/image%20copy%2041.png)

--->`bW9lY3Rme0Mw`

![](TU/image%20copy%2042.png)
--->`bjZyNDd1MTQ3`

![](TU/image%20copy%2043.png)
--->`MTBuNV95MHVy`

![](TU/image%20copy%2044.png)
--->`X2g3N1BfbDN2`

![](TU/image%20copy%2045.png)
--->`M2xfMTVfcjM0`

![](TU/image%20copy%2046.png)
--->`bGx5X2gxOWgh`
![](TU/image%20copy%2050.png)

把GET改为PUT。在最下面写上`新生！`
![](TU/image%20copy%2051.png)
--->`fQ==`  

`bW9lY3Rme0MwbjZyNDd1MTQ3MTBuNV95MHVyX2g3N1BfbDN2M2xfMTVfcjM0bGx5X2gxOWghfQ==`
base64-->`moectf{C0n6r47u14710n5_y0ur_h77P_l3v3l_15_r34lly_h19h!}`
要改成**flag{C0n6r47u14710n5_y0ur_h77P_l3v3l_15_r34lly_h19h!}**
![](TU/image%20copy%2047.png)
![](TU/image%20copy%2048.png)
![](TU/image%20copy%2049.png)


**第五章**









