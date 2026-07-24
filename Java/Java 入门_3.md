# 7 java创建对象

## 7.1 java包管理器

Java体系非常庞大，为了管理更多的代码互不侵犯，所以采用一个叫“包管理”的机制来管理代
码，简单来说就是把不同的Java代码放在不同的文件夹里，这个文件夹就是“包
(package)“。对于使用不同包的代码，得需要先导入这个包。

导包语句`import 包名+类名`
比如LocalDate这个类的完整路径就是  `java.time.LocalDate`  即`java/time/LocalDate.java`

## 7.2时间日期类

```

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class DateTest5 {

  public static void main(String[] args) {

    LocalDate time = LocalDate.now();
    // 打印默认的时间数据
    System.out.println(time.toString());

    // 创建一个格式化方式
    DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy年MM月dd");
    // 执行时间的格式化处理，得到期望格式的时间字符串
    String timeStr = df.format(time);
    // 打印时间
    System.out.println(timeStr);

  }
}

```
当然可以借助get来获取具体时间
年`int year = time.getYear();`

月`int month = time.getMonth().getValue();`

日`int day = time.getDayOfMonth();`

周`int dayOfWeek = time.getDayOfWeek().getValue();`

getMonth()和getDayOfWeek()方法的返回值不是具体的数字，而是
一个对象(Java官方的设计)，所以必须用getValue()得到具体的数字。


```
import java.time.LocalDate;

public class DateTest8 {

  public static void main(String[] args) {
    // 定义一个时间字符串，日期是2026年7月18日
    String date = "2026-07-18";

    // 把字符串转化位 LocalDate 对象，并得到字符串匹配的日期
    LocalDate date2 = LocalDate.parse(date);
    // 打印出日期
    System.out.println(date2.toString());
  }
}
```
通过`time.toString()`将time数据转为字符串

也有方法可以将字符串转为日期类型 即`.parse(date)`
这个方法转换后的日期类型是`yyyy-MM-dd HH：mm：ss`


**日期计算**

`.plusDays(天数)`天数相加

`.minusDays(天数)`天数相减

当然还有

	.plusWeeks(1)加一周
    .plusMonths(1)加一月
    .plusYears(1)加一年
	.minusWeeks(1)减一周
    .minusMonths(1)减一月
    .minusYears(1)减一年



**日期比较**

	time2.isBefore(time1) 之前 
	time2.isAfter(time1) 之后
	time2.isEqual(time1) 当天

**日期格式化**
导包实例化打印，如果对日期的格式有要求可以借助`DateTimeFormatter`类

	import java.time.format.DateTimeFormatter;     导入格式化的包

	DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");   日期格式化类型
    
	System.out.println(time.format(formatter));按照formatter打印time



```
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;     格式化的包


public class Test802 {

  public static void main(String[] args) {

    LocalDate checkOut = LocalDate.now();     获取当前时间
    int stayDays = 5;                         计数时间
    LocalDate checkIn = getCheckInTime(checkOut, stayDays);    调用日期计算方法
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");   日期格式化
    
	System.out.println(checkIn.format(formatter));

  }

  public static LocalDate getCheckInTime(LocalDate checkOutDate, int stayDays) {
    return checkOutDate.minusDays(stayDays);        减去计数时间
  }
  

}
```


## 7.3面向对象-抽象

抽象可以理解为**蓝图**

**创建类**
![image.png](https://img.xobear.cn/file/JAVA/1784365973685_image.png)


```
public class 类名称 {

}

```

## 7.3面向对象-包

自定义包就是创建文件夹，包路径就是文件夹的相对路径

`com.youkeda.test.Hello.java`其中`com.youkeda.test`是包名

Hello.java的内容如下

	package com.youkeda.test;


	public class Hello {

	}



如果需要导入自定义包写上完整路径即可 `import com.youkeda.model.House`
**import 是在 package 之后**


特征称为对象属性，行为称为对象方法

完整的抽象过程分别是 抽象对象名称、对象属性、对象方法。

**对象属性**
```
public class House {
    // 房子的颜色是绿色
    public String color = "green";    公共的变量
    // 房子的卧室有2间
    public int bedRooms = 2;
}
```
把在类中直接定义的变量称为对象属性，或者类属性



**对象方法**
```
public class House {
    // 房子的颜色是绿色
    public String color = "green";
    // 房子的卧室有2间
    public int bedRooms = 2;

    //打开水龙头

    public void runWater(){

    }

    //打开电灯
 
    public void turnLightsOn(){

    }
}
```



## 7.6实例化对象
**实例化**	
`House myHouse = new House();`

`House youHouse = new House();`
实例化语法`new 构造函数();`
实例化会在内存中单独开辟一个空间用于存放

一个类对象可以被实例化成多个实例，每个实例都可以被同样的方法、属性来操作





## 7.7构造函数
**构造函数**
构造函数其实就是一个特殊的对象方法

1.构造函数的名字和类名一样

2.构造函数没有返回值
```
public class House {
    // 房子的颜色是绿色
    public String color = "green"; //默认绿色

    // 自定义一个带 color 参数的构造函数
    public House(String color){
      this.color = color;
    }
}

```
`House myHouse = new House("red");`


this和myHouse 同等，也就是说 this 代表的是实例化后的对象


##7.8 数组Arraylist
Arraylist就是一个动态数组对象


```
import java.util.ArrayList;
// 这里的 Java 对象类型可以是任意的对象类型
// 比如 String、Integer、House 等
// 这里的 <> 是 Java 泛型的规范,记住这个语法就行了
ArrayList<Java 对象类型> list = new ArrayList<>();

```


**1.add**
```
public static void main(String[] args){

    // 创建一个 ArrayList 存储字符串集合
    ArrayList<String> strs = new ArrayList<>();

    // 添加数据到 ArrayList 实例里
    strs.add("张三");
    strs.add("李四");



```

**2.get/size**
`size()`获得数组长度
`get()`数组索引获得值


**3.for遍历数组**
```

for( 集合变量的类型 变量名称 : 集合变量 ){
}

 public static void main(String[] args){

    // 创建一个 ArrayList 存储字符串集合
    ArrayList<String> strs = new ArrayList<>();

    // 添加数据到 ArrayList 实例里
    strs.add("张三");
    strs.add("李四");

    // 获取集合的长度
    int size = strs.size();

    // 使用 for 循环迭代每一条记录
    for(String str : strs){
       System.out.println(str);
    }

  }
```

**4.List ArrayList**
List 是接口，ArrayList是其中一个常用的实现类。当然还有其它一些不常用的实现类。
```
ArrayList<String> strs = new ArrayList<>();

写作成       

import java.util.List;
List<String> strs = new ArrayList<>();

会更好
```



## 8.map映射
对比项 |	Java Map(HashMap) 映射|	Python dict 字典
------|------|------
类型约束	|泛型强类型，键值类型固定|	动态弱类型，可混合存放不同类型键值|
插入顺序	|HashMap 无序，LinkedHashMap 才可保留顺序	|3.7 及以上版本默认保留插入顺序|
空键允许	|HashMap 允许一个 null 键，多个 null 值	|不允许None以外的空键，None 可以作为普通 key|
取值容错	|get无键返回 null，getOrDefault支持默认值	|[]取值无键抛异常，get返回默认值更常用|
键要求	|自定义类作键必须重写 hashCode、equals	|key 必须可哈希，可变类型（list）不能用作 key|
`map.put(key,value)`这个方法存数据
```
import java.util.Map;
import java.util.HashMap;

// key value 得是 Java 类型
Map<key, value> map = new HashMap<>();
-----------------------------------------
// 实例化Map对象
Map<Integer,String> map = new HashMap<>();

map.put(1, "Monday");
map.put(2, "Tuesday");
map.put(3, "Wednesday");
map.put(4, "Thursday");
map.put(5, "Friday");
map.put(6, "Saturday");	
map.put(7, "Sunday");
```

**4.2读数据**
```
String weekText = map.get(3);
System.out.println(weekText);

int size = map.size();
System.out.println(size);
```
**4.3遍历数据**

Map 的遍历相对麻烦一点，因为是 key：value 格式，所以我们一般先得到这个数据格式的集合（entrySet），完整的例子如下：
```
 for (Map.Entry<Integer,String> entry : map.entrySet()){

   System.out.println("Key = " + entry.getKey() +
                  ", Value = " + entry.getValue());
 }

```
key的类型不限，可以是int也可以是string


