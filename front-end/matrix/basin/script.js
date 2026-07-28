/*
convert java to js here
1.class
2.just functions
*/

//2. just functions


let map = []; //2d array of our own 

let allValid = [];

let rows = 5;

let cols = 5;



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

    //map = proxyMap;

    //save map to local storage
    //localStorage.setItem("map", map);

    //destroy proxy---prolly not wise
    //proxyMap = null;
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
    //let isBasin = false;
    let validNeighbours = getValidNeighbour(row, col); //returns a 2d array of valid neighbours
    console.log(validNeighbours);
    let min = 100000000;
    for (let m = 0; m < validNeighbours.length; m++) { //whole
        for (let n = 0; n < validNeighbours[m].length; n++) {
            if (validNeighbours[m][n][0][0] < min) {
                min = validNeighbours[m][n][0][1];
                console.log(min);
            }
        }
    }
    return map[row][col] < min ? true : false; //strictly smaller than
}

function findBasin() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (
                isBasin(i, j)
                // &&
                //map[i][j] !== -1 //avoid false basins
            ) {
                let temp = map[i][j];
                //mark
                map[i][j] = -1;
                j += 1;
            }
        }
    }
}

//console.log(map);

loadMatrix();

console.log(map);

findBasin();

console.log(map);