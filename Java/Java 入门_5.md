数据结构 与 算法
-
----
下面是学习数据结构的课件，主代码是C语言

[第1章 绪论](/Book/数据结构/第1章%20绪论.pdf)/
[第2章 线性表](/Book/数据结构/第2章%20线性表.pdf)/
[第3章 栈和队列](/Book/数据结构/第3章%20栈和队列.pdf)/
[第4章 串、数组和广义表](/Book/数据结构/第4章%20串、数组和广义表.pdf)/
[第5章 树和二叉树](/Book/数据结构/第5章%20树和二叉树.pdf)/
[第6章 图](/Book/数据结构/第6章%20图.pdf)/
[第7章 查找](/Book/数据结构/第7章%20查找.pdf)/
[第8章 排序](/Book/数据结构/第8章%20排序.pdf)

----


**算法+数据结构=程序设计**


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
4.1 冒泡排序
-

核心规则

1.指向数组中两个相邻的元素（最开始是数组的头两个元素），并且**比较他们的大小**

2.如果前者比后者大，则**交换他们的位置**

3.如果后者比前者大，则**不交换**

4.然后依次后移，每次循环将最大元素移动最后一个位置。
![image.png](https://img.xobear.cn/file/JAVA/1786234622711_image.png)
```
#JAVA
// 冒泡排序
public static void bubbleSort(int[] array) {
    // 1. 每次循环，都能冒泡出剩余元素中最大的元素，因此需要循环 array.length 次
    for (int i = 0; i < array.length; i++) {
        // 2. 每次遍历，只需要遍历 0 到 array.length - i - 1中元素，因此之后的元素都已经是最大的了
        for (int j = 0; j < array.length - i - 1; j++) {
            //3. 交换元素
            if (array[j] > array[j + 1]) {         //这里是升序，降序只需要改为 <
                int temp = array[j + 1];
                array[j + 1] = array[j];
                array[j] = temp;
            }
        }
    }
}
```
```
#PYTHON
def bubble_sort(numbers):
    # 每轮把未排序区间中最大的元素移到末尾
    for end in range(len(numbers) - 1, 0, -1):
        swapped = False  # 记录本轮是否发生交换

        # 比较相邻元素，范围到当前未排序区间的末尾
        for index in range(end):
            # 左侧元素较大时交换，保证较大值逐步向右移动
            if numbers[index] > numbers[index + 1]:
                numbers[index], numbers[index + 1] = numbers[index + 1], numbers[index]
                swapped = True

        # 本轮没有交换，说明序列已有序，提前结束
        if not swapped:
            break

    return numbers  # 返回升序排列后的列表

```
时间复杂度为 O(N²)
4.2 选择排序
-
什么是选择排序？

重点在**选择**，每次在剩余数组中，**选择最大或者最小**的一个，放在数组的一端。

1.利用两个变量，一个存储当前**最大值**，一个存储当前**最大值所在的索引**

2.依次比较后面的元素，如果发现比**当前最大值大**，则更新最大值，并且更新最大值所在的索引。

3.直到遍历结束，将最大值放在数组的最右边，也就是**交换最右边元素和当前最大值元素**

4.重复上面的步骤

第一次

![image.png](https://img.xobear.cn/file/JAVA/1786235302933_image.png)

第二次

![image.png](https://img.xobear.cn/file/JAVA/1786235344678_image.png)

时间复杂度为 O(N²)
```
#PYTHON
def selection_sort(numbers):
    # 依次确定每个位置应放置的最小值
    for start in range(len(numbers) - 1):
        min_index = start  # 假设当前位置最小

        # 在未排序区间中查找真正的最小值
        for index in range(start + 1, len(numbers)):
            if numbers[index] < numbers[min_index]:
                min_index = index

        # 将最小值交换到未排序区间的开头
        if min_index != start:
            numbers[start], numbers[min_index] = numbers[min_index], numbers[start]

    return numbers  # 返回升序排列后的列表
```
```
#JAVA
public static void selectionSort(int[] numbers) {
    // 依次确定每个位置应放置的最小值
    for (int start = 0; start < numbers.length - 1; start++) {
        int minIndex = start; // 假设当前位置最小

        // 在未排序区间中查找真正的最小值
        for (int index = start + 1; index < numbers.length; index++) {
            if (numbers[index] < numbers[minIndex]) {
                minIndex = index;
            }
        }

        // 将最小值交换到未排序区间的开头
        if (minIndex != start) {
            int temporary = numbers[start];
            numbers[start] = numbers[minIndex];
            numbers[minIndex] = temporary;
        }
    }
}
```

冒泡需要**频繁的交换相邻两个元素**，而选择排序**每次遍历只需要交换一次**，所以选择排序真实情况速度比冒泡排序**快一倍**

4.3 插入排序
-
什么是插入排序？

重点在**插入**，每次抽离一个元素当做临时元素，依次比较和移动之后的其他元素，最终将这个临时元素插入对应的位置。

1.在第一轮，抽离数组末尾倒数第二个元素，作为临时元素。

2.用临时元素与数组后面的元素进行对比：如果 **后面的元素** 值小于临时元素，则 **后面的元素** 左移。

3.如果后面的元素大于临时元素，或者已经移动到数组末尾，则将临时元素插入当前的空隙中。

4.重复上面步骤，完成排序。

有点难懂

第一次，抽取倒数第二个数字`5`与后面的数字`3`比较。 `5`>`3` `3`左移

![image.png](https://img.xobear.cn/file/JAVA/1786236119660_image.png)

第二次，抽取倒数第三个数字`7`.依次与后面的数字比较. `7`>`3` ，`3`左移 。 `7`>`5`，  `5`左移。到达末尾直接插入`7`

![image.png](https://img.xobear.cn/file/JAVA/1786236180681_image.png)

第三次,抽取倒数第四个数字`4`.依次与后面的数字比较.`4`>`3` ，`3`左移 。`4`<`5`。`4`直接插入

![image.png](https://img.xobear.cn/file/JAVA/1786236213275_image.png)

时间复杂度：
最好的情况：如果所有的数组元素本身就是升序排列，我们**每次迭代不需要进行移动**，所以时间复杂度是 O（N）

最坏的情况：如果所以的数组元素都是按降序排列，我们**每次迭代每次比较都需要移动**，在这种情况下。

比较的步数为 **O((N^2 - N) / 2)** ，移动的步数为**O((N^2 - N) / 2)**

因此最差的情况为 **O(N^2 - N)** ，忽略常数为 **O(N^2)**

```
#PYTHON
def insertion_sort(numbers):
    # 从第二个元素开始，逐个插入已排序区间
    for current_index in range(1, len(numbers)):
        current_value = numbers[current_index]
        previous_index = current_index - 1

        # 将比当前值大的元素向右移动，为插入腾出位置
        while previous_index >= 0 and numbers[previous_index] > current_value:
            numbers[previous_index + 1] = numbers[previous_index]
            previous_index -= 1

        # 将当前值插入到正确位置
        numbers[previous_index + 1] = current_value

    return numbers  # 返回升序排列后的列表
```
```
#JAVA
public static void insertionSort(int[] numbers) {
    // 从第二个元素开始，逐个插入已排序区间
    for (int currentIndex = 1; currentIndex < numbers.length; currentIndex++) {
        int currentValue = numbers[currentIndex];
        int previousIndex = currentIndex - 1;

        // 将比当前值大的元素向右移动，为插入腾出位置
        while (previousIndex >= 0 && numbers[previousIndex] > currentValue) {
            numbers[previousIndex + 1] = numbers[previousIndex];
            previousIndex--;
        }

        // 将当前值插入到正确位置
        numbers[previousIndex + 1] = currentValue;
    }
}
```





冒泡排序 vs 选择排序 vs 插入排序

冒泡排序相比较而言肯定是较差的。但是冒泡、选择、插入排序的平均和最坏时间复杂度均为 O(n²)；冒泡通常较慢主要是交换次数较多，并非复杂度更高。

但实际使用时优先选插入排序，尤其是数据量小或基本有序时；选择排序只在交换、写入成本很高时更合适；冒泡排序通常只用于教学演示，不建议用于实际业务代码。



4.4 插入排序的进阶-二分插入排序
-






























