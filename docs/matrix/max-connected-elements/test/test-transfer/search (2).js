// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startDualWaveProcess() {
    //const use8Dir = document.getElementById('directions').value === '8';
    //const directions = use8Dir ? DIR8 : DIR4;


    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];


    //let zoneIdCounter = 0;



    //next steps
    maxDOM.zonesTableBody.innerHTML = '';

    //look for  first cell of connected in every row

    for (let i = 0; i < CCState.rows; i++) {
        for (let j = 0; j < CCState.cols; j++) {
            const cell = getCell(i, j);
            if (cell) {
                cell.className = '';
                if (CCState.grid[i][j] > 0) {
                    cell.style.backgroundColor = 'var(--color-bg)';
                    cell.style.color = 'var(--color-text-light)';
                }
            }
        }
    }



    updateMetrics();
    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    // Searching Wave: Scans row by row across matrix
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            //pause/resume/reset

            if (!isRunning) return;
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

            const cellEl = getCell(i, j);
            //if (cellEl && CCState.grid[i][j] > 0) {
            cellEl.classList.add('scanning');
            await sleep(CCState.delayMs / 2);
            cellEl.classList.remove('scanning');
            //}

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
 * ====== START DUAL-WAVE PROCESS ======
 * Searching wave scans grid, infection wave floods components
 * look for first empty of evry row
 */
async function startDualWaveProcess() {
    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    maxDOM.zonesTableBody.innerHTML = '';

    //look for  first cell of connected in every row

    for (let i = 0, j = 0; i < CCState.rows; i++) {
        //for (let j = 0; j < CCState.cols; j++) {
        if (CCState.grid[i][j] !== 1) {
            j++;
            //continue; //j++
        } else {
            const cell = getCell(i, j);
            if (cell) {
                cell.className = '';
                if (CCState.grid[i][j] > 0) {
                    cell.style.backgroundColor = 'var(--color-bg)';
                    cell.style.color = 'var(--color-text-light)';
                }
            }

            i++; //i jumps direct
        }
        //}
    }

    updateMetrics();
    addLog('Starting ' + (use8Dir ? '8-Way' : '4-Way') + ' search wave', 'info');

    for (let i = 0, j = 0; i < CCState.rows; i++) {
        // for (let j = 0; j < CCState.cols; j++) {
        if (CCState.grid[i][j] !== 1) {
            j++;
            //continue;
        } else {
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

            const cellEl = getCell(i, j);
            if (cellEl && CCState.grid[i][j] > 0) {
                cellEl.classList.add('scanning');
                await sleep(CCState.delayMs / 3);
                cellEl.classList.remove('scanning');
            }

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
        }
        //}
    }

    addLog('Searching completed. Found ' + CCState.zoneIdCounter + ' connected components', 'success');
    addLog('Largest component: ' + CCState.maxComponentSize + ' cells', 'info');

    finishProcess();
}