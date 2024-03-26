---
title: "Cross compiling a small rust server from my MacOS to Raspberry pi"
description: ""
date:  2024-03-26
image: 
---

# Introduction
I have a small rust web server running on my local network at home, which does nothing fancy but return the password for my wi-fi.
```bash
curl raspberrypi.local:3000
{
    "password": "abcd"
}
```
To manage this, i had to either use a remote window with vscode or just use the terminal and vim or nano. This was hard to manage as i'll regularly see connection timeouts
```sh
$ ssh pbaba@raspberrypi.local
// client_loop: send disconnect: Broken pipe
```
and i didn't have the luxury of my host environment. My package managers, scripts and vscode themes (very important) etc.

# Decision
To solve this, i decided to do all my coding on my host machine which is an intel x86_64 mac, package the binary as a debian package and deploy this to my raspberry pi. This will be managed as a systemd service, which will help with managing restarts, new deployments and logging.  

## Problems
1. I'll need to package this as a debian package and a bash script to manage deployments. This shouldn't be anything too fancy, it'll use `scp` to transfer the package.
2. The raspberrypi is running on ARM, this will mean i'll need to cross-compile from my host machine.
3. Since this is a rust project, i'll like to manage as much as i can with cargo (Rust's package manager).

# Solution
[cargo-deb](https://lib.rs/crates/cargo-deb) allows us manage debian packages and cross-compile with cargo as a subcommand. Let's install `cargo-deb`:
```sh
cargo install cargo-deb
```
Running `cargo deb` should build a debian package for your operating system. 
The debian package should be found in the `/target/debian` directory.
```sh
$ ls /target/debian
wifi-server_0.1.0-1_amd64.deb
```
The name is a concatenation of the name, version from the package table in `Cargo.toml` and the CPU architecture.
```toml
[package]
name = "wifi-server"
version = "0.1.0"
```

Metadata for this package can be managed directly in `Cargo.toml` under the `package.metadata.deb` table
```toml 
[package.metadata.deb]
maintainer = "Paschal Obba <paschalobba@gmail.com>"
copyright = "2024, Paschal Obba"
extended-description = """A server that tells wifi passwords and other details"""
section = "utility"
priority = "optional"
assets = [
    ["target/aarch64-unknown-linux-gnu/release/wifi-server", "/usr/bin/", "755"],
    ["config.toml", "/usr/bin/", "755"]
]
```

To cross-compile, i needed the toolchain for the raspberry pi. After a few stackoverflow links, i found out that the toolchain for my pi is `aarch64-unknown-linux-gnu`. I initially thought it was `armv7-unknown-linux-gnueabihf` but when i ran the executable on my pi i ran into `cannot execute: required file not found` errors.

We'll need to add this toolchain as a target for `rustup`.
```sh
$ rustup target add aarch64-unknown-linux-gnu
# ............ verify its installed -----
$ rustup target list --installed
aarch64-unknown-linux-gnu # this is the one
armv7-unknown-linux-gnueabihf
wasm32-unknown-unknown
x86_64-apple-darwin 
```

Using `cargo-deb` directly for cross compiling was very tedious and this is where [cargo-zigbuild](https://lib.rs/crates/cargo-zigbuild) which is based off zig comes in. It made the process very seamless.

```sh
# firstly install zig if you don't have it
$ brew install zig
# install cargo-zigbuild
$ cargo install cargo-zigbuild
# build for the pi target/toolchain
$ cargo zigbuild --target aarch64-unknown-linux-gnu --release
# build a debian package with cargo-deb
$ cargo deb --target aarch64-unknown-linux-gnu --no-build
```

After this, we should find that the debian package is now located in `/target/aarch64-unknown-linux-gnu/debian` and then i send this over ssh to the pi. 
```sh
$ scp ./target/aarch64-unknown-linux-gnu/debian/wifi-server_0.1.0-1_amd64.deb pbaba@raspberrypi.local:~/server/wifi-server.deb
```

The `raspberrypi.local` DNS name is setup using [mDNS](https://en.wikipedia.org/wiki/Multicast_DNS)

Then we can install this package on the pi and run it
```sh
# ssh into the pi
$ ssh pbaba@raspberrypi.local
# install debian package
pbaba@raspberrypi $ sudo dpkg -i server/wifi-server.deb
# run it
pbaba@raspberrypi $ wifi-server
# test it
pbaba@raspberrypi $ curl localhost:3000
{
    "password": "abcd"
}
```

It works! Finally, we'll want to run this as a systemd service. This can be managed with `cargo-deb` with a few additional keys.
```toml
[package.metadata.deb]
# ...
maintainer-scripts = "debian/"
systemd-units = { enable = false }
```
Since we specified that the scripts are in the debian folder, we'll create a debian folder and a `wifi-server.service` file. 
```toml
[Unit]
Description=WI-FI server

[Service]
ExecStart=/usr/bin/wifi-server
Restart=always
RestartSec=1
Environment="RUST_LOG=tower_http=trace"

[Install]
WantedBy=multi-user.target
```

Now we can manage this with `systemctl`.

```sh
pbaba@raspberrypi:~ $ sudo systemctl enable wifi-server
pbaba@raspberrypi:~ $ sudo systemctl start wifi-server
```

We can also look at logs for this service with `journalctl`.
```sh
pbaba@raspberrypi:~ $ sudo journalctl -u wifi-server.service
...........
Mar 26 17:53:04 raspberrypi systemd[1]: Started wifi-server.service - WI-FI server.
Mar 26 17:53:15 raspberrypi wifi-server[445450]: 2024-03-26T17:53:15.274862Z DEBUG request{method=GET uri=/ version=HTTP/1.1}: tower_http::trace::on_request: started processing request
Mar 26 17:53:15 raspberrypi wifi-server[445450]: 2024-03-26T17:53:15.274948Z DEBUG request{method=GET uri=/ version=HTTP/1.1}: tower_http::trace::on_response: finished processing request latency=0 ms status=200
```

# Final Thoughts / References
I should be able to use `wasm` as a common target and won't need to worry about architectures just incase i want to support more toolchains (i think). 
- [Github repo](https://github.com/obbap1/wifi-server)
- [Simplifying Debian Packaging for Rust: A Step-by-Step Guide for Rust Developers](https://medium.com/rust-programming-language/simplifying-debian-packaging-for-rust-a-step-by-step-guide-for-rust-developers-0457cdb3c81d)
- [systemd](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html)
- [how to create a systemd service in linux](https://www.shubhamdipt.com/blog/how-to-create-a-systemd-service-in-linux/)
- [tower-http tracing](https://docs.rs/tower-http/0.5.2/tower_http/trace/index.html)






