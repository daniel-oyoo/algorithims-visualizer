/**
 * ============================================================
 * SUDOKU MODULE - script.js
 * Location: /front-end/matrix/sodoku/script.js
 * Purpose: Complete Sudoku solver with MRV and Non-MRV strategies
 * ============================================================
 */

/**
 * ====== SUDOKU CONFIGURATION ======
 */
const SUDOKU_CONFIG = {
    size: 9,
    boxSize: 3,
    emptyValue: 0,
    strategies: {
        'non-mrv': 'Non-MRV Simple Backtracking',
        'mrv': 'MRV Minimum Remaining Values'
    }
};

/**
 * ====== SUDOKU STATE ======
 */
const SudokuState = {
    board: [],
    solution: [],
    workable: [],
    validCellList: [],
    currentStrategy: 'mrv',
    isSolving: false,
    isPaused: false,
    shouldStop: false,
    stats: {
        emptyCells: 0,
        solvedCells: 0,
        backtracks: 0,
        steps: 0,
        startTime: null,
        endTime: null
    },
    comparisonData: {
        'non-mrv': null,
        'mrv': null
    }
};

/**
 * ====== EVIL PUZZLE CONFIGURATIONS ======
 * Pre-configured evil puzzles for testing
 */
const EVIL_PUZZLES = [
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
];

/**
 * ====== PRE-SEEDED SOLVED BOARD ======
 */
const SEEDED_SOLVED = [
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
    strategySelect: document.getElementById('strategySelect'),
    puzzleSelect: document.getElementById('puzzleSelect'),
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
        SudokuState.currentStrategy = this.value;
        addLog('Strategy changed to ' + this.options[this.selectedIndex].text, 'info');
        resetVisualization();
    });

    sudokuDOM.puzzleSelect.addEventListener('change', function() {
        generatePuzzle();
    });

    sudokuDOM.speedSlider.addEventListener('input', function() {
        sudokuDOM.speedDisplay.textContent = this.value + 'ms';
    });
}

/**
 * ====== PUZZLE GENERATION ======
 */
function generatePuzzle() {
    if (SudokuState.isSolving) {
        addLog('Please wait for current solve to finish', 'warning');
        return;
    }

    const puzzleType = sudokuDOM.puzzleSelect.value;
    let board = [];

    switch (puzzleType) {
        case 'random':
            board = generateRandomPuzzle();
            break;
        case 'easy':
            board = generateEasyPuzzle();
            break;
        case 'medium':
            board = generateMediumPuzzle();
            break;
        case 'hard':
            board = generateHardPuzzle();
            break;
        case 'evil':
            board = generateEvilPuzzle();
            break;
        case 'custom':
            board = getCustomPuzzle();
            break;
        default:
            board = generateRandomPuzzle();
    }

    SudokuState.board = board;
    SudokuState.solution = [];
    SudokuState.validCellList = [];
    SudokuState.stats = {
        emptyCells: countEmpty(board),
        solvedCells: 0,
        backtracks: 0,
        steps: 0,
        startTime: null,
        endTime: null
    };

    markWorkable(board);
    renderMatrix(board);
    updateStats();
    resetVisualization();

    addLog('Generated ' + puzzleType + ' puzzle (' + SudokuState.stats.emptyCells + ' empty cells)', 'info');
}

function generateRandomPuzzle() {
    let board = SEEDED_SOLVED.map(function(row) {
        return row.slice();
    });
    const probability = 0.5;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (Math.random() < probability) {
                board[i][j] = 0;
            }
        }
    }
    return board;
}

function generateEasyPuzzle() {
    let board = SEEDED_SOLVED.map(function(row) {
        return row.slice();
    });
    return removeCells(board, 81 - 45);
}

function generateMediumPuzzle() {
    let board = SEEDED_SOLVED.map(function(row) {
        return row.slice();
    });
    return removeCells(board, 81 - 35);
}

function generateHardPuzzle() {
    let board = SEEDED_SOLVED.map(function(row) {
        return row.slice();
    });
    return removeCells(board, 81 - 28);
}

function generateEvilPuzzle() {
    let board = SEEDED_SOLVED.map(function(row) {
        return row.slice();
    });
    return removeCells(board, 81 - 22);
}

function removeCells(board, count) {
    let removed = 0;
    while (removed < count) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }
    }
    return board;
}

function getCustomPuzzle() {
    return generateMediumPuzzle();
}

function countEmpty(board) {
    let count = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) count++;
        }
    }
    return count;
}

/**
 * ====== MRV MINIMUM REMAINING VALUES ======
 */
function findMRV(board) {
    let minCandidates = Infinity;
    let bestCell = null;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
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

/**
 * ====== GET VALID CANDIDATES ======
 */
function getValidCandidates(board, row, col) {
    const candidates = [];
    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            candidates.push(num);
        }
    }
    return candidates;
}

/**
 * ====== VALIDITY CHECKS ======
 */
function isValid(board, row, col, num) {
    for (let j = 0; j < 9; j++) {
        if (board[row][j] === num) return false;
    }

    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
            if (board[i][j] === num) return false;
        }
    }

    return true;
}

/**
 * ====== MARK WORKABLE CELLS ======
 */
function markWorkable(board) {
    SudokuState.workable = [];
    for (let i = 0; i < 9; i++) {
        SudokuState.workable[i] = [];
        for (let j = 0; j < 9; j++) {
            SudokuState.workable[i][j] = (board[i][j] === 0);
        }
    }
}

/**
 * ====== RENDER MATRIX ======
 */
function renderMatrix(board) {
    sudokuDOM.matrixContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'sudoku-grid';

    for (let i = 0; i < 9; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('td');
            cell.id = 'cell-' + i + '-' + j;
            cell.dataset.row = i;
            cell.dataset.col = j;

            const value = board[i][j];
            if (value !== 0) {
                cell.textContent = value;
                if (!SudokuState.workable[i][j]) {
                    cell.classList.add('given');
                }
            } else {
                cell.classList.add('empty-cell');
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    sudokuDOM.matrixContainer.appendChild(table);
}

/**
 * ====== UPDATE CELL ======
 */
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

/**
 * ====== UPDATE STATS ======
 */
function updateStats() {
    sudokuDOM.emptyCount.textContent = SudokuState.stats.emptyCells;
    sudokuDOM.solvedCount.textContent = SudokuState.stats.solvedCells;
    sudokuDOM.backtrackCount.textContent = SudokuState.stats.backtracks;
}

/**
 * ====== PROGRESS TABLE ======
 */
function updateProgress(row, col, candidates, status) {
    status = status || 'active';
    const rowId = 'progress-' + row + '-' + col;
    let tr = document.getElementById(rowId);

    if (!tr) {
        tr = document.createElement('tr');
        tr.id = rowId;
        tr.innerHTML =
            '<td>(' + row + ', ' + col + ')</td>' +
            '<td class="candidate-cell"></td>' +
            '<td class="status-cell">' + status + '</td>';
        sudokuDOM.progressBody.appendChild(tr);
    }

    const candidateCell = tr.querySelector('.candidate-cell');
    if (candidateCell) {
        let html = '';
        for (let i = 0; i < candidates.length; i++) {
            const num = candidates[i];
            html += '<span class="number-label" data-num="' + num + '">' + num + '</span>';
        }
        candidateCell.innerHTML = html;
    }

    const statusCell = tr.querySelector('.status-cell');
    if (statusCell) {
        statusCell.textContent = status;
        tr.className = '';
        if (status === 'active') tr.classList.add('active-row');
        else if (status === 'backtrack') tr.classList.add('backtrack-row');
        else if (status === 'solved') tr.classList.add('solved-row');
    }

    sudokuDOM.progressBody.scrollTop = sudokuDOM.progressBody.scrollHeight;
}

function clearProgress() {
    sudokuDOM.progressBody.innerHTML = '';
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
 * ====== SUDOKU SOLVER ======
 */
async function solveSudoku() {
    if (SudokuState.isSolving) {
        addLog('Already solving', 'warning');
        return;
    }

    SudokuState.isSolving = true;
    SudokuState.shouldStop = false;
    SudokuState.isPaused = false;
    SudokuState.validCellList = [];
    SudokuState.stats = {
        emptyCells: countEmpty(SudokuState.board),
        solvedCells: 0,
        backtracks: 0,
        steps: 0,
        startTime: performance.now(),
        endTime: null
    };

    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.disabled = true;
    });

    const strategy = SudokuState.currentStrategy;
    addLog('Starting solve with ' + SUDOKU_CONFIG.strategies[strategy], 'info');

    const board = SudokuState.board.map(function(row) {
        return row.slice();
    });
    const workable = SudokuState.workable.map(function(row) {
        return row.slice();
    });

    clearProgress();
    clearLogs();

    const success = await solveWithStrategy(board, workable, strategy);

    SudokuState.stats.endTime = performance.now();

    if (success) {
        addLog('Puzzle solved (' + (SudokuState.stats.endTime - SudokuState.stats.startTime).toFixed(0) + 'ms)', 'success');
        SudokuState.solution = board;
        renderMatrix(board);
    } else {
        addLog('No solution found', 'error');
    }

    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.disabled = false;
    });
    SudokuState.isSolving = false;

    storeComparisonData(strategy, success);
}

/**
 * ====== SOLVE WITH STRATEGY ======
 */
async function solveWithStrategy(board, workable, strategy) {
    let currentCellListIndex = 0;
    let compute = true;
    let steps = 0;
    const maxSteps = 1000000;
    const candidateLists = [];

    while (steps < maxSteps && !SudokuState.shouldStop) {
        while (SudokuState.isPaused) {
            await sleep(50);
        }

        let cell;
        if (strategy === 'mrv') {
            cell = findMRV(board);
            if (!cell) break;
        } else {
            cell = findNextEmpty(board);
        }

        if (!cell) break;

        const row = cell.row;
        const col = cell.col;
        const speed = parseInt(sudokuDOM.speedSlider.value);

        updateCell(row, col, board[row][col] || '', 'scanning');
        sudokuDOM.currentCell.textContent = '(' + row + ', ' + col + ')';

        let candidates;
        if (strategy === 'mrv') {
            candidates = cell.candidates || getValidCandidates(board, row, col);
        } else {
            candidates = getValidCandidates(board, row, col);
        }

        updateProgress(row, col, candidates, 'active');

        let placed = false;
        for (let idx = 0; idx < candidates.length; idx++) {
            if (SudokuState.shouldStop) return false;

            const num = candidates[idx];
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                updateCell(row, col, num, 'solved');

                SudokuState.stats.solvedCells++;
                SudokuState.stats.emptyCells--;
                updateStats();

                placed = true;
                steps++;
                SudokuState.stats.steps = steps;

                const usedCandidates = candidates.slice(0, idx + 1);
                updateProgress(row, col, usedCandidates, 'solved');

                if (countEmpty(board) === 0) {
                    return true;
                }

                await sleep(speed);
                break;
            }
        }

        if (!placed) {
            board[row][col] = 0;
            updateCell(row, col, 0, 'backtrack');

            SudokuState.stats.backtracks++;
            SudokuState.stats.solvedCells--;
            SudokuState.stats.emptyCells++;
            updateStats();

            updateProgress(row, col, candidates, 'backtrack');
            sudokuDOM.currentCell.textContent = 'Backtrack at (' + row + ', ' + col + ')';

            await sleep(speed);
        }
    }

    return countEmpty(board) === 0;
}

/**
 * ====== FIND NEXT EMPTY CELL NON-MRV ======
 */
function findNextEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

/**
 * ====== TOGGLE PAUSE ======
 */
function togglePause() {
    SudokuState.isPaused = !SudokuState.isPaused;
    addLog(SudokuState.isPaused ? 'Paused' : 'Resumed', 'info');
    document.querySelector('.btn-warning').textContent =
        SudokuState.isPaused ? 'Resume' : 'Pause';
}

/**
 * ====== RESET ======
 */
function resetAll() {
    SudokuState.shouldStop = true;
    SudokuState.isPaused = false;
    SudokuState.isSolving = false;
    document.querySelector('.btn-warning').textContent = 'Pause';
    document.querySelectorAll('.btn').forEach(function(btn) {
        btn.disabled = false;
    });
    generatePuzzle();
    addLog('Reset complete', 'warning');
}

function resetVisualization() {
    renderMatrix(SudokuState.board);
    clearProgress();
    updateStats();
    sudokuDOM.currentCell.textContent = '-';
    sudokuDOM.mrvCount.textContent = '-';
}

/**
 * ====== STRATEGY COMPARISON ======
 */
async function compareStrategies() {
    if (SudokuState.isSolving) {
        addLog('Please wait for current solve to finish', 'warning');
        return;
    }

    addLog('Starting strategy comparison', 'info');
    sudokuDOM.comparisonSection.style.display = 'block';

    const strategies = ['non-mrv', 'mrv'];
    const results = {};

    for (const strategy of strategies) {
        const board = SudokuState.board.map(function(row) {
            return row.slice();
        });
        const workable = SudokuState.workable.map(function(row) {
            return row.slice();
        });

        SudokuState.currentStrategy = strategy;
        SudokuState.stats = {
            emptyCells: countEmpty(board),
            solvedCells: 0,
            backtracks: 0,
            steps: 0,
            startTime: performance.now(),
            endTime: null
        };

        const startTime = performance.now();
        const success = await solveWithStrategy(board, workable, strategy);
        const endTime = performance.now();

        results[strategy] = {
            success: success,
            time: endTime - startTime,
            steps: SudokuState.stats.steps,
            backtracks: SudokuState.stats.backtracks,
            solved: success
        };
    }

    displayComparison(results);
    addLog('Comparison complete', 'success');
}

function displayComparison(results) {
    const grid = sudokuDOM.comparisonGrid;
    grid.innerHTML = '';

    const strategyNames = {
        'non-mrv': 'Non-MRV Simple',
        'mrv': 'MRV Smart'
    };

    let winner = 'mrv';
    if (results['non-mrv'] && results['mrv']) {
        if (results['non-mrv'].time < results['mrv'].time) {
            winner = 'non-mrv';
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
            (key === winner ? '<p style="color: var(--color-success)">Winner</p>' : '') +
            '</div>';
        grid.appendChild(item);
    }
}

function storeComparisonData(strategy, success) {
    SudokuState.comparisonData[strategy] = {
        success: success,
        time: SudokuState.stats.endTime - SudokuState.stats.startTime,
        steps: SudokuState.stats.steps,
        backtracks: SudokuState.stats.backtracks,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem('sudokuComparison', JSON.stringify(SudokuState.comparisonData));
    } catch (e) {
        // Ignore
    }
}

/**
 * ====== UTILITY FUNCTIONS ======
 */
function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
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
console.log('Available: MRV and Non-MRV strategies with comparison');