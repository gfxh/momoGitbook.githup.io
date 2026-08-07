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
























































































