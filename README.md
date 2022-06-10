# Xipper

Xipper (_'ch'ipper_) is a streaming text cypher designed to provide symmetrical key encryption for
short text entries in a manner that remains compatible with the original formatting
and usage. That is, it's not readable, but looks readable and acts like written
language.

This project is derived from work done by Scrambls back in 2010. The concept was
originally used to encrypt tweets, posts and emails, end-to-end, with no special
requirements on the application or transport host.

It has been modified to function for tokenization of web requests and attribute
data.

## Installation

```shell
npm i xipper
```

## Usage
```javascript
const xipper = new Xipper();
let key = 'abcdabcdabcdabcdabcdabcdabcdabcd';
let result = xipper.cloak(key,"This is a test");
console.log(cloaked);   // ǑƃȸǃưŤȁǯŰȻƇ ȢǶǓ 
let clear = xipper.decloak(result)
console.log(clear);     // This is a test
```
The key should be 28, 36 or 44 characters in length

The cipher text can be anything but is strongest with relatively short data

### Options
Xipper can be instantiated with a few options.

| option | type    | default  | description                                                                                                                                                   |
| --- |---------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| spacing | boolean | true     | When true, Xipper will insert random word boundaries in the result so the text renders like written language                                                  |
| charset | string  | extended | There are a few different character sets defined. A valid charset must include 256 unique unicode characters, each with an index greater than or equal to 128 |

```javascript
let xipper = new Xipper({charset:"global",spacing:"false"});
```

#### Character Sets
* *extended* - characters selected from the extended ascii set, 0x0154 to 0x0254
* *global* - A selection of international characters including cyrillic and greek
* *scrambls* - The original scrambls character set