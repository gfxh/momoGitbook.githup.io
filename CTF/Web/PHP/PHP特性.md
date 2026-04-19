# PHP特性
**[CTFshow89-150](https://ctf.show/challenges)**
**[学长笔记](https://exp10it.io/posts/ctfshow-web-php-89-110-writeup/)**
**·89**
![alt text](TU/PHP4x0.png)

**[preg_match()](https://www.php.net/manual/zh/function.preg-match.php)**
正则表达式，常用于过滤用户输入，这里过滤了数字0-9。当匹配数组时会返回 false
**[intval()](https://www.php.net/manual/zh/function.intval.php)**
获取变量的整数值，空的 array（**数组**） 返回 0，非空的 array 返回 1 (**True**)
`pyload=URL/?num[]=a`

**·90**
![alt text](TU/PHP4x1.png)

**==** 会判断内容是否相同, 不会判断类型是否相同
**===** 不仅会判断内容是否相同, 而且还会判断类型是否相同
**[intval()](https://www.php.net/manual/zh/function.intval.php)**

![alt text](TU/php4X2.png)

当 base 为 0 时, 会检测 value 的格式来决定使用的进制
我们可以使用八进制或者十六进制绕过类型判断
或者使用 1146.0 1146aaa, 因为 intval() 是一个取整函数, 非整数部分都会被截断, 包括字符串

pyload=URL`/?num=0x117c`   `/?num=1146.0`   `/?num=1146aaa`

**·91**
**[preg_match($pattern, $subject, $matches)](https://www.php.net/manual/zh/function.preg-match.php)**
String $pattern 正则表达式模式 (pattern='/ /')

`/i` 表示忽略大小写 `/m` 表示多行匹配, `/^` 表示匹配开头, `/$/` 表示匹配结尾
String $subject 要匹配的字符串
String $matches 如果提供了matches,它将被填充为搜索到的匹配项
![alt text](TU/PHP4x3.png)
**这里不是过滤用户输入，而是匹配用户输入是否符合正则表达式模式**

`/^php$/im'` 第一层匹配，忽略大小写，多行匹配，匹配开头，匹配结尾。
**字符串中，任意一行，内容完全是 php（不区分大小写）** 换行即可绕过匹配。
`'/^php$/i'` 第二层匹配，忽略大小写，匹配开头，匹配结尾。
只有整个字符串完全等于 php 才会匹配成功
pyload=URL/?cmd=%0axaxa%0aphp

**·92**
![alt text](TU/PHP4x4.png)
弱比较类型

4476.0用不了了，但是4476.1可以

**·93**

![alt text](TU/PHP4x5.png)
十六进制和科学计数法不能用了, 但八进制和小数点还能用





**·94**
![alt text](TU/PHP4x6.png)
**[strpos($subject, $needle, $offset = 0)](https://www.php.net/manual/zh/function.strpos.php)** -----> 查找字符串首次出现的位置，**如果没找到 字符串，将返回 false**。
如果我们使用八进制 010574, `strpos("010574", "0") `返回0, 也就是 false, 加了 ! 后反而变成 true
这里就把八进制的0过滤掉了,需要注意**如果没找到 字符串，将返回 false**
所以字符串中必须有0, 但0不能在首位 (过滤了八进制), 只可以用小数点绕过
`pyload=URL/?num=4476.0123`

加空格的方法, 可以绕过八进制的过滤
`strpos($num, "0")` 的作用是查找字符串中第一个 "0" 出现的位置。
我们的 $num 是 " 010574"，第一个 "0" 在索引 1 的位置（因为前面有一个空格）。
strpos 返回 1，取反 !1 为 false，所以不会执行 die()。
`pyload=URL/?num=%20010574`

























