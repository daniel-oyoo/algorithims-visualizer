/**
 * ============================================================
 * GROWING RECTANGLES OF ONES MODULE - script.js
 * Location: /docs/matrix/max-connected-rectangles/script.js
 * Purpose: Find and animate all-1 rectangles in a binary matrix
 * ============================================================
 */

const RectangleState = {
    grid: [],
    rows: 9,
    cols: 9,
    isRunning: false,
    isPaused: false,
    shouldStop: false,
    resetRequested: false,
    rectanglesFound: 0,
    candidatesChecked: 0
};

const rectangleDOM = {
    gridContainer: document.getElementById('gridContainer'),
    statusDisplay: document.getElementById('statusDisplay'),
    rectangleCount: document.getElementById('rectangleCount'),
    candidateCount: document.getElementById('candidateCount'),
    logsDisplay: document.getElementById('logsDisplay'),
    sizeSelect: document.getElementById('sizeSelect'),
    speedSlider: document.getElementById('speedSlider'),
    speedDisplay: document.getElementById('speedDisplay'),
    generateButton: document.getElementById('generateButton'),
    startButton: document.getElementById('startButton'),
    pauseButton: document.getElementById('pauseButton'),
    resetButton: document.getElementById('resetButton')
};

document.addEventListener('DOMContentLoaded', function() {
    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('max-connected-rectangles');
    }

    rectangleDOM.generateButton.addEventListener('click', generateGrid);
    rectangleDOM.startButton.addEventListener('click', visualizeRectangles);
    rectangleDOM.pauseButton.addEventListener('click', togglePause);
    rectangleDOM.resetButton.addEventListener('click', resetVisualizer);
    rectangleDOM.sizeSelect.addEventListener('change', generateGrid);
    rectangleDOM.speedSlider.addEventListener('input', function() {
        rectangleDOM.speedDisplay.textContent = this.value + 'ms';
    });

    generateGrid();
});

function generateGrid() {
    if (RectangleState.isRunning) {
        return;
    }

    const size = parseInt(rectangleDOM.sizeSelect.value, 10);
    RectangleState.rows = size;
    RectangleState.cols = size;
    RectangleState.rectanglesFound = 0;
    RectangleState.candidatesChecked = 0;
    RectangleState.grid = Array.from({ length: size }, function() {
        return Array.from({ length: size }, function() {
            return Math.floor(Math.random() * 2);
        });
    });

    renderGrid();
    updateCounts();
    rectangleDOM.statusDisplay.textContent = 'New ' + size + '×' + size +
        ' binary grid generated. Start the visualization to scan it.';
    addLog('Generated a ' + size + '×' + size + ' binary grid.');
}

function renderGrid() {
    const table = document.createElement('table');
    table.className = 'rectangle-grid';
    table.setAttribute('role', 'grid');

    for (let rowIndex = 0; rowIndex < RectangleState.rows; rowIndex++) {
        const row = document.createElement('tr');
        for (let colIndex = 0; colIndex < RectangleState.cols; colIndex++) {
            const cell = document.createElement('td');
            cell.id = 'rectangle-cell-' + rowIndex + '-' + colIndex;
            cell.className = 'rectangle-cell';
            cell.textContent = RectangleState.grid[rowIndex][colIndex];
            cell.setAttribute('role', 'gridcell');
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    rectangleDOM.gridContainer.replaceChildren(table);
}

async function visualizeRectangles() {
    if (RectangleState.isRunning) {
        return;
    }

    RectangleState.isRunning = true;
    RectangleState.isPaused = false;
    RectangleState.shouldStop = false;
    RectangleState.rectanglesFound = 0;
    RectangleState.candidatesChecked = 0;
    setRunningControls(true);
    updateCounts();
    addLog('Started scanning for rectangles made entirely of 1s.');

    const delay = parseInt(rectangleDOM.speedSlider.value, 10);

    for (let startRow = 0; startRow < RectangleState.rows; startRow++) {
        for (let startCol = 0; startCol < RectangleState.cols; startCol++) {
            if (RectangleState.grid[startRow][startCol] !== 1) {
                continue;
            }

            for (let endRow = startRow; endRow < RectangleState.rows; endRow++) {
                for (let endCol = startCol; endCol < RectangleState.cols; endCol++) {
                    if (!await waitUntilResumed()) {
                        stopVisualization();
                        return;
                    }

                    RectangleState.candidatesChecked++;
                    if (!isValidRectangle(startRow, startCol, endRow, endCol)) {
                        continue;
                    }

                    RectangleState.rectanglesFound++;
                    highlightRectangle(startRow, startCol, endRow, endCol);
                    rectangleDOM.statusDisplay.textContent =
                        'Rectangle ' + RectangleState.rectanglesFound + ': (' +
                        startRow + ', ' + startCol + ') to (' + endRow + ', ' + endCol + ')';
                    updateCounts();
                    await sleep(delay);
                }
            }
        }
    }

    clearHighlights();
    rectangleDOM.statusDisplay.textContent =
        'Scan complete. Found ' + RectangleState.rectanglesFound +
        ' valid rectangle' + (RectangleState.rectanglesFound === 1 ? '' : 's') +
        ' after checking ' + RectangleState.candidatesChecked + ' candidates.';
    addLog('Scan complete. Found ' + RectangleState.rectanglesFound + ' valid rectangles.');
    finishVisualization();
}

function isValidRectangle(startRow, startCol, endRow, endCol) {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (RectangleState.grid[row][col] !== 1) {
                return false;
            }
        }
    }
    return true;
}

function highlightRectangle(startRow, startCol, endRow, endCol) {
    clearHighlights();
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cell = document.getElementById('rectangle-cell-' + row + '-' + col);
            if (cell) {
                cell.classList.add('rectangle-highlight');
            }
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.rectangle-cell.rectangle-highlight').forEach(function(cell) {
        cell.classList.remove('rectangle-highlight');
    });
}

async function waitUntilResumed() {
    while (RectangleState.isPaused && !RectangleState.shouldStop) {
        await sleep(100);
    }
    return !RectangleState.shouldStop;
}

function togglePause() {
    if (!RectangleState.isRunning) {
        return;
    }

    RectangleState.isPaused = !RectangleState.isPaused;
    rectangleDOM.pauseButton.textContent = RectangleState.isPaused ? 'Resume' : 'Pause';
    rectangleDOM.statusDisplay.textContent = RectangleState.isPaused ?
        'Visualization paused.' : 'Visualization resumed.';
}

function resetVisualizer() {
    if (RectangleState.isRunning) {
        RectangleState.resetRequested = true;
        RectangleState.shouldStop = true;
        RectangleState.isPaused = false;
        return;
    }

    generateGrid();
    addLog('Reset and generated a fresh grid.');
}

function stopVisualization() {
    clearHighlights();
    rectangleDOM.statusDisplay.textContent = 'Visualization stopped.';
    addLog('Visualization stopped.');
    finishVisualization();
}

function finishVisualization() {
    RectangleState.isRunning = false;
    RectangleState.isPaused = false;
    RectangleState.shouldStop = false;
    rectangleDOM.pauseButton.textContent = 'Pause';
    setRunningControls(false);

    if (RectangleState.resetRequested) {
        RectangleState.resetRequested = false;
        generateGrid();
        addLog('Reset and generated a fresh grid.');
    }
}

function setRunningControls(isRunning) {
    rectangleDOM.generateButton.disabled = isRunning;
    rectangleDOM.startButton.disabled = isRunning;
    rectangleDOM.sizeSelect.disabled = isRunning;
    rectangleDOM.pauseButton.disabled = !isRunning;
}

function updateCounts() {
    rectangleDOM.rectangleCount.textContent = RectangleState.rectanglesFound;
    rectangleDOM.candidateCount.textContent = RectangleState.candidatesChecked;
}

function addLog(message) {
    const entry = document.createElement('div');
    entry.className = 'rectangle-log-entry';
    entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
    rectangleDOM.logsDisplay.appendChild(entry);
    rectangleDOM.logsDisplay.scrollTop = rectangleDOM.logsDisplay.scrollHeight;
}

function sleep(milliseconds) {
    return new Promise(function(resolve) {
        setTimeout(resolve, milliseconds);
    });
}
