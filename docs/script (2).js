/**
 * ============================================================
 * ROOT SCRIPT.JS - Shared Application Logic
 * Location: /docs/script.js
 * Purpose: Centralized configuration, card generation, and
 *          shared utilities for all visualization modules
 * 
 * NOTE: The dashboard links to the Matrix and Geometric sections.
 * ============================================================
 */

/**
 * ====== ALGORITHM MODULE CONFIGURATION ======
 * These are the sections linked from the dashboard.
 */

const ALGORITHM_MODULES = [{
        id: 'matrix',
        name: 'Matrix Operations',
        description: 'Explore matrix operations, plus Sudoku, basin detection, grid traversal, and connected-component visualizations.',
        path: 'matrix/index.html',
        tags: ['Linear Algebra', 'Grid Algorithms'],
        runtime: 'Varies by operation'
    },
    {
        id: 'geometric',
        name: 'Geometric Algorithms',
        description: 'Learn geometric algorithms for point sets, including closest pairs, enclosing circles, and convex hulls.',
        path: 'geometric/index.html',
        tags: ['Computational Geometry', 'Point Sets'],
        runtime: 'Varies by algorithm'
    }
];

const APP_ROOT = new URL('./', document.currentScript.src);

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

    detectCurrentModule();
    addAccessibilityHelpers();
    generateNavigation();
    generateAlgorithmCards();
    trackVisit(AppState.currentModule);

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

    DOM.nav.replaceChildren();
    DOM.nav.setAttribute('aria-label', 'Primary navigation');

    const homeLink = createNavLink('Home', new URL('index.html', APP_ROOT).href, 'home');
    DOM.nav.appendChild(homeLink);

    ALGORITHM_MODULES.forEach(module => {
        const link = createNavLink(
            module.name,
            new URL(module.path, APP_ROOT).href,
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
        link.setAttribute('aria-current', 'page');
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
    if (!DOM.cardsGrid) return;

    DOM.cardsGrid.innerHTML = '';

    ALGORITHM_MODULES.forEach(module => {
        const card = createCardElement(module);
        DOM.cardsGrid.appendChild(card);
    });

    console.log(`Generated ${ALGORITHM_MODULES.length} algorithm cards`);
}

function createCardElement(module) {
    const card = document.createElement('a');
    card.href = new URL(module.path, APP_ROOT).href;
    card.className = 'algorithm-card';
    card.dataset.moduleId = module.id;

    card.innerHTML = `
        <div class="card-icon"></div>
        <h3 class="card-title">${module.name}</h3>
        <p class="card-description">${module.description}</p>
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
    if (!moduleId) return;

    if (!AppState.visitedModules.includes(moduleId)) {
        AppState.visitedModules.push(moduleId);
        console.log(`Visited: ${moduleId} (${AppState.visitedModules.length} total visits)`);
    }

    try {
        sessionStorage.setItem(
            'visitedModules',
            JSON.stringify(AppState.visitedModules)
        );
    } catch (error) {
        console.warn('Could not save visited modules for this session.', error);
    }
}

/**
 * ====== CURRENT MODULE DETECTION ======
 */
function detectCurrentModule() {
    const currentPath = window.location.pathname;

    for (const module of ALGORITHM_MODULES) {
        const modulePath = new URL(module.path, APP_ROOT).pathname;
        const moduleDirectory = modulePath.slice(0, modulePath.lastIndexOf('/') + 1);
        if (currentPath === modulePath || currentPath.startsWith(moduleDirectory)) {
            AppState.currentModule = module.id;
            break;
        }
    }

    if (!AppState.currentModule) {
        AppState.currentModule = 'home';
    }

    const currentModule = ALGORITHM_MODULES.find(module => module.id === AppState.currentModule);
    document.title = `Algorithm Visualizer | ${currentModule ? currentModule.name : 'Home'}`;

    try {
        const stored = sessionStorage.getItem('visitedModules');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                parsed.filter(id => typeof id === 'string').forEach(id => {
                    if (!AppState.visitedModules.includes(id)) {
                        AppState.visitedModules.push(id);
                    }
                });
            }
            console.log(`Restored ${AppState.visitedModules.length} visits from session`);
        }
    } catch (error) {
        console.warn('Could not restore visited modules for this session.', error);
    }
}

function addAccessibilityHelpers() {
    const main = document.querySelector('main');
    if (main) {
        if (!main.id) main.id = 'mainContent';
        const skipLink = document.createElement('a');
        skipLink.className = 'skip-link';
        skipLink.href = `#${main.id}`;
        skipLink.textContent = 'Skip to main content';
        document.body.prepend(skipLink);
    }

    if (DOM.nav && !DOM.nav.hasAttribute('aria-label')) {
        DOM.nav.setAttribute('aria-label', 'Primary navigation');
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