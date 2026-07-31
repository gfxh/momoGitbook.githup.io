#!/usr/bin/env python3
import sys
import ipaddress

if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} <ipv4>")
    print(f"Example: {sys.argv[0]} 1.2.3.4")
    sys.exit(1)

ip = sys.argv[1]
addr = ipaddress.ip_address(ip)

if addr.version != 4:
    print("Only IPv4 is supported")
    sys.exit(1)

print(int(addr))