/** @fileOverview CTR mode implementation for sjcl block ciphers.
 *
 * @author Leo Dorrendorf
 */

/**
 * This class is stateful because it represents a cipher chaining mode. It has to be created anew for each separate operation. 
 * Unlike the sjcl ciphers, it operates directly on byte arrays (8-bit integers).
 *
 * @constructor
 * @param {object} cipher A cipher class with the sjcl cipher interface: constructor taking a key, an encrypt() and a decrypt() function.
 * @param {Array} key The encryption key as an array of bytes (8-bit integers).
 * @param {int} iv The IV as a 32-bit integer OR as an array of bytes (8-bit integers). Optional and defaults to all-zeroes.
 *
 * @class CTR mode for sjcl ciphers.
 */
export default class CtrMode {
    constructor(cipher, key, iv) {
        this._cipher = new cipher(this._bytesToDwords(key));
        this._blocksize = 16;

        // Default IV
        this._iv = [0,0,0,0];

        // IV passed as an array?
        if (typeof(iv) === typeof([])) {
            this._iv = this._bytesToDwords(iv);
        }

        // IV passed as an integer?
        if (typeof(iv) === typeof(0)) {
            this._iv = [iv, 0, 0, 0];
        }
    }
    /**
     * Encrypt a string.
     * @param {String} data The plaintext as an array of bytes (8-bit integers).
     * @return {Array} The ciphertext as an array of bytes (8-bit integers).
     */
    encrypt(data) {
        let result = [];

        for (let i = 0; i < data.length; i += this._blocksize) {
            let plaintext = data.slice(i, i+this._blocksize);
            let pad = this._getNextPad();

            for (let j = 0; j < plaintext.length; j++)
            {
                let ciphertext = plaintext[j] ^ pad[j];
                result.push(ciphertext);
            }
        }

        return result;
    }
    /**
     * Decrypt an array of 4 big-endian words (16 bytes).
     * @param {Array} data The ciphertext as an array of bytes (8-bit integers).
     * @return {Array} The plaintext as an array of bytes (8-bit integers).
     */
    decrypt(data) {
        return this.encrypt(data);
    }
    /**
     * Returns the next cipher output (XOR pad) used to encrypt/decrypt content.
     * @return {Array} An array of bytes (8-bit integers) the length of the cipher's block.
     */
    _getNextPad() {
        // Get the next pad from the cipher output, as four 32-bit integers.
        let iv = this._getNextIV()
        let padIntList = this._cipher.encrypt(iv);

        // Return them as an array of 8-bit integers.
        return this._dwordsToBytes(padIntList);
    }
    /**
     * Returns the next nonce, used as input to the cipher's encryption function.
     * The nonce is the IV + N, where N is the invocation number for this function and starts at 1.
     * @return {Array} An array of four 32-bit integers.
     */
    _getNextIV() {
        // Cycle the IV and return it.
        // Note that the IV is a group of four 32-bit integers.
        for (let i = 0; i < 4; i++) {
            this._iv[i]++;
            if (this._iv[i] > 0xFFFFFFFF) this._iv[i] = 0;
            else break;
        }

        return this._iv;
    }
    /**
     * Helper function
     * @param {Array} byteArray An array of bytes (8-bit integers).
     * @return {Array} The An array of dwords (32-bit integers).
     */
    _bytesToDwords(byteArray) {
        let result = [];
        for (let i = 0; i < byteArray.length; i += 4) {
            let intValue = 0;
            for (let j = 0; j < 4; j++) {
                let shift = j * 8;
                intValue += (byteArray[i + j] << shift);
                if (j === 3) result.push(intValue);
            }
        }
        return result;
    }
    /**
     * Helper function
     * @param {Array} intArray An array of dwords (32-bit integers)
     * @return {Array} An array of bytes (8-bit integers).
     */
    _dwordsToBytes(intArray) {
        let result = [];
        for (let i = 0; i < intArray.length; i++) {
            let mask = 0xFF;
            let shift = 0;
            for (let j = 0; j < 4; j++) {
                let byteValue = (intArray[i] & mask) >>> shift;
                result.push(byteValue);
                mask <<= 8;
                shift += 8;
            }
        }
        return result;
    }
}
