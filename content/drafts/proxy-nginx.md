---
title: "Handle proxy connections with Lua NGINX modules"
description: ""
date:  2022-05-24
---

# Introduction
Reverse proxies help intercept requests before sending it to the upstream server. This means they can help with caching, handling TCP connections, Firewalls, Static file distribution etc. NGINX is one of the most popular reverse proxies, others include, Envoy, Caddy, HAProxy etc. 

## LuaJIT 
With NGINX, Lua sub modules can be plugged into the modules, and things can be handled programatically.

