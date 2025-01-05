import * as mathUtils from './math-utils.js';

const SHUFFLE_SEED = 679389209;
export const NUM_ALPHA_BITS = 6;
export const NUM_CHAR_BITS = 8;

export class BitSeq {
    constructor(bits = '') {
        this.bits = bits;
    }

    append(str) {
        this.bits += str;
        return this;
    }

    appendNum(num, numBits = null) {
        let binary = num.toString(2);
        if (numBits) {
            binary = binary.padStart(numBits, '0');
        }
        return this.append(binary);
    }

    appendAlphas(alphas) {
        for(let c of alphas)
            this.appendNum(mathUtils.alphaToNum(c), NUM_ALPHA_BITS);
        return this;
    }

    appendChars(chars) {
        for(let c of chars)
            this.appendNum(mathUtils.charToNum(c), NUM_CHAR_BITS);
        return this;
    }

    fillToMultiple(num) {
        const len = this.length();
        const gap = (num - len % num) % num;
		this.appendNum(0, gap);
        return this;
    }

    getReader() {
        return new BitSeqReader(this.bits);
    }

    toAlphas() {
        return this.getReader().readAlphas();
    }

    toChars() {
        return this.getReader().readChars();
    }

    get() {
        return this.bits;
    }

    length() {
        return this.bits.length;
    }

    getXOR(cipher) {
        let myLen = this.length();
        let oLen = cipher.length();
        let max = Math.max(myLen, oLen);

        let arr = this.get().split("");
        let oBits = cipher.get();

        for(let i = 0; i < max; i++)
            arr[i % myLen] = (arr[i % myLen] == oBits.charAt(i % oLen) ? '0' : '1');

        return new BitSeq(arr.join(""));
    }

    getShuffled() {
        let arr = this.bits.split("");
        let newArr = mathUtils.shuffle(arr, SHUFFLE_SEED);
        return new BitSeq(newArr.join(""));
    }

    getUnshuffled() {
        let arr = this.bits.split("");
        let newArr = mathUtils.unshuffle(arr, SHUFFLE_SEED);
        return new BitSeq(newArr.join(""));
    }
}

class BitSeqReader {
    constructor(bits = '') {
        this.bits = bits;
        this.ptr = 0;
    }

    read(numBits) {
        if(numBits === 0) return '';

        let bitsLeft = this.left();
        if(numBits == undefined || numBits == null || numBits > bitsLeft) numBits = bitsLeft;

        const str = this.bits.substring(this.ptr, this.ptr + numBits);
        this.ptr += numBits;
        return str;
    }

    readNum(numBits) {
        return numBits === 0 ? 0 : parseInt(this.read(numBits), 2);
    }

    readAlphas(numChars) {
        if(numChars === 0) return '';

        let charsLeft = Math.floor(this.left() / NUM_ALPHA_BITS);
        if(numChars === undefined || numChars === null  || numChars > charsLeft) numChars = charsLeft;

        let str = '';
        for(let i = 0; i < numChars; i++) {
            str += mathUtils.numToAlpha(this.readNum(NUM_ALPHA_BITS));
        }
        return str;
    }

    readChars(numChars) {
        if(numChars === 0) return '';

        let charsLeft = Math.floor(this.left() / NUM_CHAR_BITS);
        if(numChars === undefined || numChars === null || numChars > charsLeft) numChars = charsLeft;

        let str = '';
        for(let i = 0; i < numChars; i++) {
            str += mathUtils.numToChar(this.readNum(NUM_CHAR_BITS));
        }
        return str;
    }

    left() {
        return this.bits.length - this.ptr;
    }
}
