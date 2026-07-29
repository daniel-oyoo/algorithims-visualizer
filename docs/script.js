/**
 * ============================================================
 * ROOT SCRIPT.JS - Shared Application Logic
 * Location: /front-end/script.js
 * Purpose: Centralized configuration, card generation, and
 *          shared utilities for all visualization modules
 * 
 * NOTE: Root only shows DIRECT children: Matrix and Graph
 *       All other modules are nested under Matrix
 * ============================================================
 */

/**
 * ====== ALGORITHM MODULE CONFIGURATION ======
 * These are the DIRECT children of the root level.
 * Root only shows: Matrix and Graph
 */

//to-do add better icons for graph and matrix 
const ALGORITHM_MODULES = [{
        id: 'matrix',
        name: 'Matrix Operations',
        //icon: '📊',
        description: 'Visualize matrix transformations, multiplication, and operations in real-time. Includes sub-modules for Sudoku, Basin Detection, Walk Centre, and Max Connected Elements.',
        path: 'matrix/index.html',
        tags: ['Linear Algebra', 'Math'],
        runtime: 'O(n³)',
        difficulty: 'Intermediate',
        color: '#6C63FF'
    },
    {
        id: 'graph',
        name: 'Graph Algorithms',
        // icon: '🔗',
        description: 'Explore BFS, DFS, Dijkstra, and more with interactive node-edge visualizations',
        path: 'graph/index.html',
        tags: ['Traversal', 'Pathfinding'],
        runtime: 'O(V + E)',
        difficulty: 'Advanced',
        color: '#4ADE80'
    }
];

/**
 * ====== DOM REFERENCE CACHE ======
 */
const DOM = {
    nav: document.getElementById('mainNav'),
    cardsGrid: document.getElementById('algorithmCards'),
};

/**
 * ====== APPLICATION STATE ======
 */
const AppState = {
    currentModule: null,
    visitedModules: [],
    preferences: {
        theme: 'dark',
        animationSpeed: 1.0
    }
};

/**
 * ====== INITIALIZATION ======
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Algorithm Visualizer initializing...');

    generateNavigation();
    generateAlgorithmCards();
    trackVisit('home');
    detectCurrentModule();

    console.log('Initialization complete');
});

/**
 * ====== NAVIGATION GENERATION ======
 */
function generateNavigation() {
    if (!DOM.nav) {
        console.warn('Navigation container not found');
        return;
    }

    DOM.nav.innerHTML = '';

    const homeLink = createNavLink('Home', 'index.html', 'home');
    DOM.nav.appendChild(homeLink);

    ALGORITHM_MODULES.forEach(module => {
        const link = createNavLink(
            `${module.icon} ${module.name}`,
            module.path,
            module.id
        );
        DOM.nav.appendChild(link);
    });

    console.log(`Generated ${ALGORITHM_MODULES.length + 1} navigation links`);
}

function createNavLink(text, href, id) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    link.dataset.moduleId = id;

    if (id === AppState.currentModule) {
        link.classList.add('active');
    }

    link.addEventListener('click', function(e) {
        trackVisit(id);
    });

    return link;
}

/**
 * ====== ALGORITHM CARDS GENERATION ======
 */
function generateAlgorithmCards() {
    if (!DOM.cardsGrid) {
        console.warn('Cards grid container not found');
        return;
    }

    DOM.cardsGrid.innerHTML = '';

    ALGORITHM_MODULES.forEach(module => {
        const card = createCardElement(module);
        DOM.cardsGrid.appendChild(card);
    });

    console.log(`Generated ${ALGORITHM_MODULES.length} algorithm cards`);
}

function createCardElement(module) {
    const card = document.createElement('a');
    card.href = module.path;
    card.className = 'algorithm-card';
    card.dataset.moduleId = module.id;

    // Add a badge if module has children
    const childBadge = module.hasChildren ?
        `<span class="child-badge">${module.id === 'matrix' ? '4 Sub-Modules' : ''}</span>` : '';

    card.innerHTML = `
        <div class="card-icon">${module.icon}</div>
        <h3 class="card-title">${module.name}</h3>
        <p class="card-description">${module.description}</p>
        ${childBadge}
        <div class="card-meta">
            <span class="card-tag">${module.tags[0]}</span>
            <span class="card-runtime">${module.runtime}</span>
        </div>
    `;

    card.addEventListener('click', function(e) {
        trackVisit(module.id);
    });

    return card;
}

/**
 * ====== VISIT TRACKING ======
 */
function trackVisit(moduleId) {
    if (!AppState.visitedModules.includes(moduleId)) {
        AppState.visitedModules.push(moduleId);
        console.log(`Visited: ${moduleId} (${AppState.visitedModules.length} total visits)`);
    }

    try {
        sessionStorage.setItem(
            'visitedModules',
            JSON.stringify(AppState.visitedModules)
        );
    } catch (e) {
        // Ignore
    }
}

/**
 * ====== CURRENT MODULE DETECTION ======
 */
function detectCurrentModule() {
    const currentPath = window.location.pathname;

    for (const module of ALGORITHM_MODULES) {
        if (currentPath.includes(module.path.replace('/', ''))) {
            AppState.currentModule = module.id;
            console.log(`Current module: ${module.name}`);
            document.title = `Algorithm Visualizer | ${module.name}`;
            break;
        }
    }

    if (!AppState.currentModule) {
        AppState.currentModule = 'home';
        document.title = 'Algorithm Visualizer | Home';
    }

    try {
        const stored = sessionStorage.getItem('visitedModules');
        if (stored) {
            const parsed = JSON.parse(stored);
            parsed.forEach(id => {
                if (!AppState.visitedModules.includes(id)) {
                    AppState.visitedModules.push(id);
                }
            });
            console.log(`Restored ${AppState.visitedModules.length} visits from session`);
        }
    } catch (e) {
        // Ignore
    }
}

/**
 * ====== SHARED UTILITY FUNCTIONS ======
 */
function randomColor(opacity = 1) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function create2DArray(rows, cols, defaultValue = 0) {
    return Array.from({ length: rows }, () =>
        Array(cols).fill(defaultValue)
    );
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function measureTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return {
        result: result,
        time: end - start,
        formatted: `${(end - start).toFixed(2)}ms`
    };
}

/**
 * ====== EXPOSE TO GLOBAL SCOPE ======
 */
window.AlgorithmVisualizer = {
    config: ALGORITHM_MODULES,
    state: AppState,
    utils: {
        randomColor,
        sleep,
        create2DArray,
        deepClone,
        measureTime
    },
    trackVisit,
    detectCurrentModule
};

console.log('Algorithm Visualizer API exposed to window');
console.log('Algorithm Visualizer API exposed to window');