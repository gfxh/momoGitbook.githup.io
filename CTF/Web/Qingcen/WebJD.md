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





































