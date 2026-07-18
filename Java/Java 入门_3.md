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


**构造函数**
构造函数其实就是一个特殊的对象方法
1.构造函数的名字和类名一样
2.构造函数没有返回值















