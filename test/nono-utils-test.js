import * as nono from '../js/util/nono-utils.js';
import * as mathUtils from '../js/util/math-utils.js';

testState();
//testSolve1();
//testSolve2();

function testState() {
    const rng = mathUtils.getRandomizer(72);
    const numRows = 5;
    const numCols = 8;
    let grid1 = nono.getEmptyGrid(numRows, numCols);
    for(let row = 0; row < numRows; row++)
        for(let col = 0; col < numCols; col++)
            grid1[row][col] = Math.floor(rng() * 3);
    
    nono.displayGrid(grid1);

    const encoded = nono.encodeGridState(grid1);
    console.log('Encoded: ' + encoded);

    let grid2 = nono.getEmptyGrid(numRows, numCols);
    nono.decodeGridState(grid2, encoded);

    nono.displayGrid(grid2);

}

function testSolve1() {
    let horHints = [
        [2,2],
        [4,4],
        [1,2,2],
        [5,2,1],
        [1,2,4],
        [4,1,1],
        [1,1,3],
        [5,1],
    ];

    let verHints = [
        [6],
        [2,1,1,1],
        [2,5],
        [5,1],
        [3,1],
        [1],
        [1,5],
        [2,2,1],
        [3,3],
        [3]
    ];

    nono.solveNonogram(horHints, verHints);
}

function testSolve2() {
    let horHints = [
        [1],
        [1,2],
        [1],
        [5]
    ];

    let verHints = [
        [1,1],
        [1,1],
        [1],
        [1,1],
        [3]
    ];

    nono.solveNonogram(horHints, verHints);
}