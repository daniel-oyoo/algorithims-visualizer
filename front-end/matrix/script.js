/**
 * ============================================================
 * MATRIX MODULE - script.js
 * Location: /front-end/matrix/script.js
 * Purpose: Complete matrix visualization logic
 * Depends on: ../script.js (root shared utilities)
 * ============================================================
 */

/**
 * ====== MATRIX OPERATIONS CONFIG ======
 */
const MATRIX_CONFIG = {
    defaultSize: 4,
    maxSize: 8,
    minSize: 2,
    operations: {
        addition: {
            symbol: '+',
            description: 'Element-wise addition of two matrices',
            requiresTwoMatrices: true
        },
        multiplication: {
            symbol: '×',
            description: 'Standard matrix multiplication (dot product)',
            requiresTwoMatrices: true
        },
        transpose: {
            symbol: 'ᵀ',
            description: 'Flip matrix across diagonal (rows ↔ columns)',
            requiresTwoMatrices: false
        },
        determinant: {
            symbol: 'det',
            description: 'Calculate scalar value representing matrix properties',
            requiresTwoMatrices: false
        }
    }
};

/**
 * ====== MATRIX STATE ======
 */
const MatrixState = {
    matrixA: [],
    matrixB: [],
    matrixResult: [],
    currentOperation: 'multiplication',
    size: MATRIX_CONFIG.defaultSize,
    isAnimating: false,
    stepIndex: 0,
    operationSteps: [],
    speed: 1.0
};

/**
 * ====== DOM REFERENCES ======
 */
const MatrixDOM = {
    matrixA: document.getElementById('matrixA'),
    matrixB: document.getElementById('matrixB'),
    matrixResult: document.getElementById('matrixResult'),
    operationSymbol: document.getElementById('operationSymbol'),
    statusMessage: document.getElementById('statusMessage'),
    logEntries: document.getElementById('logEntries'),
    matrixSize: document.getElementById('matrixSize'),
    operationType: document.getElementById('operationType'),
    speedSlider: document.getElementById('animationSpeed'),
    speedDisplay: document.getElementById('speedDisplay'),
    generateBtn: document.getElementById('generateBtn'),
    visualizeBtn: document.getElementById('visualizeBtn'),
    stepBtn: document.getElementById('stepBtn'),
    resetBtn: document.getElementById('resetBtn'),
    clearBtn: document.getElementById('clearBtn')
};

/**
 * ====== CHILD MODULE TRACKING ======
 * Track which child modules have been visited
 */
const ChildModules = {
    sodoku: false,
    basin: false,
    'walk-centre': false,
    'max-connected-elements': false
};

/**
 * ====== INITIALIZATION ======
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 Matrix module initializing...');

    // Track visit to matrix module
    if (window.AlgorithmVisualizer) {
        window.AlgorithmVisualizer.trackVisit('matrix');
    }

    // Check for child module visits from sessionStorage
    try {
        const stored = sessionStorage.getItem('matrixChildVisits');
        if (stored) {
            const parsed = JSON.parse(stored);
            Object.assign(ChildModules, parsed);
            console.log('📚 Restored child module visits:', ChildModules);
        }
    } catch (e) {
        // Ignore
    }

    // Set up event listeners
    setupEventListeners();

    // Initialize with random matrices
    generateRandomMatrices();
    renderMatrices();

    // Update operation symbol
    updateOperationSymbol();

    addLogEntry('✅ Matrix module ready', 'success');
    setStatus('💡 Ready! Generate matrices or start an operation.');

    console.log('✅ Matrix module initialized');
});

/**
 * ====== EVENT LISTENERS ======
 */
function setupEventListeners() {
    // Matrix size change
    MatrixDOM.matrixSize.addEventListener('change', function() {
        MatrixState.size = parseInt(this.value);
        generateRandomMatrices();
        renderMatrices();
        clearResult();
        addLogEntry(`📐 Matrix size changed to ${MatrixState.size}×${MatrixState.size}`, 'info');
        setStatus(`📐 Size: ${MatrixState.size}×${MatrixState.size}. Matrices regenerated.`);
    });

    // Operation type change
    MatrixDOM.operationType.addEventListener('change', function() {
        MatrixState.currentOperation = this.value;
        updateOperationSymbol();
        clearResult();
        addLogEntry(`🔄 Operation changed to ${this.value}`, 'info');
        setStatus(`🔄 Operation: ${this.value}. Ready to visualize.`);

        // Show/hide matrix B based on operation
        const matrixBWrapper = MatrixDOM.matrixB.closest('.matrix-wrapper');
        if (MATRIX_CONFIG.operations[this.value].requiresTwoMatrices) {
            matrixBWrapper.style.display = 'block';
        } else {
            matrixBWrapper.style.display = 'none';
        }
    });

    // Speed slider
    MatrixDOM.speedSlider.addEventListener('input', function() {
        MatrixState.speed = parseFloat(this.value);
        MatrixDOM.speedDisplay.textContent = MatrixState.speed.toFixed(1) + 'x';
        addLogEntry(`⚡ Speed set to ${MatrixState.speed.toFixed(1)}x`, 'info');
    });

    // Generate button
    MatrixDOM.generateBtn.addEventListener('click', function() {
        generateRandomMatrices();
        renderMatrices();
        clearResult();
        addLogEntry('🔄 Generated new random matrices', 'success');
        setStatus('🔄 New random matrices generated.');
    });

    // Visualize button
    MatrixDOM.visualizeBtn.addEventListener('click', function() {
        if (MatrixState.isAnimating) {
            setStatus('⏳ Animation already in progress...');
            return;
        }
        startVisualization();
    });

    // Step button
    MatrixDOM.stepBtn.addEventListener('click', function() {
        if (MatrixState.isAnimating) {
            setStatus('⏳ Please wait for current animation to finish');
            return;
        }
        stepThroughOperation();
    });

    // Reset button
    MatrixDOM.resetBtn.addEventListener('click', function() {
        resetVisualization();
        addLogEntry('⏹ Reset visualization', 'warning');
        setStatus('⏹ Reset complete. Ready to go again.');
    });

    // Clear button
    MatrixDOM.clearBtn.addEventListener('click', function() {
        clearResult();
        MatrixDOM.logEntries.innerHTML = '<div class="log-entry">🗑️ Log cleared</div>';
        addLogEntry('🧹 Cleared all data', 'warning');
        setStatus('🧹 All cleared. Fresh start.');
    });
}

/**
 * ====== MATRIX GENERATION ======
 */
function generateRandomMatrices() {
    const n = MatrixState.size;
    MatrixState.matrixA = createRandomMatrix(n, n);
    MatrixState.matrixB = createRandomMatrix(n, n);
    MatrixState.matrixResult = [];
    MatrixState.operationSteps = [];
    MatrixState.stepIndex = 0;
}

function createRandomMatrix(rows, cols) {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.floor(Math.random() * 10) + 1)
    );
}

/**
 * ====== MATRIX RENDERING ======
 */
function renderMatrices() {
    renderMatrix(MatrixDOM.matrixA, MatrixState.matrixA, 'matrixA');
    renderMatrix(MatrixDOM.matrixB, MatrixState.matrixB, 'matrixB');
    renderMatrix(MatrixDOM.matrixResult, MatrixState.matrixResult, 'result');
}

function renderMatrix(container, matrix, matrixId) {
    if (!container) return;

    container.innerHTML = '';

    if (!matrix || matrix.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'grid';
    const rows = matrix.length;
    const cols = matrix[0].length || 0;

    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.matrix = matrixId;
            cell.textContent = matrix[i][j] !== undefined ? matrix[i][j] : '';

            // Add highlight if cell is in operation steps
            if (MatrixState.operationSteps.length > 0) {
                const step = MatrixState.operationSteps[MatrixState.stepIndex];
                if (step && step.cells) {
                    const key = `${matrixId}-${i}-${j}`;
                    if (step.cells.includes(key)) {
                        cell.classList.add('active');
                    }
                }
            }

            container.appendChild(cell);
        }
    }
}

/**
 * ====== OPERATION SYMBOL UPDATE ======
 */
function updateOperationSymbol() {
    const op = MatrixState.currentOperation;
    //const symbol = MATRIX_CONFIG.operations[op] ? symbol || '?';
    MatrixDOM.operationSymbol.textContent = symbol;
}

/**
 * ====== MATRIX OPERATIONS ======
 */
function performMatrixAddition(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        throw new Error('Matrices must have same dimensions for addition');
    }

    const result = [];
    const steps = [];

    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < A[i].length; j++) {
            result[i][j] = A[i][j] + B[i][j];

            steps.push({
                row: i,
                col: j,
                value: result[i][j],
                cells: [
                    `matrixA-${i}-${j}`,
                    `matrixB-${i}-${j}`,
                    `result-${i}-${j}`
                ],
                message: `A[${i}][${j}] + B[${i}][${j}] = ${result[i][j]}`
            });
        }
    }

    return { result, steps };
}

function performMatrixMultiplication(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length || 0;
    const rowsB = B.length;
    const colsB = B[0].length || 0;

    if (colsA !== rowsB) {
        throw new Error('Number of columns in A must equal number of rows in B');
    }

    const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
    const steps = [];

    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0;

            for (let k = 0; k < colsA; k++) {
                const product = A[i][k] * B[k][j];
                sum += product;
            }

            result[i][j] = sum;

            const cells = [];
            for (let k = 0; k < colsA; k++) {
                cells.push(`matrixA-${i}-${k}`);
                cells.push(`matrixB-${k}-${j}`);
            }
            cells.push(`result-${i}-${j}`);

            steps.push({
                row: i,
                col: j,
                value: sum,
                cells: cells,
                message: `Result[${i}][${j}] = Σ(A[${i}][k] × B[k][j]) = ${sum}`
            });
        }
    }

    return { result, steps };
}

function performMatrixTranspose(A) {
    const rows = A.length;
    const cols = A[0].length || 0;

    const result = Array.from({ length: cols }, (_, i) =>
        Array.from({ length: rows }, (_, j) => A[j][i])
    );

    const steps = [];
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            steps.push({
                row: i,
                col: j,
                value: result[i][j],
                cells: [`matrixA-${j}-${i}`, `result-${i}-${j}`],
                message: `Transpose[${i}][${j}] = A[${j}][${i}] = ${result[i][j]}`
            });
        }
    }

    return { result, steps };
}

function performDeterminant(A) {
    const n = A.length;
    if (n !== A[0].length) {
        throw new Error('Matrix must be square for determinant');
    }

    if (n === 1) {
        return {
            result: [
                [A[0][0]]
            ],
            steps: []
        };
    }

    if (n === 2) {
        const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        const steps = [{
            cells: ['matrixA-0-0', 'matrixA-1-1', 'matrixA-0-1', 'matrixA-1-0', 'result-0-0'],
            message: `det = (${A[0][0]} × ${A[1][1]}) - (${A[0][1]} × ${A[1][0]}) = ${det}`
        }];
        return {
            result: [
                [det]
            ],
            steps
        };
    }

    let det = 0;
    const steps = [];

    for (let j = 0; j < n; j++) {
        const minor = getMinor(A, 0, j);
        const cofactor = (j % 2 === 0 ? 1 : -1) * A[0][j] * performDeterminant(minor).result[0][0];
        det += cofactor;

        steps.push({
            cells: [`matrixA-0-${j}`],
            message: `Term ${j+1}: ${(j % 2 === 0 ? '+' : '-')}(${A[0][j]} × minor) = ${cofactor}`
        });
    }

    steps.push({
        cells: ['result-0-0'],
        message: `det = ${det}`
    });

    return {
        result: [
            [det]
        ],
        steps
    };
}

function getMinor(A, row, col) {
    return A.filter((_, i) => i !== row)
        .map(row => row.filter((_, j) => j !== col));
}

/**
 * ====== VISUALIZATION ENGINE ======
 */
function startVisualization() {
    if (MatrixState.isAnimating) return;

    try {
        const result = generateOperationSteps();
        if (!result) return;

        MatrixState.matrixResult = result.result;
        MatrixState.operationSteps = result.steps;
        MatrixState.stepIndex = 0;

        clearHighlights();
        renderMatrices();

        MatrixState.isAnimating = true;
        MatrixDOM.visualizeBtn.disabled = true;
        MatrixDOM.stepBtn.disabled = true;

        addLogEntry(`▶️ Starting ${MatrixState.currentOperation} visualization`, 'info');
        setStatus(`▶️ Visualizing ${MatrixState.currentOperation}...`);

        animateSteps();

    } catch (error) {
        setStatus(`❌ Error: ${error.message}`);
        addLogEntry(`❌ ${error.message}`, 'error');
        MatrixState.isAnimating = false;
        MatrixDOM.visualizeBtn.disabled = false;
        MatrixDOM.stepBtn.disabled = false;
    }
}

function generateOperationSteps() {
    const op = MatrixState.currentOperation;
    const A = MatrixState.matrixA;
    const B = MatrixState.matrixB;

    switch (op) {
        case 'addition':
            return performMatrixAddition(A, B);
        case 'multiplication':
            return performMatrixMultiplication(A, B);
        case 'transpose':
            return performMatrixTranspose(A);
        case 'determinant':
            return performDeterminant(A);
        default:
            throw new Error(`Unknown operation: ${op}`);
    }
}

async function animateSteps() {
    const steps = MatrixState.operationSteps;
    const totalSteps = steps.length;

    if (totalSteps === 0) {
        MatrixState.isAnimating = false;
        MatrixDOM.visualizeBtn.disabled = false;
        MatrixDOM.stepBtn.disabled = false;
        setStatus('✅ No steps to visualize');
        return;
    }

    for (let i = 0; i < totalSteps; i++) {
        MatrixState.stepIndex = i;
        const step = steps[i];

        clearHighlights();
        highlightCells(step.cells);

        setStatus(`Step ${i+1}/${totalSteps}: ${step.message}`);

        if (i % Math.max(1, Math.floor(totalSteps / 10)) === 0) {
            addLogEntry(`📊 Step ${i+1}/${totalSteps}`, 'info');
        }

        renderMatrices();

        const delay = 500 / MatrixState.speed;
        await sleep(delay);

        if (!MatrixState.isAnimating) {
            addLogEntry('⏸️ Animation paused', 'warning');
            break;
        }
    }

    MatrixState.isAnimating = false;
    MatrixDOM.visualizeBtn.disabled = false;
    MatrixDOM.stepBtn.disabled = false;

    clearHighlights();
    highlightResult();

    const resultMatrix = MatrixState.matrixResult;
    const resultStr = resultMatrix.map(row =>
        '[' + row.join(', ') + ']'
    ).join(' ');

    addLogEntry(`✅ ${MatrixState.currentOperation} complete! Result: ${resultStr}`, 'success');
    setStatus(`✅ ${MatrixState.currentOperation} complete! Result displayed.`);

    renderMatrices();
}

function stepThroughOperation() {
    if (MatrixState.isAnimating) return;

    if (MatrixState.operationSteps.length === 0) {
        try {
            const result = generateOperationSteps();
            if (!result) return;

            MatrixState.matrixResult = result.result;
            MatrixState.operationSteps = result.steps;
            MatrixState.stepIndex = 0;
            renderMatrices();

            addLogEntry(`📋 Generated ${result.steps.length} steps for ${MatrixState.currentOperation}`, 'info');
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
            addLogEntry(`❌ ${error.message}`, 'error');
            return;
        }
    }

    if (MatrixState.stepIndex >= MatrixState.operationSteps.length) {
        setStatus('✅ All steps complete. Click "Reset" to start over.');
        return;
    }

    const step = MatrixState.operationSteps[MatrixState.stepIndex];
    clearHighlights();
    highlightCells(step.cells);

    setStatus(`Step ${MatrixState.stepIndex+1}/${MatrixState.operationSteps.length}: ${step.message}`);
    addLogEntry(`👣 Step ${MatrixState.stepIndex+1}: ${step.message}`, 'info');

    renderMatrices();
    MatrixState.stepIndex++;
}

function resetVisualization() {
    MatrixState.isAnimating = false;
    MatrixState.stepIndex = 0;
    MatrixState.operationSteps = [];
    MatrixState.matrixResult = [];

    MatrixDOM.visualizeBtn.disabled = false;
    MatrixDOM.stepBtn.disabled = false;

    clearHighlights();
    renderMatrices();

    setStatus('⏹ Reset complete. Generate matrices or start again.');
    addLogEntry('⏹ Visualization reset', 'warning');
}

function clearResult() {
    MatrixState.matrixResult = [];
    MatrixState.operationSteps = [];
    MatrixState.stepIndex = 0;
    MatrixState.isAnimating = false;
    clearHighlights();
    renderMatrices();
}

/**
 * ====== CELL HIGHLIGHTING ======
 */
function highlightCells(cellIds) {
    if (!cellIds) return;

    cellIds.forEach(id => {
        const [matrix, row, col] = id.split('-');
        const container = getMatrixContainer(matrix);
        if (!container) return;

        const cells = container.querySelectorAll('.matrix-cell');
        const index = parseInt(row) * getMatrixCols(matrix) + parseInt(col);
        if (cells[index]) {
            cells[index].classList.add('active');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.matrix-cell').forEach(cell => {
        cell.classList.remove('active', 'highlight', 'result', 'calculating', 'dimmed');
    });
}

function highlightResult() {
    const cells = MatrixDOM.matrixResult.querySelectorAll('.matrix-cell');
    cells.forEach(cell => {
        cell.classList.add('result');
    });
}

function getMatrixContainer(matrixId) {
    switch (matrixId) {
        case 'matrixA':
            return MatrixDOM.matrixA;
        case 'matrixB':
            return MatrixDOM.matrixB;
        case 'result':
            return MatrixDOM.matrixResult;
        default:
            return null;
    }
}

function getMatrixCols(matrixId) {
    const matrix = getMatrixData(matrixId);
    return matrix && matrix[0] ? matrix[0].length : 0;
}

function getMatrixData(matrixId) {
    switch (matrixId) {
        case 'matrixA':
            return MatrixState.matrixA;
        case 'matrixB':
            return MatrixState.matrixB;
        case 'result':
            return MatrixState.matrixResult;
        default:
            return null;
    }
}

/**
 * ====== UTILITY FUNCTIONS ======
 */
function setStatus(message) {
    if (MatrixDOM.statusMessage) {
        MatrixDOM.statusMessage.textContent = message;
    }
}

function addLogEntry(message, type = 'info') {
    if (!MatrixDOM.logEntries) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;

    MatrixDOM.logEntries.appendChild(entry);
    MatrixDOM.logEntries.scrollTop = MatrixDOM.logEntries.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ====== KEYBOARD SHORTCUTS ======
 */
document.addEventListener('keydown', function(e) {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        if (!MatrixState.isAnimating) {
            MatrixDOM.visualizeBtn.click();
        }
    }

    if (e.key === 'Enter' && !MatrixState.isAnimating) {
        MatrixDOM.stepBtn.click();
    }

    if (e.key === 'r' || e.key === 'R') {
        MatrixDOM.resetBtn.click();
    }

    if (e.key === 'g' || e.key === 'G') {
        MatrixDOM.generateBtn.click();
    }
});

console.log('🎮 Keyboard shortcuts: Space=Visualize, Enter=Step, R=Reset, G=Generate');