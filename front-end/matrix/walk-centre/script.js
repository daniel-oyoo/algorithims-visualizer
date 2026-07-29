/**
 * ============================================================
 * WALK CENTRE MODULE - script.js
 * Location: /front-end/matrix/walk-centre/script.js
 * Purpose: Grid walk simulation with Greedy and A star strategies
 * ============================================================
 */

/**
 * ====== WALK CONFIGURATION ======
 */
const WALK_CONFIG = {
    defaultSize: 7,
    defaultDelay: 300,
    strategies: {
        'greedy': 'Greedy Max Neighbor',
        'astar': 'A Star Search To Highest Cell'
    }
};

/**
 * ====== DIRECTION SETS ======
 */
const DIRECTION_SETS = {
    4: [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1]
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
 * ====== WALK STATE ======
 */
const WalkState = {
    grid: [],
    rows: 7,
    cols: 7,
    isRunning: false,
    isPaused: false,
    shouldStop: false,
    delayMs: 300,
    steps: 0,
    path: [],
    visited: [],
    maxValue: 0,
    maxPosition: null,
    strategy: 'greedy',
    directions: 4,
    startRow: 0,
    startCol: 0
};

/**
 * ====== DOM REFERENCES ======
 */
const walkDOM = {
    matrixContainer: document.getElementById('matrixContainer'),
    statusLog: document.getElementById('statusLog'),
    metricSteps: document.getElementById('metricSteps'),
    metricScore: document.getElementById('metricScore'),
    metricMax: document.getElementById('metricMax'),
    metricPath: document.getElementById('metricPath'),
    btnStart: document.getElementById('btnStart'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    strategySelect: document.getElementById('strategySelect'),
    directionSelect: document.getElementById('directionSelect'),
    sizeSelect: document.getElementById('sizeSelect'),
    speedSlider: document.getElementById('speedSlider'),
    speedDisplay: document.getElementById('speedDisplay')
};

/**
 * ====== INITIALIZATION ======
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Walk Centre module initializing');

    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('walk-centre');
    }

    setupEventListeners();
    initGrid();

    console.log('Walk Centre module initialized');
});

/**
 * ====== EVENT LISTENERS ======
 */
function setupEventListeners() {
    walkDOM.strategySelect.addEventListener('change', function() {
        WalkState.strategy = this.value;
        addLog('Strategy changed to ' + this.options[this.selectedIndex].text, 'info');
        resetSimulation();
    });

    walkDOM.directionSelect.addEventListener('change', function() {
        WalkState.directions = parseInt(this.value);
        addLog('Move set changed to ' + this.value + '-Way', 'info');
        resetSimulation();
    });

    walkDOM.sizeSelect.addEventListener('change', function() {
        resetSimulation();
    });

    walkDOM.speedSlider.addEventListener('input', function() {
        WalkState.delayMs = parseInt(this.value);
        walkDOM.speedDisplay.textContent = this.value + 'ms';
    });

    walkDOM.btnStart.addEventListener('click', startWalk);
    walkDOM.btnPause.addEventListener('click', togglePause);
    walkDOM.btnReset.addEventListener('click', resetSimulation);
}

/**
 * ====== GRID INITIALIZATION ======
 */
function initGrid() {
    const size = parseInt(walkDOM.sizeSelect.value);
    WalkState.rows = size;
    WalkState.cols = size;
    WalkState.steps = 0;
    WalkState.path = [];
    WalkState.visited = [];
    WalkState.isRunning = false;
    WalkState.isPaused = false;
    WalkState.shouldStop = false;

    WalkState.startRow = Math.floor(size / 2);
    WalkState.startCol = Math.floor(size / 2);

    WalkState.grid = [];
    WalkState.maxValue = 0;
    WalkState.maxPosition = null;

    for (let i = 0; i < size; i++) {
        WalkState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            const val = Math.floor(Math.random() * 90) + 10;
            WalkState.grid[i][j] = val;

            if (val > WalkState.maxValue) {
                WalkState.maxValue = val;
                WalkState.maxPosition = { row: i, col: j };
            }
        }
    }

    renderGrid();
    updateMetrics();
    clearLog();
    addLog('Generated ' + size + 'x' + size + ' grid', 'info');
    addLog('Global maximum: ' + WalkState.maxValue + ' at (' + WalkState.maxPosition.row + ', ' + WalkState.maxPosition.col + ')', 'info');

    walkDOM.btnStart.disabled = false;
    walkDOM.btnPause.disabled = true;
    walkDOM.btnPause.textContent = 'Pause';
}

/**
 * ====== RENDER GRID ======
 */
function renderGrid() {
    walkDOM.matrixContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'grid-table';
    table.id = 'gridTable';

    for (let i = 0; i < WalkState.rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < WalkState.cols; j++) {
            const cell = document.createElement('td');
            cell.id = 'cell-' + i + '-' + j;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = WalkState.grid[i][j];
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    walkDOM.matrixContainer.appendChild(table);
}

/**
 * ====== GET CELL ELEMENT ======
 */
function getCell(row, col) {
    return document.getElementById('cell-' + row + '-' + col);
}

/**
 * ====== CLEAR CELL STYLES ======
 */
function clearCellStyles() {
    for (let i = 0; i < WalkState.rows; i++) {
        for (let j = 0; j < WalkState.cols; j++) {
            const cell = getCell(i, j);
            if (cell) cell.className = '';
        }
    }
}

/**
 * ====== UPDATE METRICS ======
 */
function updateMetrics() {
    walkDOM.metricSteps.textContent = WalkState.steps;
    walkDOM.metricMax.textContent = WalkState.maxValue;
    walkDOM.metricPath.textContent = WalkState.path.length;

    if (WalkState.path.length > 0) {
        const last = WalkState.path[WalkState.path.length - 1];
        walkDOM.metricScore.textContent = WalkState.grid[last.row][last.col];
    } else {
        walkDOM.metricScore.textContent = '0';
    }
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
    walkDOM.statusLog.appendChild(logEntry);
    walkDOM.statusLog.scrollTop = walkDOM.statusLog.scrollHeight;
}

function clearLog() {
    walkDOM.statusLog.innerHTML = '';
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
    while (WalkState.isPaused) {
        await sleep(100);
        if (WalkState.shouldStop) return false;
    }
    return !WalkState.shouldStop;
}

/**
 * ====== GET VALID NEIGHBORS ======
 */
function getValidNeighbors(row, col, directions) {
    const neighbors = [];
    const dirs = DIRECTION_SETS[directions] || DIRECTION_SETS[4];

    for (const dir of dirs) {
        const dr = dir[0];
        const dc = dir[1];
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < WalkState.rows && nc >= 0 && nc < WalkState.cols) {
            neighbors.push({ row: nr, col: nc });
        }
    }

    return neighbors;
}

/**
 * ====== GREEDY STRATEGY ======
 */
async function runGreedy(startRow, startCol, directions) {
    let currRow = startRow;
    let currCol = startCol;
    const visited = Array.from({ length: WalkState.rows }, function() {
        return Array(WalkState.cols).fill(false);
    });

    while (WalkState.isRunning && !WalkState.shouldStop) {
        if (!await checkPause()) break;

        visited[currRow][currCol] = true;
        WalkState.steps++;
        WalkState.path.push({ row: currRow, col: currCol });

        const currentEl = getCell(currRow, currCol);
        if (currentEl) {
            currentEl.className = 'active';
        }

        updateMetrics();
        addLog('At (' + currRow + ', ' + currCol + ') = ' + WalkState.grid[currRow][currCol], 'info');

        if (currRow === 0 || currRow === WalkState.rows - 1 ||
            currCol === 0 || currCol === WalkState.cols - 1) {
            addLog('Reached edge at (' + currRow + ', ' + currCol + '). Stopping.', 'warning');
            break;
        }

        const neighbors = getValidNeighbors(currRow, currCol, directions);
        let bestVal = -1;
        let bestNeighbor = null;

        for (const neighbor of neighbors) {
            const nRow = neighbor.row;
            const nCol = neighbor.col;

            if (!visited[nRow][nCol]) {
                const nEl = getCell(nRow, nCol);
                if (nEl) nEl.classList.add('evaluating');

                addLog('Checking neighbor (' + nRow + ', ' + nCol + ') = ' + WalkState.grid[nRow][nCol], 'info');
                await sleep(WalkState.delayMs / 2);

                if (WalkState.grid[nRow][nCol] > bestVal) {
                    bestVal = WalkState.grid[nRow][nCol];
                    bestNeighbor = neighbor;
                }

                if (nEl) nEl.classList.remove('evaluating');
            }
        }

        if (currentEl) {
            currentEl.className = 'visited';
        }

        if (!bestNeighbor) {
            addLog('No unvisited neighbors available. Local peak reached.', 'warning');
            break;
        }

        currRow = bestNeighbor.row;
        currCol = bestNeighbor.col;

        const chosenEl = getCell(currRow, currCol);
        if (chosenEl) chosenEl.className = 'chosen';

        await sleep(WalkState.delayMs / 2);
    }
}

/**
 * ====== A STAR SEARCH STRATEGY ======
 */
async function runAStar(startRow, startCol, directions) {
    const targetRow = WalkState.maxPosition.row;
    const targetCol = WalkState.maxPosition.col;

    addLog('A star targeting maximum cell at (' + targetRow + ', ' + targetCol + ') = ' + WalkState.maxValue, 'info');

    const heuristic = function(row, col) {
        return Math.hypot(row - targetRow, col - targetCol);
    };

    let openSet = [{
        row: startRow,
        col: startCol,
        g: 0,
        f: heuristic(startRow, startCol),
        path: [{ row: startRow, col: startCol }]
    }];

    const visited = Array.from({ length: WalkState.rows }, function() {
        return Array(WalkState.cols).fill(false);
    });

    while (openSet.length > 0 && WalkState.isRunning && !WalkState.shouldStop) {
        if (!await checkPause()) break;

        openSet.sort(function(a, b) {
            return a.f - b.f;
        });
        const current = openSet.shift();

        const currRow = current.row;
        const currCol = current.col;

        if (visited[currRow][currCol]) continue;
        visited[currRow][currCol] = true;

        WalkState.steps++;
        WalkState.path = current.path;

        const currentEl = getCell(currRow, currCol);
        if (currentEl) {
            currentEl.className = 'active';
        }

        updateMetrics();
        addLog('Exploring (' + currRow + ', ' + currCol + ') f=' + current.f.toFixed(1), 'info');

        if (currRow === targetRow && currCol === targetCol) {
            addLog('Reached maximum cell at (' + currRow + ', ' + currCol + ')!', 'success');
            if (currentEl) currentEl.className = 'target';
            break;
        }

        if (currRow === 0 || currRow === WalkState.rows - 1 ||
            currCol === 0 || currCol === WalkState.cols - 1) {
            addLog('Reached edge at (' + currRow + ', ' + currCol + '). Stopping.', 'warning');
            break;
        }

        if (currentEl) {
            currentEl.className = 'visited';
        }

        const neighbors = getValidNeighbors(currRow, currCol, directions);
        for (const neighbor of neighbors) {
            const nRow = neighbor.row;
            const nCol = neighbor.col;

            if (!visited[nRow][nCol]) {
                const nEl = getCell(nRow, nCol);
                if (nEl) nEl.classList.add('evaluating');

                const g = current.g + 1;
                const h = heuristic(nRow, nCol);
                const f = g + h;

                const newPath = current.path.slice();
                newPath.push({ row: nRow, col: nCol });

                openSet.push({
                    row: nRow,
                    col: nCol,
                    g: g,
                    f: f,
                    path: newPath
                });

                await sleep(WalkState.delayMs / 3);
                if (nEl) nEl.classList.remove('evaluating');
            }
        }

        await sleep(WalkState.delayMs / 2);
    }
}

/**
 * ====== START WALK ======
 */
async function startWalk() {
    if (WalkState.isRunning) return;

    WalkState.isRunning = true;
    WalkState.shouldStop = false;
    WalkState.isPaused = false;
    WalkState.steps = 0;
    WalkState.path = [];

    WalkState.strategy = walkDOM.strategySelect.value;
    WalkState.directions = parseInt(walkDOM.directionSelect.value);
    const size = parseInt(walkDOM.sizeSelect.value);
    WalkState.rows = size;
    WalkState.cols = size;
    const startRow = Math.floor(size / 2);
    const startCol = Math.floor(size / 2);

    clearCellStyles();
    clearLog();
    walkDOM.btnStart.disabled = true;
    walkDOM.btnPause.disabled = false;
    walkDOM.btnPause.textContent = 'Pause';

    addLog('Starting ' + walkDOM.strategySelect.options[walkDOM.strategySelect.selectedIndex].text + ' walk from center (' + startRow + ', ' + startCol + ')', 'info');
    addLog('Using ' + WalkState.directions + '-Way movement', 'info');

    try {
        if (WalkState.strategy === 'greedy') {
            await runGreedy(startRow, startCol, WalkState.directions);
        } else if (WalkState.strategy === 'astar') {
            await runAStar(startRow, startCol, WalkState.directions);
        }
    } catch (error) {
        addLog('Error: ' + error.message, 'error');
    }

    WalkState.isRunning = false;
    walkDOM.btnStart.disabled = false;
    walkDOM.btnPause.disabled = true;
    walkDOM.btnPause.textContent = 'Pause';

    addLog('Walk complete. ' + WalkState.steps + ' steps, path length ' + WalkState.path.length, 'success');
}

/**
 * ====== TOGGLE PAUSE ======
 */
function togglePause() {
    WalkState.isPaused = !WalkState.isPaused;
    walkDOM.btnPause.textContent = WalkState.isPaused ? 'Resume' : 'Pause';
    addLog(WalkState.isPaused ? 'Paused' : 'Resumed', 'info');
}

/**
 * ====== RESET SIMULATION ======
 */
function resetSimulation() {
    WalkState.shouldStop = true;
    WalkState.isPaused = false;
    WalkState.isRunning = false;
    walkDOM.btnPause.textContent = 'Pause';
    walkDOM.btnStart.disabled = false;
    walkDOM.btnPause.disabled = true;
    initGrid();
    addLog('Reset complete', 'warning');
}

/**
 * ====== EXPOSE GLOBALLY ======
 */
window.startWalk = startWalk;
window.togglePause = togglePause;
window.resetSimulation = resetSimulation;

console.log('Walk Centre module loaded');
console.log('Available: Greedy and A star strategies with 4 and 8 Way movement');