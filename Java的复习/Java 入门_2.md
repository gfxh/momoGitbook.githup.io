# 26/4/23
# 字符串
## 调用字符串对象方法 常用方法  字符串操作方法
### 1.字符串长度 **length()**
```
public static void main(String[] args) {

  String message = "今天我在学习 Java 字符串";
  // 调用字符串的长度方法得到长度
  int size = message.length();

  System.out.println(size);-------> 24
}

```

### 2.去除字符串的一个字符 **charAt()**
```
public static void main(String[] args) {

  String message = "今天我在学习 Java 字符串";
  // 调用字符串的charAt()方法得到字符
  char c = message.charAt(0);

  System.out.println(c);-------> 今
  System.out.println(message.charAt(10));-------> a
  
}
```
### 2.去除字符串空格 **trim()**
```
public static void main(String[] args) {

  String message = "  今 天我 在学习 Java 字符串  ";
  // 调用字符串的trim()方法去除空格
  message = message.trim();

  System.out.println(message);-------> 今天我在学习Java字符串
}
```

### 4.查找字符串 **indexOf()**
```
public static void main(String[] args) {

  String message = "今天我在学习 Java 字符串";
  // 调用字符串的indexOf()方法查找字符
  int index = message.indexOf('a');

  System.out.println(index);-------> 8
}
```
 这个方法就是解决这类问题的，indexOf 方法接受一个 String 字符串，当调用这个方法的时候，就会去文本中去查找第一个匹配到的坐标索引值,所以我们可以得到一个 int 数字类型的数据。我们可以根据这个 int 数字的值来判断是否匹配成功。
 如果匹配成功，那么 int 数字的值就是匹配到的坐标索引值，否则就是 -1。
 **怎么找到第二个 a 呢？**
`indexOf("字符串","开始索引值")`,第二个参数是一个数字类型，用于设定从什么位置开始查找。所以我们找到第一个匹配到的索引+匹配字符串长度就是开始值了，这个时候查找到的就是第二个匹配内容了
```
index = str.indexOf("a", index + 1);
```

### 5.字符串拼接 **substring()** 我愿称之为子字符串截取
substring 方法有两种调用方式

一种是： substring(开始索引)，这个方法执行的结果就是从开始索引开始（含这个值）一直到结束
一种是：substring(开始索引, 结束索引)，这个方法执行的结果就是拼接新的一个字符串从开始索引开始（含这个值）到结束索引结束（不含）；
```
public static void main(String[] args) {

  String message = "今天我在学习 Java 字符串";
  String newstr=message.substring(5);
  System.out.println(newstr);-------> 习 Java 字符串 
  newstr=message.substring(5,8);
  System.out.println(newstr);-------> 习 J
}
```




### 6.字符串开始和结束内容判断 **startsWith()** 和**endsWith()**
startsWith 方法用于判断字符串是否以指定的前缀开始
endsWith 方法用于判断字符串是否以指定的后缀结束
```
public static void main(String[] args) {
  String message = "今天我在学习 Java 字符串";
  // 调用字符串的startsWith()方法判断是否以指定的前缀开始
  boolean isStart = message.startsWith("今天");
  System.out.println(isStart);---------> true
  // 调用字符串的endsWith()方法判断是否以指定的后缀结束
  boolean isEnd = message.endsWith("字符串");
  System.out.println(isEnd);---------> true

    String str="is.doc";
    if(str.endsWith(".doc")){
      System.out.println("这是一个文档");
    }

    String str2="https://www.baidu.com";
    if(str2.startsWith("https")){
      System.out.println("这是一个 安全的 URL");
    }

}
```
### 7.字符串替换 **replace()** 和 **replaceAll()**
replace 方法用于替换字符串中的指定子字符串
replaceAll 方法用于替换字符串中的所有匹配项
```
public static void main(String[] args) {
  String message = "今天我在学习 Java 字符串";
  // 调用字符串的replace()方法替换指定子字符串
  message = message.replace("学习", "复习");
  System.out.println(message);-------> 今天我在复习 Java 字符串
  // 调用字符串的replaceAll()方法替换所有匹配项
  message = message.replaceAll("Java", "Python");
  System.out.println(message);-------> 今天我在复习 Python 字符串
}
```

### 8.字符串分割 **split()**
split 方法用于将字符串分割成多个字符串，返回一个字符串数组


多数时候处理这样的数据，会先把这种文本数据变成数组，每一行作为一条记录，从一个文本变成数组数据，那就需要 `split("分割字符串")`，注意这个分割字符串可以是字符串也可以是特殊的符号，比如说换行的符号是 `\n`(提醒一下换行符在文本文件里肉眼是看不见的),split 方法执行的结果是返回一个字符串数组对象，所以上面的内容改造成代码就可以是

```
public static void main(String[] args){
  String text = "姓名|年龄|性别\n张三|20|男\n李四|18|男\n小花|18|女";

  // 使用 split 进行换行符的分割，得到一个新的数组对象
  String[] data = text.split("\n");

  // 因为第一行是标题不是数据，所以我们需要把长度-1
  // (注意要使用小括号包围，因为要先计算长度再组合字符串)
  System.out.println("共有:"+(data.length-1)+" 条记录");

}
```

 `. || *`这三个字符如果作为分割符，那么就需要加上 `\\` 来转义，否则就会报错。
比如：` str.split("\\|");`



### 9.大小写转换 toUpperCase() 和 toLowerCase()
toUpperCase() 方法用于将字符串转换为大写
toLowerCase() 方法用于将字符串转换为小写
```
  public static void main(String[] args) {
    String text = "ZhanSan";
    // 把拼音全部转化为大写字母
    String enName = text.toUpperCase();
    System.out.println(enName);
  }
```



### 10.字符串比较 **equals()**
equals() 方法用于比较两个字符串是否相等
注意：`equals()` 方法是区分大小写的，所以如果两个字符串的大小写不同，那么返回的结果就是 `false`。

```
  public static void main(String[] args) {

    String text = "字符串";
    // 使用 equals 方法判断是否相同
    if (text.equals("字符串")) {
      System.out.println("equals 方法字符串相等");
    }
    // 前后顺序无所谓,下面代码是一样的
    if ("字符串".equals(text)) {
      System.out.println("equals 方法字符串相等");
    }
  }
```

注意'str1==str2'比较的是地址，不是字符串的内容


### 11.数字和字符串转换 **Integer.parseInt()**
```
  public static void main(String[] args) {
    String text = "123";
    // 转化字符串为数字
    int a = Integer.parseInt(text);
    System.out.println(a);

    // 转化字符串为数字
    a = Integer.parseInt("100");
    System.out.println(a);
  }
```

数字转字符串有两种
· 使用 `valueOf()` 强制转换
· 使用 `+` 运算符
```
  public static void main(String[] args) {
    int a = 123;
    // 转化数字为字符串
    String str = a + "";
    System.out.println(str);
    int a = 100;
    //使用valueOf强制把数字转化为字符串
    String str = String.valueOf(a);
    System.out.println(str);
  }
  




```





















