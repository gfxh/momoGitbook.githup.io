项目实战？
-
项目流程
![image.png](https://img.xobear.cn/file/JAVA/1786665750813_image.png)
抓取歌曲，每首歌的评论中最频繁的词语

功能描述
-
1.抓取单曲：爬虫加数据分析
2.抓取评论
3.分词，对评论用工具分词，词汇出现频率越高，字体越大。呈现词云效果


查询歌手歌单详细-API

信息描述|信息说明|
-------|--------|
API地址|`http://neteaseapi.youkeda.com:3000/artists?id=`
请求方式|GET
参数|id-歌手id

![image.png](https://img.xobear.cn/file/JAVA/1786666439144_image.png)

链接中的数字就是歌手ID   毛不易：12138269
![image.png](https://img.xobear.cn/file/JAVA/1786666870347_image.png)
`artist`是歌手的歌单（也叫“专辑“）数据，里面包含了歌手信息，歌手名称，别名，简介，歌曲书，专辑数等
`hotSongs`歌曲的集合




































































































































































