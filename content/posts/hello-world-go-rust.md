---
title: "Hello World in Go From Rust"
description: ""
date:  2024-01-07
image: https://res.cloudinary.com/pbaba/image/upload/v1704655971/ggr.drawio_i75fz7.png
---

# Introduction
Suppose every software in the world was written in just one programming language Eg. C. In that case, there'll be no need for bindings and foreign function interfaces but since we have thousands of programming languages, genuine use cases arise where communicating across programming languages is necessary.

* Some programming languages are more performant than others and you'll need to hand off computation-intensive tasks to these languages.
* Some programming languages are state of the art in different areas, Eg, Javascript with Browsers, Python with Data, and C with Embedded systems, so it'll be easier to utilize the existing libraries instead of reinventing the wheel.
* Some languages are strict and strongly typed; you want to prototype fast but not compromise on performance. An example is Game development or NGINX module extensions with Lua and C.

# The Base C Layer
![gorust](https://res.cloudinary.com/pbaba/image/upload/v1704655971/ggr.drawio_i75fz7.png)

Golang uses `cgo` to communicate with external C libraries and Rust uses FFI (Foreign function interfaces) to export C functions. Additionally, a library for automatically generating bindings can be used to generate the header files `(.h)`. In our case, we'll only be exporting two C functions, so using [cbindgen](https://github.com/mozilla/cbindgen) is overkill but we'll use it regardless because why not? 
Firstly, we'll write the rust functions we want to export. We'll start by creating a new rust library:

```sh
cargo new r --lib
```

This means we're creating a new rust library called `r`. 

In our Cargo.toml, we'll specify that this crate is a dynamic library and then include the libc and cbindgen dependencies.

```toml
[package]
name = "r"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
libc = "0.2.151"

[build-dependencies]
cbindgen = "0.26.0"
```

We'll need `libc` to access some C types, specifically the `c_char` type. This is because strings are UTF-32 encoded (4 bytes) in C while they're UTF-8 encoded in Rust, meaning they can have variable sizes (1 to 4 bytes).

# Rust Functions
To write our `hello_world` function which will be called from Go, we'll need the `no_mangle` annotation so the linker can find the function while linking without the Rust compiler [mangling](https://rust-lang.github.io/rfcs/2603-rust-symbol-name-mangling-v0.html) it. 

Then we can write our functions `hello_world` and `hello_world_free`:

```rust
extern crate libc;

use std::ffi::CString;

use libc::c_char;

#[no_mangle]
pub extern "C" fn hello_world(item: *mut c_char) -> *mut c_char {
    unsafe {
        let c_str =
            CString::new(format!("hello world {:?}", CString::from_raw(item))).expect("dont fail");
        c_str.into_raw()
    }
}

#[no_mangle]
pub extern "C" fn hello_world_free(item: *mut c_char) {
    unsafe {
        if item.is_null() {
            return;
        }
        let _ = CString::from_raw(item);
    };
}
```

`hello_world` accepts a mutable pointer to a char array as an argument and returns the same. The `unsafe` keyword is needed as the rust compiler can't guarantee that `from_raw` which entails dereferencing a null pointer, won't lead to undefined behavior. Finally, we use `into_raw` to hand ownership back to the caller, in this case, Go.

`hello_world_free` accepts a mutable pointer, and calls `from_raw` on it, so we can properly reconstruct it, claim ownership, and then drop it. This is to avoid memory leaks.

```rust
cbindgen::Builder::new()
        .with_crate(crate_dir)
        .with_config(config)
        .generate()
        .expect("Unable to generate bindings")
        .write_to_file("bindings.h");
```

To generate the bindings, we'll add a build script `build.rs` which uses `cbindgen` to generate the `bindings.h` file. Then we can run:

```sh
cargo build
```

If everything goes smoothly, we should have a compiled binary and a newly created `bindings.h` file with the following methods in it:

```c
char *hello_world(char *item);

void hello_world_free(char *item);
```

# Go
After building the Rust binary, we'll need to tell the linker where to find it and we can do this by passing the linker flags via `cgo`. We'll also need to include (think import) the `bindings.h` file so we can call the rust methods.

```go
// #cgo LDFLAGS: -L/Users/pbaba/projects/go-rust/r/target/debug -lr
// #include <bindings.h>
import "C"
```

Finally, we can use the `hello_world` function and include the "merry christmas" string as an argument. We'll also defer the `hello_world_free` method call, which will free the memory referenced by the pointer `b` afterward.

```go
a := C.CString("merry christmas")
b := C.hello_world(a)
defer C.hello_world_free(b)
fmt.Println(C.GoString(b))
```

Then we can run `go run main.go` and it's alive:
```sh
hello world. "merry christmas"
```

In some cases, we can do without the `hello_world_free` function and replace it with the custom free function provided by `cgo`

```go
defer C.free(unsafe.Pointer(b))
```

This should replace the function we already have so we don't end up freeing the same location in memory twice and causing a double free:

```sh
malloc: Double free of object 0x7f8c340040a0
```

But for CStrings, [The Rust documentation](https://doc.rust-lang.org/src/alloc/ffi/c_str.rs.html#416-419) recommends we free this explicitly by reconstructing and then dropping it instead of using C's free.

The rest of the code [is on GitHub](https://github.com/obbap1/go-rust).

