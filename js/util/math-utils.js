export const MAX_HASH = 0x7FFFFFFF;
export const ALPHAS = Array.from("-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
export const ALPHA_TO_NUM = new Map(ALPHAS.map((alpha, index) => [alpha, index]));
export const CHARS = Array.from("� !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~éèêëàâçîïôùûœáíóúñÉÈÊËÀÂÇÎÏÔÙÛŒÁÍÓÚÑ");
export const CHAR_TO_NUM = new Map(CHARS.map((char, index) => [char, index]));
export const BASE64_BITS = 8;

// https://stackoverflow.com/a/29450606
export function getRandomizer(seed) {
    var mask = 0xffffffff;
    var m_w  = (123456789 + seed) & mask;
    var m_z  = (987654321 - seed) & mask;

    return function() {
      m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;

      var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
    }
}

export function hash(vals) {
    // Convert the values to a single number using bitwise operations
    let hash = 0;

    // Mix the values with shifts and XOR
    for (let i = 0; i < vals.length; i++) {
        hash ^= (vals[i] << (i * 5));  // Shift each value by a different number of bits
    }

    // You can apply further mixing here, such as rotating bits or using more XORs
    hash = (hash ^ (hash >>> 16)) * 0x45d9f3b;
    hash = (hash ^ (hash >>> 16)) * 0x45d9f3b;
    hash = hash ^ (hash >>> 16);

    // Final hash as a 31-bit integer
    hash &= MAX_HASH;

    return hash;
}

export function numToAlpha(num) {
	return numToX(ALPHAS, num);
}

export function alphaToNum(alpha) {
	return xToNum(ALPHA_TO_NUM, alpha);
}

export function numToChar(num) {
	return numToX(CHARS, num);
}

export function charToNum(char) {
	return xToNum(CHAR_TO_NUM, char);
}

export function numToX(arr, num) {
	return arr[num < arr.length ? num : 0];
}

export function xToNum(arr, char) {
	return arr.get(char) ?? 0;
}

export function shuffle(arr, seed) {
	const rng = getRandomizer(seed);
	const newArr = [...arr];
	const rngNums = [];
	const len = newArr.length;

	for(let i = 1; i < len; i++)
		rngNums.push(rng());

	for (let i = 1; i < len; i++) {
		const j = Math.floor(rngNums[len - i - 1] * (i + 1));
		[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}

	return newArr;
}

export function unshuffle(arr, seed = 42) {
	const rng = getRandomizer(seed);
	const newArr = [...arr];

	for (let i = newArr.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}
	
	return newArr;
}

export function binaryToBase64(binaryStr) {
	const uint8Array = new Uint8Array(binaryStr.match(/.{1,8}/g).map(b => parseInt(b, 2)));
	return btoa(String.fromCharCode(...uint8Array));
}

export function base64ToBinary(base64Str) {
	const binaryBuffer = atob(base64Str).split("").map(char => char.charCodeAt(0));
	return binaryBuffer.map(byte => byte.toString(2).padStart(BASE64_BITS, "0")).join("");
}
