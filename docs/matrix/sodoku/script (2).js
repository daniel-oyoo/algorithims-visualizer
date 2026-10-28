/**
 * ============================================================
 * SUDOKU MODULE - script.js
 * Location: /docs/matrix/sodoku/script.js
 * Purpose: Complete Sudoku solver with MRV and Non-MRV strategies
 *          Dynamic table progress tracking with visual feedback
 * ============================================================
 */

/**
 * ====== CONFIGURATION ======
 */
const CONFIG = {
    size: 9,
    boxSize: 3,
    emptyValue: 0,
    prob: 0.75,
    maxSteps: 1000000
};

/**
 * ====== STATE ======
 */
const State = {
    board: [],
    workable: [],
    validCellList: [],
    emptyCells: 0,
    solvedCells: 0,
    backtracks: 0,
    steps: 0,
    isSolving: false,
    isPaused: false,
    shouldStop: false,
    currentStrategy: 'mrv',
    startTime: null,
    endTime: null,
    cellListIndex: 0,
    gridSize: 9
};

/**
 * ====== SEEDED BOARD ======
 */
const SEEDED_BOARD = [
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

/**
 * ====== DOM REFERENCES ======
 */
const sudokuDOM = {
    matrixContainer: document.getElementById('matrixContainer'),
    progressBody: document.getElementById('progressBody'),
    logsDisplay: document.getElementById('logsDisplay'),
    emptyCount: document.getElementById('emptyCount'),
    solvedCount: document.getElementById('solvedCount'),
    currentCell: document.getElementById('currentCell'),
    backtrackCount: document.getElementById('backtrackCount'),
    mrvCount: document.getElementById('mrvCount'),
    iterations: document.getElementById('iterations'),
    strategySelect: document.getElementById('strategySelect'),
    puzzleSelect: document.getElementById('puzzleSelect'),
    sizeSelect: document.getElementById('sizeSelect'),
    speedSlider: document.getElementById('speedSlider'),
    speedDisplay: document.getElementById('speedDisplay'),
    comparisonSection: document.getElementById('comparisonSection'),
    comparisonGrid: document.getElementById('comparisonGrid')
};

/**
 * ====== INITIALIZATION ======
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sudoku module initializing');

    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('sodoku');
    }

    setupEventListeners();
    generatePuzzle();
    addLog('Sudoku module ready', 'success');
    console.log('Sudoku module initialized');
});

/**
 * ====== EVENT LISTENERS ======
 */
function setupEventListeners() {
    sudokuDOM.strategySelect.addEventListener('change', function() {
        State.currentStrategy = this.value;
        addLog('Strategy changed to ' + this.options[this.selectedIndex].text, 'info');
        resetVisualization();
    });

    sudokuDOM.puzzleSelect.addEventListener('change', function() {
        generatePuzzle();
    });

    sudokuDOM.sizeSelect.addEventListener('change', function() {
        State.gridSize = parseInt(this.value);
        generatePuzzle();
        addLog('Grid size changed to ' + State.gridSize + 'x' + State.gridSize, 'info');
    });

    sudokuDOM.speedSlider.addEventListener('input', function() {
        sudokuDOM.speedDisplay.textContent = this.value + 'ms';
    });
}

/**
 * ====== PUZZLE GENERATION ======
 */
function generatePuzzle() {
    if (State.isSolving) {
        addLog('Please wait for current solve to finish', 'warning');
        return;
    }

    const puzzleType = sudokuDOM.puzzleSelect.value;
    const size = State.gridSize;
    let board = [];

    if (size === 9) {
        board = generateStandardPuzzle(puzzleType);
    } else if (size === 4) {
        board = generateMiniPuzzle(puzzleType);
    } else if (size === 3) {
        board = generateTinyPuzzle(puzzleType);
    } else {
        board = generateStandardPuzzle('random');
    }

    State.board = board;
    State.workable = [];
    State.validCellList = [];
    State.cellListIndex = 0;
    State.emptyCells = countEmpty(board);
    State.solvedCells = 0;
    State.backtracks = 0;
    State.steps = 0;

    markWorkable(board);
    renderMatrix(board);
    updateStats();
    clearProgress();
    resetVisualization();

    addLog('Generated ' + puzzleType + ' puzzle (' + State.emptyCells + ' empty cells)', 'info');
}

function generateStandardPuzzle(puzzleType) {
    let board = SEEDED_BOARD.map(function(row) {
        return row.slice();
    });

    let cellsToRemove;
    switch (puzzleType) {
        case 'easy':
            cellsToRemove = 81 - 45;
            break;
        case 'medium':
            cellsToRemove = 81 - 35;
            break;
        case 'hard':
            cellsToRemove = 81 - 28;
            break;
        case 'evil':
            cellsToRemove = 81 - 22;
            break;
        case 'random':
        default:
            cellsToRemove = Math.floor(Math.random() * 20) + 30;
            break;
    }

    return removeCells(board, cellsToRemove);
}

function generateMiniPuzzle(puzzleType) {
    const miniBoard = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
    ];

    let board = miniBoard.map(function(row) {
        return row.slice();
    });

    let cellsToRemove = Math.floor(Math.random() * 6) + 4;
    return removeCells(board, cellsToRemove);
}

function generateTinyPuzzle(puzzleType) {
    const tinyBoard = [
        [1, 2, 3],
        [3, 1, 2],
        [2, 3, 1]
    ];

    let board = tinyBoard.map(function(row) {
        return row.slice();
    });

    let cellsToRemove = Math.floor(Math.random() * 4) + 2;
    return removeCells(board, cellsToRemove);
}

function removeCells(board, count) {
    let removed = 0;
    const size = board.length;
    const maxAttempts = count * 10;
    let attempts = 0;

    while (removed < count && attempts < maxAttempts) {
        attempts++;
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
    return board;
}

function countEmpty(board) {
    let count = 0;
    const size = board.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) count++;
        }
    }
    return count;
}

/**
 * ====== MARK WORKABLE ======
 */
function markWorkable(board) {
    const size = board.length;
    State.workable = [];
    for (let i = 0; i < size; i++) {
        State.workable[i] = [];
        for (let j = 0; j < size; j++) {
            State.workable[i][j] = (board[i][j] === 0);
        }
    }
}

/**
 * ====== VALIDITY CHECKS ======
 */
function rowValid(board, row, col, num) {
    const size = board.length;
    for (let j = 0; j < size; j++) {
        if (board[row][j] === num) return false;
    }
    return true;
}

function colValid(board, row, col, num) {
    const size = board.length;
    for (let i = 0; i < size; i++) {
        if (board[i][col] === num) return false;
    }
    return true;
}

function zoneValid(board, row, col, num) {
    const size = board.length;
    const boxSize = Math.sqrt(size);
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;
    for (let i = boxRow; i < boxRow + boxSize; i++) {
        for (let j = boxCol; j < boxCol + boxSize; j++) {
            if (board[i][j] === num) return false;
        }
    }
    return true;
}

function isValid(board, row, col, num) {
    return rowValid(board, row, col, num) &&
        colValid(board, row, col, num) &&
        zoneValid(board, row, col, num);
}

/**
 * ====== MRV MINIMUM REMAINING VALUES ======
 */
function findMRV(board) {
    const size = board.length;
    let minCandidates = Infinity;
    let bestCell = null;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                const candidates = getValidCandidates(board, i, j);
                if (candidates.length < minCandidates) {
                    minCandidates = candidates.length;
                    bestCell = { row: i, col: j, candidates: candidates };
                    if (minCandidates === 1) break;
                }
            }
        }
        if (minCandidates === 1) break;
    }
    return bestCell;
}

function getValidCandidates(board, row, col) {
    const size = board.length;
    const candidates = [];
    for (let num = 1; num <= size; num++) {
        if (isValid(board, row, col, num)) {
            candidates.push(num);
        }
    }
    return candidates;
}

function findNextEmpty(board) {
    const size = board.length;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === 0) {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

/**
 * ====== RENDER MATRIX ======
 */
function renderMatrix(board) {
    const size = board.length;
    sudokuDOM.matrixContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'sudoku-grid';
    const boxSize = Math.sqrt(size);

    for (let i = 0; i < size; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('td');
            cell.id = 'cell-' + i + '-' + j;
            cell.dataset.row = i;
            cell.dataset.col = j;

            const value = board[i][j];
            if (value !== 0) {
                cell.textContent = value;
                if (!State.workable[i][j]) {
                    cell.classList.add('given');
                }
            } else {
                cell.classList.add('empty-cell');
            }

            if ((j + 1) % boxSize === 0 && j < size - 1) {
                cell.style.borderRight = '3px solid var(--color-primary)';
            }
            if ((i + 1) % boxSize === 0 && i < size - 1) {
                cell.style.borderBottom = '3px solid var(--color-primary)';
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    sudokuDOM.matrixContainer.appendChild(table);
}

function updateCell(row, col, value, className) {
    className = className || '';
    const cell = document.getElementById('cell-' + row + '-' + col);
    if (cell) {
        cell.textContent = value || '';
        cell.className = '';
        if (className) cell.classList.add(className);
        if (value === 0) cell.classList.add('empty-cell');
    }
}

function clearCellHighlights() {
    const cells = document.querySelectorAll('.sudoku-grid td');
    cells.forEach(function(cell) {
        cell.classList.remove('scanning', 'solved', 'backtrack', 'mrv-highlight');
    });
}

/**
 * ====== PROGRESS TABLE - ORIGINAL BEHAVIOR WITH AUTO-SCROLL ======
 * These functions preserve the shrink/expand behavior from your original code
 */

// Removes highlight from all progress rows
function clearRowHighlights() {
    const rows = document.querySelectorAll('#statusTable tr');
    rows.forEach(function(row) {
        row.classList.remove('current-row', 'backtrack-row', 'solved-row');
    });
}

// Scrolls to make the current row visible
function scrollToCurrentRow(rowId) {
    const rowElement = document.getElementById(rowId);
    if (rowElement) {
        // Use smooth scroll with offset
        rowElement.scrollIntoView({
            block: 'center',
            behavior: 'smooth'
        });
    }
}

// Highlights the current row and scrolls to it
function highlightCurrentRow(rowId, className) {
    className = className || 'current-row';

    // Clear all row highlights
    clearRowHighlights();

    // Add highlight to current row
    const rowElement = document.getElementById(rowId);
    if (rowElement) {
        rowElement.classList.add(className);
        // Scroll to the row
        //currently makes the screen glitch
        /*scrollToCurrentRow(rowId);*/
    }
}

// Creates a new row in the progress table
function createProgressRow(row, col) {
    let currentRow = document.createElement('tr');
    currentRow.id = 'row-' + row + '-' + col;
    currentRow.className = 'rows';
    currentRow.innerHTML = '<td>[' + row + ', ' + col + ']</td><td id="list-' + row + '-' + col + '"></td>';
    sudokuDOM.progressBody.appendChild(currentRow);

    // Highlight and scroll to the new row
    //this too makes the screen glitch
    /*highlightCurrentRow('row-' + row + '-' + col, 'current-row');*/

    return currentRow;
}

// Adds a number to the progress table row
function addNumToProgress(row, col, num) {
    let currentList = document.getElementById('list-' + row + '-' + col);
    if (!currentList) return;
    let label = document.createElement('label');
    label.className = 'num-label';
    label.id = num + '-' + row + '-' + col + '-' + num;
    label.textContent = num;
    currentList.appendChild(label);
}

// Removes a number from the progress table row
function removeNumFromProgress(row, col, num) {
    let span = document.getElementById(num + '-' + row + '-' + col + '-' + num);
    if (span) {
        setTimeout(function() {
            span.remove();
        }, 200);
    }
}

// Removes an entire row from the progress table
function removeProgressRow(row, col) {
    let rowElement = document.getElementById('row-' + row + '-' + col);
    if (rowElement) {
        rowElement.remove();
    }
}

// Clears all progress rows
function clearProgress() {
    sudokuDOM.progressBody.innerHTML = '';
}

/**
 * ====== UPDATE STATS ======
 */
function updateStats() {
    sudokuDOM.emptyCount.textContent = State.emptyCells;
    sudokuDOM.solvedCount.textContent = State.solvedCells;
    sudokuDOM.backtrackCount.textContent = State.backtracks;
    sudokuDOM.iterations.textContent = State.steps;

    if (State.validCellList && State.validCellList[State.cellListIndex]) {
        sudokuDOM.mrvCount.textContent = State.validCellList[State.cellListIndex].length;
    } else {
        sudokuDOM.mrvCount.textContent = '-';
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
    sudokuDOM.logsDisplay.appendChild(logEntry);
    sudokuDOM.logsDisplay.scrollTop = sudokuDOM.logsDisplay.scrollHeight;
}

function clearLogs() {
    sudokuDOM.logsDisplay.innerHTML = '';
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
    while (State.isPaused) {
        await sleep(100);
        if (State.shouldStop) return false;
    }
    return !State.shouldStop;
}

/**
 * ====== SOLVE SUDOKU ======
 */
async function solveSudoku() {
    if (State.isSolving) {
        addLog('Already solving', 'warning');
        return;
    }

    State.isSolving = true;
    State.shouldStop = false;
    State.isPaused = false;
    State.validCellList = [];
    State.cellListIndex = 0;
    State.emptyCells = countEmpty(State.board);
    State.solvedCells = 0;
    State.backtracks = 0;
    State.steps = 0;
    State.startTime = performance.now();

    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.disabled = true;
    });

    const strategy = State.currentStrategy;
    const strategyName = strategy === 'mrv' ? 'MRV (Smart)' :
        strategy === 'non-mrv' ? 'Non-MRV (Simple)' : 'Iterative with Stack';
    addLog('Starting solve with ' + strategyName, 'info');

    const board = State.board.map(function(row) {
        return row.slice();
    });
    const workable = State.workable.map(function(row) {
        return row.slice();
    });

    clearProgress();
    clearLogs();
    clearCellHighlights();

    let success;
    if (strategy === 'iterative' || strategy === 'non-mrv') {
        success = await solveIterative(board, workable);
    } else {
        success = await solveWithStrategy(board, workable, strategy);
    }

    State.endTime = performance.now();

    if (success) {
        addLog('Puzzle solved (' + (State.endTime - State.startTime).toFixed(0) + 'ms, ' + State.steps + ' steps)', 'success');
        State.board = board;
        renderMatrix(board);
    } else {
        addLog('No solution found after ' + State.steps + ' steps', 'error');
    }

    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.disabled = false;
    });
    State.isSolving = false;
}

/**
 * ====== SOLVE WITH STRATEGY (MRV) ======
 */
async function solveWithStrategy(board, workable, strategy) {
    const size = board.length;
    let compute = true;
    let steps = 0;

    outer:
        for (let i = 0; i < size && i >= 0; i++) {
            for (let j = 0; j < size;) {
                if (!State.isSolving || State.shouldStop) {
                    addLog('Process stopped by user', 'warning');
                    return false;
                }

                if (!await checkPause()) {
                    addLog('Process paused', 'warning');
                    return false;
                }

                const speed = parseInt(sudokuDOM.speedSlider.value);

                sudokuDOM.currentCell.textContent = '(' + i + ', ' + j + ')';
                updateStats();

                clearCellHighlights();
                updateCell(i, j, board[i][j] || '', 'scanning');

                if (workable[i][j]) {
                    let candidates;
                    let cell;

                    if (strategy === 'mrv') {
                        cell = findMRV(board);
                        if (!cell) {
                            break outer;
                        }
                        const r = cell.row;
                        const c = cell.col;
                        candidates = cell.candidates || getValidCandidates(board, r, c);
                        if (r !== i || c !== j) {
                            i = r;
                            j = c;
                            updateCell(i, j, board[i][j] || '', 'scanning');
                            sudokuDOM.currentCell.textContent = '(' + i + ', ' + j + ')';
                        }
                    } else {
                        candidates = getValidCandidates(board, i, j);
                    }

                    // Create progress row and add candidates
                    createProgressRow(i, j);
                    State.validCellList[State.cellListIndex] = candidates.slice();
                    for (let idx = 0; idx < candidates.length; idx++) {
                        addNumToProgress(i, j, candidates[idx]);
                    }
                    updateStats();

                    let placed = false;
                    for (let idx = 0; idx < candidates.length; idx++) {
                        const num = candidates[idx];
                        if (isValid(board, i, j, num)) {
                            board[i][j] = num;
                            updateCell(i, j, num, 'solved');

                            State.solvedCells++;
                            State.emptyCells--;
                            State.steps++;
                            steps++;
                            updateStats();

                            // Remove the used number from progress display
                            removeNumFromProgress(i, j, num);

                            placed = true;
                            State.cellListIndex++;
                            compute = true;

                            // Highlight the row as solved
                            highlightCurrentRow('row-' + i + '-' + j, 'solved-row');

                            if (State.emptyCells === 0) {
                                addLog('All cells filled!', 'success');
                                return true;
                            }

                            await sleep(speed);
                            break;
                        }
                    }

                    if (!placed) {
                        board[i][j] = 0;
                        updateCell(i, j, 0, 'backtrack');

                        State.backtracks++;
                        State.solvedCells--;
                        State.emptyCells++;
                        State.steps++;
                        steps++;
                        updateStats();

                        sudokuDOM.currentCell.textContent = 'Backtrack at (' + i + ', ' + j + ')';

                        State.validCellList.pop();
                        State.cellListIndex--;
                        compute = false;

                        // Highlight the row as backtrack
                        highlightCurrentRow('row-' + i + '-' + j, 'backtrack-row');

                        await sleep(speed);

                        // Remove the entire progress row on backtrack
                        removeProgressRow(i, j);

                        j--;
                        if (j < 0) {
                            j = size - 1;
                            i--;
                        }
                        if (i < 0) {
                            addLog('No solution found', 'error');
                            return false;
                        }
                        if (workable[i] && workable[i][j]) {
                            board[i][j] = 0;
                            updateCell(i, j, 0, '');
                            await sleep(speed);
                        }
                        continue;
                    }
                }

                if (compute) {
                    j++;
                }
            }
        }

    return State.emptyCells === 0;
}

/**
 * ====== SOLVE ITERATIVE WITH STACK (Non-MRV) ======
 * This preserves your original Non-MRV behavior with the table shrink/expand
 */
async function solveIterative(board, workable) {
    const size = board.length;
    let stack = [];
    let row = 0;
    let col = 0;
    let steps = 0;
    let backtracks = 0;
    let cellList = 0;
    let compute = true;

    outer:
        for (let i = 0; i < size && i >= 0; i++) {
            for (let j = 0; j < size;) {
                if (!State.isSolving || State.shouldStop) {
                    addLog('Process stopped by user', 'warning');
                    return false;
                }

                if (!await checkPause()) {
                    addLog('Process paused', 'warning');
                    return false;
                }

                const speed = parseInt(sudokuDOM.speedSlider.value);

                sudokuDOM.currentCell.textContent = '[' + i + ', ' + j + ']';
                updateStats();

                clearCellHighlights();
                updateCell(i, j, board[i][j] || '', 'scanning');

                if (workable[i][j]) {
                    // Compute candidates for this cell
                    if (compute) {
                        // Create progress row
                        createProgressRow(i, j);

                        // Get candidates
                        let candidates = getValidCandidates(board, i, j);

                        // If no candidates, try MRV fallback
                        if (candidates.length === 0) {
                            let minCandidates = Infinity;
                            let bestCell = null;
                            for (let r = 0; r < size; r++) {
                                for (let c = 0; c < size; c++) {
                                    if (board[r][c] === 0) {
                                        const cands = getValidCandidates(board, r, c);
                                        if (cands.length < minCandidates) {
                                            minCandidates = cands.length;
                                            bestCell = { row: r, col: c, candidates: cands };
                                        }
                                    }
                                }
                            }
                            if (bestCell) {
                                candidates = bestCell.candidates;
                                i = bestCell.row;
                                j = bestCell.col;
                                updateCell(i, j, board[i][j] || '', 'scanning');
                                sudokuDOM.currentCell.textContent = '[' + i + ', ' + j + '] (MRV Fallback)';
                            }
                        }

                        State.validCellList[cellList] = candidates.slice();
                        // Add numbers to the progress table
                        for (let idx = 0; idx < candidates.length; idx++) {
                            addNumToProgress(i, j, candidates[idx]);
                        }
                        updateStats();
                    }

                    const current = State.validCellList[cellList];

                    if (current && current.length > 0) {
                        let chosen = current[0];

                        board[i][j] = chosen;
                        updateCell(i, j, chosen, 'solved');

                        State.solvedCells++;
                        State.emptyCells--;
                        State.steps++;
                        steps++;
                        updateStats();

                        // Remove the used number from progress display
                        removeNumFromProgress(i, j, chosen);

                        current.shift();
                        cellList++;
                        compute = true;

                        // Highlight the row as solved
                        highlightCurrentRow('row-' + i + '-' + j, 'solved-row');

                        if (State.emptyCells === 0) {
                            addLog('All cells filled!', 'success');
                            return true;
                        }

                        await sleep(speed);
                    } else {
                        // Backtrack - no valid number found
                        board[i][j] = 0;
                        updateCell(i, j, 0, 'backtrack');

                        backtracks++;
                        State.backtracks++;
                        State.solvedCells--;
                        State.emptyCells++;
                        State.steps++;
                        steps++;
                        updateStats();

                        sudokuDOM.currentCell.textContent = 'Backtrack at [' + i + ', ' + j + ']';

                        State.validCellList.pop();
                        cellList--;
                        compute = false;

                        // Highlight the row as backtrack
                        highlightCurrentRow('row-' + i + '-' + j, 'backtrack-row');

                        await sleep(speed);

                        // Remove the entire progress row on backtrack
                        removeProgressRow(i, j);

                        // Move backwards
                        j--;
                        if (j < 0) {
                            j = size - 1;
                            i--;
                        }
                        if (i < 0) {
                            addLog('No solution found', 'error');
                            return false;
                        }
                        if (workable[i] && workable[i][j]) {
                            board[i][j] = 0;
                            updateCell(i, j, 0, '');
                            await sleep(speed);
                        }
                        continue;
                    }
                }

                if (compute) {
                    j++;
                } else {
                    j--;
                    if (j < 0) {
                        j = size - 1;
                        if (i > 0) {
                            i--;
                        }
                    }
                    if (workable[i] && workable[i][j]) {
                        board[i][j] = 0;
                        updateCell(i, j, 0, '');
                        await sleep(speed);
                    }
                }
            }
        }

    return State.emptyCells === 0;
}

/**
 * ====== TOGGLE PAUSE ======
 */
function togglePause() {
    State.isPaused = !State.isPaused;
    addLog(State.isPaused ? 'Paused' : 'Resumed', 'info');
    const btn = document.querySelector('.btn-warning');
    if (btn) btn.textContent = State.isPaused ? 'Resume' : 'Pause';
}

/**
 * ====== RESET ======
 */
function resetAll() {
    State.shouldStop = true;
    State.isPaused = false;
    State.isSolving = false;
    const btn = document.querySelector('.btn-warning');
    if (btn) btn.textContent = 'Pause';
    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.disabled = false;
    });
    generatePuzzle();
    addLog('Reset complete', 'warning');
}

function resetVisualization() {
    renderMatrix(State.board);
    clearProgress();
    updateStats();
    sudokuDOM.currentCell.textContent = '-';
    sudokuDOM.mrvCount.textContent = '-';
    sudokuDOM.iterations.textContent = '0';
    clearCellHighlights();
}


/**
 * collapsible
 */
function setupCollapsibleCards() {
    const approachCards = document.querySelectorAll('.approach-card');

    approachCards.forEach(card => {
        const header = card.querySelector('h4');
        if (header) {
            header.addEventListener('click', function() {
                // Close all other cards
                approachCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('expanded');
                    }
                });
                // Toggle this card
                card.classList.toggle('expanded');
            });
        }
    });
}

setupCollapsibleCards();

/**
 * ====== COMPARE STRATEGIES ======
 */
async function compareStrategies() {
    if (State.isSolving) {
        addLog('Please wait for current solve to finish', 'warning');
        return;
    }

    addLog('Starting strategy comparison', 'info');
    sudokuDOM.comparisonSection.style.display = 'block';

    const strategies = ['non-mrv', 'mrv', 'iterative'];
    const results = {};

    for (const strategy of strategies) {
        const board = State.board.map(function(row) {
            return row.slice();
        });
        const workable = State.workable.map(function(row) {
            return row.slice();
        });

        State.currentStrategy = strategy;
        State.emptyCells = countEmpty(board);
        State.solvedCells = 0;
        State.backtracks = 0;
        State.steps = 0;
        State.cellListIndex = 0;
        State.validCellList = [];

        const startTime = performance.now();
        let success;
        if (strategy === 'iterative' || strategy === 'non-mrv') {
            success = await solveIterative(board, workable);
        } else {
            success = await solveWithStrategy(board, workable, strategy);
        }
        const endTime = performance.now();

        results[strategy] = {
            success: success,
            time: endTime - startTime,
            steps: State.steps,
            backtracks: State.backtracks
        };

        State.isSolving = false;
        State.shouldStop = false;
        State.isPaused = false;
    }

    displayComparison(results);
    addLog('Comparison complete', 'success');
}

function displayComparison(results) {
    const grid = sudokuDOM.comparisonGrid;
    grid.innerHTML = '';

    const strategyNames = {
        'non-mrv': 'Non-MRV Simple',
        'mrv': 'MRV Smart',
        'iterative': 'Iterative with Stack'
    };

    let winner = null;
    let bestTime = Infinity;
    for (const key of Object.keys(results)) {
        if (results[key].success && results[key].time < bestTime) {
            bestTime = results[key].time;
            winner = key;
        }
    }

    for (const key of Object.keys(results)) {
        const data = results[key];
        const item = document.createElement('div');
        item.className = 'comparison-item' + (key === winner ? ' winner' : '');
        item.innerHTML =
            '<h4>' + strategyNames[key] + '</h4>' +
            '<div class="stats">' +
            '<p><strong>Status:</strong> ' + (data.success ? 'Solved' : 'Failed') + '</p>' +
            '<p><strong>Time:</strong> ' + data.time.toFixed(2) + 'ms</p>' +
            '<p><strong>Steps:</strong> ' + data.steps + '</p>' +
            '<p><strong>Backtracks:</strong> ' + data.backtracks + '</p>' +
            (key === winner ? '<p style="color: var(--color-success); font-weight: bold;">Winner</p>' : '') +
            '</div>';
        grid.appendChild(item);
    }
}

/**
 * ====== EXPOSE GLOBALLY ======
 */
window.generatePuzzle = generatePuzzle;
window.solveSudoku = solveSudoku;
window.togglePause = togglePause;
window.resetAll = resetAll;
window.compareStrategies = compareStrategies;

console.log('Sudoku module loaded');
console.log('Features: 3 strategies Non-MRV, MRV, Iterative, dynamic progress tracking, comparison');
console.log('Supported sizes: 3x3, 4x4, 9x9');