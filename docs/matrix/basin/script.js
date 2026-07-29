/**
 * ============================================================
 * BASIN MODULE - script.js
 * Location: /front-end/matrix/basin/script.js
 * Purpose: Complete basin detection (local minima) visualizer
 * ============================================================
 */

/**
 * ====== BASIN CONFIGURATION ======
 */
const BASIN_CONFIG = {
    defaultSize: 9,
    defaultMaxValue: 9,
    strategies: {
        'full-scan': 'Full Grid Scan'
    }
};

/**
 * ====== BASIN STATE ======
 */
const BasinState = {
    grid: [],
    rows: 9,
    cols: 9,
    maxValue: 9,
    isRunning: false,
    isPaused: false,
    shouldStop: false,
    stats: {
        totalBasins: 0,
        cellsScanned: 0,
        totalCells: 0,
        minValue: Infinity,
        maxValue: -Infinity,
        sumValues: 0
    },
    foundBasins: []
};

/**
 * ====== DOM REFERENCES ======
 */
const basinDOM = {
    matrixContainer: document.getElementById('matrixContainer'),
    comparisonSpace: document.getElementById('comparisonSpace'),
    logsDisplay: document.getElementById('logsDisplay'),
    basinCount: document.getElementById('basinCount'),
    cellsScanned: document.getElementById('cellsScanned'),
    scanProgress: document.getElementById('scanProgress'),
    avgValue: document.getElementById('avgValue'),
    minValue: document.getElementById('minValue'),
    maxValue: document.getElementById('maxValue'),
    sizeSelect: document.getElementById('sizeSelect'),
    valueRange: document.getElementById('valueRange'),
    speedSlider: document.getElementById('speedSlider'),
    speedDisplay: document.getElementById('speedDisplay'),
    analysisSection: document.getElementById('analysisSection'),
    analysisGrid: document.getElementById('analysisGrid')
};

/**
 * ====== INITIALIZATION ======
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Basin module initializing');

    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('basin');
    }

    setupEventListeners();
    generateGrid();

    addLog('Basin module ready', 'success');
    console.log('Basin module initialized');
});

/**
 * ====== EVENT LISTENERS ======
 */
function setupEventListeners() {
    basinDOM.sizeSelect.addEventListener('change', function() {
        generateGrid();
    });

    basinDOM.valueRange.addEventListener('change', function() {
        generateGrid();
    });

    basinDOM.speedSlider.addEventListener('input', function() {
        basinDOM.speedDisplay.textContent = this.value + 'ms';
    });
}

/**
 * ====== GRID GENERATION ======
 */
function generateGrid() {
    if (BasinState.isRunning) {
        addLog('Please wait for current scan to finish', 'warning');
        return;
    }

    BasinState.shouldStop = true;
    BasinState.isPaused = false;

    const size = parseInt(basinDOM.sizeSelect.value);
    const maxVal = parseInt(basinDOM.valueRange.value);

    BasinState.rows = size;
    BasinState.cols = size;
    BasinState.maxValue = maxVal;
    BasinState.stats = {
        totalBasins: 0,
        cellsScanned: 0,
        totalCells: size * size,
        minValue: Infinity,
        maxValue: -Infinity,
        sumValues: 0
    };
    BasinState.foundBasins = [];

    BasinState.grid = [];
    for (let i = 0; i < size; i++) {
        BasinState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            const val = Math.floor(Math.random() * (maxVal + 1));
            BasinState.grid[i][j] = val;

            if (val < BasinState.stats.minValue) BasinState.stats.minValue = val;
            if (val > BasinState.stats.maxValue) BasinState.stats.maxValue = val;
            BasinState.stats.sumValues += val;
        }
    }

    renderGrid();
    updateStats();
    updateAnalysis();

    basinDOM.comparisonSpace.innerHTML = 'New grid generated. Click Find Basins to begin analysis.';
    addLog('Generated ' + size + 'x' + size + ' grid (values 0-' + maxVal + ')', 'info');
}

/**
 * ====== RENDER GRID ======
 */
function renderGrid() {
    basinDOM.matrixContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'terrain-grid';

    for (let i = 0; i < BasinState.rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < BasinState.cols; j++) {
            const cell = document.createElement('td');
            cell.id = 'cell-' + i + '-' + j;
            cell.dataset.row = i;
            cell.dataset.col = j;

            const value = BasinState.grid[i][j];
            cell.textContent = value;

            const valClass = 'value-' + Math.min(value, 9);
            cell.classList.add(valClass);

            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    basinDOM.matrixContainer.appendChild(table);
}

/**
 * ====== UPDATE CELL ======
 */
function updateCell(row, col, className) {
    const cell = document.getElementById('cell-' + row + '-' + col);
    if (cell) {
        cell.classList.remove('scanning', 'basin', 'basin-found', 'neighbor-highlight');
        if (className) {
            cell.classList.add(className);
        }
    }
}

/**
 * ====== UPDATE STATS ======
 */
function updateStats() {
    basinDOM.basinCount.textContent = BasinState.stats.totalBasins;
    basinDOM.cellsScanned.textContent = BasinState.stats.cellsScanned;

    const progress = BasinState.stats.totalCells > 0 ?
        Math.round((BasinState.stats.cellsScanned / BasinState.stats.totalCells) * 100) :
        0;
    basinDOM.scanProgress.textContent = progress + '%';

    basinDOM.avgValue.textContent = BasinState.stats.totalCells > 0 ?
        (BasinState.stats.sumValues / BasinState.stats.totalCells).toFixed(1) :
        '-';
    basinDOM.minValue.textContent = BasinState.stats.minValue !== Infinity ? BasinState.stats.minValue : '-';
    basinDOM.maxValue.textContent = BasinState.stats.maxValue !== -Infinity ? BasinState.stats.maxValue : '-';
}

/**
 * ====== UPDATE ANALYSIS ======
 */
function updateAnalysis() {
    const grid = BasinState.grid;
    const rows = BasinState.rows;
    const cols = BasinState.cols;

    const basins = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (isBasin(i, j)) {
                basins.push({ row: i, col: j, value: grid[i][j] });
            }
        }
    }

    let flatAreas = 0;
    let steepestSlope = 0;
    let avgNeighborDiff = 0;
    let totalDiff = 0;
    let neighborCount = 0;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const neighbors = getValidNeighbors(i, j);
            if (neighbors.length === 0) continue;

            let maxDiff = 0;
            let sumDiff = 0;

            for (const neighbor of neighbors) {
                const diff = Math.abs(grid[i][j] - neighbor.val);
                if (diff > maxDiff) maxDiff = diff;
                sumDiff += diff;
            }

            if (maxDiff === 0) flatAreas++;
            if (maxDiff > steepestSlope) steepestSlope = maxDiff;
            totalDiff += sumDiff / neighbors.length;
            neighborCount++;
        }
    }

    avgNeighborDiff = neighborCount > 0 ? totalDiff / neighborCount : 0;

    basinDOM.analysisSection.style.display = 'block';
    basinDOM.analysisGrid.innerHTML =
        '<div class="analysis-item">' +
        '<h4>Total Basins</h4>' +
        '<div class="value">' + basins.length + '</div>' +
        '</div>' +
        '<div class="analysis-item">' +
        '<h4>Average Neighbor Diff</h4>' +
        '<div class="value">' + avgNeighborDiff.toFixed(2) + '</div>' +
        '</div>' +
        '<div class="analysis-item">' +
        '<h4>Steepest Slope</h4>' +
        '<div class="value">' + steepestSlope + '</div>' +
        '</div>' +
        '<div class="analysis-item">' +
        '<h4>Flat Areas</h4>' +
        '<div class="value">' + flatAreas + '</div>' +
        '</div>' +
        '<div class="analysis-item">' +
        '<h4>Basin Density</h4>' +
        '<div class="value">' + (basins.length / (rows * cols) * 100).toFixed(1) + '%</div>' +
        '</div>' +
        '<div class="analysis-item">' +
        '<h4>Terrain Complexity</h4>' +
        '<div class="value">' + (avgNeighborDiff / BasinState.maxValue * 100).toFixed(0) + '%</div>' +
        '</div>';
}

/**
 * ====== BASIN DETECTION ======
 */
function findBasins() {
    if (BasinState.isRunning) {
        addLog('Already running', 'warning');
        return;
    }

    BasinState.isRunning = true;
    BasinState.shouldStop = false;
    BasinState.isPaused = false;
    BasinState.stats = {
        totalBasins: 0,
        cellsScanned: 0,
        totalCells: BasinState.rows * BasinState.cols,
        minValue: Infinity,
        maxValue: -Infinity,
        sumValues: 0
    };
    BasinState.foundBasins = [];

    for (let i = 0; i < BasinState.rows; i++) {
        for (let j = 0; j < BasinState.cols; j++) {
            updateCell(i, j, '');
        }
    }

    document.querySelectorAll('.btn').forEach(btn => btn.disabled = true);

    addLog('Starting basin detection scan', 'info');
    basinDOM.comparisonSpace.innerHTML = 'Scanning grid for local minima';

    scanGrid();
}

/**
 * ====== SCAN GRID ======
 */
async function scanGrid() {
    const speed = parseInt(basinDOM.speedSlider.value);

    for (let i = 0; i < BasinState.rows; i++) {
        for (let j = 0; j < BasinState.cols; j++) {
            if (BasinState.shouldStop) {
                addLog('Scan stopped by user', 'warning');
                finishScan(false);
                return;
            }

            while (BasinState.isPaused) {
                await sleep(100);
                if (BasinState.shouldStop) {
                    addLog('Scan stopped while paused', 'warning');
                    finishScan(false);
                    return;
                }
            }

            const currentVal = BasinState.grid[i][j];
            const neighbors = getValidNeighbors(i, j);

            updateCell(i, j, 'scanning');

            let neighborDisplay = neighbors.map(function(n) {
                return n.val + ' ' + (n.val < currentVal ? 'down' : n.val > currentVal ? 'up' : 'equal');
            }).join(' | ');

            basinDOM.comparisonSpace.innerHTML =
                '<div style="margin-bottom: 8px;">' +
                '<span class="highlight-cell">Testing Cell (' + i + ', ' + j + ')</span>' +
                '<span style="color: var(--color-text-light);">[Value: </span>' +
                '<span style="color: var(--color-primary-light); font-weight: 700;">' + currentVal + '</span>' +
                '<span style="color: var(--color-text-light);">]</span>' +
                '</div>' +
                '<div>' +
                '<span class="neighbor-text">Neighbors:</span>' +
                '<span style="color: var(--color-text-muted);">[' + neighborDisplay + ']</span>' +
                '</div>';

            for (const neighbor of neighbors) {
                updateCell(neighbor.r, neighbor.c, 'neighbor-highlight');
            }

            const basin = isBasin(i, j);

            if (basin) {
                updateCell(i, j, 'basin');
                BasinState.foundBasins.push({ row: i, col: j, value: currentVal });
                BasinState.stats.totalBasins++;

                basinDOM.comparisonSpace.innerHTML +=
                    '<div style="margin-top: 8px; color: var(--color-success); font-weight: 700;">' +
                    'BASIN FOUND (' + currentVal + ' less than all neighbors)' +
                    '</div>';

                addLog('Basin found at (' + i + ', ' + j + ') with value ' + currentVal, 'success');
            } else {
                updateCell(i, j, '');

                const basinFound = BasinState.foundBasins.some(function(b) {
                    return b.row === i && b.col === j;
                });
                if (!basinFound) {
                    basinDOM.comparisonSpace.innerHTML +=
                        '<div style="margin-top: 8px; color: var(--color-text-muted);">' +
                        'Not a basin (has smaller or equal neighbor)' +
                        '</div>';
                }
            }

            BasinState.stats.cellsScanned++;
            updateStats();

            await sleep(speed);
        }
    }

    addLog('Scan complete. Found ' + BasinState.stats.totalBasins + ' basins', 'success');
    basinDOM.comparisonSpace.innerHTML =
        '<div style="font-size: 1.2rem; color: var(--color-success); font-weight: 700;">' +
        'Scan Complete' +
        '</div>' +
        '<div style="margin-top: 8px; color: var(--color-text-muted);">' +
        'Found ' + BasinState.stats.totalBasins + ' basins out of ' + BasinState.stats.totalCells + ' cells' +
        ' (' + (BasinState.stats.totalBasins / BasinState.stats.totalCells * 100).toFixed(1) + '%)' +
        '</div>';

    finishScan(true);
}

/**
 * ====== FINISH SCAN ======
 */
function finishScan(success) {
    BasinState.isRunning = false;
    BasinState.shouldStop = false;
    BasinState.isPaused = false;

    document.querySelectorAll('.btn').forEach(btn => btn.disabled = false);

    if (success) {
        for (const basin of BasinState.foundBasins) {
            updateCell(basin.row, basin.col, 'basin-found');
        }
        updateAnalysis();
    }
}

/**
 * ====== UTILITY FUNCTIONS ======
 */

function getValidNeighbors(r, c) {
    const neighbors = [];
    const grid = BasinState.grid;
    const rows = BasinState.rows;
    const cols = BasinState.cols;

    if (r - 1 >= 0) neighbors.push({ r: r - 1, c: c, val: grid[r - 1][c] });
    if (r + 1 < rows) neighbors.push({ r: r + 1, c: c, val: grid[r + 1][c] });
    if (c - 1 >= 0) neighbors.push({ r: r, c: c - 1, val: grid[r][c - 1] });
    if (c + 1 < cols) neighbors.push({ r: r, c: c + 1, val: grid[r][c + 1] });

    return neighbors;
}

function isBasin(r, c) {
    const currentVal = BasinState.grid[r][c];
    const neighbors = getValidNeighbors(r, c);

    for (const neighbor of neighbors) {
        if (currentVal >= neighbor.val) {
            return false;
        }
    }
    return true;
}

/**
 * ====== CONTROLS ======
 */
function togglePause() {
    if (!BasinState.isRunning) {
        addLog('No scan in progress to pause', 'warning');
        return;
    }

    BasinState.isPaused = !BasinState.isPaused;
    addLog(BasinState.isPaused ? 'Paused' : 'Resumed', 'info');
    document.querySelector('.btn-warning').textContent =
        BasinState.isPaused ? 'Resume' : 'Pause';
}

function resetAll() {
    BasinState.shouldStop = true;
    BasinState.isPaused = false;
    BasinState.isRunning = false;

    document.querySelector('.btn-warning').textContent = 'Pause';
    document.querySelectorAll('.btn').forEach(btn => btn.disabled = false);

    generateGrid();
    addLog('Reset complete', 'warning');
}

function analyzeTerrain() {
    if (BasinState.isRunning) {
        addLog('Please wait for scan to finish', 'warning');
        return;
    }
    updateAnalysis();
    addLog('Terrain analysis updated', 'info');
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
    basinDOM.logsDisplay.appendChild(logEntry);
    basinDOM.logsDisplay.scrollTop = basinDOM.logsDisplay.scrollHeight;
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
 * ====== EXPOSE GLOBALLY ======
 */
window.generateGrid = generateGrid;
window.findBasins = findBasins;
window.togglePause = togglePause;
window.resetAll = resetAll;
window.analyzeTerrain = analyzeTerrain;

console.log('Basin module loaded');
console.log('Features: Full grid scan, real-time comparison, terrain analysis');