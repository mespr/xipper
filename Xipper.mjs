/*
  API into a Xipper:

    function cloak(key, cleartext, nextPostInKey)
	  returns {ciphered: "ciphertext", key: nextPosInKey} 

  and to reverse it:

    function decloak(key, cloakedtext, state)   state = {keyp: nextPosInKey};
      return {clear: "cleartext", state: state}
      
  The AES cloaker ignores the 'state'/'nextPosInKey' arguments and returns them unmodified.
      
  The AES cloaker's algorithm to cloak unicode characters is to take the actual
  codepoint value for each unicode character in the string and encrypt it with 
  AES in CTR mode, initialized with the key supplied.  The new codepoint value 
  might or might not be a valid codepoint (it might not be valid because not all 
  integer values are defined in the unicode standard).  Because it might not be
  a valid codepoint, we can't just put out that character.  Moreover, it is 
  likely that a browser might not display all codepoints, so we need to 
  carefully choose the set of characters that will be used for encoding.

  Once the new value is determined, we encode the integer as a set of Unicode
  characters.  A set of 256 unicode characters (representing all values a byte
  can take on) is used to put out byte values, and the UTF-8 encoding scheme is
  used to split values into more than a single byte.
 */
import Codec from './js/Codec.mjs';
import CtrMode from './js/CtrMode.mjs';
import Util from './js/Util.mjs';
import Zip from './js/zipjs/Zip.mjs';
import sjcl from './js/sjcl/sjcl.mjs';

export default class Xipper {
    constructor(options) {
        this.options = Object.assign({spacing:true,charset:"extended"},options);
        this.util = new Util();
        this.codec = new Codec();

        // "coded" contains the set of 256 Unicode chars that are used to
        // encode the key-shifted cleartext.  It is initialized in
        // initEncoding.  DO NOT CHANGE THIS SET OF CHARACTERS!!  If ANY
        // change is made then all cloaked data will become uncloakable!
        this.coded = null;
        let zip = new Zip();
        this.deflate = new zip.deflate();
        this.inflate = new zip.inflate();

        this.initEncoding();
    }
    log(msg) {
        console.log("[aesCloaker: " + msg + "]");
        //TODO: this.xbrowser.logDebug("[aesCloaker: " + msg + "]");
    }
    toList(s) {
        let l = [];
        for (let i = 0; i < s.length; i++) l.push(s.charCodeAt(i));
        return l;
    }
    initEncoding() {
        let tlist = "";
        let ch;

        // DO NOT CHANGE THIS SET OF CHARACTERS!!  If ANY change is
        // made then all cloaked data will become uncloakable!  Also, all
        // of these characters must have a char code >= 128
        switch(this.options.charset) {
            case "scrambls":
                for (ch = 0x0142; ch < 0x01C0; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x0400; ch < 0x0470; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x30B0; ch < 0x30C2; ch++) tlist += String.fromCharCode(ch);
                break;
            case "extended":
                for (ch = 0x0154; ch < 0x0254; ch++) tlist += String.fromCharCode(ch);
                // for (ch = 0x0180; ch < 0x018e; ch++) tlist += String.fromCharCode(ch);
                break;
            case "global":
                for (ch = 0x10a8; ch < 0x10c5; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x0410; ch < 0x044f; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x2c80; ch < 0x2ca9; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x3148; ch < 0x3162; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x0395; ch < 0x03c9; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x1bc00; ch < 0x1ba5; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0x091d; ch < 0x0933; ch++) tlist += String.fromCharCode(ch);
                for (ch = 0xa8aa; ch < 0xa8c1; ch++) tlist += String.fromCharCode(ch);
                break;
        }

        if (tlist.length !== 256) {
            this.log("initDomainRange:  need exactly 256 chars but have " + tlist.length);
        }

        this.coded = this.toList(tlist).sort(function(a, b) {return a - b;});
    }
    /**
     * aesCloak
     */
    cloak(key, clear, kc) {  // returns {ciphered: string, keyp: int}; ciphered contains ciphertext, keyp contains next key position
        let unhexedKey = this.codec.decodeHex(key);
        kc = kc || 0;

        // Encode the cleartext unambiguously into a byte array.
        let byteArray = this.stringToByteArray(clear);

        // Compress the byte array
        let deflater = new this.deflate.Deflater(9);
        deflater.append(byteArray);
        let compressed = deflater.flush();

        // Encrypt the byte array using the given key, and using kc as the IV.
        let cipher = new CtrMode(sjcl.cipher.aes, unhexedKey, kc);
        let ciphertext = cipher.encrypt(compressed);

        // Encode the ciphertext, byte by byte, into the output character set.
        let cloaked = "";
        for (let i = 0; i < ciphertext.length; i++) {
            cloaked += String.fromCharCode(this.coded[ciphertext[i]]);
        }

        // Insert random whitespace for a better appearance.
        if (this.options.spacing) cloaked = this.insertWhitespace(cloaked);

        // Update the external counter/iv variable
        kc += byteArray.length;

        return cloaked;
    }
    /**
     * aesDecloak
     */
    decloak(key, cloaked, state) {  // returns {clear: string, state: state}; clear contains clear text, state contains next key position
        let unhexedKey = this.codec.decodeHex(key);

        state = state || {};
        let kc = state.keyp || 0;

        // Remove any ASCII chars including whitespace.
        // ASCII chars can only be found in the cloaked input if inserted by
        // the website - for example, Facebook may insert '...' into messages;
        // and whitespace may be inserted both by the cloaker and by the website
        let clean = "";
        for (let i = 0; i < cloaked.length; i++) {
            if (this.util.isUnicodeWhitespace(cloaked[i]) ||
                cloaked.charCodeAt(i) < 128) {
                continue;
            }
            clean += cloaked[i];
        }

        // Decode the cleaned-up string into an array of bytes (8-bit integers).
        let byteArray = [];
        for (let i = 0; i < clean.length; i++) {
            let byteIndex = this.util.binsearch(this.coded, clean.charCodeAt(i));
            byteArray.push(byteIndex);
        }

        // Decrypt the byte array using the given key, and using kc as the IV.
        let cipher = new CtrMode(sjcl.cipher.aes, unhexedKey, kc);
        let plaintext = cipher.decrypt(byteArray);

        // Decompress the byte array
        let inflater = new this.inflate.Inflater();
        let decompressed = inflater.append(plaintext);

        // Update the external counter/iv variable
        state.keyp = kc + byteArray.length;

        // Decode the byte array into a Unicode string as understood by Javascript.
        let decoded = this.stringFromByteArray(decompressed);
        return decoded;
    }
    stringToByteArray(string) {
        string = unescape(encodeURIComponent(string));
        let result = [];
        for (let i = 0; i < string.length; i++)
        {
            let charCode = string.charCodeAt(i);
            do
            {
                result.push(charCode & 0xFF);
                charCode >>= 8;
            }
            while (charCode > 0);
        }
        return result;
    }

    stringFromByteArray(array) {
        let result = "";
        for (let i = 0; i < array.length; i++)
        {
            result += String.fromCharCode(array[i]);
        }
        return decodeURIComponent(escape(result));
    }
    /**
     * Insert spaces into text at random intervals to give it a lifelike appearance.
     */
    insertWhitespace(text) {
        let i = 0;
        let last = 0;
        let result = ""
        while (i < text.length) {
            i += Math.floor(Math.random() * 10 + 5);
            result += text.substring(last, i) + " ";
            last = i;
        }
        return result;
    }
    async makeKey(str) {
        if (!str) throw "no pass phrase provided"
        let buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder("utf-8").encode(str));
        return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    }
    testBlock(text) {
        return /@@((\n|\r|.)*?)@@/m.test(text);
    }
    async cloakBlock(phrase,text,quote,endquote) {
        let key = await this.makeKey(phrase)
        quote = quote===''?'':quote||'@@';
        endquote = endquote||quote;
        return text.replace(/@@((\n|\r|.)*?)@@/gm,(block,content)=>{
            return `${quote}${this.cloak(key,content)}${endquote}`;
        })
    }
    async decloakBlock(phrase,text,quote,endquote) {
        let key = await this.makeKey(phrase)
        quote = quote===''?'':quote||'@@';
        endquote = endquote||quote;
        return text.replace(/@@((\n|\r|.)*?)@@/gm,(block,content)=>{
            return `${quote}${this.decloak(key,content)}${endquote}`;
        })
    }
    get store() {
        return {
            get:(name)=>{
                return localStorage.getItem("xipper.store."+name);
            },
            put:(name,value)=>{
                localStorage.setItem("xipper.store."+name,value)
            },
            remove:(name,value)=>{
                localStorage.removeItem("xipper.store."+name,value)
            }
        }
    }
}
