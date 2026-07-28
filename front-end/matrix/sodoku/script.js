 /*do it as a class
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         1.solve sodoku log to console
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          

                                  //let map = []; //board
                                  //let workable = []; //visited/workable/empty
                                 */
 let map = []; //board
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



 function zerofy() {
     console.log("Working ");
     for (let i = 0; i < rows; i++) {
         //map.push([]);
         workable.push([]);
         for (let j = 0; j < cols; j++) {
             //map[i][j] = 0;
             workable[i][j] = false;
         }
     }

     console.log("Finished Working ");
 }


 function renderMatrixDynamically() {
     let temp = seededMap;
     map = seededMap;
     //console.log(map);
     //1.zerofy--intializes both
     //zerofy();
     //console.log(map);
     //mark woarkbale to enable solve
     markWorkable();
     //2. solve--solves empty borad
     //();
     //console.log(map);
     //3.delete randomly--random from board made 0
     deleteRandom();
     //console.log(map);
     //4.rander this--this is whats renderered 
     renderMatrix();
     //console.log(map);


     //restore

     seededMap = temp;
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
 function mapify() {
     //most evil
     map[1][2] = 3;
     map[0][0] = 8;
     map[1][3] = 6; //infinity=2
     map[2][1] = 7;
     map[2][4] = 9;
     map[2][6] = 2;
     map[3][1] = 5;
     map[3][5] = 7;

     map[4][3] = 4;
     map[4][4] = 5;
     map[5][3] = 1;
     map[5][7] = 3;

     //map[6][2]=1;
     // map[6][7]=6;
     // map[6][8]=8;
     // map[7][2]=8;
     //up to here works

     // map[7][3]=5;
     //map[7][6]=1;
     //all these work

     map[8][1] = 9;
     //this works too

     map[8][4] = 4;

     //all ulbaled are udnefined by default

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


 function solve() {
     console.log("working");
     let currentCellListIndex = 0;
     //we use existing
     let compute = true;

     outer:
         //scan for empty
         for (let i = 0; i < rows && i >= 0; i++) {
             for (let j = 0; j < cols;) {
                 if (workable[i][j]) {
                     if (compute) {
                         validCellList.push([]);
                         //fill with nums/valid
                         for (let num = 1; num <= 9; num++) {
                             if (isValid(i, j, num)) {
                                 validCellList[currentCellListIndex].push(num);
                             }
                         } //end for - nums

                     } //end if compute/recompute

                     //here we have a list
                     let currentList = validCellList[currentCellListIndex]

                     //empty or not
                     if (currentList.length !== 0) {
                         map[i][j] = currentList[0]; //take the first in list

                         //remove the first from list
                         currentList.shift();
                         //move to next list
                         currentCellListIndex++;
                         //set compute
                         compute = true;

                     } else {
                         currentList = null;
                         currentCellListIndex--;
                         compute = false;

                     } //check if list valid or not

                     //there is no solution
                     if (validCellList[0].length === 0 &&
                         //should be for the first ever encounter cell;
                         map[r][c] === 0
                     ) {
                         console.log("No solution ");
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
                     j = rows - 1;
                     //dont overflow
                     if (i > 0)
                         i--;
                 }
                 if (workable[i][j]) {
                     map[i][j] = 0;
                 }

             }

         } //scan

 } //scan



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

             //console.log(map);
             //console.log(workable);
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


 //now scanning
 async function sodoku() {
     //refresh table progress and matrix
     //renderMatrix();
     console.log("Working ")
         //hold valids for each cell
         //we we progress this list reduces in number
         //if the first list is empty and its not placed in that cell we sya there is no solution

     let currentCellListIndex = 0;


     //we use existing
     let compute = true;
     //for emergecncy exit incase there is no slution



     //anaimatiosna and all 
     // let empty = document.querySelector('.result-container .results #empty');
     //let logs = document.querySelector('.result-container .results #logs');
     //let solved = document.querySelector('.result-container .results #solved');
     //let pboards = document.querySelector('.result-container .results #p-boards');
     //let currentCell = document.querySelector('.result-container .results #current-cell');


     //anaime
     let emptycells = 67;
     let solvedcells = 0;
     let pboard = 0;
     outer:
         //scan for empty
         for (let i = 0; i < rows && i >= 0; i++) {
             // System.out.println("Working ");
             for (let j = 0; j < cols;) {

                 LOG(`Scanning cell (${i},${j})`);

                 currentCell.innerText = `${i},${j}`;
                 pboards.innerText = `${pboard}`;
                 empty.innerText = `${emptycells}`;
                 solved.innerText = `${solvedcells}`;


                 //delay works
                 //pause/resume
                 while (isPaused) {
                     await sleep(10);
                 }
                 //reset
                 if (stop) {
                     return;
                 }

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


                 //aniamtions
                 // let num = 1;





                 //check if empty//cells that are 0 
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

                     //create table and all for displaying data as we move across
                     let statusRow = null;

                     //System.out.println("Processing cell ( "+ i + ", " + j + ") " + " with list " + cellList);
                     if (compute) {
                         //console.log("Computing list ");
                         //this cell valid lets fill its valid nums
                         //add a list without refrence to avoid working with the same list through out
                         validCellList.push([]);


                         //animations
                         //let currentRow = document.createElement('tr');
                         //currentRow.id = 'list-${currenCellListIndex}';
                         //currentRow.className='list-${currenCellListIndex}'
                         //let colOne = document.createElement('td');
                         //let colTwo = document.createElement('td');
                         //colOne.innerText = `(${i},${j})`;
                         //currenRow.appendChild(colOne);
                         //currentRow.appendChild(colTwo);

                         let statusRow = createRow(currentCellListIndex, i, j);




                         //fill with nums/valid
                         for (let num = 1; num <= 9; num++) {
                             //System.out.println("Num " + num + " Valid : " + cellValid(i,j,num));
                             //if this num valid()
                             if (isValid(i, j, num)) {
                                 //System.out.println("Number " + num + " valid for cell ( " + i + ", " + j + ") ");
                                 validCellList[currentCellListIndex].push(num);


                                 //anime
                                 //colTwo.innerText += `${num}`;
                                 //labels pile side by sie with unique id,beats just adding content to td
                                 statusRow.children[1].innerHTML += `<label id=${num}> <b>${num}</b></label>`;
                                 //progressTable.appendChild(currenRow);
                                 await sleep(10);



                             }
                         } //end for - nums

                         //anime
                         //currentRow.appendChild(colTwo);
                         //progressTable.appendChild(currenRow);

                         //console.log(progressTable);



                         //console.log(validCellList.get(cellList));
                     } //end if compute/recompute

                     //here we have a list
                     let currentList = validCellList[currentCellListIndex]


                     //aniamtions


                     //let idx = `$ {
                     //  currenCellListIndex
                     //}
                     //`;
                     //  statusRow = document.getElementById(`
                     //$ {
                     //  list - idx
                     //}
                     //`);

                     //empty or not
                     if (currentList.length !== 0) {
                         //we have a non empty list
                         //console.log("Processing cell ( " + i + ", " + j + ") " + " with list " + cellList);
                         //place
                         map[i][j] = currentList[0]; //take the first in list

                         //anime 
                         document.getElementById(`${i}-${j}`).innerText = map[i][j];
                         //remove the first from list
                         currentList.shift();
                         //move to next list
                         currentCellListIndex++;
                         //set compute
                         compute = true;




                         //animations
                         //remove from table  add to matrix--await sleep in between
                         //cell.innerText = map[i][j];
                         //document.querySelector('#${i}-${j}').innerText = map[i][j];
                         let removedNum = document.getElementById(`${map[i][j]}`);
                         //currrnetlyit doesnt reflect removed
                         removedNum = null;
                         //lets try this
                         //statusRow.children[1].innerText = currentList;//freezes treversal
                         empty.innerText = `${emptycells--}`;
                         solved.innerText = `${solvedcells++}`;



                     } else {

                         //remove current row
                         let removedRow = document.getElementById(`list-${currentCellListIndex}`);
                         removedRow = null;

                         //remove this list from our global list
                         // validCellList[currentCellListIndex] = null;

                         //list empty-remove it
                         //validCellList.removeTheLast List of usbale added;
                         //go ack to previous cell
                         currentCellListIndex--;
                         //map[i][j]=0;//bug or maybe has no effect
                         //dont build new list ,use existing
                         compute = false;
                         //console.log("Going back to cell ( " + i + ", " + j + ") " + " with li // st " + cellList);


                         //aniamtions
                         //remove current list 
                         //glow box-shadow the nextOne;
                         //here

                         //assign results divs to these varialbes
                         pboards.innerText = `${pboard++}`;
                         solved.innerText = `${emptycells++}`;
                         solved.innerText = `${solvedcells--}`;

                     } //check if list valid or not


                     //System.out.println(validCellList.size());
                     //our parent list is not empty
                     if (validCellList.length !== 0) {
                         //find (i,j) for first empty/workable cell
                         let r = getFirstCellValid()[0];
                         let c = getFirstCellValid()[1];
                         //test and exit condition
                         //first cell empty and not placed 
                         //there is no solution
                         if (validCellList[0].length === 0 &&
                             //should be for the first ever encounter cell;
                             map[r][c] === 0
                         ) {
                             console.log("No solution ");
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
                         j = rows - 1;
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

     console.log(map);
 }

 function getFirstCellValid() {
     for (let i = 0; i < rows; i++) {
         for (let j = 0; j < cols; j++) {
             if (workable[i][j] == true) {
                 return [i, j];
             }
         }
     }

     return null;
 }

 /*Animations rlated quiclks*/

 function createRow(index, i, j) {
     //returns a collection of children
     //animations
     let currentRow = document.createElement('tr');
     currentRow.id = `list-${index}`;
     //currentRow.className='list-${currenCellListIndex}'
     let colOne = document.createElement('td');
     let colTwo = document.createElement('td');
     colOne.innerText = ` (${i}, ${j})`;
     currentRow.appendChild(colOne);
     currentRow.appendChild(colTwo);
     progressTable.appendChild(currentRow);

     //document.getElementById('progress').appendChild(progressTable);



     return currentRow;
 }

 function LOG(info) {
     let log = document.querySelector('.result-container .results #logs');
     log.innerText = info; //overflows but can be wrapped around its conatainer
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
     //console.log(map);
     //build mirror
     zerofy();
     //mapify();
     //markWorkable(); //forgot this and had trouble 
     //delete rand
     deleteRandom();

     //mark after delete
     markWorkable(); //forgot this and had trouble
     //render this 

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
             if (workable[i][j]) {
                 //c.style.backgroundColor = "lightgrey";
             }

             //append
             r.appendChild(c);
         }
         table.appendChild(r);
     }

     container.appendChild(table);

     //seededMap = temp;
     // map = [];
 }



 renderMatrix();
 //renderMatrixDynamically();