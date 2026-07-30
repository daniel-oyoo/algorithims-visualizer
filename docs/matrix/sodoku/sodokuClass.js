        let map = []; //board

        let allEmptycells = 0;
        //pre-seeded to avoid re render overhead
        let seededMap = [
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
        let workable = []; //visited/workable/empty

        const rows = 9;
        const cols = 9;


        const PROB = 0.75;
        //hold valid cells
        const validCellList = []; //store usbale for each cell
        // 
        /*
        //anaimatiosna and all 
        let empty = document.querySelector('.result-container .results #empty');
        let logs = document.querySelector('.result-container .results #logs');
        let solved = document.querySelector('.result-container .results #solved');
        let pboards = document.querySelector('.result-container .results #p-boards');
        let currentCell = document.querySelector('.result-container .results #current-cell');


        let progressTable = document.querySelector('#progress #status');
        // 
        //delay controls
        let isPaused = false;
        let stop = false;
*/


        function zerofy() {
            console.log("Working ");
            for (let i = 0; i < rows; i++) {
                map.push([]);
                workable.push([]);
                for (let j = 0; j < cols; j++) {
                    map[i][j] = 0;
                    workable[i][j] = false;
                }
            }

            console.log("Finished Working ");
        }

        function display() {
            //for (let i = 0; i < map.length; i++) {
            console.log(map);
            //}
        }

        function displayWork() {
            console.log(workable);
        }


        function mapify1() {}
        //mapify

        function deleteRandom() {
            let choice = Math.floor(Math.random() * 2); //add some bad with good boards dynamically
            if (choice === 1) { //good board just delete any number--cant have duplicates
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < Math.floor(cols * PROB); j++) {
                        //set random to empty
                        map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = 0;
                        allEmptycells++;
                    }
                }
            } else { //replace numbers may have duplicates

                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < Math.floor(cols * PROB); j++) {
                        //set random to empty
                        map[Math.floor(Math.random() * rows)][Math.floor(Math.random() * rows)] = 0;
                        map[Math.floor(Math.random() * rows)]
                            [Math.floor(Math.random() * rows)] =
                            Math.floor(Math.random() * 10);
                        allEmptycells++;
                    }
                }

            }
        }


        function markWorkable() {
            for (let i = 0; i < rows; i++) {
                //workable.push([]);
                for (let j = 0; j < cols; j++) {
                    //empty
                    if (map[i][j] == 0) {
                        workable[i][j] = true;
                    } else {
                        workable[i][j] = false;
                    }

                }
            }
        }

        //validity check
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
            } else
            if ((row < 3 && (col >= 3 && col < 6))) {

                row = 0;
                col = 3;
            } else
            if (row < 3 && (col >= 6 && col < 9)) {
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
            return (rowValid(row, col, number) &&
                colValid(row, col, number) &&
                ZoneValid(row, col, number)
            );
        }


        function sodoku() {
            let cellList = 0;
            let compute = true;

            outer:
                for (let i = 0; i < rows && i >= 0; i++) {
                    for (let j = 0; j < cols;) {
                        if (workable[i][j]) {
                            if (compute) {
                                console.log("Computing list");
                                validCellList.push([]);
                                for (let num = 1; num <= rows; num++) {
                                    if (cellValid(i, j, num)) {
                                        validCellList[cellList].push(num);
                                    }
                                }
                                console.log(SolveSodoku.validCellList[cellList]);
                            }

                            const current = validCellList[cellList];
                            console.log("List empty : " + (current.length === 0));

                            if (current.length > 0) {
                                console.log("Processing  cell (" + i + "," + j + ")" + " with list " + cellList);
                                map[i][j] = current[0];
                                current.shift();
                                cellList++;
                                compute = true;
                            } else {
                                console.log("Stuck at (" + i + "," + j + ")");
                                validCellList.pop();
                                cellList--;
                                compute = false;
                                console.log("Going back to  cell (" + i + "," + j + ")" + " with list " + cellList);
                            }

                            if (validCellList.length > 0) {
                                const firstCell = getFirstCellValid();
                                const r = firstCell[0];
                                const c = firstCell[1];
                                if (validCellList[0].length === 0 &&
                                    map[r][c] === 0) {
                                    console.log("No solution");
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
                            }
                        }
                    }
                }
        }

        function getFirstCellValid() {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    if (workable[i][j] === true) {
                        return [i, j];
                    }
                }
            }
            return null;
        }


        // Test class equivalent
        function main() {
            //all zeros
            zerofy();

            //markWorkable();
            deleteRandom();
            const s = Date.now();
            sodoku();
            display();
            const e = Date.now();
            console.log(validCellList);
            console.log(`\nTime : ${e - s} ms`);
        }

        // Run the test
        main();