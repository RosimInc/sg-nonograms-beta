import * as mathUtils from './math-utils.js';
import * as idParser from './id-parser.js';
import { BitSeq } from './bitseq.js';

const PAGE_URL = `https://rosiminc.github.io/sg-nonograms/`;
const SG_URL = `https://www.steamgifts.com/`;

export function solveNonogram(horHints, verHints) {
    let numRows = horHints.length;
    let numCols = verHints.length;
    let grid = getEmptyGrid(numRows, numCols);

    let analysis = getAnalysisStruct(grid, [{hints: horHints, len: numCols}, {hints: verHints, len: numRows}]);
    
    findInitialPossibilities(analysis);

    let turn = 0;
    let insights = [0];
    while(insights.length > 0) {
        let dirAnalysis = analysis[turn % 2];
        
        if(turn > 0) {
            applyInsights(insights, grid, dirAnalysis); // Reduce possibilities
        }

        insights = getInsights(dirAnalysis); // Discover insights

        turn++;
    }

    return hasUniqueSolution(analysis) ? grid : null;
}

function hasUniqueSolution(analysis) {
    for(let dirAnalysis of analysis)
        for(let line of dirAnalysis.lines)
            if(line.possibilities.length > 1)
                return false;
    return true;
}

function applyInsights(insights, grid, analysis) {
    if(insights == null) return;

    for(let i of insights) {
        let row = i.line * analysis.dir + i.pos * (1 - analysis.dir);
        let col = i.line * (1 - analysis.dir) + i.pos * analysis.dir;
        grid[row][col] = i.val;

        let line = analysis.lines[i.pos];
        line.possibilities = reducePossibilities(line.possibilities, i);
    }
}

// Removes all possibilities that contradict the insight
function reducePossibilities(possibilities, insight) {
    if(possibilities.length == 1)
        return possibilities;
    
    let newPoss = [];
    for(let possibility of possibilities) {
        if(possibility[insight.line] == (2-insight.val))
            newPoss.push(possibility);
    }
    
    return newPoss;
}

function getInsights(analysis) {
    let insights = [];
    const numLines = analysis.lines.length;
    for(let i = 0; i < numLines; i++) {
        let line = analysis.lines[i];
        for(let pos of findCommonalities(line)) {
            insights.push({line: i, pos, val: line.possibilities[0][pos] == '1' ? 1 : 2});
        }
    }

    return insights;
}

function findCommonalities(line) {
    if (line.possibilities.length === 0) return [];

    const gridLine = line.get();
    const len = gridLine.length;
    const skipCheck = (line.possibilities.length) === 1;
    const result = [];

    for (let i = 0; i < len; i++) {
        if (gridLine[i] == 0) {
            if(skipCheck) {
                result.push(i);
            } else {
                const value = line.possibilities[0][i];
                if (gridLine[i] == 0 && line.possibilities.every(str => str[i] === value)) {
                    result.push(i);
                }
            }
        }
    }

    return result;
}

function getGridLine(grid, direction, index) {
    return function() {
        if (direction == 0) { // Horizontal
            return grid[index];
        } else if (direction == 1) { // Vertical
            return grid.map(row => row[index]);
        }
    };
}

function getAnalysisStruct(grid, params) {
    let analysisStruct = [];
    for(let dir in params) {
        let dirParams = params[dir];
        let obj = {dir: dir, lineLen: dirParams.len, lines: []};
        for(let i = 0; i < dirParams.hints.length; i++) {
            obj.lines.push({index: i, hints: dirParams.hints[i],
                get: getGridLine(grid, dir, i)});
        }
        analysisStruct.push(obj);
    }
    return analysisStruct;
}

function findInitialPossibilities(analysis) {
    for(let dirAnalysis of analysis) {
        for(let line of dirAnalysis.lines) {
            line.possibilities = listLinePossibilities(line.hints, dirAnalysis.lineLen);
        }
    }
}

function listLinePossibilities(hints, len) {
    let possibilities = [];

    let sum = hints.reduce((sum, value) => sum + value, 0);
    let numHints = hints.length;
    let numSpacesToPut = len - sum - hints.length + 1;

    for(let permutation of listPossibilities(numHints + 1, numSpacesToPut)) {
        let pos = 0;
        let arr = Array(len).fill(0);
        for(let i = 0; i < numHints; i++) {
            pos += permutation[i];
            for(let j = 0; j < hints[i]; j++) {
                arr[pos + j] = 1;
            }
            pos += hints[i] + 1;
        }
        possibilities.push(arr.join(''));
    }

    return possibilities;
}

function listPossibilities(numSpots, numFillers, current = [], results = []) {
    if(numSpots <= 0)
        return [];

    if(numSpots == 1) {
        results.push([...current, numFillers]);
        return [[numFillers]];
    }
    
    if(numFillers == 0) {
        const arr = Array(numSpots).fill(0);
        results.push(current.concat(arr));
        return [arr];
    }
    
    for (let i = 0; i <= numFillers; i++) {
        listPossibilities(numSpots - 1, numFillers - i, [...current, i], results);
    }
    
    return results;
}

function getGridBinary(grid) {
    let bitSeq = new BitSeq();

    for(let row = 0; row < grid.length; row++)
        for(let col = 0; col < grid[0].length; col++)
            bitSeq.append(grid[row][col] == 1 ? '1' : '0');

    return bitSeq;
}

export function decryptWithGrid(enc, msgType, grid) {
    let gridSeq = getGridBinary(grid);
    let decSeq = enc.getXOR(gridSeq);
    return msgType == 0 ? decSeq.toChars() : decSeq.toAlphas();
}

export function getPuzzle(numRows, numCols, seed) {
    const grid = generateGrid(numRows, numCols, seed);
    return generateHints(grid);
}

export function generateNonogram(numRows, numCols, message, msgType) {
    let seed;
    if(message) {
        seed = mathUtils.hash(message.split("").map(v => mathUtils.charToNum(v)));
    } else {
        message = 'Well done!';
        seed = Math.floor(Math.random() * 100000000);
    }
    
    let solved = false;
    let grid;

    while(!solved) {
        grid = generateGrid(numRows, numCols, seed);
        let hints = generateHints(grid);
        solved = solveNonogram(hints[0], hints[1])
        
        if(!solved)
            seed++;
    }

    const toEncrypt = new BitSeq();
    if(msgType == 0)
        toEncrypt.appendChars(message);
    else
        toEncrypt.appendAlphas(message);
    const cipher = getGridBinary(grid);

    const enc = toEncrypt.getXOR(cipher);

    return idParser.generateId(numRows, numCols, seed, enc, msgType);
}

function generateHints(grid) {
    let numRows = grid.length;
    let numCols = grid[0].length;
    let horHints = [];
    let verHints = [];

    for(let row = 0; row < numRows; row++) {
        let hints = [];

        let count = 0;
        for(let col = 0; col <= numCols; col++) {
            if(col == numCols || grid[row][col] != 1) {
                if(count > 0) {
                    hints.push(count);
                    count = 0;
                }
            } else {
                count++;
            }
        }
        horHints.push(hints);
    }

    for(let col = 0; col < numCols; col++) {
        let hints = [];

        let count = 0;
        for(let row = 0; row <= numRows; row++) {
            if(row == numRows || grid[row][col] != 1) {
                if(count > 0) {
                    hints.push(count);
                    count = 0;
                }
            } else {
                count++;
            }
        }
        verHints.push(hints);
    }

    return [horHints, verHints];
}

export function generateGrid(numRows, numCols, seed) {
    const rd = mathUtils.getRandomizer(seed);

    const ratio = 0.4 + 0.4 * rd(); // 40% to 80%
    const totalCells = numRows * numCols;
    const numOnes = Math.round(totalCells * ratio);
    const numZeros = totalCells - numOnes;

    const cells = Array(numOnes).fill(1).concat(Array(numZeros).fill(0));

    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(rd() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const grid = [];
    for (let i = 0; i < numRows; i++) {
        grid.push(cells.slice(i * numCols, (i + 1) * numCols));
    }

    return grid;
}

export function getEmptyGrid(numRows, numCols) {
    return Array.from({ length: numRows }, () => Array(numCols).fill(0));
}

export function encodeGameState(grid, gridHorHints, gridVerHints) {
    const numRows = grid.length;
    const numCols = grid[0].length;

    let bitSeq = new BitSeq();
    for(let row = 0; row < numRows; row++)
        for(let col = 0; col < numCols; col++)
            bitSeq.appendNum(grid[row][col], 2);

    for(let row of gridHorHints)
        for(let num of row)
            bitSeq.appendNum(num, 1);

    for(let col of gridVerHints)
        for(let num of col)
            bitSeq.appendNum(num, 1);

    bitSeq.fillToMultiple(mathUtils.BASE64_BITS);

    return mathUtils.binaryToBase64(bitSeq.get());
}

export function decodeGameState(grid, gridHorHints, gridVerHints, encodedState) {
    const b = new BitSeq(mathUtils.base64ToBinary(encodedState));
    const reader = new BitSeq(mathUtils.base64ToBinary(encodedState)).getReader();

    const numRows = grid.length;
    const numCols = grid[0].length;
    
    for(let row = 0; row < numRows; row++)
        for(let col = 0; col < numCols; col++)
            grid[row][col] = reader.readNum(2);
        
    for(let row of gridHorHints)
        for(let num in row)
            row[num] = reader.readNum(1);

    for(let col of gridVerHints)
        for(let num in col)
            col[num] = reader.readNum(1);
}

export function displayGrid(grid) {
    if(!grid) return;
    const numRows = grid.length;
    const numCols = grid[0].length;
    let str = '';
    for(let row = 0; row < numRows; row++) {
        for(let col = 0; col < numCols; col++) {
            let val = grid[row][col];
            str += val == 0 ? '  ' : val == 1 ? ' X' : ' .';
        }
        str += '\n';
    }
    console.log(str);
}

export function getPageURL(id) {
    let link = PAGE_URL;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        link = "http://127.0.0.1:8080/";
    }
    return `${link}?id=${id}`;
}

export function getSteamGiftsURL(code) {
    return `${SG_URL}giveaway/${code}/`;
}
