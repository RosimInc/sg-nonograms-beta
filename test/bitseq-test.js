import { BitSeq } from '../js/util/bitseq.js';
import * as idParser from '../js/util/id-parser.js';

//testBitSeq();
testIdParser();
//testXOR();

function testXOR() {
	let bs1 = new BitSeq('1100');
	let bs2 = new BitSeq('1101001011111111111');
	let xor = bs1.getXOR(bs2);
	console.log(xor.get());
	let xor2 = xor.getXOR(bs2);
	console.log(bs1.get())
	console.log(xor2.get())
}

function testBitSeq() {
	let bs = new BitSeq();
	console.log(bs.get());
	bs.appendNum(25, 6);
	console.log(bs.get());
	bs.appendAlpha('F');
	bs.appendAlpha('-');
	console.log(bs.get());
	bs.prepend('101010');
	console.log(bs.get());
	bs.append('11100');
	console.log(bs.get());

	console.log('Reading');

	let reader = bs.getReader();
	console.log(reader.read(6));
	console.log(reader.readNum(2));
	console.log(reader.readNum(4));
	console.log(reader.readAlpha(2));
	console.log(reader.read(5));
}

function testIdParser() {
	let id = idParser.generateId(5, 7, 998, 'h3lL0');
	let {version, numRows, numCols, seed, msg, msgType} = idParser.parseId(id);

	console.log(`id: ${id}`);
	console.log(`version: ${version}`);
	console.log(`numRows: ${numRows}`);
	console.log(`numCols: ${numCols}`);
	console.log(`seed: ${seed}`);
	console.log(`msg: ${msg}`);
	console.log(`msgType: ${msgType}`);
}
