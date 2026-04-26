import requests
import urllib3
import tkinter as tk
from tkinter import ttk
import base64
from urllib.parse import quote, unquote
import re

# 关闭SSL警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ==================== 行号组件 ====================
class TextLineNumbers(tk.Canvas):
    def __init__(self, master, text_widget, **kwargs):
        super().__init__(master, **kwargs)
        self.text_widget = text_widget
        self.text_widget.bind('<KeyPress>', self.on_key_press)
        self.text_widget.bind('<KeyRelease>', self.on_key_press)
        self.text_widget.bind('<Button-1>', self.on_key_press)
        self.text_widget.bind('<ButtonRelease-1>', self.on_key_press)
        self.text_widget.bind('<B1-Motion>', self.on_key_press)
        self.text_widget.bind('<MouseWheel>', self.on_mouse_wheel)
        self.text_widget.bind('<B2-Motion>', self.on_key_press)
        self.text_widget.bind('<B3-Motion>', self.on_key_press)
        self.bind('<Button-1>', self.on_mouse_wheel)
        self.bind('<MouseWheel>', self.on_mouse_wheel)
        self.after_idle(self.redraw)

    def on_key_press(self, event=None):
        self.redraw()

    def on_mouse_wheel(self, event=None):
        self.redraw()

    def redraw(self):
        self.delete("all")
        i = self.text_widget.index("@0,0")
        while True:
            dline = self.text_widget.dlineinfo(i)
            if dline is None:
                break
            y = dline[1]
            linenum = str(i).split('.')[0]
            self.create_text(2, y, anchor='nw', text=linenum, font=self.text_widget['font'])
            i = self.text_widget.index("%s+1lines" % i)

class TextWithLineNumbers(tk.Frame):
    def __init__(self, master, **kwargs):
        super().__init__(master)
        self.vscroll = tk.Scrollbar(self, orient='vertical')
        self.text = tk.Text(self, yscrollcommand=self.vscroll.set, **kwargs)
        self.line_numbers = TextLineNumbers(self, self.text, width=30, bg='#f0f0f0')
        self.line_numbers.pack(side='left', fill='y')
        self.text.pack(side='left', fill='both', expand=True)
        self.vscroll.pack(side='right', fill='y')
        self.vscroll.config(command=self.on_scroll)
        self.text.bind('<Configure>', self.on_text_change)
        self.text.bind('<KeyPress>', self.on_text_change)
        self.text.bind('<KeyRelease>', self.on_text_change)
        self.text.bind('<Button-1>', self.on_text_change)
        self.text.bind('<ButtonRelease-1>', self.on_text_change)
        self.text.bind('<MouseWheel>', self.on_text_change)
        self.text.bind('<B1-Motion>', self.on_text_change)
        self.text.bind('<B2-Motion>', self.on_text_change)
        self.text.bind('<B3-Motion>', self.on_text_change)
        self.text.bind('<<Paste>>', self.on_text_change)
        self.text.bind('<<Cut>>', self.on_text_change)

    def on_scroll(self, *args):
        self.text.yview(*args)
        self.line_numbers.redraw()

    def on_text_change(self, event=None):
        self.line_numbers.redraw()

    def get(self, start="1.0", end=tk.END):
        return self.text.get(start, end).rstrip('\n')

    def insert(self, index, text):
        self.text.insert(index, text)
        self.line_numbers.redraw()

    def delete(self, start="1.0", end=tk.END):
        self.text.delete(start, end)
        self.line_numbers.redraw()

# ==================== 全局配置（字体/颜色） ====================
# 字体设置：Segoe UI 12号（圆润字体）
FONT_NORMAL = ("Segoe UI", 12)
FONT_BOLD = ("Segoe UI", 12, "bold")

# 语法高亮配色（VSCode风格）
COLORS = {
    "keyword": "#0000FF",       # 关键字-蓝色
    "string": "#008000",        # 字符串-绿色
    "comment": "#808080",       # 注释-灰色
    "number": "#800080",        # 数字-紫色
    "symbol": "#FF8C00",        # 符号-橙色
    "builtin": "#FF0000",       # 内置函数-红色
    "replace": "#DC143C"        # 替换文本-深红色
}

# 多语言语法规则（正则匹配）
SYNTAX_RULES = {
    # Python关键字
    "python_keyword": {
        "pattern": r"\b(def|class|import|from|if|else|for|while|return|print|break|continue)\b",
        "tag": "keyword"
    },
    # PHP关键字
    "php_keyword": {
        "pattern": r"\b(echo|print|if|else|foreach|while|function|include|require)\b",
        "tag": "keyword"
    },
    # JS关键字
    "js_keyword": {
        "pattern": r"\b(var|let|const|function|if|else|for|while|return|console)\b",
        "tag": "keyword"
    },
    # Shell关键字
    "shell_keyword": {
        "pattern": r"\b(echo|if|then|else|fi|for|while|do|done|cd|ls|cat)\b",
        "tag": "keyword"
    },
    # 字符串（单/双引号）
    "string": {
        "pattern": r'(".*?"|\'.*?\')',
        "tag": "string"
    },
    # 注释
    "comment": {
        "pattern": r"(#.*?$|//.*?$|/\*.*?\*/)",
        "tag": "comment",
        "flags": re.MULTILINE | re.DOTALL
    },
    # 数字（整数/十六进制）
    "number": {
        "pattern": r"\b(\d+|0x[0-9a-fA-F]+)\b",
        "tag": "number"
    },
    # 特殊符号
    "symbol": {
        "pattern": r"(\=|\(|\)|\;|\{|\}|\[|\]|\.|\+|\-|\*|\/|\&|\|)",
        "tag": "symbol"
    },
    # 内置函数（CTF高频）
    "builtin": {
        "pattern": r"\b(file_get_contents|system|exec|eval|passthru|base64_encode|base64_decode)\b",
        "tag": "builtin"
    }
}

# ==================== 语法高亮函数 ====================
def highlight_syntax(text_widget):
    # 移除所有现有高亮标签（保留replace标签）
    for tag in text_widget.tag_names():
        if tag not in ["replace"]:
            text_widget.tag_remove(tag, "1.0", tk.END)
    
    # 应用所有语法规则
    content = text_widget.get("1.0", tk.END)
    for rule_name, rule in SYNTAX_RULES.items():
        pattern = rule["pattern"]
        tag = rule["tag"]
        flags = rule.get("flags", 0)
        try:
            regex = re.compile(pattern, flags)
            for match in regex.finditer(content):
                start = text_widget.index(f"1.0 + {match.start()} chars")
                end = text_widget.index(f"1.0 + {match.end()} chars")
                text_widget.tag_add(tag, start, end)
                text_widget.tag_configure(tag, foreground=COLORS[tag])
        except:
            # 正则匹配出错时跳过，避免程序崩溃
            continue

# ==================== 主窗口 ====================
root = tk.Tk()
root.title("GETPOST+简单解密")
root.geometry("800x900")  # 放大窗口适配行号

# 设置全局字体
root.option_add('*Font', FONT_NORMAL)

# 创建选项卡
tab_control = ttk.Notebook(root)

# 配置 ttk 组件样式（解决按钮、选项卡字体不变问题）
style = ttk.Style()
style.theme_use('default')  # 使用默认主题
style.configure('TLabel', font=FONT_NORMAL)
style.configure('TButton', font=FONT_NORMAL)
style.configure('TNotebook', font=FONT_NORMAL)
style.configure('TNotebook.Tab', font=FONT_NORMAL)
style.configure('TEntry', font=FONT_NORMAL)
style.configure('TCombobox', font=FONT_NORMAL)
style.configure('TLabelframe', font=FONT_NORMAL)
style.configure('TLabelframe.Label', font=FONT_NORMAL)

tab1 = ttk.Frame(tab_control)
tab2 = ttk.Frame(tab_control)
tab3 = ttk.Frame(tab_control)

tab_control.add(tab1, text="📤 发送请求📤")
tab_control.add(tab2, text="🔐 编解码🔐")
tab_control.add(tab3, text="📝 文本替换📝")
tab_control.pack(expand=1, fill="both")

# ==============================================
# ================== 页面1：发包 ==================
# ==============================================
def send():
    url = entry_url.get().strip()
    get_arg = entry_get.get().strip()
    post_data = text_post.text.get("1.0", tk.END).strip()

    if get_arg:
        url += "?" + get_arg

    try:
        if post_data:
            res = requests.post(
                url,
                data=post_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                verify=False
            )
        else:
            res = requests.get(url, verify=False)

        res_text.text.delete("1.0", tk.END)
        res_text.text.insert(tk.END, f"状态码：{res.status_code}\n\n")
        res_text.text.insert(tk.END, res.text)
        highlight_syntax(res_text.text)  # 响应内容高亮
    except Exception as e:
        res_text.text.delete("1.0", tk.END)
        res_text.text.insert(tk.END, f"错误：{str(e)}")

# URL
ttk.Label(tab1, text="目标 URL：", font=FONT_NORMAL).grid(row=0, column=0, sticky="w", padx=10, pady=3)
entry_url = ttk.Entry(tab1, font=FONT_NORMAL)
entry_url.grid(row=1, column=0, sticky="ew", padx=10, pady=3)
entry_url.insert(0, "放置目标 URL")

# GET
ttk.Label(tab1, text="GET 参数(不用加 ？)：", font=FONT_NORMAL).grid(row=2, column=0, sticky="w", padx=10, pady=3)
entry_get = ttk.Entry(tab1, font=FONT_NORMAL)
entry_get.grid(row=3, column=0, sticky="ew", padx=10, pady=3)

# POST（高亮）
ttk.Label(tab1, text="POST 数据：", font=FONT_NORMAL).grid(row=4, column=0, sticky="w", padx=10, pady=3)
text_post = TextWithLineNumbers(tab1, font=FONT_NORMAL, padx=5, pady=5)
text_post.grid(row=5, column=0, sticky="nsew", padx=10, pady=3)
text_post.text.bind("<KeyRelease>", lambda e: highlight_syntax(text_post.text))

# 发送按钮
frame_btn1 = ttk.Frame(tab1)
frame_btn1.grid(row=6, column=0, sticky="w", pady=5)
btn_send = ttk.Button(frame_btn1, text="🚀 发送请求 🚀", command=send)
btn_send.pack(side=tk.LEFT, padx=5)

# 响应（高亮）
ttk.Label(tab1, text="响应内容：", font=FONT_NORMAL).grid(row=7, column=0, sticky="w", padx=10, pady=3)
res_text = TextWithLineNumbers(tab1, font=FONT_NORMAL, padx=5, pady=5)
res_text.grid(row=8, column=0, sticky="nsew", padx=10, pady=3)

# 配置grid权重，使大框按5:5分配
tab1.columnconfigure(0, weight=1)
tab1.rowconfigure(5, weight=1)
tab1.rowconfigure(8, weight=1)

# ==============================================
# ================== 页面2：编解码 ==================
# ==============================================
def encode_content():
    mode = combo_type.get()
    content = input_box.text.get("1.0", tk.END).strip()
    try:
        if mode == "URL":
            out = quote(content, safe='')
        elif mode == "Base64":
            out = base64.b64encode(content.encode('utf-8')).decode('utf-8')
        else:
            out = "请选择编码类型"
        output_box.text.delete("1.0", tk.END)
        output_box.text.insert(tk.END, out)
        highlight_syntax(output_box.text)  # 输出内容高亮
    except Exception as e:
        output_box.text.delete("1.0", tk.END)
        output_box.text.insert(tk.END, f"编码失败：{str(e)}")

def decode_content():
    mode = combo_type.get()
    content = input_box.text.get("1.0", tk.END).strip()
    try:
        if mode == "URL":
            out = unquote(content)
        elif mode == "Base64":
            content = content + '=' * (4 - len(content) % 4)
            out = base64.b64decode(content).decode('utf-8')
        else:
            out = "请选择编码类型"
        output_box.text.delete("1.0", tk.END)
        output_box.text.insert(tk.END, out)
        highlight_syntax(output_box.text)  # 输出内容高亮
    except Exception as e:
        output_box.text.delete("1.0", tk.END)
        output_box.text.insert(tk.END, f"解码失败：{str(e)}")

# 输入框（高亮）
ttk.Label(tab2, text="输入内容：", font=FONT_NORMAL).grid(row=0, column=0, sticky="w", padx=10, pady=5)
input_box = TextWithLineNumbers(tab2, font=FONT_NORMAL, padx=5, pady=5)
input_box.grid(row=1, column=0, sticky="nsew", padx=10, pady=5)
input_box.text.bind("<KeyRelease>", lambda e: highlight_syntax(input_box.text))

# 操作区
frame_opt = ttk.Frame(tab2)
frame_opt.grid(row=2, column=0, sticky="w", pady=8)
ttk.Label(frame_opt, text="编码类型：", font=FONT_NORMAL).pack(side=tk.LEFT, padx=5)
combo_type = ttk.Combobox(frame_opt, values=["URL", "Base64"], state="readonly", width=10, font=FONT_NORMAL)
combo_type.current(0)
combo_type.pack(side=tk.LEFT, padx=5)
btn_encode = ttk.Button(frame_opt, text="🔒 编码", command=encode_content)
btn_encode.pack(side=tk.LEFT, padx=10)
btn_decode = ttk.Button(frame_opt, text="🔓 解码", command=decode_content)
btn_decode.pack(side=tk.LEFT, padx=5)

# 输出框（高亮）
ttk.Label(tab2, text="输出结果：", font=FONT_NORMAL).grid(row=3, column=0, sticky="w", padx=10, pady=5)
output_box = TextWithLineNumbers(tab2, font=FONT_NORMAL, padx=5, pady=5)
output_box.grid(row=4, column=0, sticky="nsew", padx=10, pady=5)

# 配置grid权重，使大框按5:5分配
tab2.columnconfigure(0, weight=1)
tab2.rowconfigure(1, weight=1)
tab2.rowconfigure(4, weight=1)

# ==============================================
# ================== 页面3：文本替换 ==================
# ==============================================
def replace_text():
    original_text = replace_input.text.get("1.0", tk.END).strip()
    old_str = entry_old.get().strip()
    new_str = entry_new.get().strip()

    try:
        if not original_text:
            replace_output.text.delete("1.0", tk.END)
            replace_output.text.insert(tk.END, "⚠️ 请输入需要替换的文本！")
            count_label.config(text="替换计数：0 处")
            return

        if not old_str:
            replace_output.text.delete("1.0", tk.END)
            replace_output.text.insert(tk.END, "⚠️ 请输入要替换的原文本！")
            count_label.config(text="替换计数：0 处")
            return

        replace_count = original_text.count(old_str)
        replace_output.text.delete("1.0", tk.END)

        # 分割文本并插入（替换内容标红）
        parts = original_text.split(old_str)
        for i, part in enumerate(parts):
            replace_output.text.insert(tk.END, part)
            if i < len(parts) - 1:
                replace_output.text.insert(tk.END, new_str, "replace")

        # 语法高亮 + 替换文本样式
        highlight_syntax(replace_output.text)
        replace_output.text.tag_configure("replace", foreground=COLORS["replace"], font=FONT_BOLD)
        count_label.config(text=f"替换计数：{replace_count} 处")

        if replace_count == 0:
            replace_output.text.insert(tk.END, "\n\nℹ️ 未找到匹配的文本，无需替换")

    except Exception as e:
        replace_output.text.delete("1.0", tk.END)
        replace_output.text.insert(tk.END, f"❌ 替换失败：{str(e)}")
        count_label.config(text="替换计数：0 处")

def clear_replace():
    replace_input.text.delete("1.0", tk.END)
    entry_old.delete(0, tk.END)
    entry_new.delete(0, tk.END)
    replace_output.text.delete("1.0", tk.END)
    count_label.config(text="替换计数：0 处")

# 待替换文本（高亮）
ttk.Label(tab3, text="待替换文本：", font=FONT_NORMAL).grid(row=0, column=0, sticky="w", padx=10, pady=5)
replace_input = TextWithLineNumbers(tab3, font=FONT_NORMAL, padx=5, pady=5)
replace_input.grid(row=1, column=0, sticky="nsew", padx=10, pady=5)
replace_input.text.bind("<KeyRelease>", lambda e: highlight_syntax(replace_input.text))

# 操作区
frame_replace = ttk.Frame(tab3)
frame_replace.grid(row=2, column=0, sticky="w", pady=8)
ttk.Label(frame_replace, text="原文本：", font=FONT_NORMAL).pack(side=tk.LEFT, padx=5)
entry_old = ttk.Entry(frame_replace, width=20, font=FONT_NORMAL)
entry_old.pack(side=tk.LEFT, padx=5)
ttk.Label(frame_replace, text="替换为：", font=FONT_NORMAL).pack(side=tk.LEFT, padx=5)
entry_new = ttk.Entry(frame_replace, width=20, font=FONT_NORMAL)
entry_new.pack(side=tk.LEFT, padx=5)
btn_replace = ttk.Button(frame_replace, text="🔄 执行替换 🔄", command=replace_text)
btn_replace.pack(side=tk.LEFT, padx=10)
btn_clear = ttk.Button(frame_replace, text="🗑️ 清空", command=clear_replace)
btn_clear.pack(side=tk.LEFT, padx=5)
count_label = ttk.Label(frame_replace, text="替换计数：0 处", foreground="blue", font=FONT_NORMAL)
count_label.pack(side=tk.LEFT, padx=10)

# 替换后文本（高亮）
ttk.Label(tab3, text="替换后文本：", font=FONT_NORMAL).grid(row=3, column=0, sticky="w", padx=10, pady=5)
replace_output = TextWithLineNumbers(tab3, font=FONT_NORMAL, padx=5, pady=5)
replace_output.grid(row=4, column=0, sticky="nsew", padx=10, pady=5)

# 配置grid权重，使大框按5:5分配
tab3.columnconfigure(0, weight=1)
tab3.rowconfigure(1, weight=1)
tab3.rowconfigure(4, weight=1)

# ==================== 初始化高亮标签 ====================
# 初始化所有文本框的语法高亮标签
for text_widget in [text_post.text, res_text.text, input_box.text, output_box.text, replace_input.text, replace_output.text]:
    for tag in COLORS.keys():
        text_widget.tag_configure(tag, foreground=COLORS[tag])
    text_widget.tag_configure("replace", foreground=COLORS["replace"], font=FONT_BOLD)

# 启动
root.mainloop()