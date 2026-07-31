/*all variables and states*/
//; //board
let map = [
    [8, 1, 2, 3, 7, 4, 5, 6, 9],
    [9, 4, 3, 6, 2, 5, 1, 7, 8],
    [5, 7, 6, 8, 9, 1, 2, 4, 3],
    [1, 5, 4, 2, 3, 7, 8, 9, 6],
    [3, 6, 8, 4, 5, 9, 7, 1, 2],
    [7, 2, 9, 1, 6, 8, 4, 3, 5],
    [2, 3, 1, 7, 8, 6, 9, 5, 4],
    [4, 8, 5, 9, 1, 3, 6, 2, 7],
    [6, 9, 7, 5, 4, 2, 3, 8, 1]
];
let allEmptycells = 0;
//pre-seeded to avoid re render overhead
let workable = []; //visited/workable/empty
const rows = 9;
const cols = 9;
const PROB = 0.75;
//hold valid cells
const validCellList = []; //store usbale for each cell
// 


/**
 * ====== DOM REFERENCES ======
 */
let empty = document.getElementById('emptyCount');
let logs = document.getElementById('logsDisplay');
let solved = document.getElementById('solvedCount');
let pboards = document.getElementById('backtrackCount');
let currentCell = document.getElementById('currentCell');


let progressTable = document.querySelector('#statusTable #progressBody');
// 
//delay controls



/**all initialzations and set up in order */
//1. zerofy----mark the board and vsited to default

//mark workable with alld efault
function zerofy() {
    console.log("Working ");
    for (let i = 0; i < rows; i++) {
        //map.push([]);//if map was empty we would do this
        workable.push([]);
        for (let j = 0; j < cols; j++) {
            //map[i][j] = 0;
            workable[i][j] = false;
        }
    }
    console.log("Finished Working ");
}

//2. mark empyt and full in workbale
function markWorkable() {
    for (let i = 0; i < rows; i++) {
        //workable.push([]);
        for (let j = 0; j < cols; j++) {
            //empty
            if (map[i][j] == 0) {
                //allEmptycells++;
                workable[i][j] = true;
            } else {
                workable[i][j] = false;
            }
        }
    }
}

//3.delete random from map
//mapify
function deleteRandom() {
    allEmptycells = 0;
    let choice = Math.floor(Math.random() * 2); //add some bad with good boards dynamically
    if (choice === 1) {
        //good board just delete any number--cant have duplicates
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < Math.floor(cols * PROB); j++) {
                //set random to empty
                map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = 0;
                allEmptycells++;
            }
        }
    } else {
        //replace numbers may have duplicates
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < Math.floor(cols * PROB); j++) {
                //set random to empty
                map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = 0;
                map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = Math.floor(Math.random() * 10);
                allEmptycells++;
            }
        }
    }
}



//empty count 
function getEmptyCount() {
    let count = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = onabort; j < cols; j++) {
            if (map[i][j] === 0) {
                count++;
            }
        }
    }
    allEmptycells = count;
}


/**displays and debugging */
//prints
function display() {
    //for (let i = 0; i < map.length; i++) {
    console.log(map);
    //}
}

function displayWork() {
    console.log(workable);
}



/**validiy checks and all row col box */
//checks for duplicat
//here we check if the current number already exists or is a duplicate
function rowValid(row, col, number) {
    let rowValid = true;
    //row
    for (col = 0; col < rows; col++) {
        if (map[row][col] === number) {
            rowValid = false;
            break;
        }
    }
    return rowValid;
}

function colValid(row, col, number) {
    let colValid = true;
    //column
    for (row = 0; row < cols; row++) {
        if (map[row][col] == number) {
            colValid = false;
            break;
        }
    }
    return colValid;
}

function ZoneValid(row, col, number) {
    let zoneValid = true;
    let zoneSize = 3;
    //(int)Math.sqrt(map.length);
    //boundary cecks and guard
    if (row < 3 && col < 3) {
        row = 0;
        col = 0;
    } else if ((row < 3 && (col >= 3 && col < 6))) {
        row = 0;
        col = 3;
    } else if (row < 3 && (col >= 6 && col < 9)) {
        row = 0;
        col = 6;
    } else if (row >= 3 && row < 6 && col < 3) {
        row = 3;
        col = 0;
    } else if (row >= 3 && row < 6 && col >= 3 && col < 6) {
        row = 3;
        col = 3;
    } else if (row >= 3 && row < 6 && col >= 6 && col < 9) {
        row = 3;
        col = 6;
    } else if (row >= 6 && row < 9 && col < 3) {
        row = 6;
        col = 0;
    } else if (row >= 6 && row < 9 && col >= 3 && col < 6) {
        row = 6;
        col = 3;
    } else if (row >= 6 && row < 9 && col >= 6 && col < 9) {
        row = 6;
        col = 6;
    }
    //actaul loops
    for (let m = row; m < row + zoneSize; m++) {
        for (let n = col; n < col + zoneSize; n++) {
            //System.out.println(m + " " + n);
            if (map[m][n] === number) {
                //System.out.println(m + " " + n);
                zoneValid = false;
                break;
            }
        }
    }
    return zoneValid;
}

//combine validity check
function isValid(row, col, number) {
    return (rowValid(row, col, number) && colValid(row, col, number) && ZoneValid(row, col, number));
}


/**Actual implementation */

async function sodoku() {
    //zerofy();
    //deleteRandom();
    //markWorkable()
    // deleteRandom();

    //anaime
    let emptycells = allEmptycells; //should get true empty value from the delete rand function
    console.log(allEmptycells);
    let solvedcells = 0;
    let pboard = 0;

    let cellList = 0;
    let compute = true;
    //let num;

    outer:
        for (let i = 0; i < rows && i >= 0; i++) {
            for (let j = 0; j < cols;) {


                LOG(`Scanning cell (${i},${j})`);

                currentCell.innerText = `[${i},${j}]`;
                pboards.innerText = `${pboard}`;
                empty.innerText = `${emptycells}`;
                solved.innerText = `${solvedcells}`;


                //get cell--any cell
                let cell = document.getElementById(`${i}-${j}`);

                //clear previous scans
                let list = Array.from(document.querySelectorAll('.cell'));

                for (let c = 0; c < list.length; c++) {
                    list[c].classList.remove('scan');
                }
                //scan
                if (cell) {
                    cell.classList.add('scan');
                    //await sleep here to avoid insta magic
                    await sleep(10);
                }


                if (workable[i][j]) {


                    for (let m = 0; m < list.length; m++) {
                        list[m].classList.remove('empty-cell');
                    }
                    //damn here working found so we remove the scan colour it yellow and solve it 
                    if (cell) {
                        cell.classList.remove('scan');
                        cell.classList.add('empty-cell');
                        await sleep(10);
                    }

                    //console.log("in loop");
                    if (compute) {
                        LOG("Computing list");
                        validCellList.push([]);

                        createEmptyTableRow(i, j);
                        await sleep(10);


                        for (let num = 1; num <= rows; num++) {
                            if (isValid(i, j, num)) {
                                validCellList[cellList].push(num);

                                addNumToTable(i, j, num);

                                await sleep(10);
                            }
                        }
                        LOG(validCellList[cellList]);
                    }
                    const current = validCellList[cellList];
                    LOG("List empty : " + (current.length === 0));
                    if (current.length > 0) {
                        LOG("Processing  cell (" + i + "," + j + ")" + " with list " + cellList);

                        let chosen = current[0];

                        map[i][j] = chosen;


                        removeNumFromTable(i, j, chosen);

                        await sleep(10);


                        cell.innerText = chosen;
                        cell.classList.add("solved");

                        current.shift();
                        cellList++;
                        compute = true;


                        empty.innerText = `
                         ${ emptycells-- }
                         `;
                        solved.innerText = `
                         ${ solvedcells++ }
                         `;

                    } else {
                        LOG("Stuck at (" + i + "," + j + ")");
                        validCellList.pop();

                        removeRow(i, j);
                        //document.getElementById(getRowId(i, j)).classList.add('scan');
                        await sleep(10);
                        cell.classList.remove("solved");


                        cellList--;
                        compute = false;

                        pboards.innerText = `
                         ${ pboard++ }
                         `;
                        solved.innerText = `
                         ${ emptycells++ }
                         `;
                        solved.innerText = `
                         ${ solvedcells-- }
                         `;
                        LOG("Going back to  cell (" + i + "," + j + ")" + " with list " + cellList);
                    }
                    //console.log("List length", validCellList.length);
                    if (validCellList.length >= 0) { //why we remove always//.pop() side effect
                        const firstCell = getFirstCellValid();
                        const r = firstCell[0];
                        const c = firstCell[1];
                        if (cellList < 0 || (validCellList[0].length === 0 && map[r][c] === 0)) {
                            console.log("No solution");
                            LOG("No solution");
                            break outer;
                        }
                    }
                }
                if (compute) {
                    j++;
                } else {
                    j--;
                    if (j < 0) {
                        j = map.length - 1;
                        if (i > 0) {
                            i--;
                        }
                    }
                    if (workable[i][j]) {
                        map[i][j] = 0;
                        //update map too
                        document.getElementById(`${i}-${j}`).innerText = '0';
                        document.getElementById(`${i}-${j}`).classList.remove("solved");
                        await sleep(10);
                    }
                }
            }
        }
}

/**helper functions and utilities */

function getFirstCellValid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (workable[i][j] === true) {
                return [i,
                    j
                ];
            }
        }
    }
    return null;
}

/*Animations rlated quiclks*/

function removeRow(i, j) {
    let row = document.getElementById(getRowId(i, j));
    if (row) row.remove();
}


function removeNumFromTable(i, j, num) {
    let span = document.getElementById(getNumId(i, j, num));
    if (span) {
        //span.classList.add("removed");
        setTimeout(() => {
            span.remove();
        }, 200);
    }
}


function getRowId(i, j) {
    return `row-${i}-${j}`;
}

function getNumId(i, j, num) {
    return `${num}-${i}-${j}-${num}`;
}

function createEmptyTableRow(i, j) {
    //creates an empty row
    //animations
    let currentRow = document.createElement('tr');
    currentRow.id = getRowId(i, j);
    currentRow.className = 'rows';
    currentRow.innerHTML = `<td> [${ i }, ${ j }]</td><td id = "list-${i}-${j}"></td>`;
    progressTable.appendChild(currentRow);

}


function addNumToTable(i, j, num) {
    //get current list
    let currentList = document.getElementById(`list-${i}-${j}`);
    //check validity
    if (!currentList) return;
    let label = document.createElement("label");

    label.className = 'num-label';

    label.id = getNumId(i, j, num);


    label.textContent = num;

    currentList.appendChild(label);


    //firgit this ---this was making or col2 in row addition go to next space or next col1 row next
    //progressTable.appendChild(currentList);

}

function LOG(info) {
    //let log = document.querySelector('.result-container .results #logs');
    logs.innerText = info; //overflows but can be wrapped around its conatainer
    //for now remove plus
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function pause() {
    isPaused = true;
}

function resume() {
    isPaused = false;
}

function reset() {
    stop = true
}

function renderMatrix() {

    map = [
        [8, 1, 2, 3, 7, 4, 5, 6, 9],
        [9, 4, 3, 6, 2, 5, 1, 7, 8],
        [5, 7, 6, 8, 9, 1, 2, 4, 3],
        [1, 5, 4, 2, 3, 7, 8, 9, 6],
        [3, 6, 8, 4, 5, 9, 7, 1, 2],
        [7, 2, 9, 1, 6, 8, 4, 3, 5],
        [2, 3, 1, 7, 8, 6, 9, 5, 4],
        [4, 8, 5, 9, 1, 3, 6, 2, 7],
        [6, 9, 7, 5, 4, 2, 3, 8, 1]
    ];
    //console.log(map);
    //build mirror
    zerofy();
    //delete rand
    deleteRandom();

    //mark after delete
    markWorkable(); //forgot this and had trouble
    //render this 

    //getEmptyCount();

    let container = document.querySelector('.matrix-wrapper #matrixContainer');
    //document.getElementById('matrix');

    //console.log(container);
    //clear
    container.innerHTML = "";
    //1.get table
    let table = document.createElement('table');
    table.id = "table-matrix";
    table.border = "1";
    for (let i = 0; i < rows; i++) {
        //create rows
        let r = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            let c = document.createElement('td');
            //class
            c.className = "cell";
            //id
            c.id = `${i}-${j}`;
            //text maybe
            c.innerText = map[i][j];
            if (!workable[i][j]) {
                c.classList.add('fixed');
            }

            //append
            r.appendChild(c);
        }
        table.appendChild(r);
    }

    container.appendChild(table);

}


renderMatrix();


// Run the test
// main();



//map should be reset everytime
//sodoku();
//display();