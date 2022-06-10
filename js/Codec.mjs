export default class Codec {
	constructor() {
		this.B64Chars   = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
			'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E',
			'F', 'G', 'H', 'I',	'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
			'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '@', '$'];
	}
	log(msg) {
		console.log("[codec: " + msg + "]");
		//TODO: xbrowser.logDebug("[codec: " + msg + "]");
	}
	encodeXID(id) {
		if (isNaN(parseInt(id))) return id;
		// format is:  1-byte-length; base-36-dbid-chars, 1-byte-chksum
		let rad = this.toRadix(id, 36);
		let bytes = [rad.length];
		let chk = 0;
		let ss = "";
		let cc;

		for (let i = 0; i < rad.length; i++) {
			cc = rad.charCodeAt(i);
			bytes[i+1] = cc;
			chk = (chk + 43 * cc) % 243;
		}
		bytes[rad.length+1] = chk;

		bytes = this.encodeB64(bytes);
		for (let idx = 0; idx < bytes.length; idx++) {
			ss += bytes[idx];
		}

		return ss;
	}
	decodeXID(xid) {
		// assumes we start after any marker/version chars
		let bytes = this.decodeB64(xid);
		let len   = bytes[0];

		if (len === bytes.length - 2) {
			let rad="", chk=0;
			for (let i = 1; i < bytes.length - 1; i++) {
				let by = bytes[i];
				chk = (chk + 43 * by) % 243;
				rad += String.fromCharCode(by);
			}

			if (chk === bytes[bytes.length - 1]) {  // passes checksum
				return this.fromRadix(rad, 36);
			}
		}
	}
	toRadix(n, radix) {
		if (n) {
			let HexN="", Q=Math.floor(Math.abs(n)), R;
			while (true) {
				R = Q % radix;
				HexN = "0123456789abcdefghijklmnopqrstuvwxyz".charAt(R) + HexN;
				Q=(Q-R)/radix;
				if (Q===0)
					break;
			}
			return ((n < 0) ? "-"+HexN : HexN);
		}
		return "0";
	}
	fromRadix(s,radix) {
		let v = 0;
		for (let i = 0; i < s.length; i++) {
			let c = s.charAt(i);
			let cc = c.charCodeAt();
			if ((c >= '0' && c <= '9'))      v = v * radix + (cc - '0'.charCodeAt());
			else if ((c >= 'a' && c <= 'z')) v = v * radix + (cc - 'a'.charCodeAt() + 10);
		}

		return v;
	}

	encodeB64(bytes, charset) {
		if (!bytes)
			return [];

		let str = [];
		let sidx = 0;

		charset = charset || this.B64Chars;

		if (charset.length !== 64) this.log("encodeB64 called with a charset that isn't exactly 64 chars long!");

		// general:  grab 3 bytes and generate up to 4 chars
		// end case:  (originalByteAry.length % 3) == 0:  we will have multiple of 4 chars (since orig has multiple of 24 bits)
		// end case:  (originalByteAry.length % 3) == 1:  multiple of 24 bits (4 chars) +  8 bits = 1 char + 2bits left over
		// end case:  (originalByteAry.length % 3) == 2:  multiple of 24 bits (4 chars) + 16 bits = 2 char + 4bits left over

		for (let i = 0; i < bytes.length; i++) {
			// at beginning of 3-byte chunk
			let b1 = bytes[i];

			str[sidx++] = charset[b1 & 0x3f];  // always can append 1 char for the 6 bits
			b1 = b1 >>> 6;  // keep top 2 bits

			if (++i < bytes.length) {
				let b2 = bytes[i];

				// take 2 bits from b1 and 4 bits from b2
				str[sidx++] = charset[b1 + ((b2 & 0xf) << 2)];  // keep 4 bits from b2 but shift left by 2
				b2 = b2 >>> 4; // keep top 4 bits

				if (++i < bytes.length) {
					let b3 = bytes[i];

					str[sidx++] = charset[b2 + ((b3 & 0x3) << 4)];
					str[sidx++] = charset[b3 >>> 2];
				}
				else {  // no remaining byte to combine with 4 bits from 2nd byte with
					str[sidx++] = charset[b2];
				}
			}
			else {  // no remaining byte to combine the 2 bits from the first byte with
				str[sidx++] = charset[b1];
			}
		}

		return str;
	}
	decodeB64(str, charset, findFn) {
		if (!str) return [];

		let by  = [];
		let byi = 0;

		charset = charset || this.B64Chars;
		findFn = findFn || this.findChar;

		if (charset.length !== 64) this.log("decodeB64 called with a charset that isn't exactly 64 chars long!");

		// general:  grab 4 chars (each of which is really 6 bits) and pull out 3 bytes (24 bits)
		// end case:  (originalByteAry.length % 3) == 0:  we will have multiple of 4 chars (since orig has multiple of 24 bits)
		// end case:  (originalByteAry.length % 3) == 1:  multiple of 24 bits (4 chars) +  8 bits = 1 char + 2bits left over
		// end case:  (originalByteAry.length % 3) == 2:  multiple of 24 bits (4 chars) + 16 bits = 2 char + 4bits left over

		for (let i = 0, m = str.length; i < m; i++) {
			// at beginning of 4 char chunk
			let b1 = findFn(str.charAt(i));

			if (++i < str.length) {
				let b2 = findFn(str.charAt(i));

				by[byi++] = b1 + ((b2 & 0x3) << 6);

				if (++i < str.length) {
					let b3 = findFn(str.charAt(i));

					by[byi++] = (b2 >>> 2) + ((b3 & 0xf) << 4);

					if (++i < str.length) {
						let b4 = findFn(str.charAt(i));

						by[byi++] = (b3 >>> 4) + (b4 << 2);
					}
					else {
						by[byi++] = b3 >>> 4;
					}
				}
				else {   // only b1 and b2
					by[byi++] = b2 >>> 2;
				}
			}
			else {  // no more chars, so assume 0s for bits
				by[byi++] = b1;
			}
		}

		// possible artifact of decoding is that we have an extra 0 byte that ends it
		// but only if the string didn't have any leftovers
		if (((str.length % 4) !== 0) && (by[by.length - 1] === 0)) {
			by.splice(by.length - 1, 1);
		}

		return by;
	}
	findChar(c) {
		let code = c.charCodeAt();

		if ((c >= 'a') && (c <= 'z')) return code - 'a'.charCodeAt();
		else if ((c >= 'A') && (c <= 'Z')) return (code - 'A'.charCodeAt()) + 26;
		else if ((c >= '0') && (c <= '9')) return (code - '0'.charCodeAt()) + 52;
		else if (c === '@') return 62;
		else if (c === '$') return 63;
		else return 0;
	}
	// Encode the given list of integers into hexadecimal.
	encodeHex(ints) {
		let hex = "";
		for (let i = 0; i < ints.length; i++) {
			let str = ints[i].toString(16).toUpperCase();
			if (str.length % 2 !== 0) {
				str = "0" + str;
			}
			hex += str;
		}
		return hex;
	}
	// Decode the given hexadecimal string into a list of integers.
	decodeHex(hex) {
		let list = [];
		for (let i = 0; i < hex.length; i += 2) {
			list.push((this.dehexChar(hex.charAt(i).toLowerCase()) * 16 +
				this.dehexChar(hex.charAt(i + 1).toLowerCase())));
		}
		return list;
	}

	// Decode the given hexadecimal char into an integer.
	dehexChar(ch) {
		const hex0 = '0'.charCodeAt(0);
		const hex9 = '9'.charCodeAt(0);
		const hexA = 'a'.charCodeAt(0);
		const hexF = 'f'.charCodeAt(0);

		ch = ch.charCodeAt(0);
		if ((hex0 <= ch) && (ch <= hex9)) return (ch - hex0);
		if ((hexA <= ch) && (ch <= hexF)) return (ch - hexA + 10);
	}
}

