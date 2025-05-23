---
title: "How happy are Eyeballs"
description: ""
date: 2024-07-17
image: https://res.cloudinary.com/pbaba/image/upload/v1721205181/michael-dziedzic-nc11Hg2ja-s-unsplash_jeto7j.jpg
---

```
curl http://localhost:9000 -svv
* Host localhost:9000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:9000...
* connect to ::1 port 9000 from ::1 port 59687 failed: Connection refused
*   Trying 127.0.0.1:9000...
* Connected to localhost (127.0.0.1) port 9000
> GET / HTTP/1.1
> Host: localhost:9000
> User-Agent: curl/8.7.1
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 200 OK
< Content-Type: text/plain
< Content-Length: 13
< 
* Connection #0 to host localhost left intact
Hello, World!%  
```

```
go run client/main.go
start DNS... {localhost}
done DNS... {[{::1 } {127.0.0.1 }] <nil> false}
connect start... tcp [::1]:9000
connect done... tcp [::1]:9000 dial tcp [::1]:9000: connect: connection refused
connect start... tcp 127.0.0.1:9000
connect done... tcp 127.0.0.1:9000 <nil>
Response-> Hello, World!
```