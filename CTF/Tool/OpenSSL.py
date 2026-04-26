import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64
import binascii
import hashlib

class OpenSSLAESTool:
    def __init__(self, root):
        self.root = root
        self.root.title("OpenSSL AES 专业加解密工具 | 兼容原版加盐格式")
        self.root.geometry("900x750")

        # 输入框
        ttk.Label(root, text="输入内容（支持 Base64 / Hex）", font=("微软雅黑", 11)).pack(pady=5)
        self.input_text = scrolledtext.ScrolledText(root, width=110, height=12, font=("Consolas", 10))
        self.input_text.pack(pady=3)

        # 参数面板
        frame = ttk.LabelFrame(root, text="参数设置", padding=10)
        frame.pack(pady=10, fill="x", padx=10)

        # 第一行
        ttk.Label(frame, text="运算模式").grid(row=0, column=0, padx=10, pady=5)
        self.mode = ttk.Combobox(frame, values=["CBC", "ECB", "OFB", "CFB", "CTR", "GCM"], width=10, state="readonly")
        self.mode.current(0)
        self.mode.grid(row=0, column=1, padx=5)

        ttk.Label(frame, text="填充模式").grid(row=0, column=2, padx=10, pady=5)
        self.padding = ttk.Combobox(frame, values=["PKCS7", "NoPadding", "ZeroPadding", "AnsiX923", "Iso10126", "Iso97971"], width=10, state="readonly")
        self.padding.current(0)
        self.padding.grid(row=0, column=3, padx=5)

        ttk.Label(frame, text="密钥长度").grid(row=0, column=4, padx=10, pady=5)
        self.key_size = ttk.Combobox(frame, values=["128", "192", "256"], width=10, state="readonly")
        self.key_size.current(2)
        self.key_size.grid(row=0, column=5, padx=5)

        # 第二行
        ttk.Label(frame, text="密码/口令").grid(row=1, column=0, padx=10, pady=5)
        self.password = ttk.Entry(frame, width=15)
        self.password.grid(row=1, column=1, padx=5)

        ttk.Label(frame, text="偏移 IV").grid(row=1, column=2, padx=10, pady=5)
        self.iv = ttk.Entry(frame, width=20)
        self.iv.grid(row=1, column=3, padx=5)

        ttk.Label(frame, text="输入格式").grid(row=1, column=4, padx=10, pady=5)
        self.input_format = ttk.Combobox(frame, values=["Base64", "Hex"], width=10, state="readonly")
        self.input_format.current(0)
        self.input_format.grid(row=1, column=5, padx=5)

        # 按钮
        btn_frame = ttk.Frame(frame)
        btn_frame.grid(row=0, column=6, rowspan=2, padx=20)
        ttk.Button(btn_frame, text="🔒 加密", command=self.encrypt).pack(pady=5, fill="x")
        ttk.Button(btn_frame, text="🔓 解密", command=self.decrypt).pack(pady=5, fill="x")

        # 输出框
        ttk.Label(root, text="输出结果", font=("微软雅黑", 11)).pack(pady=5)
        self.output_text = scrolledtext.ScrolledText(root, width=110, height=18, font=("Consolas", 10))
        self.output_text.pack(pady=3)

        # 状态提示
        self.status = ttk.Label(root, text="就绪", foreground="gray")
        self.status.pack(pady=2)

    # 解码输入
    def decode_input(self, data):
        fmt = self.input_format.get()
        try:
            data = data.strip().replace("\n", "").replace("\r", "")
            if fmt == "Base64":
                return base64.b64decode(data)
            elif fmt == "Hex":
                return binascii.unhexlify(data.replace(" ", ""))
        except Exception as e:
            raise ValueError(f"输入格式错误：{e}")

    # OpenSSL 原版 Key/IV 派生（兼容 MD5 算法，修复之前的报错）
    def openssl_derive_key_iv(self, password, salt, key_len, iv_len):
        """兼容 OpenSSL 原版的派生方式（MD5）"""
        password = password.encode('utf-8') if isinstance(password, str) else password
        salt = salt if salt is not None else b''
        derived = b''
        prev = b''
        while len(derived) < key_len + iv_len:
            prev = hashlib.md5(prev + password + salt).digest()
            derived += prev
        return derived[:key_len], derived[key_len:key_len+iv_len]

    # 解密核心
    def decrypt(self):
        self.output_text.delete(1.0, tk.END)
        self.status.config(text="正在解密...", foreground="blue")
        self.root.update()
        try:
            data = self.input_text.get(1.0, tk.END)
            cipher_bytes = self.decode_input(data)
            password = self.password.get()
            key_size = int(self.key_size.get())
            padding = self.padding.get()
            mode_name = self.mode.get()

            # 识别 OpenSSL 加盐格式
            is_openssl = cipher_bytes.startswith(b"Salted__")
            salt = None
            raw_cipher = cipher_bytes

            if is_openssl:
                salt = cipher_bytes[8:16]
                raw_cipher = cipher_bytes[16:]

            # 计算 Key/IV
            key_len = key_size // 8
            iv_len = 16 if mode_name not in ("ECB", "GCM") else 0
            if is_openssl:
                key, iv = self.openssl_derive_key_iv(password, salt, key_len, iv_len)
            else:
                key = password.encode()[:key_len].ljust(key_len, b'\x00')
                iv = bytes.fromhex(self.iv.get().strip()) if self.iv.get().strip() else b'\x00' * iv_len

            # 初始化 cipher
            mode_map = {
                "CBC": AES.MODE_CBC,
                "ECB": AES.MODE_ECB,
                "OFB": AES.MODE_OFB,
                "CFB": AES.MODE_CFB,
                "CTR": AES.MODE_CTR,
                "GCM": AES.MODE_GCM
            }
            mode = mode_map[mode_name]
            if mode == AES.MODE_ECB:
                cipher = AES.new(key, mode)
            elif mode == AES.MODE_CTR:
                cipher = AES.new(key, mode, nonce=iv[:12])
            elif mode == AES.MODE_GCM:
                cipher = AES.new(key, mode, nonce=iv[:12])
            else:
                cipher = AES.new(key, mode, iv)

            # 解密
            if mode == AES.MODE_GCM:
                # GCM 模式处理 tag
                tag = raw_cipher[-16:]
                ciphertext = raw_cipher[:-16]
                plain = cipher.decrypt_and_verify(ciphertext, tag)
            else:
                plain = cipher.decrypt(raw_cipher)

            # 去填充
            if padding == "PKCS7" and mode not in (AES.MODE_CTR, AES.MODE_OFB, AES.MODE_CFB, AES.MODE_GCM):
                plain = unpad(plain, AES.block_size)
            elif padding == "ZeroPadding":
                plain = plain.rstrip(b'\x00')

            self.output_text.insert(tk.END, plain.decode(errors="replace"))
            self.status.config(text="解密成功！", foreground="green")

        except Exception as e:
            self.output_text.insert(tk.END, f"解密失败：{str(e)}")
            self.status.config(text="解密失败", foreground="red")

    # 加密核心
    def encrypt(self):
        self.output_text.delete(1.0, tk.END)
        self.status.config(text="正在加密...", foreground="blue")
        self.root.update()
        try:
            plain = self.input_text.get(1.0, tk.END).encode()
            password = self.password.get()
            key_size = int(self.key_size.get())
            padding = self.padding.get()
            mode_name = self.mode.get()

            key_len = key_size // 8
            iv_len = 16 if mode_name not in ("ECB", "GCM") else 0
            salt = None
            use_openssl = True  # 默认生成 OpenSSL 加盐格式

            if use_openssl:
                import os
                salt = os.urandom(8)
                key, iv = self.openssl_derive_key_iv(password, salt, key_len, iv_len)
            else:
                key = password.encode()[:key_len].ljust(key_len, b'\x00')
                iv = bytes.fromhex(self.iv.get().strip()) if self.iv.get().strip() else b'\x00' * iv_len

            # 初始化 cipher
            mode_map = {
                "CBC": AES.MODE_CBC,
                "ECB": AES.MODE_ECB,
                "OFB": AES.MODE_OFB,
                "CFB": AES.MODE_CFB,
                "CTR": AES.MODE_CTR,
                "GCM": AES.MODE_GCM
            }
            mode = mode_map[mode_name]

            if padding == "PKCS7" and mode not in (AES.MODE_CTR, AES.MODE_OFB, AES.MODE_CFB, AES.MODE_GCM):
                plain = pad(plain, AES.block_size)
            elif padding == "ZeroPadding":
                pad_len = AES.block_size - (len(plain) % AES.block_size)
                plain += b'\x00' * pad_len

            if mode == AES.MODE_ECB:
                cipher = AES.new(key, mode)
            elif mode == AES.MODE_CTR:
                cipher = AES.new(key, mode, nonce=iv[:12])
            elif mode == AES.MODE_GCM:
                cipher = AES.new(key, mode, nonce=iv[:12])
            else:
                cipher = AES.new(key, mode, iv)

            if mode == AES.MODE_GCM:
                ciphertext, tag = cipher.encrypt_and_digest(plain)
                ciphertext += tag
            else:
                ciphertext = cipher.encrypt(plain)

            if use_openssl:
                ciphertext = b"Salted__" + salt + ciphertext

            if self.input_format.get() == "Base64":
                out = base64.b64encode(ciphertext).decode()
            else:
                out = ciphertext.hex()
            self.output_text.insert(tk.END, out)
            self.status.config(text="加密成功！", foreground="green")

        except Exception as e:
            self.output_text.insert(tk.END, f"加密失败：{str(e)}")
            self.status.config(text="加密失败", foreground="red")

if __name__ == "__main__":
    root = tk.Tk()
    app = OpenSSLAESTool(root)
    root.mainloop()