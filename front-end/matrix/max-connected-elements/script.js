/**
 * ============================================================
 * MAX CONNECTED ELEMENTS MODULE - script.js
 * Location: /front-end/matrix/max-connected-elements/script.js
 * Purpose: Connected component detection with dual-wave flood fill
 * ============================================================
 */

/**
 * ====== CONNECTED COMPONENT CONFIG ======
 */
const CC_CONFIG = {
    defaultSize: 8,
    defaultDensity: 0.5,
    defaultDelay: 150
};

/**
 * ====== DIRECTION SETS ======
 */
const DIRECTION_SETS = {
    4: [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ],
    8: [
        [-1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1]
    ]
};

/**
 * ====== ZONE COLORS ======
 */
const ZONE_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
    '#84cc16', '#14b8a6', '#8b5cf6', '#d946ef',
    '#f43f5e', '#0ea5e9', '#8b5cf6', '#22d3ee'
];

/**
 * ====== COMPONENT STATE ======
 */
const CCState = {
    grid: [],
    rows: 8,
    cols: 8,
    isRunning: false,
    isPaused: false,
    shouldStop: false,
    delayMs: 150,
    zoneList: [],
    totalVisited: 0,
    maxComponentSize: 0,
    zoneIdCounter: 0
};

/**
 * ====== DOM REFERENCES ======
 */
const maxDOM = {
    gridTable: document.getElementById('gridTable'),
    zonesTableBody: document.getElementById('zonesTableBody'),
    statusLog: document.getElementById('statusLog'),
    metricTotalZones: document.getElementById('metricTotalZones'),
    metricMaxConnected: document.getElementById('metricMaxConnected'),
    metricVisitedCells: document.getElementById('metricVisitedCells'),
    metricTotalCells: document.getElementById('metricTotalCells'),
    btnStart: document.getElementById('btnStart'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    directionSelect: document.getElementById('directionSelect'),
    densitySelect: document.getElementById('densitySelect'),
    sizeSelect: document.getElementById('sizeSelect'),
    speedSlider: document.getElementById('speedSlider'),
    speedDisplay: document.getElementById('speedDisplay')
};

/**
 * ====== INITIALIZATION ======
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Max Connected Elements module initializing');

    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('max-connected-elements');
    }

    setupEventListeners();
    initGrid();

    console.log('Max Connected Elements module initialized');
});

/**
 * ====== EVENT LISTENERS ======
 */
function setupEventListeners() {
    maxDOM.directionSelect.addEventListener('change', function() {
        addLog('Connection strategy changed to ' + this.value + '-Way', 'info');
        resetSimulation();
    });

    maxDOM.densitySelect.addEventListener('change', function() {
        resetSimulation();
    });

    maxDOM.sizeSelect.addEventListener('change', function() {
        resetSimulation();
    });

    maxDOM.speedSlider.addEventListener('input', function() {
        CCState.delayMs = parseInt(this.value);
        maxDOM.speedDisplay.textContent = this.value + 'ms';
    });

    maxDOM.btnStart.addEventListener('click', startWaves);
    maxDOM.btnPause.addEventListener('click', togglePause);
    maxDOM.btnReset.addEventListener('click', resetSimulation);
}

/**
 * ====== GRID INITIALIZATION ======
 */
function initGrid() {
    const size = parseInt(maxDOM.sizeSelect.value);
    CCState.rows = size;
    CCState.cols = size;
    CCState.isRunning = false;
    CCState.isPaused = false;
    CCState.shouldStop = false;
    CCState.zoneList = [];
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneIdCounter = 0;

    const density = parseFloat(maxDOM.densitySelect.value);

    CCState.grid = [];
    for (let i = 0; i < size; i++) {
        CCState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            if (Math.random() < density) {
                CCState.grid[i][j] = Math.floor(Math.random() * 9) + 1;
            } else {
                CCState.grid[i][j] = 0;
            }
        }
    }

    renderGrid();
    updateMetrics();
    clearLog();
    addLog('Generated ' + size + 'x' + size + ' grid with ' + (density * 100) + '% coverage', 'info');

    let total = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (CCState.grid[i][j] > 0) total++;
        }
    }
    maxDOM.metricTotalCells.textContent = total;

    maxDOM.btnStart.disabled = false;
    maxDOM.btnPause.disabled = true;
    maxDOM.btnPause.textContent = 'Pause';
}

/**
 * ====== RENDER GRID ======
 */
function renderGrid() {
    maxDOM.gridTable.innerHTML = '';

    for (let i = 0; i < CCState.rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < CCState.cols; j++) {
            const td = document.createElement('td');
            td.id = 'cell-' + i + '-' + j;
            td.dataset.row = i;
            td.dataset.col = j;

            const val = CCState.grid[i][j];
            if (val > 0) {
                td.textContent = val;
                td.style.backgroundColor = 'var(--color-bg)';
            } else {
                td.textContent = '';
                td.style.backgroundColor = 'var(--color-bg-dark)';
                td.style.opacity = '0.3';
            }

            tr.appendChild(td);
        }
        maxDOM.gridTable.appendChild(tr);
    }
}

/**
 * ====== GET CELL ELEMENT ======
 */
function getCell(row, col) {
    return document.getElementById('cell-' + row + '-' + col);
}

/**
 * ====== UPDATE METRICS ======
 */
function updateMetrics() {
    maxDOM.metricTotalZones.textContent = CCState.zoneIdCounter;
    maxDOM.metricMaxConnected.textContent = CCState.maxComponentSize;
    maxDOM.metricVisitedCells.textContent = CCState.totalVisited;
}

/**
 * ====== LOG SYSTEM ======
 */
function addLog(message, type) {
    type = type || 'info';
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry ' + type;
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = '[' + timestamp + '] ' + message;
    maxDOM.statusLog.appendChild(logEntry);
    maxDOM.statusLog.scrollTop = maxDOM.statusLog.scrollHeight;
}

function clearLog() {
    maxDOM.statusLog.innerHTML = '';
}

/**
 * ====== SLEEP ======
 */
function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

/**
 * ====== CHECK PAUSE ======
 */
async function checkPause() {
    while (CCState.isPaused) {
        await sleep(100);
        if (CCState.shouldStop) return false;
    }
    return !CCState.shouldStop;
}

/**
 * ====== FIND VALID CELL ======
 * Checks if cell is in bounds and positive (unvisited)
 */
function find(row, col) {
    return row >= 0 && row < CCState.rows &&
        col >= 0 && col < CCState.cols &&
        CCState.grid[row][col] > 0;
}

/**
 * ====== INFECTION WAVE (Flood Fill) ======
 * Recursively spreads to all connected positive cells
 */
async function runInfectionWave(row, col, zoneObj, directions) {
    if (!CCState.isRunning) return;
    if (!await checkPause()) return;

    CCState.grid[row][col] = -1;
    zoneObj.count++;
    CCState.totalVisited++;

    if (zoneObj.count > CCState.maxComponentSize) {
        CCState.maxComponentSize = zoneObj.count;
    }

    updateMetrics();

    const countTd = document.getElementById('zone-count-' + zoneObj.id);
    if (countTd) countTd.textContent = zoneObj.count;

    const cellEl = getCell(row, col);
    if (cellEl) {
        cellEl.style.backgroundColor = zoneObj.color;
        cellEl.style.color = '#ffffff';
        cellEl.classList.add('infecting');
        await sleep(CCState.delayMs / 2);
        cellEl.classList.remove('infecting');
        cellEl.classList.add('infected');
    }

    for (const dir of directions) {
        const dr = dir[0];
        const dc = dir[1];
        const nr = row + dr;
        const nc = col + dc;
        if (find(nr, nc)) {
            await runInfectionWave(nr, nc, zoneObj, directions);
        }
    }
}

/**
 * ====== START DUAL-WAVE PROCESS ======
 * Searching wave scans grid, infection wave floods components
 */
async function startDualWaveProcess() {
    const use8Dir = maxDOM.directionSelect.value === '8';
    const directions = use8Dir ? DIRECTION_SETS[8] : DIRECTION_SETS[4];

    CCState.zoneIdCounter = 0;
    CCState.totalVisited = 0;
    CCState.maxComponentSize = 0;
    CCState.zoneList = [];

    maxDOM.zonesTableBody.innerHTML = '';

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

    for (let i = 0; i < CCState.rows; i++) {
        for (let j = 0; j < CCState.cols; j++) {
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
 * ====== FINISH PROCESS ======
 */
function finishProcess() {
    CCState.isRunning = false;
    CCState.shouldStop = false;
    CCState.isPaused = false;

    maxDOM.btnStart.disabled = false;
    maxDOM.btnPause.disabled = true;
    maxDOM.btnPause.textContent = 'Pause';
}

/**
 * ====== START WAVES ======
 */
async function startWaves() {
    if (CCState.isRunning) return;

    CCState.isRunning = true;
    CCState.shouldStop = false;
    CCState.isPaused = false;

    maxDOM.btnStart.disabled = true;
    maxDOM.btnPause.disabled = false;
    maxDOM.btnPause.textContent = 'Pause';

    try {
        await startDualWaveProcess();
    } catch (error) {
        addLog('Error: ' + error.message, 'error');
        CCState.isRunning = false;
        maxDOM.btnStart.disabled = false;
        maxDOM.btnPause.disabled = true;
    }
}

/**
 * ====== TOGGLE PAUSE ======
 */
function togglePause() {
    CCState.isPaused = !CCState.isPaused;
    maxDOM.btnPause.textContent = CCState.isPaused ? 'Resume' : 'Pause';
    addLog(CCState.isPaused ? 'Paused' : 'Resumed', 'info');
}

/**
 * ====== RESET SIMULATION ======
 */
function resetSimulation() {
    CCState.shouldStop = true;
    CCState.isPaused = false;
    CCState.isRunning = false;
    maxDOM.btnPause.textContent = 'Pause';
    maxDOM.btnStart.disabled = false;
    maxDOM.btnPause.disabled = true;
    initGrid();
    addLog('Reset complete', 'warning');
}

/**
 * ====== EXPOSE GLOBALLY ======
 */
window.startWaves = startWaves;
window.togglePause = togglePause;
window.resetSimulation = resetSimulation;

console.log('Max Connected Elements module loaded');
console.log('Features: Dual-wave search, 4 and 8-way connectivity, component tracking');