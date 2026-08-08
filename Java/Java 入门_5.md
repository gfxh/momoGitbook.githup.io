数据结构 与 算法
-
算法+数据结构=程序设计


●算法是一个处理数据的计算过程,当其运行时能从一个
初始状态和初始输入(可能为空)开始,经过一系列有限而
清晰定义的状态最终产生输出并停止于一个终态。

●数据结构是计算机中存储、组织数据的方式。

1.2 画方格
-
![image.png](https://img.xobear.cn/file/JAVA/1786059017491_image.png)
这张图，画满16个格子需要多少步
1.挨个画格子--->16步
2.折叠，每折叠一次格子数量翻倍，每次折叠数量乘以 \(2\)，折叠 \(n\) 次后为 \(2^n\) 个方格

公式，需要格子数N，f(N)=log₂N

上述在计算机中是一个思维方式，二分法：每执行一次，目标范围缩小已被

1.3 猜数字
-
从1~100中随机出一个数字，去猜测。大了小了可以提示
可以用笨方法，挨个去猜，当然小一点的数还好，但凡大一点就需要不少时间。
如果用二分法的思想呢，50-大了-25-小了-38-大了。。。。。范围逐渐缩小

```
import random
# 定义范围
min_val = 0
max_val = 100
secret = random.randint(min_val, max_val)
guess = (max_val + min_val) // 2
attempts = 0
while True:
   attempts += 1
   if guess == secret:
       print(f"恭喜！你猜对了，数字是 {guess}，共用了 {attempts} 次。")
       break
   elif guess < secret:
       min_val = guess + 1
   else:
       max_val = guess - 1
   guess = (max_val + min_val) // 2
```

```
print("请在心中想一个数字，我来猜！")
min_val, max_val = map(int, input("请输入数字范围（如：0,100）：").split(","))
guess = (max_val + min_val) // 2
attempts = 0
while True:
   attempts += 1
   print(f"我猜是 {guess}，对吗？")
   feedback = input("如果大了请输入 '>'，小了请输入 '<'，对了请输入 '='：")
   if feedback == "=":
       print(f"太棒了！我用了 {attempts} 次就猜到了！")
       break
   elif feedback == ">":
       max_val = guess - 1
   elif feedback == "<":
       min_val = guess + 1
   guess = (max_val + min_val) // 2
```

2.1 O 时间复杂度
-
●找出语句重复执行次数最多的那条作为基本语句

●然后用公式T(n)=O(f(n)), n表示问题规模,O是数量级的符号

●其中T(n)是时间复杂度,f(n)表示基本语句的执行次数

![image.png](https://img.xobear.cn/file/JAVA/1786061740228_image.png)
基本语句:重复执行次数最多,对运行时间贡献最大,在循环里一般在嵌套最深层语句


![image.png](https://img.xobear.cn/file/JAVA/1786061926598_image.png)

最终的结果为 N²+N+1步。注意,此次有指数出现了,我们称为  **指数时间-- O(N²+N+1),忽略常数为O(N²)** 。

![image.png](https://img.xobear.cn/file/JAVA/1786062414626_image.png)
![image.png](https://img.xobear.cn/file/JAVA/1786062253612_image.png)
![image.png](https://img.xobear.cn/file/JAVA/1786063111989_image.png)
大O记法,只保留最大趋势公式,指数>线性>对数>常数。(⊙o⊙)？

如果能用线性复杂度的代码,替换指数复杂度的代码,那就是大大性能优化。


2.3 空间复杂度
-

时间复杂度是以步作为基础单位，空间复杂度是以一个基础数据类型值当做基础单位。

	S(n)=O(f(n))

其中n为问题的规模（或大小），S即Space空间

(❁´◡`❁)默认计算机内存足够大，我们优先考虑优化时间复杂度


2.4 二分法查找🔍
-
**线性查找**依次遍历数组
![image.png](https://img.xobear.cn/file/JAVA/1786063545332_image.png)
```
public static int find(int[] array, int aim) {
    for (int i = 0; i < array.length; i++) {
        if (aim == array[i]) {
            return i;
        }
    }
    return -1;
}
```
时间复杂度O(N)
**二分法查找**
![image.png](https://img.xobear.cn/file/JAVA/1786063603636_image.png)

```
public class Find {

  public static int find(int[] array, int aim) {
    if (array == null || array.length == 0) {
      return -1;
    }

    int left = 0;
    int right = array.length - 1;

    while (left <= right) {
      // 避免 left + right 可能导致的整数溢出
      int middle = left + (right - left) / 2;
      int middleValue = array[middle];

      if (middleValue == aim) {
        return middle;
      } else if (middleValue < aim) {
        // 数组为降序，较大的目标在左侧
        right = middle - 1;
      } else {
        // 数组为降序，较小的目标在右侧
        left = middle + 1;
      }
    }

    return -1;
  }

  public static void main(String[] args) {
    int[] array = {100, 90, 80, 75, 22, 3, 2};

    int result1 = find(array, 22);
    if (result1 == -1) {
      System.out.println("22 不存在数组中");
    } else {
      System.out.println("22 存在数组中，index=" + result1);
    }

    int result2 = find(array, 50);
    if (result2 == -1) {
      System.out.println("50 不存在数组中");
    } else {
      System.out.println("50 存在数组中，index=" + result2);
    }
  }
}
```
3.1 计算机内存管理
-

内存，所有程序都是在内存中运行


计算机内存储和处理信息的最小单位是位（bit,或比特），一个比特值可以是0或1，不能再分割
1bit = 一个二进制位
01011110 = 表示一个8位的字（比特）表示8位的二进制 数

通常8个二进制位为一个字节（byte）

8个二进制位 （bit）= 1字节（byte）

四、与16进制的关系
1、通常一个字节 =两个16进制位
过程解析：  1个16进制数 = 4个二进制数位，
           2个16进制数 = 8个二进制数位 = 1字节

![image.png](https://img.xobear.cn/file/JAVA/1786144282636_image.png)


3.2 数组-存储和读取
-

![image.png](https://img.xobear.cn/file/JAVA/1786144663419_image.png)
后面还会用到。

**数组（Array）** 是一种**线性表数据结构**。它用一组**连续的内存空间**，来存储一组具有**相同类型**的数据


**线性数据结构**：表示数组中数据都是按前后这种线性顺序排列的。

**相同数据类型**：数组中的每个值的数据类型都相同。
![image.png](https://img.xobear.cn/file/JAVA/1786144752659_image.png)

连续性，就如同下面的座位一般。
![image.png](https://img.xobear.cn/file/JAVA/1786144948210_image.png)
知道数组开始地址，数组每个元素的大小，就可以算出各个元素在内存中的地址
```
// 第一个元素地址
start_address
// 第二个元素地址
start_address + item_size * 1
// 第三个元素地址
start_address + item_size * 2
// 第N个元素地址
start_address + item_size * (N - 1)
```
1.从中可以看出，数组的索引从0开始

2.数组的索引访问的时间复杂度是O(1)
![image.png](https://img.xobear.cn/file/JAVA/1786144534839_image.png)

3.3 数组-插入和删除
-
**尾插**
![image.png](https://img.xobear.cn/file/JAVA/1786146075252_image.png)
`start_address + item_size * n  // n 为当前数组的个数` 只需要一步
```
public class Schedule {
  ......
  // 末尾插入
  public void add(String task){
    this.array[this.size] = task;
    this.size++;
  }
}
```
**中间插**
![image.png](https://img.xobear.cn/file/JAVA/1786146195180_image.png)
![image.png](https://img.xobear.cn/file/JAVA/1786146214041_image.png)
一共需要3步
```
// 第三个位置插入
public void insert3Position(String task) {
  // 索引值为3的地方
  int index = 3;
  // 第一步：从右侧开始依次右移
  for (int i = this.size - 1; i >= index; i--) {
    this.array[i + 1] = this.array[i];
  }
  // 第二步：插入元素
  this.array[index] = task;
  // 调整size
  this.size++;
}
```
如果数组长度为N，新数据要插入在第一位（0）则需要N+1步，时间复杂度O(N)

```
public class YKDArrayList {

  // 底层存储数组
  int[] array = new int[20];
  int size = 0;

  public YKDArrayList() {
  }

  // 获取实际元素数量
  public int size() {
    return this.size;
  }

  // 获取指定索引的元素
  public int get(int index) {
    return this.array[index];
  }

  // 在末尾添加元素
  public void add(int element) {
    this.add(this.size, element);
  }

  // 在指定位置添加元素
  public void add(int index, int element) {
    if (index < 0 || index > this.size) {
      return;
    }

    // 数组满时扩容为原来的两倍
    if (this.size == this.array.length) {
      int[] newArray = new int[this.array.length * 2];

      for (int i = 0; i < this.array.length; i++) {
        newArray[i] = this.array[i];
      }

      this.array = newArray;
    }

    // 元素依次右移
    for (int i = this.size - 1; i >= index; i--) {
      this.array[i + 1] = this.array[i];
    }

    // 插入元素并更新长度
    this.array[index] = element;
    this.size++;
  }

  // 删除指定索引的元素
  public void remove(int index) {
    if (index < 0 || index >= this.size) {
      return;
    }

    // 后续元素依次左移
    for (int i = index; i < this.size - 1; i++) {
      this.array[i] = this.array[i + 1];
    }

    // 清空最后一个有效位置并更新长度
    this.array[this.size - 1] = 0;
    this.size--;
  }

  public static void main(String[] args) {
    YKDArrayList ykdArrayList = new YKDArrayList();

    ykdArrayList.add(1);
    ykdArrayList.add(2);
    ykdArrayList.add(3);
    ykdArrayList.add(4);

    ykdArrayList.add(0, 5);
    ykdArrayList.remove(3);

    System.out.println(ykdArrayList.size()); // 4
    System.out.println(ykdArrayList.get(0)); // 5
    System.out.println(ykdArrayList.get(3)); // 4
  }

```





















































