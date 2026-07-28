/*
convert java to js here
1.class
2.just functions
*/

//2. just functions


let map = null; //2d array of our own 

let rows = 5;

let cols = 5;



function display() {
    console.log(map);
}

//mapify
function loadMatrix() {
    let proxyMap = [];
    for (let i = 0; i < rows; i++) {
        proxyMap.push([]);
        for (let j = 0; j < cols; j++) {
            proxyMap[i][j] = Math.floor(Math.random() * rows);
        }
    }

    map = proxyMap;

    //save map to local storage
    //localStorage.setItem("map", map);

    //destroy proxy---prolly not wise
    //proxyMap = null;
}

function getValidNeighbour(row, col) {
    let valid = [];
    //up
    if (row - 1 >= 0) {
        valid.push([row - 1, col]);
    }

    //down
    if (row + 1 < rows) {
        valid.push([row + 1, col]);
    }

    //left
    if (col - 1 >= 0) {
        valid.push([row, col - 1]);
    }

    //right
    if (col + 1 >= 0) {
        valid.push([row, col + 1]);
    }

    return valid;
}

function isBasin(row, col) {
    //let isBasin = false;
    let validNeighbours = getValidNeighbour(row, col); //returns a 2d array of valid neighbours
    let min = 100000000;

    for ([i, j] in validNeighbours) {
        if (map[i][j] < min) { min = map[i][j]; }
    }
    return map[row][col] < min ? true : false; //strictly smaller than
}

function findBasin() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (isBasin(i, j)) {
                let temp = map[i][j];
                //mark
                map[i][j] = -1;
                j += 1;
            }
        }
    }
}

loadMatrix();

findBasin();

display();