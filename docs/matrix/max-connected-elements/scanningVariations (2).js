/**
 * basic/direct -works with absolute accuraccy
 * 
 */
// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startDualWaveProcess() {



    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0; i < CCState.rows; i++) {
        for (let j = 0; j < CCState.cols; j++) {
            //pause/resume/reset

            //if (!isRunning) return;
            if (!CCState.isRunning || CCState.shouldStop) {
                addLog('Process stopped by user', 'warning');
                finishProcess();
                return;
            }

            if (!await checkPause()) {
                addLog('Process stopped', 'warning');
                finishProcess();
                return;
            }


            //search wave through all elemnets 0 and all

            const cellEl = document.getElementById(`cell-${i}-${j}`);

            document.querySelectorAll("cell").forEach(c => {
                c.classList.remove("scanning");
            });
            //getCell(i, j);
            //now its complete
            if (cellEl
                // && CCState.grid[i][j] > 0
            ) {
                cellEl.classList.add('scanning');
                await sleep(CCState.delayMs / 2);
                cellEl.classList.remove('scanning');
                //console.log("Scan logic working");
            }

            // If searching wave hits an unvisited component start point
            //main process

            if (find(i, j)) {
                CCState.zoneIdCounter++;
                const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                const zoneObj = {
                    id: CCState.zoneIdCounter,
                    startR: i,
                    startC: j,
                    count: 0,
                    color: color
                };
                CCState.zoneList.push(zoneObj);

                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' +
                    '<span class="color-badge" style="background:' + color + '"></span>' +
                    'Zone #' + zoneObj.id +
                    '</td>' +
                    '<td>[' + i + ', ' + j + ']</td>' +
                    '<td id="zone-count-' + zoneObj.id + '">0</td>';
                maxDOM.zonesTableBody.appendChild(tr);
                updateMetrics();

                await runInfectionWave(i, j, zoneObj, directions);

                addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
            }
        }
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}


















/**
 * improved basic
 * 
 */
// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startFasterDualWaveProcess() {



    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0; i < CCState.rows; i++) {
        for (let j = 0; j < CCState.cols; j++) {
            //pause/resume/reset

            //if (!isRunning) return;
            if (!CCState.isRunning || CCState.shouldStop) {
                addLog('Process stopped by user', 'warning');
                finishProcess();
                return;
            }

            if (!await checkPause()) {
                addLog('Process stopped', 'warning');
                finishProcess();
                return;
            }


            //search wave through all elemnets 0 and all

            const cellEl = document.getElementById(`cell-${i}-${j}`);

            document.querySelectorAll("cell").forEach(c => {
                c.classList.remove("scanning");
            });
            //getCell(i, j);
            //now its complete
            if (cellEl
                // && CCState.grid[i][j] > 0
            ) {
                cellEl.classList.add('scanning');
                await sleep(CCState.delayMs / 2);
                cellEl.classList.remove('scanning');
                //console.log("Scan logic working");
            }

            // If searching wave hits an unvisited component start point
            //main process

            if (find(i, j)) {
                CCState.zoneIdCounter++;
                const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                const zoneObj = {
                    id: CCState.zoneIdCounter,
                    startR: i,
                    startC: j,
                    count: 0,
                    color: color
                };
                CCState.zoneList.push(zoneObj);

                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' +
                    '<span class="color-badge" style="background:' + color + '"></span>' +
                    'Zone #' + zoneObj.id +
                    '</td>' +
                    '<td>[' + i + ', ' + j + ']</td>' +
                    '<td id="zone-count-' + zoneObj.id + '">0</td>';
                maxDOM.zonesTableBody.appendChild(tr);
                updateMetrics();

                await runInfectionWave(i, j, zoneObj, directions);

                addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
            }
        }
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}






















/**
 * elite but wrong
 * 
 */
// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startFastestDualWaveProcess() {



    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0, j = 0; i < CCState.rows; i++, j++) {

        //pause/resume/reset
        //if (!isRunning) return;
        if (!CCState.isRunning || CCState.shouldStop) {
            addLog('Process stopped by user', 'warning');
            finishProcess();
            return;
        }

        if (!await checkPause()) {
            addLog('Process stopped', 'warning');
            finishProcess();
            return;
        }


        //search wave through all elemnets 0 and all

        const cellEl = document.getElementById(`cell-${i}-${j}`);

        document.querySelectorAll("cell").forEach(c => {
            c.classList.remove("scanning");
        });
        //getCell(i, j);
        //now its complete
        if (cellEl
            // && CCState.grid[i][j] > 0
        ) {
            cellEl.classList.add('scanning');
            await sleep(CCState.delayMs / 2);
            cellEl.classList.remove('scanning');
            //console.log("Scan logic working");
        }

        // If searching wave hits an unvisited component start point
        //main process

        if (find(i, j)) {
            CCState.zoneIdCounter++;
            const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

            addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

            const zoneObj = {
                id: CCState.zoneIdCounter,
                startR: i,
                startC: j,
                count: 0,
                color: color
            };
            CCState.zoneList.push(zoneObj);

            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' +
                '<span class="color-badge" style="background:' + color + '"></span>' +
                'Zone #' + zoneObj.id +
                '</td>' +
                '<td>[' + i + ', ' + j + ']</td>' +
                '<td id="zone-count-' + zoneObj.id + '">0</td>';
            maxDOM.zonesTableBody.appendChild(tr);
            updateMetrics();

            await runInfectionWave(i, j, zoneObj, directions);

            addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
        }
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}













/**
 * test method
 * 
 */
// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startDualWaveProcess() {



    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0; i < CCState.rows; i++) {
        for (let j = 0; j < CCState.cols; j++) {
            //pause/resume/reset

            //if (!isRunning) return;
            if (!CCState.isRunning || CCState.shouldStop) {
                addLog('Process stopped by user', 'warning');
                finishProcess();
                return;
            }

            if (!await checkPause()) {
                addLog('Process stopped', 'warning');
                finishProcess();
                return;
            }


            //search wave through all elemnets 0 and all

            const cellEl = document.getElementById(`cell-${i}-${j}`);

            document.querySelectorAll("cell").forEach(c => {
                c.classList.remove("scanning");
            });
            //getCell(i, j);
            //now its complete
            if (cellEl
                // && CCState.grid[i][j] > 0
            ) {
                cellEl.classList.add('scanning');
                await sleep(CCState.delayMs / 2);
                cellEl.classList.remove('scanning');
                //console.log("Scan logic working");
            }

            // If searching wave hits an unvisited component start point
            //main process

            if (find(i, j)) {
                CCState.zoneIdCounter++;
                const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                const zoneObj = {
                    id: CCState.zoneIdCounter,
                    startR: i,
                    startC: j,
                    count: 0,
                    color: color
                };
                CCState.zoneList.push(zoneObj);

                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' +
                    '<span class="color-badge" style="background:' + color + '"></span>' +
                    'Zone #' + zoneObj.id +
                    '</td>' +
                    '<td>[' + i + ', ' + j + ']</td>' +
                    '<td id="zone-count-' + zoneObj.id + '">0</td>';
                maxDOM.zonesTableBody.appendChild(tr);
                updateMetrics();

                await runInfectionWave(i, j, zoneObj, directions);

                addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
            }
        }
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}


































/**
 * test method
 * 
 */
// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startDualWaveProcess() {



    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0; i < CCState.rows; i++) {
        for (let j = 0; j < CCState.cols; j++) {
            //pause/resume/reset

            //if (!isRunning) return;
            if (!CCState.isRunning || CCState.shouldStop) {
                addLog('Process stopped by user', 'warning');
                finishProcess();
                return;
            }

            if (!await checkPause()) {
                addLog('Process stopped', 'warning');
                finishProcess();
                return;
            }


            //search wave through all elemnets 0 and all

            const cellEl = document.getElementById(`cell-${i}-${j}`);

            document.querySelectorAll("cell").forEach(c => {
                c.classList.remove("scanning");
            });
            //getCell(i, j);
            //now its complete
            if (cellEl
                // && CCState.grid[i][j] > 0
            ) {
                cellEl.classList.add('scanning');
                await sleep(CCState.delayMs / 2);
                cellEl.classList.remove('scanning');
                //console.log("Scan logic working");
            }

            // If searching wave hits an unvisited component start point
            //main process

            if (find(i, j)) {
                CCState.zoneIdCounter++;
                const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                const zoneObj = {
                    id: CCState.zoneIdCounter,
                    startR: i,
                    startC: j,
                    count: 0,
                    color: color
                };
                CCState.zoneList.push(zoneObj);

                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' +
                    '<span class="color-badge" style="background:' + color + '"></span>' +
                    'Zone #' + zoneObj.id +
                    '</td>' +
                    '<td>[' + i + ', ' + j + ']</td>' +
                    '<td id="zone-count-' + zoneObj.id + '">0</td>';
                maxDOM.zonesTableBody.appendChild(tr);
                updateMetrics();

                await runInfectionWave(i, j, zoneObj, directions);

                addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
            }
        }
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}

















/**
 * hybrid -fast and accurate
 * 
 */
// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startHybridDualWaveProcess() {



    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0, j = 0; i < CCState.rows; i++, j++) {


        if (CCState.grid[i][j] == 1) {

            //pause/resume/reset
            if (!CCState.isRunning || CCState.shouldStop) {
                addLog('Process stopped by user', 'warning');
                finishProcess();
                return;
            }

            if (!await checkPause()) {
                addLog('Process stopped', 'warning');
                finishProcess();
                return;
            }


            //search wave through all elemnets 0 and all

            const cellEl = document.getElementById(`cell-${i}-${j}`);

            document.querySelectorAll("cell").forEach(c => {
                c.classList.remove("scanning");
            });
            //getCell(i, j);
            //now its complete
            if (cellEl
                // && CCState.grid[i][j] > 0
            ) {
                cellEl.classList.add('scanning');
                await sleep(CCState.delayMs / 2);
                cellEl.classList.remove('scanning');
                //console.log("Scan logic working");
            }

            // If searching wave hits an unvisited component start point
            //main process

            if (find(i, j)) {
                CCState.zoneIdCounter++;
                const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                const zoneObj = {
                    id: CCState.zoneIdCounter,
                    startR: i,
                    startC: j,
                    count: 0,
                    color: color
                };
                CCState.zoneList.push(zoneObj);

                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' +
                    '<span class="color-badge" style="background:' + color + '"></span>' +
                    'Zone #' + zoneObj.id +
                    '</td>' +
                    '<td>[' + i + ', ' + j + ']</td>' +
                    '<td id="zone-count-' + zoneObj.id + '">0</td>';
                maxDOM.zonesTableBody.appendChild(tr);
                updateMetrics();

                await runInfectionWave(i, j, zoneObj, directions);

                addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
            }
            i++;
            j++;
        } else if (CCState.grid[i][j] == 1) {
            i++;
            j++;
        } else {
            //left
            for (let left = i - 1; left >= 0; left--) {

                //pause/resume/reset
                if (!CCState.isRunning || CCState.shouldStop) {
                    addLog('Process stopped by user', 'warning');
                    finishProcess();
                    return;
                }

                if (!await checkPause()) {
                    addLog('Process stopped', 'warning');
                    finishProcess();
                    return;
                }


                //search wave through all elemnets 0 and all

                const cellEl = document.getElementById(`cell-${i}-${j}`);

                document.querySelectorAll("cell").forEach(c => {
                    c.classList.remove("scanning");
                });
                //getCell(i, j);
                //now its complete
                if (cellEl
                    // && CCState.grid[i][j] > 0
                ) {
                    cellEl.classList.add('scanning');
                    await sleep(CCState.delayMs / 2);
                    cellEl.classList.remove('scanning');
                    //console.log("Scan logic working");
                }

                // If searching wave hits an unvisited component start point
                //main process

                if (find(i, j)) {
                    CCState.zoneIdCounter++;
                    const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                    addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                    const zoneObj = {
                        id: CCState.zoneIdCounter,
                        startR: i,
                        startC: j,
                        count: 0,
                        color: color
                    };
                    CCState.zoneList.push(zoneObj);

                    const tr = document.createElement('tr');
                    tr.innerHTML =
                        '<td>' +
                        '<span class="color-badge" style="background:' + color + '"></span>' +
                        'Zone #' + zoneObj.id +
                        '</td>' +
                        '<td>[' + i + ', ' + j + ']</td>' +
                        '<td id="zone-count-' + zoneObj.id + '">0</td>';
                    maxDOM.zonesTableBody.appendChild(tr);
                    updateMetrics();

                    await runInfectionWave(i, j, zoneObj, directions);

                    addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');
                }

                break; //important
            }
            //right
            for (let right = i + 1; right < CCState.cols; rigth++) {

                //pause/resume/reset
                if (!CCState.isRunning || CCState.shouldStop) {
                    addLog('Process stopped by user', 'warning');
                    finishProcess();
                    return;
                }

                if (!await checkPause()) {
                    addLog('Process stopped', 'warning');
                    finishProcess();
                    return;
                }


                //search wave through all elemnets 0 and all

                const cellEl = document.getElementById(`cell-${i}-${j}`);

                document.querySelectorAll("cell").forEach(c => {
                    c.classList.remove("scanning");
                });
                //getCell(i, j);
                //now its complete
                if (cellEl
                    // && CCState.grid[i][j] > 0
                ) {
                    cellEl.classList.add('scanning');
                    await sleep(CCState.delayMs / 2);
                    cellEl.classList.remove('scanning');
                    //console.log("Scan logic working");
                }

                // If searching wave hits an unvisited component start point
                //main process

                if (find(i, j)) {
                    CCState.zoneIdCounter++;
                    const color = ZONE_COLORS[(CCState.zoneIdCounter - 1) % ZONE_COLORS.length];

                    addLog('Target found at [' + i + ', ' + j + ']. Handing torch to Infection Wave', 'success');

                    const zoneObj = {
                        id: CCState.zoneIdCounter,
                        startR: i,
                        startC: j,
                        count: 0,
                        color: color
                    };
                    CCState.zoneList.push(zoneObj);

                    const tr = document.createElement('tr');
                    tr.innerHTML =
                        '<td>' +
                        '<span class="color-badge" style="background:' + color + '"></span>' +
                        'Zone #' + zoneObj.id +
                        '</td>' +
                        '<td>[' + i + ', ' + j + ']</td>' +
                        '<td id="zone-count-' + zoneObj.id + '">0</td>';
                    maxDOM.zonesTableBody.appendChild(tr);
                    updateMetrics();

                    await runInfectionWave(i, j, zoneObj, directions);

                    addLog('Infection wave finished Zone #' + zoneObj.id + ' (' + zoneObj.count + ' cells)', 'info');

                }

                break; //important
            }
        }
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}