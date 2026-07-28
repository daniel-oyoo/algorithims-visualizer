/*
convert java to js here
1.class
2.just functions
*/

//2. just functions


let map = []; //2d array of our own 

let allValid = [];

let rows = 9;

let cols = 9;

const PROB = 1;




function display() {
    console.log(map);
}

//mapify
function loadMatrix() {
    //let proxyMap = [];
    for (let i = 0; i < rows; i++) {
        map.push([]);
        //proxyMap.push([]);
        for (let j = 0; j < cols; j++) {
            //proxyMap[i][j] = Math.floor(Math.random() * rows);
            map[i][j] = Math.floor(Math.random() * rows);
        }
    }
}

function getValidNeighbour(row, col) {
    let valid = [];
    //up
    if (row - 1 >= 0 && map[row - 1][col] != -1) {
        valid.push([row - 1, col]);
    }

    //down
    if (row + 1 < rows && map[row + 1][col] != -1) {
        valid.push([row + 1, col]);
    }

    //left
    if (col - 1 >= 0 && map[row][col - 1] != -1) {
        valid.push([row, col - 1]);
    }

    //right
    if (col + 1 >= 0 && map[row][col + 1] != -1) {
        valid.push([row, col + 1]);
    }

    //return 
    allValid.push(valid);

    return allValid;
}

function isBasin(row, col) {
    let basin = true;
    //lets only operate within bounds
    if ((row > 1 && row < map.length - 1) && (col > 1 && col < map.length - 1)) {
        //just find one mismatch and call it quits
        //left and right
        if (map[row][col] > map[row][col - 1] || map[row][col] > map[row][col + 1]) {
            //up an down
            if (map[row][col] > map[row - 1][col] || map[row][col] > map[row + 1][col]) {
                basin = false;
            }
        }
    }
    return basin;
}

function findBasin() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (
                map[i][j] !== -1 &&
                isBasin(i, j)
                //avoid false basins
            ) {
                let temp = map[i][j];
                //mark
                //map[i][j] = -1;

                console.log(map);

                //if along the border
                //if(){}
                j += 1;


            }
        }
    }
}



function deleteRandom() {
    let choice = Math.floor(Math.random() * 2); //add some bad with good boards dynamically
    if (choice === 1) { //good board just delete any number--cant have duplicates
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < Math.floor(cols * PROB); j++) {
                //set random to empty
                map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = 0;
            }
        }
    } else { //replace numbers may have duplicates

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < Math.floor(cols * PROB); j++) {
                //set random to empty
                map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = 0;
                map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = Math.floor(Math.random() * 10);
            }
        }

    }
}


function renderMatrix() {

    //let temp = seededMap;

    //console.log(temp);

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

    //delete rand
    deleteRandom();

    let container = document.querySelector('.main-content #matrix');
    //document.getElementById('matrix');

    console.log(container);
    //clear
    container.innerHTML = " ";
    //1.get table
    let table = document.createElement('table');
    table.id = "table-matrix ";
    table.border = "1 ";
    for (let i = 0; i < rows; i++) {
        //create rows
        let r = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            let c = document.createElement('td');
            //class
            c.className = "cell ";
            //id
            c.id = `${i}-${j}`;
            //text maybe
            c.innerText = map[i][j];
            //append
            r.appendChild(c);
        }
        table.appendChild(r);
    }

    container.appendChild(table);

    //seededMap = temp;
    // map = [];
}


//console.log(map);

//loadMatrix();

renderMatrix();

console.log(map);

findBasin();

console.log(map);