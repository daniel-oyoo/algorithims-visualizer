// State variables
/*
let map = [];
let rows = 8;
let cols = 8;
let isRunning = false;
let isPaused = false;
let delayMs = 150;

let zoneList = []; // Tracks components: { id, startR, startC, count, color }
let totalVisitedCount = 0;
let maxComponentSize = 0;
*/

/**
 * ====== COMPONENT STATE ======
 */
const CCState = {
    map: [],
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


// Visual Colors for infection spreading
const ZONE_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
    '#84cc16', '#14b8a6', '#8b5cf6', '#d946ef'
];

/**
 * ====== CONNECTED COMPONENT CONFIG ======
 */
const CC_CONFIG = {
    defaultSize: 8,
    defaultDensity: 0.5,
    defaultDelay: 150
};


// Direction sets matching your Java code
const DIR4 = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
];
const DIR8 = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1], // Up, Down, Left, Right
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1] // Diagonal Up-Left, Up-Right, Down-Right, Down-Left
];

/*
// DOM Handles
const gridTable = document.getElementById('gridTable');
const zonesTableBody = document.getElementById('zonesTableBody');
const statusLog = document.getElementById('statusLog');

const metricTotalZones = document.getElementById('metricTotalZones');
const metricMaxConnected = document.getElementById('metricMaxConnected');
const metricVisitedCells = document.getElementById('metricVisitedCells');

const btnStart = document.getElementById('btnStart');
const btnPause = document.getElementById('btnPause');
const btnReset = document.getElementById('btnReset');
*/

function log(msg) {
    statusLog.innerHTML += `> ${msg}<br>`;
    statusLog.scrollTop = statusLog.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPause() {
    while (isPaused) {
        await sleep(100);
    }
}

// Helper equivalent to Java's find(a,b) check
function find(a, b) {
    return a >= 0 && a < rows && b >= 0 && b < cols && map[a][b] > 0;
}

function generateMatrix() {
    const coverage = parseFloat(document.getElementById('density').value);
    map = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            // Populate cells with positive values (targets) based on coverage density
            row.push(Math.random() < coverage ? Math.floor(Math.random() * 9) + 1 : 0);
        }
        map.push(row);
    }
}

function renderGrid() {
    gridTable.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            let td = document.createElement('td');
            td.id = `cell-${i}-${j}`;
            td.innerText = map[i][j] > 0 ? map[i][j] : '';
            if (map[i][j] === 0) {
                td.style.backgroundColor = '#1e293b';
            }
            tr.appendChild(td);
        }
        gridTable.appendChild(tr);
    }
}

function getCell(r, c) {
    return document.getElementById(`cell-${r}-${c}`);
}

// Adapted from Java `findMaxConnnected` (Recursive Flood Fill)
async function runInfectionSpread(r, c, zoneObj, directions) {
    if (!isRunning) return;
    await checkPause();

    // Mark cell visited in data (-1) matching Java logic
    map[r][c] = -1;
    zoneObj.count++;
    totalVisitedCount++;

    // Update UI metrics
    metricVisitedCells.innerText = totalVisitedCount;
    if (zoneObj.count > maxComponentSize) {
        maxComponentSize = zoneObj.count;
        metricMaxConnected.innerText = maxComponentSize;
    }

    // Update live row in the zones table
    const countTd = document.getElementById(`zone-count-${zoneObj.id}`);
    if (countTd) countTd.innerText = zoneObj.count;

    // Animate cell visual
    const cellEl = getCell(r, c);
    cellEl.style.backgroundColor = zoneObj.color;
    cellEl.style.color = '#ffffff';
    cellEl.classList.add('infecting');
    await sleep(delayMs);
    cellEl.classList.remove('infecting');

    // Recurse into valid neighboring cells
    for (let [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        if (find(nr, nc)) {
            await runInfectionSpread(nr, nc, zoneObj, directions);
        }
    }
}

// Dual Wave Search Loop (Adapted from Java `findConnected` / `checkOncePerRow`)
async function startDualWaveProcess() {
    const use8Dir = document.getElementById('directions').value === '8';
    const directions = use8Dir ? DIR8 : DIR4;

    let zoneIdCounter = 0;

    log("Searching Wave initiated...");

    // Searching Wave: Scans row by row across matrix
    for (let i = 0, j = 0; i < rows; i++, j++) {
        //for (let j = 0; j < cols; j++) {
        if (!isRunning) return;
        await checkPause();

        const cellEl = getCell(i, j);
        cellEl.classList.add('scanning');
        await sleep(delayMs / 2);
        cellEl.classList.remove('scanning');

        // If searching wave hits an unvisited component start point
        if (find(i, j)) {
            zoneIdCounter++;
            const color = ZONE_COLORS[(zoneIdCounter - 1) % ZONE_COLORS.length];

            log(`Target found at [${i},${j}]! Handing torch to Infection Wave...`);

            const zoneObj = {
                id: zoneIdCounter,
                startR: i,
                startC: j,
                count: 0,
                color: color
            };
            zoneList.push(zoneObj);

            // Append new zone to side table
            const tr = document.createElement('tr');
            tr.innerHTML = `
                            <td><span class="color-badge" style="background:${color}"></span>Zone #${zoneObj.id}</td>
                            <td>[${i}, ${j}]</td>
                            <td id="zone-count-${zoneObj.id}">0</td>
                        `;
            zonesTableBody.appendChild(tr);
            metricTotalZones.innerText = zoneIdCounter;

            // Trigger Infection Spreading Wave
            await runInfectionSpread(i, j, zoneObj, directions);

            log(`Infection wave finished Zone #${zoneObj.id} (${zoneObj.count} cells). Resuming search line.`);
        }
        //}
    }

    log(`Searching completed. Found ${zoneIdCounter} connected components!`);
    isRunning = false;
    btnStart.disabled = false;
    btnPause.disabled = true;
}

function init() {
    rows = parseInt(document.getElementById('gridSize').value) || 8;
    cols = rows;
    isRunning = false;
    isPaused = false;
    totalVisitedCount = 0;
    maxComponentSize = 0;
    zoneList = [];

    btnStart.disabled = false;
    btnPause.disabled = true;
    btnPause.innerText = 'Pause';

    metricTotalZones.innerText = '0';
    metricMaxConnected.innerText = '0';
    metricVisitedCells.innerText = '0';
    zonesTableBody.innerHTML = '';
    statusLog.innerHTML = 'Ready...';

    generateMatrix();
    renderGrid();
}

// Controls setup
btnStart.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    isPaused = false;
    btnStart.disabled = true;
    btnPause.disabled = false;
    startDualWaveProcess();
});

btnPause.addEventListener('click', () => {
    isPaused = !isPaused;
    btnPause.innerText = isPaused ? 'Resume' : 'Pause';
    log(isPaused ? 'Animation paused.' : 'Animation resumed.');
});

btnReset.addEventListener('click', init);

document.getElementById('speed').addEventListener('input', (e) => {
    delayMs = parseInt(e.target.value);
});

document.getElementById('gridSize').addEventListener('change', init);
document.getElementById('density').addEventListener('change', init);

// Initial launch
init();