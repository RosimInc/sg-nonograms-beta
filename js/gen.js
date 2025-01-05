import * as nono from './util/nono-utils.js';
import * as idParser from './util/id-parser.js';

const args = process.argv.slice(2);

const numRows = parseInt(args[0], 10);
const numCols = parseInt(args[1], 10);
const msg = args[2];
const msgType = args[3] || 0;

const id = nono.generateNonogram(numRows, numCols, msg, msgType);

const infos = idParser.parseId(id);
const [horHints, verHints] = nono.getPuzzle(infos.numRows, infos.numCols, infos.seed);
const grid = nono.solveNonogram(horHints, verHints);
const dec = nono.decryptWithGrid(infos.enc, infos.msgType, grid);

nono.displayGrid(grid);

console.log(`Message: '${dec}'`);
console.log(`ID: ${id}`);
console.log(`Link: ${nono.getPageURL(id)}`);