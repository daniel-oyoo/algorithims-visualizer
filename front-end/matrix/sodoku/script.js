/*do it as a class
1.solve sodoku log to console
 */

//works fine until we introduce an evil sodoku
//but this version works fine for all partial and well structured
//sodoku ,unless it becomes wrong by design 
class SolveSodoku {
    /*
        let map = []; //board
    let workable = []; //visited/workable/empty

    const PROB = 0.75;
    //hold valid cells
    const validCellList = []; //store usbale for each cell
    */

    constructor(rows = 9, cols = 9) {
        console.log("initialization worked");
        this.map = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ]; //board
        this.workable = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        ]; //visited/workable/empty
        this.PROB = 0.75;
        //hold valid cells
        this.validCellList = []; //store usable for each cell
        this.mapify(); //empty map
        this.marWorkable();
    }

    display() {
        for (let i = 0; i < map.length; i++) {
            console.log(map);
        }
    }

    displayWork() {
        for (let i = 0; i < this.workable.length; i++) {
            console.log(this.workable);
        }
    }


    mapify1() {}
        //mapify
    mapify() {
        //most evil
        this.map[1][2] = 3;
        this.map[0][0] = 8;
        this.map[1][3] = 6; //infinity=2
        this.map[2][1] = 7;
        this.map[2][4] = 9;
        this.map[2][6] = 2;
        this.map[3][1] = 5;
        this.map[3][5] = 7;

        this.map[4][3] = 4;
        this.map[4][4] = 5;
        this.map[5][3] = 1;
        this.map[5][7] = 3;

        //map[6][2]=1;
        // map[6][7]=6;
        // map[6][8]=8;
        // map[7][2]=8;
        //up to here works

        // map[7][3]=5;
        //map[7][6]=1;
        //all these work

        this.map[8][1] = 9;
        //this works too

        this.map[8][4] = 4;

        //all ulbaled are udnefined by default

    }


    marWorkable() {
        for (let i = 0; i < this.workable.length; i++) {
            //workable.push([]);
            for (let j = 0; j < this.workable[i].length; j++) {
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

    rowValid(row, col, number) {
        let rowValid = true;
        //row
        for (col = 0; col < map.length; col++) {
            if (map[row][col] === number) {
                rowValid = false;
                break;
            }
        }

        return rowValid;
    }

    colValid(row, col, number) {
        let colValid = true;
        //column
        for (row = 0; row < map.length; row++) {
            if (map[row][col] == number) {
                colValid = false;
                break;
            }
        }

        return colValid;

    }


    ZoneValid(row, col, number) {
        let zoneValid = true;

        let ZoneSize = 3;
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
        for (let m = row; m < a + ZoneSize; m++) {
            for (let n = col; n < b + boundary; n++) {
                //System.out.println(m + "" + n);
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
    isValid(row, col, number) {
        return (rowValid(row, col, number) &&
            colValid(row, col, number) &&
            ZoneValid(row, col, number)
        );
    }


    //now scanning
    sodoku() {
        //hold valids for each cell
        //we we progress this list reduces in number
        //if the first list is empty and its not placed in that cell we sya there is no solution

        let currentCellListIndex = 0;
        //this decides if we recompute the list again or use exising
        //assist in backtracking 
        //if we move forward we recompute new else 
        //we use existing
        let compute = true;
        //for emergecncy exit incase there is no slution
        outer:
            //scan for empty
            for (let i = 0; i < map.length && i >= 0; i++) {
                // System.out.println("Working");
                for (let j = 0; j < map[i].length;
                    //j++//does this always force forward processing
                ) {
                    //check if empty//cells that are 0 
                    if (workable[i][j]) {
                        //System.out.println("Processing  cell ("+ i + "," + j + ")" + " with list " + cellList);
                        if (compute) {
                            console.log("Computing list");
                            //this cell valid lets fill its valid nums
                            //add a list without refrence to avoid working with the same list through out
                            validCellList.push([]);
                            //fill with nums/valid
                            for (let num = 1; num <= map.length; num++) {
                                //System.out.println("Num " + num + " Valid : " + cellValid(i,j,num));
                                //if this num valid()
                                if (isValid(i, j, num)) {
                                    //System.out.println("Number " + num + " valid for cell (" + i + "," + j + ")");
                                    validCellList[currentCellListIndex].push(num);
                                }
                            } //end for - nums
                            console.log(validCellList.get(cellList));
                        } //end if compute/recompute

                        //here we have a list
                        let currentList = validCellList[currentCellListIndex];
                        console.log("List empty : " + (current.isEmpty()));

                        //empty or not
                        if (!currentList.isEmpty()) {
                            //we have a non empty list
                            console.log("Processing  cell (" + i + "," + j + ")" + " with list " + cellList);
                            //place
                            map[i][j] = currentList[0]; //take the first in list
                            //remove the first from list
                            currentList.shift();
                            //move to next list
                            currentCellListIndex++;
                            //set compute
                            compute = true;
                        } else {

                            console.log("Stuck at (" + i + "," + j + ")");
                            //list empty-remove it
                            //validCellList.removeTheLast List of usbale added;
                            //go ack to previous cell
                            currentCellListIndex--;
                            //map[i][j]=0;//bug or maybe has no effect
                            //dont build new list ,use existing
                            compute = false;
                            console.log("Going back to  cell (" + i + "," + j + ")" + " with list " + cellList);

                        } //check if list valid or not


                        //System.out.println(validCellList.size());
                        //our parent list is not empty
                        if (!validCellList.isEmpty()) {
                            //find (i,j) for first empty/workable cell
                            let r = getFirstCellValid()[0];
                            let c = getFirstCellValid()[1];
                            //test and exit condition
                            //first cell empty and not placed 
                            //there is no solution
                            if (validCellList[0].isEmpty() &&
                                //should be for the first ever encounter cell;
                                map[r][c] === 0
                            ) {
                                console.log("No solution");
                                //exit the whole program-three loops
                                break outer;
                            }
                        }

                    } //end if for empty nums/workable

                    if (compute) {
                        //we placed/or it not workable - move next
                        j++;
                    } else {
                        //we dint place-backtrack
                        j--;
                        //go up               
                        if (j < 0) {
                            j = map.length - 1;
                            //dont overflow
                            if (i > 0)
                                i--;
                        }

                        //this enables us to exit 
                        //since ths is in place we can comfortable check the foirst workable am list 
                        //and we are guranteed our placed/not placed check will work
                        if (workable[i][j]) {
                            map[i][j] = 0;
                        }

                    }

                } //scan

            } //scan
    }

    getFirstCellValid() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map.length; j++) {
                if (workable[i][j] == true) {
                    return [i, j];
                }
            }
        }

        return null;
    }
}


//this worked
let sodoku = new SolveSodoku();
//sodoku.sodoku();
//sodoku.display();