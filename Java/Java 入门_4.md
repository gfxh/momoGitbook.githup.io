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

4.1 User-Agent
-

UA，我们在做日志包含的题目时经常使用。很多时候在UA上传 一句话木马

现在，我需要详细学一下User-Agent

HTTP
消息头
Headers
是
HTTP
协议的一项重要内容，作用是在发起请求
的时候，除了请求参数外，可以附加更多的信息。
[Headers文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers)

User-Agent是存放在
Headers
中的一种数据信息。作用是，在指定
URL
发送请求的时候，告诉服务端当前用户的浏览器类型、版本，甚至操作系
统、CPU等非隐私的技术信息

Okhttp3
库已经支持
Headers
了，只需要在构建
Request对象的时候，调用
`addHeader()`
方法即可：

```
Request request = new Request.Builder()
    .url(url)
    .addHeader("User-Agent", "")
    .build();
```

`addHeader()`方法第一个参数是名称，第二个参数是值。

4.2 Referer
-

说白了，就是“假装”

一个图片网站A，允许网站B访问图片，不许网站C访问图片

C去请求A的网站，响应了403，C就在请求头上加一个`Referer:B的网站`假装是B去访问A的图片

**Referer 表示的是“我声称自己从哪个网页来的”，不是“请求者实际是谁”。**

4.3 Host
-
Host表示当前请求的域名。虽然这个域名已经存在于UL中，但遇到复杂的场景，例如使用代理服务器、或者URL中不写域名而是写IP地址进
行请求等，设置Host就非常有用了。
[Host](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Host)

跟
User-Agent和
Referer一样，Host
也是属于
He aders数据的字段
之一
```
Request request = new Request.Builder()
    .url(url)
    .addHeader("Host", "www.douban.com")
    .build();
```
Host
的值一定是一个域名且不带协议头。

5.1 下载文件
-


5.1 下载文件
console
```
Java

创建文件对象
   ↓
写入内容
   ↓
关闭写入操作
```
**写入文本文件**

```
import java.io.File;
import java.io.FileWriter;

// 文件对象
File file = new File("foo.txt");

// 写入内容
FileWriter fileWritter = new FileWriter(file.getName());
fileWritter.write(content);

// 关闭
fileWritter.close();
```

File
是文件类
FileWriter是用来给文件写入内容的类。再次强调
写入文件类必须执行关闭操作。

**写入二进制文件**
```
import java.io.File;
import java.io.FileOutputStream;

// 文件对象
File file = new File("china-city-list.xlsx");

// 写文件
FileOutputStream fos = new FileOutputStream(file);
fos.write(data);

// 必须刷新并关闭
fos.flush();
fos.close();
```

5.2 下载图片
-
与写入二进制文件一样
```
package com.youkeda.test.http;

import java.io.IOException;
import java.io.File;
import java.io.FileOutputStream;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class ImageAsker {

  /**
   * 根据输入的url，读取页面内容并返回
   */
  public byte[] getContent(String url) {
    // okHttpClient 实例
    OkHttpClient okHttpClient = new OkHttpClient();
    // 定义一个request
    Request request = new Request.Builder()
        .url(url)
        .addHeader("Referer","http://photo.yupoo.com/")
        .addHeader("Host","http://photo.yupoo.com/")
        .addHeader("User-Agent","http://photo.yupoo.com/")
        .build();
    byte[] bytes = null;
    try {
      // 执行请求
      Response response = okHttpClient.newCall(request).execute();
      bytes = response.body().bytes();
    } catch (IOException e) {
      System.out.println("request " + url + " error . ");
      e.printStackTrace();
    }

    return bytes;
  }

  public static void main(String[] args) {
    String url = "http://photo.yupoo.com/vibius/GkRSowXr/medish.jpg";
    ImageAsker asker = new ImageAsker();
    byte[] data = asker.getContent(url);

    try {
      File file = new File("medish.jpg");
      // 写入图片文件
      FileOutputStream fileOutputStream=new FileOutputStream(file);
      fileOutputStream.write(data);
      fileOutputStream.flush();
      fileOutputStream.close();

      System.out.println("Download complete");
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}

```

5.3 解析excel
-
**依赖库**
easyexcel是阿里巴巴出品的快速、简单操作
exce1文件的库。使用前必
须在
pom.xml
文件中加入对库的依赖。
```
<dependency>
  <groupId>com.alibaba</groupId>
  <artifactId>easyexcel</artifactId>
  <version>3.1.1</version>
</dependency>
```
exce1文件是多
sheet模式的，每个sheet实际上是一个
表格，表格又分为行和列。

所以解析数据的路径一定是：sheet->行->列
第一个sheet，第一行，第一列  （0，0，0）


```
import com.alibaba.excel.EasyExcel;
import java.util.Map;
import java.util.List;

// 读取第一个sheet
List<Map<Integer, String>> sheetDatas = EasyExcel.read("xzq_201907.xlsx").sheet(0).doReadSync();
// List 中每个元素表示一行
for (Map<Integer, String> rowData : sheetDatas) {
  // Map 中用序号指代每一列
  for (Integer index : rowData.keySet()) {
    // 列值
    String columnValue = rowData.get(index);
  }
}
```
解析文件的第一个步骤是读取文件内容，调用EasyExce1.read()方法，传
入文件名称。然后这里解析的第一个工作表，所以调用
sheet()方法，传
入参数0。最后的doReadsync()表示同步方式读取文件内容，返回一个读
取到的内容集合
List。这是一个连贯的写法。

返回的
List集合中，系统用
Map
类表示一行数据（因为系统不知道
excel
对应什么具体的对象，其实Map
可以当做一种通用的对象)

![image.png](https://img.xobear.cn/file/JAVA/1785490381583_image.png)


自动转换为类


在不能提前确定excel文件每一列的含义时，或者复杂场景下exce1文件的列经常变化，用Map表示每一列的数据比较好。
但是如果知道excel文件每一列的含义，用自定义类来表示，会更加直观。


```
import com.alibaba.excel.EasyExcel;
import java.util.List;

// 读取第一个sheet
List<DemoData> sheetDatas = EasyExcel.read("xzq_201907.xlsx").head(DemoData.class).sheet(0).doReadSync();
```
注意这里多调用了一个方法：`.head(DemoData.class)`,`DemoData`就是自定义的类，表示一行数据，类的每个属性都表示一列的值。
MCP更灵活，自定义类更直观易理解。一般列数不太多（不超过10个）、不会变化，用自定义类
返回值为List<DemoData>就表示把每一行都转换为一个DemoData的实例对象，放入List集合中。


6.1 cookie
-
cookie ，是存储在客户端浏览器中的一段文本内容。以  key=value（数据名称、数据值）的格式存储一条数据；多条数据之间用分号 `;`

由于各种浏览器都对cookie有大小和数量限制，所以目前cookie主要用于**存储登录数据**。


6.2 session
-
Session是服务器端用于保存用户状态的机制，通过唯一的Session ID将客户端与服务器端的会话关联起来。

Session的基本概念
Session（会话）是服务器为每个客户端创建的唯一对象，用于在客户端与服务器之间保持状态信息。由于HTTP协议是无状态的，服务器无法自动识别客户端身份，因此Session用于存储用户登录状态、购物车信息等数据，实现跨请求的数据共享和状态保持 

Session与Cookie的区别

	存储位置：Cookie保存在客户端浏览器中，而Session保存在服务器端 
	安全性：Session数据存储在服务器端，相对更安全；Cookie容易被篡改。
	容量：Session可以存储大量数据，而Cookie受浏览器限制，存储量有限。

Session的工作原理

	创建Session：客户端首次访问服务器时，服务器为其创建一个Session对象，并生成唯一的Session ID（如JSESSIONID） 

	关联客户端：Session ID通过Cookie发送到客户端，客户端在后续请求中携带该ID，服务器根据ID找到对应的Session对象 

	存取数据：服务器端可以通过键值对方式在Session中存储数据，例如session.setAttribute("username", "张三")，并可通过getAttribute获取 

	生命周期：Session通常在浏览器关闭或超时后失效，也可以通过服务器端配置延长或手动销毁。

Session在不同环境中的实现

	Java：通过HttpServletRequest.getSession()创建Session，服务器自动生成Session ID并通过Cookie返回客户端 

	Node.js：可使用express-session模块创建和管理Session，支持设置Cookie名称、过期时间和滚动更新等选项 

	Electron：通过session模块创建新的Session对象或访问现有页面的Session，可选择持久化或内存Session 

6.3 复用session



static
表示类变量，意味着无论
new出多少个
PageLoginer对
象，PageLoginer.okHttpClient
都只有一个。
final
表示
okHttpC1ient一旦第一次
new
出对象后，不能再次
new
新对象。

7.1 SMTP
-
SMTP是一个简单的基于文本的邮件传输协议，全称为(Simple Mail
Transfer Protocol-简单邮件传输协议)。在这个协议上我们可以指定一
条邮件消息和一个或多个邮件接收者，然后进行邮件输出。

通过地址和协议，我们便具有发送邮件的基础通道。使用Java或其它编
程语言，可以使用SMTP
完成邮件的发送，不必打开网页登录邮箱发送邮件了。

先添加依赖pom

javamail
```
	<dependency>
        <groupId>javax.mail</groupId>
        <artifactId>mail</artifactId>
        <version>1.4</version>
	</dependency>
```
发送邮件的代码较为固定

![image.png](https://img.xobear.cn/file/JAVA/1785971310495_image.png)


```
import java.security.Security;
import java.util.Properties;
import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class MailClient {
  public static void main(String[] args) {
    try {
      final String SSL_FACTORY = "javax.net.ssl.SSLSocketFactory";

      //配置邮箱信息
      Properties props = System.getProperties();
      //邮件服务器
      props.setProperty("mail.smtp.host", "smtp.qq.com");
      props.setProperty("mail.smtp.socketFactory.class", SSL_FACTORY);
      props.setProperty("mail.smtp.socketFactory.fallback", "false");
      //邮件服务器端口
      props.setProperty("mail.smtp.port", "465");
      props.setProperty("mail.smtp.socketFactory.port", "465");
      //鉴权信息
      props.setProperty("mail.smtp.auth", "true");
      //建立邮件会话
      Session session = Session.getDefaultInstance(props, new Authenticator() {
        //身份认证
        protected PasswordAuthentication getPasswordAuthentication() {
          //1.账户 授权码需要自己获得
          return new PasswordAuthentication("xxxxxxx@qq.com", "xxxx");
        }
      });
      //建立邮件对象
      MimeMessage message = new MimeMessage(session);
      //设置邮件的发件人
      message.setFrom(new InternetAddress("xxxxxxx@qq.com"));
      //2.设置邮件的收件人
      message.setRecipients(Message.RecipientType.TO, "xxxxxxx@qq.com");
      //设置邮件的主题
      message.setSubject("通过javamail发出！！！");
      //文本部分
      message.setContent("文本邮件测试", "text/html;charset=UTF-8");
      message.saveChanges();
      //发送邮件
      Transport.send(message);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
```
8.1 查询城市天气
-
https://api.seniverse.com/v3/weather/daily.json?key=SCYrvkytJze9qyzOh&location=杭州


APi的第二个参数location就是指定城市名称，可以用汉字（杭州）或
拼音(hangzhou)
第一个参数key是此APi接口需要的认证码。使用的是统一认证码。
[json格式化工具](https://www.bejson.com/jsonviewernew/)
```
{
  "results": [
    {
      "location": {
        "id": "WWH1780CEFBR",
        "name": "宿迁",
        "country": "CN",
        "path": "宿迁,宿迁,江苏,中国",
        "timezone": "Asia/Shanghai",
        "timezone_offset": "+08:00"
      },
      "daily": [
        {
          "date": "2026-08-06",
          "text_day": "晴",
          "code_day": "0",
          "text_night": "晴",
          "code_night": "1",
          "high": "35",
          "low": "26",
          "rainfall": "0.00",
          "precip": "0.00",
          "wind_direction": "东北",
          "wind_direction_degree": "45",
          "wind_speed": "8.4",
          "wind_scale": "2",
          "humidity": "84"
        },
        {
          "date": "2026-08-07",
          "text_day": "晴",
          "code_day": "0",
          "text_night": "晴",
          "code_night": "1",
          "high": "35",
          "low": "28",
          "rainfall": "0.00",
          "precip": "0.00",
          "wind_direction": "东北",
          "wind_direction_degree": "45",
          "wind_speed": "23.4",
          "wind_scale": "4",
          "humidity": "78"
        },
        {
          "date": "2026-08-08",
          "text_day": "小雨",
          "code_day": "13",
          "text_night": "小雨",
          "code_night": "13",
          "high": "33",
          "low": "26",
          "rainfall": "0.50",
          "precip": "0.33",
          "wind_direction": "东北",
          "wind_direction_degree": "45",
          "wind_speed": "23.4",
          "wind_scale": "4",
          "humidity": "78"
        }
      ],
      "last_update": "2026-08-06T07:06:45+08:00"
    }
  ]
}
```

| 单元格 | 说明 |
| ---- | ---- |
| location | 城市区域基本信息 |
| daily | 每日天气内容 |
| date | 日期 |
| text_day | 白天天气现象文字 |
| code_day | 白天天气现象代码 |
| text_night | 晚间天气现象文字 |
| code_night | 晚间天气现象代码 |
| high | 当天最高温度 |
| low | 当天最低温度 |
| precip | 降水概率，范围0~100，单位百分比 |
| wind_direction | 风向文字 |
| wind_direction_degree | 风向角度，范围0~360 |
| wind_speed | 风速，单位km/h |
| wind_scale | 风力等级 |
| rainfall | 降水量，单位mm |
| humidity | 相对湿度，0~100，单位为百分比 |
| last_update | 数据最近的更新时间。没有做特别的格式化，输出系统默认的格式。 |










