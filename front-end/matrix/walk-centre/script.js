/**
 * ============================================================
 * WALK CENTRE MODULE - script.js
 * Location: /front-end/matrix/walk-centre/script.js
 * Purpose: Grid walk simulation with Greedy & A* strategies
 * ============================================================
 */

/**
 * ====== WALK CONFIGURATION ======
 */
const WALK_CONFIG = {
    defaultSize: 7,
    defaultDelay: 300,
    strategies: {
        'greedy': 'Greedy (Max Neighbor)',
        'astar': 'A* Search (To Highest Cell)'
    }
};

/**
 * ====== DIRECTION SETS ======
 */
const DIRECTION_SETS = {
    4: [
        [-1, 0], // Up
        [0, 1], // Right
        [1, 0], // Down
        [0, -1] // Left
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
const DOM = {
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
    console.log('🚶 Walk Centre module initializing...');

    // Track visit
    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('walk-centre');
    }

    // Set up event listeners
    setupEventListeners();

    // Initialize grid
    initGrid();

    console.log('✅ Walk Centre module initialized');
});

/**
 * ====== EVENT LISTENERS ======
 */
function setupEventListeners() {
    // Strategy change
    DOM.strategySelect.addEventListener('change', function() {
        WalkState.strategy = this.value;
        addLog(`🔄 Strategy changed to ${this.options[this.selectedIndex].text}`, 'info');
        resetSimulation();
    });

    // Direction change
    DOM.directionSelect.addEventListener('change', function() {
        WalkState.directions = parseInt(this.value);
        addLog(`🔄 Move set changed to ${this.value}-Way`, 'info');
        resetSimulation();
    });

    // Size change
    DOM.sizeSelect.addEventListener('change', function() {
        resetSimulation();
    });

    // Speed slider
    DOM.speedSlider.addEventListener('input', function() {
        WalkState.delayMs = parseInt(this.value);
        DOM.speedDisplay.textContent = `${this.value}ms`;
    });

    // Buttons
    DOM.btnStart.addEventListener('click', startWalk);
    DOM.btnPause.addEventListener('click', togglePause);
    DOM.btnReset.addEventListener('click', resetSimulation);
}

/**
 * ====== GRID INITIALIZATION ======
 */
function initGrid() {
    const size = parseInt(DOM.sizeSelect.value);
    WalkState.rows = size;
    WalkState.cols = size;
    WalkState.steps = 0;
    WalkState.path = [];
    WalkState.visited = [];
    WalkState.isRunning = false;
    WalkState.isPaused = false;
    WalkState.shouldStop = false;

    // Calculate start position (center)
    WalkState.startRow = Math.floor(size / 2);
    WalkState.startCol = Math.floor(size / 2);

    // Generate random grid values (10-99)
    WalkState.grid = [];
    WalkState.maxValue = 0;
    WalkState.maxPosition = null;

    for (let i = 0; i < size; i++) {
        WalkState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            const val = Math.floor(Math.random() * 90) + 10;
            WalkState.grid[i][j] = val;

            // Track global max
            if (val > WalkState.maxValue) {
                WalkState.maxValue = val;
                WalkState.maxPosition = { row: i, col: j };
            }
        }
    }

    renderGrid();
    updateMetrics();
    clearLog();
    addLog(`🔄 Generated ${size}×${size} grid`, 'info');
    addLog(`🏔️ Global maximum: ${WalkState.maxValue} at (${WalkState.maxPosition.row}, ${WalkState.maxPosition.col})`, 'info');

    DOM.btnStart.disabled = false;
    DOM.btnPause.disabled = true;
    DOM.btnPause.textContent = '⏸️ Pause';
}

/**
 * ====== RENDER GRID ======
 */
function renderGrid() {
    DOM.matrixContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'grid-table';
    table.id = 'gridTable';

    for (let i = 0; i < WalkState.rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < WalkState.cols; j++) {
            const cell = document.createElement('td');
            cell.id = `cell-${i}-${j}`;
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = WalkState.grid[i][j];
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    DOM.matrixContainer.appendChild(table);
}

/**
 * ====== GET CELL ELEMENT ======
 */
function getCell(row, col) {
    return document.getElementById(`cell-${row}-${col}`);
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
    DOM.metricSteps.textContent = WalkState.steps;
    DOM.metricMax.textContent = WalkState.maxValue;
    DOM.metricPath.textContent = WalkState.path.length;

    // Show current value if at a cell
    if (WalkState.path.length > 0) {
        const last = WalkState.path[WalkState.path.length - 1];
        DOM.metricScore.textContent = WalkState.grid[last.row][last.col];
    } else {
        DOM.metricScore.textContent = '0';
    }
}

/**
 * ====== LOG SYSTEM ======
 */
function addLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ${message}`;
    DOM.statusLog.appendChild(logEntry);
    DOM.statusLog.scrollTop = DOM.statusLog.scrollHeight;
}

function clearLog() {
    DOM.statusLog.innerHTML = '';
}

/**
 * ====== SLEEP ======
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

    for (const [dr, dc] of dirs) {
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
    const visited = Array.from({ length: WalkState.rows }, () =>
        Array(WalkState.cols).fill(false)
    );

    while (WalkState.isRunning && !WalkState.shouldStop) {
        // Check pause
        if (!await checkPause()) break;

        // Mark current as visited
        visited[currRow][currCol] = true;
        WalkState.steps++;
        WalkState.path.push({ row: currRow, col: currCol });

        // Update UI
        const currentEl = getCell(currRow, currCol);
        if (currentEl) {
            currentEl.className = 'active';
        }

        // Update metrics
        updateMetrics();
        addLog(`📍 At (${currRow}, ${currCol}) = ${WalkState.grid[currRow][currCol]}`, 'info');

        // Check if at edge (stop condition for greedy)
        if (currRow === 0 || currRow === WalkState.rows - 1 ||
            currCol === 0 || currCol === WalkState.cols - 1) {
            addLog(`🛑 Reached edge at (${currRow}, ${currCol})! Stopping.`, 'warning');
            break;
        }

        // Find best unvisited neighbor
        const neighbors = getValidNeighbors(currRow, currCol, directions);
        let bestVal = -1;
        let bestNeighbor = null;

        for (const neighbor of neighbors) {
            const nRow = neighbor.row;
            const nCol = neighbor.col;

            if (!visited[nRow][nCol]) {
                const nEl = getCell(nRow, nCol);
                if (nEl) nEl.classList.add('evaluating');

                addLog(`  🔍 Checking neighbor (${nRow}, ${nCol}) = ${WalkState.grid[nRow][nCol]}`, 'info');
                await sleep(WalkState.delayMs / 2);

                if (WalkState.grid[nRow][nCol] > bestVal) {
                    bestVal = WalkState.grid[nRow][nCol];
                    bestNeighbor = neighbor;
                }

                if (nEl) nEl.classList.remove('evaluating');
            }
        }

        // Mark current as visited
        if (currentEl) {
            currentEl.className = 'visited';
        }

        // Move to best neighbor or stop
        if (!bestNeighbor) {
            addLog(`🔄 No unvisited neighbors available. Local peak reached.`, 'warning');
            break;
        }

        currRow = bestNeighbor.row;
        currCol = bestNeighbor.col;

        // Highlight chosen path
        const chosenEl = getCell(currRow, currCol);
        if (chosenEl) chosenEl.className = 'chosen';

        await sleep(WalkState.delayMs / 2);
    }
}

/**
 * ====== A* SEARCH STRATEGY ======
 */
async function runAStar(startRow, startCol, directions) {
    // Find global maximum target
    let targetRow = WalkState.maxPosition.row;
    let targetCol = WalkState.maxPosition.col;

    addLog(`🎯 A* targeting maximum cell at (${targetRow}, ${targetCol}) = ${WalkState.maxValue}`, 'info');

    // Heuristic: Euclidean distance to target
    const heuristic = (row, col) => {
        return Math.hypot(row - targetRow, col - targetCol);
    };

    // Open set with path
    let openSet = [{
        row: startRow,
        col: startCol,
        g: 0,
        f: heuristic(startRow, startCol),
        path: [{ row: startRow, col: startCol }]
    }];

    const visited = Array.from({ length: WalkState.rows }, () =>
        Array(WalkState.cols).fill(false)
    );

    while (openSet.length > 0 && WalkState.isRunning && !WalkState.shouldStop) {
        // Check pause
        if (!await checkPause()) break;

        // Sort by f-score (lowest first)
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        const currRow = current.row;
        const currCol = current.col;

        // Skip if already visited
        if (visited[currRow][currCol]) continue;
        visited[currRow][currCol] = true;

        // Update state
        WalkState.steps++;
        WalkState.path = current.path;

        // Update UI
        const currentEl = getCell(currRow, currCol);
        if (currentEl) {
            currentEl.className = 'active';
        }

        // Update metrics
        updateMetrics();
        addLog(`📍 Exploring (${currRow}, ${currCol}) f=${current.f.toFixed(1)}`, 'info');

        // Check if reached target
        if (currRow === targetRow && currCol === targetCol) {
            addLog(`🎉 Reached maximum cell at (${currRow}, ${currCol})!`, 'success');
            if (currentEl) currentEl.className = 'target';
            break;
        }

        // Check if at edge
        if (currRow === 0 || currRow === WalkState.rows - 1 ||
            currCol === 0 || currCol === WalkState.cols - 1) {
            addLog(`🛑 Reached edge at (${currRow}, ${currCol})! Stopping.`, 'warning');
            break;
        }

        // Mark as visited
        if (currentEl) {
            currentEl.className = 'visited';
        }

        // Explore neighbors
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

                openSet.push({
                    row: nRow,
                    col: nCol,
                    g: g,
                    f: f,
                    path: [...current.path, { row: nRow, col: nCol }]
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

    // Reset state
    WalkState.isRunning = true;
    WalkState.shouldStop = false;
    WalkState.isPaused = false;
    WalkState.steps = 0;
    WalkState.path = [];

    // Get config
    WalkState.strategy = DOM.strategySelect.value;
    WalkState.directions = parseInt(DOM.directionSelect.value);
    const size = parseInt(DOM.sizeSelect.value);
    WalkState.rows = size;
    WalkState.cols = size;
    const startRow = Math.floor(size / 2);
    const startCol = Math.floor(size / 2);

    // Update UI
    clearCellStyles();
    clearLog();
    DOM.btnStart.disabled = true;
    DOM.btnPause.disabled = false;
    DOM.btnPause.textContent = '⏸️ Pause';

    addLog(`🚶 Starting ${DOM.strategySelect.options[DOM.strategySelect.selectedIndex].text} walk from center (${startRow}, ${startCol})`, 'info');
    addLog(`🧭 Using ${WalkState.directions}-Way movement`, 'info');

    // Run strategy
    try {
        if (WalkState.strategy === 'greedy') {
            await runGreedy(startRow, startCol, WalkState.directions);
        } else if (WalkState.strategy === 'astar') {
            await runAStar(startRow, startCol, WalkState.directions);
        }
    } catch (error) {
        addLog(`❌ Error: ${error.message}`, 'error');
    }

    // Finish
    WalkState.isRunning = false;
    DOM.btnStart.disabled = false;
    DOM.btnPause.disabled = true;
    DOM.btnPause.textContent = '⏸️ Pause';

    addLog(`✅ Walk complete! ${WalkState.steps} steps, path length ${WalkState.path.length}`, 'success');
}

/**
 * ====== TOGGLE PAUSE ======
 */
function togglePause() {
    WalkState.isPaused = !WalkState.isPaused;
    DOM.btnPause.textContent = WalkState.isPaused ? '▶️ Resume' : '⏸️ Pause';
    addLog(WalkState.isPaused ? '⏸️ Paused' : '▶️ Resumed', 'info');
}

/**
 * ====== RESET SIMULATION ======
 */
function resetSimulation() {
    WalkState.shouldStop = true;
    WalkState.isPaused = false;
    WalkState.isRunning = false;
    DOM.btnPause.textContent = '⏸️ Pause';
    DOM.btnStart.disabled = false;
    DOM.btnPause.disabled = true;
    initGrid();
    addLog('⏹ Reset complete', 'warning');
}

/**
 * ====== EXPOSE GLOBALLY ======
 */
window.startWalk = startWalk;
window.togglePause = togglePause;
window.resetSimulation = resetSimulation;

console.log('🚶 Walk Centre module loaded');
console.log('🧭 Available: Greedy & A* strategies with 4/8-Way movement');