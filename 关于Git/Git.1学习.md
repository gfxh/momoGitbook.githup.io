# 学习的第一性原理是自学
🐻9/30🐻


今天学习了有关git的内容，了解了项目开发的流程等等
# Git
下载Git
>官方网站：https://git-scm.cn/downloads/win
# 本地Git的全局配置
* # 创建user名：
```
git config --global user.name "XXXXXX"  
```
* # 创建user的邮箱：
```
git config --global user.email "xxxxx@xxxx.com"  
```
* # Git密钥配置 

在企业中开发，会先把项目下载到自己电脑上，再进行开发的。但企业中的代码未必是公开的，不是任何人都可以随意下载项目代码的，gitlab 平台(优课达/Github...)会做权限的管理。

所以在开发之前，需要在 gitlab 上进行配置，设置一个 SSH ，把我们的开发环境和 gitlab 连接起来，这样使用 git 操作代码的过程会更加顺利。

在我们我们的开发环境和 gitlab 服务器之间，也有这样的暗号，它的名字叫做 SSH（Secure Shell，安全协议外壳），通常也叫密钥。


  * 生成SSH密钥：

```
ssh-keygen -t rsa -b 4096 -C "XXXXXXXXX@XXX.com"
```
输入后，如果出现 “overwrite(y/n)?” 的提示，敲一个 Y 回车即可
其他情况一路回车，就会生成SSH

![](Picture/g100-2-5.12.pngPicture/g100-2-5.12.png)

  * 查看SSH:

在终端中输入以下命令：
```
cat ~/.ssh/id_rsa.pub
```
输好命令回车后，可以看到很长的、以 “ssh-rsa” 开头、以你自己邮箱结尾的字符内容，这就是 ssh 了：
![](Picture/ssh1.png)

这个很长的 ssh 看不懂没关系，不用纠结（本来就不是给人看的，是计算机识别的）。

复制 SSH ，下面的步骤会用到。复制的区域为：
![](Picture/sshfuzhi.png)

接下来就是到任意的Git平台（你的代码仓库）上添加你的本地Git的密钥了。

```
GitHub 是一个基于 Git 的代码托管平台，也是全球最大的开源社区。

​核心功能：​​

​代码托管：​​ 用 Git 版本控制来管理项目代码。

​协作开发：​​ 支持多人通过 Fork、Pull Request 等功能共同参与项目。

​开源项目集散地：​​ 数百万开发者在这里分享和发现开源项目。

简单说，它是一个用于存储、管理和协作开发代码的网站。
```
>GitHup官方网站：https://github.com/

因为是国外的网站可能需要加速器，这里推荐WattToolkit
>WattToolkit官方网站：https://steampp.net/

以下演示基于 GitHub

# Github 的配置

![](照片文件夹/githup0.1.png)
![](照片文件夹/githup1.png)
## 注意：这只是在一个仓库上部署密钥，没有在账户上部署密钥。
想要在账户上部署密钥点击右上角的头像---设置（齿轮）---SSH和GPG密钥（钥匙）。
![](照片文件夹/GITHUP2.png)
![](照片文件夹/GITHUP3.png)


到这里，你的本地Git就可以访问云端上的Github了。

























# Linux


**🐻先这样吧累了，打游戏去🐻**
