import { BitSeq, NUM_ALPHA_BITS } from './bitseq.js';

const VERSION = 1;

export function parseId(id) {
	const reader = new BitSeq().appendAlphas(id).getUnshuffled().getReader();
	const version = 1 + reader.readNum(6);

	let numRows = '';
	let numCols = '';
	let seed = '';
	let msgType = '';
	let enc = null;

	switch(version) {
		case 1:
			let gap = reader.readNum(3);
			reader.readNum(gap);
			numRows = reader.readNum(5) + 4; // 4-35
			numCols = reader.readNum(5) + 4; // 4-35
			seed = reader.readNum(31);
			msgType = reader.readNum(1);
			enc = new BitSeq(reader.read());
			break;
		default:
	}
    
	return { version, numRows, numCols, seed, msgType, enc };
}

export function generateId(numRows, numCols, seed, enc, msgType = 0, version = VERSION) {
	let bitSeq = new BitSeq();
	bitSeq.appendNum(version - 1, 6);

	switch(version) {
		case 1: 
			const len = 6 + 3 + 5 + 5 + 31 + 1 + enc.length();
			const gap = (NUM_ALPHA_BITS - len % NUM_ALPHA_BITS) % NUM_ALPHA_BITS;
			
			bitSeq.appendNum(gap, 3);
			bitSeq.appendNum(0, gap);
			bitSeq.appendNum(numRows - 4, 5);
			bitSeq.appendNum(numCols - 4, 5);
			bitSeq.appendNum(seed, 31);
			bitSeq.appendNum(msgType, 1);
			bitSeq.append(enc.get());
			break;
		default:
	}

	return bitSeq.getShuffled().toAlphas();
}
