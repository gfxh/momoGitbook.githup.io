![image.png](https://img.xobear.cn/file/JAVA/1784504499208_image.png)
协议 端口  URL

# 2.java Okhttp3库
java 功能非常强大，用来实现抓取网站内容也非常简便。那么是如何实现它的呢？

首先，我们需要安装一个库：` Okhttp3`，这是一个非常流行的 `HTTP` 库，可以简单、快速的实现 `HTTP`调用

安装 `Okhttp3`库 的方式是在`pom.xml `文件中增加依赖：
```
<!-- https://mvnrepository.com/artifact/com.squareup.okhttp3/okhttp -->
<dependency>
<groupId>com.squareup.okhttp3</groupId>
<artifactId>okhttp</artifactId>
<version>4.1.0</version>
</dependency>

```
唯一的`<dependencies>`标签中，包含多个`<dependency>`标签，每一个`<dependency>` 标签表示一个依赖库。书写时注意嵌套顺序哦。

 `pom.xml `文件的作用就是定义 JAVA项目需要用到的那些库

**使用`OkHttp3`完成页面请求，需要三大步骤 过程与python的requests库类似**  
1。实例化`OkHttpClient`（创建） 
`OkHttpClient okHttpClient = new OkHttpClient();`


2。调用执行（运行）
在执行调用之前，需要实例化一个 `Request` 对象，作用是定义请求的各种参数，`Request request = new Request.Builder().url(url).build();`

然后构建调用对象 `Call call = okHttpClient.newCall(request);`

最后执行调用，如果调用失败可能抛异常，所以必须抓取异常。 `call.execute()`就是执行调用的代码。
3。返回执行结果（响应内容）

`call.execute()` 返回的其实是一个执行的结果对象，调用对象的方法即可获取返回的字符串内容：`call.execute().body().string();`


```
JAVA
package com.youkeda.test.http;

import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;


public class GetPage {
    public static void main(String[] args) {
        OkHttpClient okHttpClient = new OkHttpClient();
        String url ="https://www.done.kim/api/m/musicRankings";
        Request request = new Request.Builder().url(url).build();
        Call call = okHttpClient.newCall(request);
        try {
            // 执行请求拿到响应对象
            Response response = call.execute();
            // 获取响应体字符串并打印
            String result = response.body().string();
            System.out.println(result);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}



package com.youkeda.test.http;

import java.io.IOException;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;

public class GetPage {

  /**
   * 根据输入的url，读取页面内容并返回
   */
  public String getContent(String url) {
    // okHttpClient 实例
    OkHttpClient okHttpClient = new OkHttpClient();
    // 定义一个request
    Request request = new Request.Builder().url(url).build();
    // 使用client去请求
    Call call = okHttpClient.newCall(request);
    // 返回结果字符串
    String result = null;
    try {
      // 获得返回结果
      result = call.execute().body().string();
    } catch (IOException e) {
      // 抓取异常
      System.out.println("request " + url + " error . ");
      e.printStackTrace();
    }
    return result;
  }

  public static void main(String[] args) {
    String url = "https://www.done.kim/api/m/musicRankings";
    GetPage getPage = new GetPage();
    String content = getPage.getContent(url);
  
    System.out.println("API调用结果");
    System.out.println(content);
  }
}



-----------------------------------------------------------------------
python的requests库
简洁版本：
import requests

# 步骤1：创建Session（等价OkHttpClient，自带连接池）
session = requests.Session()
# 步骤2：构造并执行请求（等价Request、Call、execute）
resp = session.get("目标url")
# 步骤3：读取响应内容（等价response.body().string()）
content = resp.text
print(content)

------------------------------------------------------------------------
完整可运行版）：增加 url 变量、try/except、raise_for_status、print 输出：
import requests

# 目标接口地址
url = "https://www.done.kim/api/m/musicRankings"

try:
    # 发起GET请求，等价Java OkHttp的execute执行请求
    resp = requests.get(url)
    # 获取响应文本，等价 response.body().string()
    result = resp.text
    # 控制台打印结果
    print(result)
except requests.exceptions.RequestException as e:
    # 捕获各类网络相关异常，对应Java的IOException
    print(f"请求出错：{e}")

```


。


# 3.POST传表单数据
也需要用到`Okhttp3`
首先需要创建表单--》FormBody表单对象
```
Builder builder = new FormBody.Builder();
// 设置数据，第一个参数是数据名，第二个参数是数据值
builder.add("", "");
FormBody formBody = builder.build();

Request request = new Request.Builder().url(url).post(formBody).build();
```
在构建Request对象时，使用.post(formBody) 语句放入表单对象，就表示执行 POST 操作

`new Request.Builder().url(url).post(formBody).build();`是连写，正常这么写：
```
Request.Builder build = new Request.Builder();
build = build.url(url);
build = build.addHeader("Referer", "http://www.taobao.com");
build = build.post(formBody);
Request request = build.build();
```
一次完整的
```
package com.youkeda.test.http;

import okhttp3.Call;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

public class FormPoster {

    public String postContent(String url, Map<String, String> formData) {
        // okHttpClient 实例
        OkHttpClient okHttpClient = new OkHttpClient();

        // 1. 构建表单构建器
        FormBody.Builder formBuilder = new FormBody.Builder();
        // 2. 遍历map，放入表单数据
        for (Map.Entry<String, String> entry : formData.entrySet()) {
            formBuilder.add(entry.getKey(), entry.getValue());
        }
        // 3. 构建 FormBody 对象
        FormBody formBody = formBuilder.build();

        // 4. 指定 post 方式并绑定FormBody请求体
        Request request = new Request.Builder()
                .url(url)
                .post(formBody) // 核心：传入表单请求体，声明POST请求
                .build();

        // 使用client去请求
        Call call = okHttpClient.newCall(request);
        // 返回结果字符串
        String result = null;
        try {
            // 获得返回结果，注意：responseBody只能读取一次
            result = call.execute().body().string();
        } catch (IOException e) {
            // 抓取异常
            System.out.println("request " + url + " error . ");
            e.printStackTrace();
        }
        return result;
    }

    public static void main(String[] args) {
        String url = "https://www.done.kim/api/m/mobile_tel_segment.htm";
        Map<String, String> formData = new HashMap<>();
        formData.put("tel", "13800138000"); // 填入测试手机号

        FormPoster poster = new FormPoster();
        String content = poster.postContent(url, formData);

        System.out.println("API调用结果");
        System.out.println(content);
    }
}
```
## POST传 JSON数据
![image.png](https://img.xobear.cn/file/JAVA/1784618878762_image.png)









```
package com.youkeda.test.http;

import java.io.IOException;
import java.net.URL;

import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class GetPage {

  /**
   * 根据输入的url，读取页面内容并返回
   */
  public static String getContent(String url) {
    // okHttpClient 实例
    OkHttpClient okHttpClient = new OkHttpClient();
    // 定义一个request
    Request request = new Request.Builder().url(url).build();
    // 使用client去请求
    Call call = okHttpClient.newCall(request);
    // 返回结果字符串
    String result = null;
    try {
      // 只执行一次，接收Response
      try (Response response = call.execute()) {
        // 从response拿信息
        System.out.println("状态码：" + response.code());
        if (response.body() != null) {
          result = response.body().string();
        }
      }
    } catch (IOException e) {
      System.out.println("request " + url + " error . ");
      e.printStackTrace();
    }
    return result;
  }

  public static void main(String[] args) {
    String url = "https://www.baidu.com/";
    GetPage getPage = new GetPage();
    String content = GetPage.getContent(url);
    ;
  
    System.out.println("页面请求结果：");
    System.out.println(content);
  }
}

```
3.1 Response - 网页
-
使用一条语句执行调用请求，并取得返回结果字符串：`call.execute().body().string()`(连写风格)
execute()方法是真正执行发送请求，前面的一系列代码是做前置准备。

[http常见的状态码](https://ham.youkeda.com/articles/detail/5f3758675e205f30b2c2b2a4)


通常还要读取响应内容，但是又不能执行两次请求，所以代码应该优化
```
import okhttp3.Response;

// 执行请求
Response rep = call.execute();
// 获取响应状态码
int code = rep.code();
// 获取响应内容
String content = rep.body().string();


```

3.2 Response - 非文本文件
-
但实际上okhttp3库不仅可以请求网页、API,也能请求图片、excel等各种文件。

图片、excel是请求的二级制编码 	`response.body().bytes();`

**示例：**
```
package com.youkeda.test.http;

import java.io.IOException;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class ImageAsker {

  /**
   * 根据输入的url，读取页面内容并返回
   */
  public void getImage(String url) {
    // okHttpClient 实例
    OkHttpClient okHttpClient = new OkHttpClient();
    // 定义一个request
    Request request = new Request.Builder().url(url).build();
    try {
      // 执行请求
      Response response = okHttpClient.newCall(request).execute();
      
	  byte[] bytes = response.body().bytes();          ****
      
	  System.out.println("图片大小为： " + bytes.length + " 字节");
    } catch (IOException e) {
      // 抓取异常
      System.out.println("request " + url + " error . ");
      e.printStackTrace();
    }
  }

  public static void main(String[] args) {
    String url = "https://document.youkeda.com/course/py2/douban2.png";
    ImageAsker asker = new ImageAsker();
    asker.getImage(url);
  }
}

```


3.3 Response - JSON
-

`JSON`是一段文本，也就是`Java`的字符串，是难以进行解析具体内容的。必须转换成]ava的对象。

使用`fastjson`库把参数对象转换为`JSON`格式字符串，当然也可以把`JSON`结果转换为对象，方便程序今后一步分析。
`JSON.parseObject()`

JSON格式一般使用大括号包裹的，转换的格式最好是map格式
`Map map =JSON.parseObject(content,Map.class);`

**示例：**
```
package com.youkeda.test.http;


import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import jdk.nashorn.internal.parser.JSONParser;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class ApiAsker {

  /**
   * 根据输入的url，读取页面内容并返回
   */
  public String getContent(String url) {
    // okHttpClient 实例
    OkHttpClient okHttpClient = new OkHttpClient();
    // 定义一个request
    Request request = new Request.Builder().url(url).build();
    // 使用client去请求
    Call call = okHttpClient.newCall(request);
    // 返回结果字符串
    String result = null;
    try {
      // 执行请求
      Response response = call.execute();
      // 获取响应内容
      result = response.body().string();
    } catch (IOException e) {
      // 抓取异常
      System.out.println("request " + url + " error . ");
      e.printStackTrace();
    }
    return result;
  }

  public static void main(String[] args) {
    String url = "https://www.done.kim/api/m/client_search_cp?aggr=1&cr=1&flag_qc=0&p=1&n=30&w=西海情歌&format=json";
    ApiAsker asker = new ApiAsker();
    String content = asker.getContent(url);

    Map map =JSON.parseObject(content,Map.class);

    System.out.println("查询结果文本：" + content);
    
    System.out.println("JSON 格式字符串转换为 Map 对象");
  }
}

```

3.4 解析JSON对象
-

如果是更复杂的多次嵌套结构的JSON数据：
```
{
  "code": 0,
  "data": {
    "ip": "117.89.35.58",
    "country": "中国",
    "area": "",
    "region": "江苏",
    "city": "南京",
    "county": "XX",
    "isp": "电信",
    "country_id": "CN",
    "area_id": "",
    "region_id": "320000",
    "city_id": "320100",
    "county_id": "xx",
    "isp_id": "100017"
  }
}
```
只需要多次取出嵌套的
Map对象即可：
```
Map contentObj = JSON.parseObject(content, Map.class);
Map dataObj = (Map)contentObj.get("data");
String city = (String)dataObj.get("city");
```
因为
Map可以存储任何对象，所以从
Map中get()
到的对象必须指定其
实际的类型：(Map)、(string)
![image.png](https://img.xobear.cn/file/JAVA/1785140441794_image.png)

面对对层级嵌套，想要获得最里层的数据，必须挨个层级获取

![image.png](https://img.xobear.cn/file/JAVA/1785140695646_image.png)
[json格式化工具](https://www.bejson.com/jsonviewernew/#google_vignette)


















