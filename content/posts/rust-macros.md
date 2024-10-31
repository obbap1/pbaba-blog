---
title: "Tinkering with Rust Procedural Macros"
description: ""
date: 2024-10-31
image: https://res.cloudinary.com/pbaba/image/upload/v1729372198/sandy-wood-qyY9iScMu6w-unsplash_jnkbit.jpg
---

Macros are a useful tool for meta programming. Think of macros like writing code for code. For example, lets say we have some pseudocode that looks like this: 

```
function Antelope(){}
function Bird(){}
function Cat(){}
```

We can write a macro with pseudocode like:

```
for animal in ["Antelope", "Bird", "Cat"] {
    function #animal(){}
}
```

This means for every animal in the array, declare an empty function block. This should directly replace the first pseudocode that was defined. 

These macros are evaluated at compile time, so there's no runtime overhead for these expressions. The generated code can of course incure additional runtime overhead but thats not because of the macros. An example of a feature with runtime overhead is dynamic dispatch which can be achieved in rust with trait objects or dynamic traits. These are like interfaces in other languages and since many types can implement an interface, a `vtable` lookup will be done at runtime to find the correct function to call.

That being said, macros add an extra layer of complexity as they don't abide by the same rules as code. Eg. They have slightly different syntax, They receive a [TokenStream](https://doc.rust-lang.org/beta/proc_macro/struct.TokenStream.html) as an argument and return the same type. This is because macros are processed after the abstract syntax tree is constructed so they have access to the tokens which are gotten after tokenization<sup>[2]</sup> and they should return valid syntax in whatever language they're written in. 

## Proc(edural) Macros
Broadly speaking, there are two kinds of macros<sup>[1]</sup> in rust. I'll write an example with proc macros as i think they'll give more clarity to the utility and essence of macros and they're less pain on the eye. 

Derive-Proc macros use the `#[derive]` attribute. This attribute can be used to implement traits or in this case macros on specific types. For an example with traits:
```rust
#[derive(Debug, Default, Clone, Copy, Eq, PartialEq)]
struct Greet{
    morning: String
}
```
Because of the `Debug` trait derived on the `Greet` struct, we can print the contents of the struct to stdout. 
```rust
let hi = Greet { morning: "hi".to_string() };
println!("{:?}", hi);
```
The reason why we can print the variable `hi` to stdout using `println!` (which is a function-like proc macro) is because we implement `Debug`. Without implementing that trait we would see something like this from the compiler
```
`Greet` doesn't implement `Debug`
the trait `Debug` is not implemented for `Greet`
add `#[derive(Debug)]` to `Greet` or manually `impl Debug for Greet`
```

This means the debug trait can be derived or implemented manually, like it is done for types in the standard library. Eg. [The bool type](https://doc.rust-lang.org/src/core/fmt/mod.rs.html#2411-2423)

## Mathy
I want to implement a derive proc-macro called `Mathy` which will expose some math related methods to its associated type. For example, if i have a struct like:
```rust
struct Count {
    morning: u32
    afternoon: u32
    evening: u32
    comment: String
}
```
This struct holds the number of times a person has eaten at different times in the day with a comment. 
```rust
let count = Count {
    morning: 5, 
    afternoon: 0, 
    evening: 1, 
    comment: "Had so much to eat in the morning".to_string()
};
```
If i derive macro `Mathy` on this struct, i should be able to call a method `sum` that will sum up all the integer-like types in the struct. In this case, it'll ignore the `comment` field and sum up others to return `6`. 

The benefit of using a macro over a function in this case is that for every struct this is derived on, at compile time, the macro knows the integer-like types on the struct and computes what the `sum` method should be. 

In this case, when `Mathy` is expanded, it will look like:
```rust
Impl Count {
    fn sum(&self) -> isize {
        self.morning + self.afternoon + self.evening
    }
}
``` 

To get started, we ensure the library crate is labeled as a proc-macro in `Cargo.toml`
```toml
[lib]
proc-macro = true

[dependencies]
quote = "1.0.37"
syn = "2.0.79"
```

Then we define all the integer-like types we know of in rust
``` rust
const INTEGER_TYPES: [&str; 12] = [
    "u8", "u16", "u32", "u64", "u128", "usize", "i8", "i16", "i32", "i64", "i128", "isize",
];

#[proc_macro_derive(Mathy)]
pub fn derive_math_functions(item: TokenStream) -> TokenStream {}
```

The function `derive_math_functions` is what implements the macro. Its signature accepts a `TokenStream` and returns same. 
```rust
// ...
let input = parse_macro_input!(item as DeriveInput);
let name = &input.ident;
let mut integer_fields = Vec::new();
if let Data::Struct(s) = input.data {
    if let Fields::Named(namen) = s.fields {
        for field in namen.named {
            for field_type in field.clone().ty.into_token_stream() {
                if INTEGER_TYPES.contains(&field_type.to_string().as_str()) {
                    integer_fields.push(field.clone().ident.unwrap());
                }
            }
        }
    }
}
```
This is us pushing all the integer-like fields on the struct to an array. 
Most importantly, in the block below, we implement the `sum` function which uses the pattern `#(...)*` to run for every field in the array.

```rust
// ...
let result = if integer_fields.len() > 0 {
    let first = integer_fields.remove(0);
    quote! {
        impl #name {
            pub fn sum(&self) -> isize {
                let mut result = self.#first as isize;
                #(
                    result += self.#integer_fields as isize;
                )*
                result
            }
        }
    }
}else {
    quote! {}
};

TokenStream::from(result)
```

## Cargo Expand
With a tool called [cargo-expand](https://github.com/dtolnay/cargo-expand) we can see what the macro expands to and the methods that have been exposed. 

If we derive [Mathy](https://github.com/obbap1/mathy) on the count struct we declared above, 
```rust
#[derive(Mathy)]
struct Count {
    morning: u32
    afternoon: u32
    evening: u32
    comment: String
}

let count = Count {
    morning: 5, 
    afternoon: 0, 
    evening: 1, 
    comment: "Had so much to eat in the morning".to_string()
}

// 
println!("The sum is {}", count.sum()); // 6
```

To see what exactly was derived on struct `Count`, we run:
```bash
cargo expand
```
We can see that an `impl Count` block has been added because `Mathy` was derived on this struct and we can see that the sum function contains all integer-like fields in it and all this code was generated at compile time!
```rust
struct Count {
    morning: usize,
    afternoon: usize,
    evening: usize,
    comment: String,
}
// ...... ADDED BECAUSE OF THE MACRO.....
impl Count {
    pub fn sum(&self) -> isize {
        let mut result = self.morning as isize;
        result += self.afternoon as isize;
        result += self.evening as isize;
        result
    }
}
```

Happy Macro-ing and [Mathy-ing](https://github.com/obbap1/mathy)

## References
[1] https://veykril.github.io/tlborm/proc-macros/methodical.html

[2] https://en.wikipedia.org/wiki/Lexical_analysis#Tokenization
