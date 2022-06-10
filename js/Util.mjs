/**
 * coding/decoding functionality
 */
export default class Util {
	constructor() {
	}
	log(msg) {
		console.log(msg);
	}
	/**
	 * returns true if the given testVersion is later than the
	 * hardcoded current plugin version.
	 */
	isLaterVersion(testVersion) {
		let cver = this.xconfig.pluginVersion.split(".");
		let nver = testVersion.split(".");

		if (parseInt(cver[0]) > parseInt(nver[0])) return false;
		if (parseInt(cver[1]) > parseInt(nver[1])) return false;
		return parseInt(cver[2]) < parseInt(nver[2]);
	}
	/**
	 * performs a binary search on the supplied array looking for the given
	 * item as a value in the array.  If the item exists in the array, then
	 * its 0-based index is returned, -1 is returned otherwise.
	 *
	 * The given array must be already in sorted order.
	 */
	binsearch(ary, itm) {
		let l = 0, u = ary.length, m;
		while (l < u) {
			if (itm > ary[ (m = ((l+u) >> 1)) ]) l = m+1;
			else u = (itm === ary[m]) ? -2 : m;
		}
		return (u === -2) ? m : -1;
	}
	hasUnicode(text) {
		for (let i = 0; i < text.length; i++) {
			if (text.charCodeAt(i) > 127) {
				return true;
			}
		}
		return false;
	}
	/**
	 * Checks a given class attribute for the presence of a given class
	 *
	 * @author  Dan Delaney     http://fluidmind.org/
	 * @param   element         DOM Element object (or element ID) to remove the class from
	 * @param   nameOfClass     The name of the CSS class to check for
	 */
	checkForClass(element, nameOfClass) {
		if (typeof element == 'string') { element = document.getElementById(element); }

		if (element.className === '') {
			return false;
		} else {
			return new RegExp('\\b' + nameOfClass + '\\b').test(element.className);
		}
	}
	/**
	 * Adds a class to an element's class attribute
	 *
	 * @author  Dan Delaney     http://fluidmind.org/
	 * @param   element         DOM Element object (or element ID) to add the class to
	 * @param   nameOfClass     Class name to add
	 * @see     checkForClass
	 */
	addClass(element, nameOfClass) {
		if (typeof element == 'string') { element = document.getElementById(element); }

		if (!this.checkForClass(element, nameOfClass)) {
			element.className += (element.className ? ' ' : '') + nameOfClass;
			return true;
		} else {
			return false;
		}
	}
	/**
	 * Removes a class from an element's class attribute
	 *
	 * @author  Dan Delaney     http://fluidmind.org/
	 * @param   element         DOM Element object (or element ID) to remove the class from
	 * @param   nameOfClass     Class name to remove
	 * @see     checkForClass
	 */
	removeClass(element, nameOfClass) {
		if (typeof element == 'string') { element = document.getElementById(element); }

		if (this.checkForClass(element, nameOfClass)) {
			element.className = element.className.replace(
				(element.className.indexOf(' ' + nameOfClass) >= 0 ? ' ' + nameOfClass : nameOfClass),
				'');
			return true;
		} else {
			return false;
		}
	}
	addCookie(document, name, value) {
		let cook = name + "=" + value;
		cook = cook + "; path=/;Domain=" + this.xconfig.cookieDomain;
		document.cookie = cook;
	}
	deleteCookie(document, name) {
		document.cookie = name + "=none; max-age=0; path=/";
	}
	getCookie(document, cookieName) {
		let i, x, y, ARRcookies = document.cookie.split(";");

		for (i = 0; i < ARRcookies.length; i++) {
			x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
			y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g, "");

			if (x === cookieName) {
				return unescape(y);
			}
		}
	}
	isAsciiWhitespace(c) {
		return " \t\n".indexOf(String.fromCharCode(c)) !== -1;
	}

	isUnicodeWhitespace(c) {
		// we really need to include U+2028 and U+2029 but Firefox complains about unterminated string literal
		// if they're really there and not just \u2028 form (and the google closure compiler puts out
		// the actual utf8 encoding...)
		return " \t\n\u00A0".indexOf(String.fromCharCode(c)) !== -1;
	}

	isValidAuthToken(ata) {
		return (ata !== undefined) && (ata !== "badvalue") && (ata !== "");
	}

	makeCanonicalHostname(hostname) {
		if (hostname.toLowerCase().indexOf("www.") === 0) hostname = hostname.substring(4);  // 4 == "www.".length()
		return hostname;
	}
}
