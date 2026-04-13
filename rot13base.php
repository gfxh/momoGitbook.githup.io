<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>ROT13 & Atbash & Base64</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    textarea { width: 100%; height: 120px; font-size: 16px; padding: 8px; box-sizing: border-box; resize: vertical; }
    button { margin: 10px 0; padding: 10px 24px; font-size: 16px; cursor: pointer; }
    label { font-weight: bold; display: block; margin-top: 16px; }
  </style>
</head>
<body>
  <h2>ROT13转换</h2>
  <label for="rot13_input">输入：</label>
  <textarea id="rot13_input" placeholder="请输入要转换的文本..."></textarea>
  <button onclick="rot13_convert()">转换</button>
  <label for="rot13_output">输出：</label>
  <textarea id="rot13_output" readonly placeholder="转换结果..."></textarea>

  <hr>

  <h2>Atbash密码转换</h2>
  <label for="input">输入：</label>
  <textarea id="input" placeholder="请输入要转换的文本..."></textarea>
  <button onclick="convert()">转换</button>
  <label for="output">输出：</label>
  <textarea id="output" readonly placeholder="转换结果..."></textarea>

  <hr>

  <h2>Base64转换</h2>
  <label for="b64_input">输入：</label>
  <textarea id="b64_input" placeholder="请输入要转换的文本..."></textarea>
  <button onclick="b64_encode()">编码</button>
  <button onclick="b64_decode()">解码</button>
  <label for="b64_output">输出：</label>
  <textarea id="b64_output" readonly placeholder="转换结果..."></textarea>

  <script>
    function rot13(text) {
      let result = '';
      for (let char of text) {
        if (/[a-zA-Z]/.test(char)) {
          const isUpper = char === char.toUpperCase();
          const base = isUpper ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
          const offset = char.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
          result += String.fromCharCode(base + (offset + 13) % 26);
        } else {
          result += char;
        }
      }
      return result;
    }
    function rot13_convert() {
      document.getElementById('rot13_output').value = rot13(document.getElementById('rot13_input').value);
    }

    function atbash(text) {
      let result = '';
      for (let char of text) {
        if (/[a-zA-Z]/.test(char)) {
          const isUpper = char === char.toUpperCase();
          const base = isUpper ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
          const offset = char.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
          result += String.fromCharCode(base + (25 - offset));
        } else {
          result += char;
        }
      }
      return result;
    }
    function convert() {
      document.getElementById('output').value = atbash(document.getElementById('input').value);
    }

    function b64_encode() {
      try {
        document.getElementById('b64_output').value = btoa(unescape(encodeURIComponent(document.getElementById('b64_input').value)));
      } catch(e) {
        document.getElementById('b64_output').value = '编码失败：' + e.message;
      }
    }
    function b64_decode() {
      try {
        document.getElementById('b64_output').value = decodeURIComponent(escape(atob(document.getElementById('b64_input').value)));
      } catch(e) {
        document.getElementById('b64_output').value = '解码失败：' + e.message;
      }
    }
  </script>

  <?php
  function atbash_php($text) {
    $result = '';
    foreach (str_split($text) as $char) {
      if (ctype_alpha($char)) {
        $is_upper = ctype_upper($char);
        $base = $is_upper ? ord('A') : ord('a');
        $offset = ord(strtolower($char)) - ord('a');
        $new_char = chr($base + (25 - $offset));
        $result .= $new_char;
      } else {
        $result .= $char;
      }
    }
    return $result;
  }
  ?>
</body>
</html>