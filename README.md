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
Xipper uses [rollup](rollupjs.org) to bundle files for browser use.
```javscript
<script src='xipper.bundle.js'>
```

## Usage
```javascript
import {Xipper} from '<path>/xipper.bundle.js'
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

## Secret Store
Xipper does not communicate with any server. All encryption takes place within the
memory of the browser. The phrase used to encode content is only known to the user.

Xipper does provide a simple tool for stashing phrases to be re-applied. This is
used by XipperMonitor to make the system user friendly and to avoid security fatigue.
It is not used by Xipper itself or required in any way.

## Xipper Monitor
The monitor provides a widget for prompting for and applying the decryption
phrase. It is designed to be attached to an editable DIV on the host page.

```javascript
import {XipperMonitor} from 'Xipper';

const myDiv = document.createElement('div');
this.xipperMonitor = new XipperMonitor(this.doclet._id.d,{hide:true});
this.xipperMonitor.attach(myDiv);

try {
    // if matches the pattern @@...@@
    if (this.xipper.testBlock(myDiv.innerText)) {
        // descrypt the xipped blocks with the last used phrase in the xipper store
        myDiv.innerText = await this.xipper.decloakBlock(this.xipperMonitor.activePhrase,myDiv.innerText);
    }
} catch(e) {
    // the decrypt phrase failed, so alert the user and prompt for the correct phrase
    this.xipperMonitor.flash();
    this.xipperMonitor.activate(true);
}
```

## Development
Build xipper.bundle.js by invoking rollup with the configuration defined in rollup.config.mjs
```bash
$ rollup -c
```