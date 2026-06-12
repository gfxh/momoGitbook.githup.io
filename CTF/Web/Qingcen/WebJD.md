**basic**
![image.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272320503_image.png)
跟着心法走ctrl+U看源码

**basic2**
![image copy.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272412677_image_copy.png)
F12和ctrl+U都被禁了
但是ctrl+shift+j可以打开控制台
也可以禁用JS，关闭反调试再查看源码

看到的flag需要base64解码
**basic_2**
![image copy 2.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272391823_image_copy_2.png)
检查一圈没什么可用的。BP抓包
有一个`is_admin=0`。改为`is_admin=1`在重新发包，发现flag在响应体中

**basic_3**
![image copy 3.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272391955_image_copy_3.png)
检查源码，有js文件。
![image copy 4.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272391996_image_copy_4.png)
复制引号里面的东西，在控制台里执行，发现flag在响应体中。    
![image copy 5.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272395692_image_copy_5.png)
这就是密码，还要给他    
![image copy 6.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272389626_image_copy_6.png)
**basic_4**
![image copy 7.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272394166_image_copy_7.png)

查看源码有js文件
![image copy 8.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272390081_image_copy_8.png)
ASCLL码解密
| 变量 | 字符码 | 解码结果 |
|------|--------|----------|
| `_0` | 81,67,67,84,70,95,86,73,80,95,50,48,50,54 | **`QCCTF_VIP_2026`** |
| `_1` | 47,102,108,97,103 | **`/flag`** |
| `_2` | 86,73,80,95,78,79,84,95,72,69,82,69 | **`VIP_NOT_HERE`** |

**basic_5**
![image copy 9.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272388305_image_copy_9.png)
直接抓包。领取奖励，请求中有base64编码的data。解码是`{"score":0}`
将他修改为`{"score":1000}`然后base64编码再发包。
![image copy 10.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272392384_image_copy_10.png)
响应中的data再base64解码

**basic_6**
![image copy 11.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272389029_image_copy_11.png)
检查源码没什么有用的东西
抓包在标头有发现flag
![image copy 12.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272393491_image_copy_12.png)
![image copy 13.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272389055_image_copy_13.png)

**basic_7**
![image copy 14.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272389677_image_copy_14.png)
拼图之后提交会返回你是小猪。flag就在这个返回的响应体中。
这是拼图之后发送的包，flag是不存在的
![image copy 15.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272397009_image_copy_15.png)
这个包**放行**之后还会有一个包，flag在响应体中。
![image copy 16.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272393161_image_copy_16.png)

**basic_8**
![image copy 17.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272398878_image_copy_17.png)
查看源码，抓包，都没什么有用信息
查看index.phps。至于为什么时phps下一题有解释
![image copy 18.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272390372_image_copy_18.png)
有发现。给了一个GET a  越过if条件就可以获得flag
![image copy 19.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272396201_image_copy_19.png)
![image copy 20.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272391175_image_copy_20.png)
**basic_9**
![image copy 21.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272390712_image_copy_21.png)
没有index.php所以试不了
文章中有提到爬虫排除协议
访问/robots.txt
![image copy 22.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272400245_image_copy_22.png)
有一个qcq.php
打开文件就是flag
**basic_10**
![image copy 24.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272396174_image_copy_24.png)
![image copy 23.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272401216_image_copy_23.png)
好吧都没有用


![image copy 25.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272395910_image_copy_25.png)
目录扫描，找到一个sitemap.xml ，打开发现一个wqw.php
wqw.php需要Cookie是admin身份
![image copy 26.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272395938_image_copy_26.png)

**EZ_PHP**
![image copy 27.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272395839_image_copy_27.png)
GET a和b
 PHP 中 `and` 的优先级比 `==` 低
a构造为0e就可以绕过
b在数字后面加一个字母即可
PHP 的弱类型特性：字符串和数字比较时，会自动从开头提取数字部分，非数字部分会被忽略。
![image copy 28.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272399089_image_copy_28.png)
**EZ_PHP1**
![image copy 29.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272398826_image_copy_29.png)

必须传入非空的qc参数
qc必须是合法 JSON，解码后转成数组
array_search("QCCTF", $qc)的结果必须严格等于1

array_search("QCCTF", $qc) 会在数组中搜索值为"QCCTF"的元素，并返回它的键名

`?qc=["1","QCCTF"]`


**ezphp_2**
![image copy 30.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272402380_image_copy_30.png)
```
$qc是一个包含"n"键的数组，"n"对应的值是一个非空数组
$qc中存在值为0的元素（绕过QCCTF的array_search）
$qc["n"]数组中存在值为0的元素（绕过QCyyds的array_search）
$qc["n"]数组中没有严格等于"QCyyds"的元素
```
![image copy 31.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272394115_image_copy_31.png)



**第一章**
![image copy 34.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272398996_image_copy_34.png)

![image copy 35.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272397714_image_copy_35.png)

![image copy 39.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272396594_image_copy_39.png)
禁用js就可以粘贴了
![image copy 40.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272402073_image_copy_40.png)
500次就交给BP吧。第500次有flag
额，可能题目没做好吧
**第二章**
![image copy 36.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272404481_image_copy_36.png)

藏字了。`前往/golden_trail看看`
![image copy 37.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272399644_image_copy_37.png)


题目提示http的请求头
![image copy 38.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272403510_image_copy_38.png)
moectf{0bs3rv3_Th3_Gold3n_traiL}
改成flag{}就行

**第三章**



**第四章**

![image copy 41.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272404344_image_copy_41.png)

--->`bW9lY3Rme0Mw`

![image copy 42.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272406763_image_copy_42.png)
--->`bjZyNDd1MTQ3`

![image copy 43.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272407469_image_copy_43.png)
--->`MTBuNV95MHVy`

![image copy 44.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272407953_image_copy_44.png)
--->`X2g3N1BfbDN2`

![image copy 45.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272405955_image_copy_45.png)
--->`M2xfMTVfcjM0`

![image copy 46.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272404729_image_copy_46.png)
--->`bGx5X2gxOWgh`
![image copy 50.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272404855_image_copy_50.png)

把GET改为PUT。在最下面写上`新生！`
![image copy 51.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272404904_image_copy_51.png)
--->`fQ==`  

`bW9lY3Rme0MwbjZyNDd1MTQ3MTBuNV95MHVyX2g3N1BfbDN2M2xfMTVfcjM0bGx5X2gxOWghfQ==`
base64-->`moectf{C0n6r47u14710n5_y0ur_h77P_l3v3l_15_r34lly_h19h!}`
要改成**flag{C0n6r47u14710n5_y0ur_h77P_l3v3l_15_r34lly_h19h!}**
![image copy 47.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272403275_image_copy_47.png)
![image copy 48.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272403016_image_copy_48.png)
![image copy 49.png](https://img.xobear.cn/file/CTF/WEB/Qingcen/1781272409377_image_copy_49.png)


**第五章**

 







