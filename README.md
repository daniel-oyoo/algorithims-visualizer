# 🚀 Algorithm Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

> **"Where complex algorithms become visual stories. Because reading code is overrated."**

## 📖 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
  - [Matrix Operations](#matrix-operations-)
  - [Graph Algorithms](#graph-algorithms-)
  - [Sudoku Solver](#sudoku-solver-)
  - [Basin Finder](#basin-finder-)
  - [Walk Centre](#walk-centre-)
  - [Max Connected Elements](#max-connected-elements-)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Contact](#-contact)

---

## 🎯 Overview

**Algorithm Visualizer** is an interactive, frontend-only web application designed to demystify complex algorithms through real-time, step-by-step visualizations. Built with pure HTML, CSS, and JavaScript, it provides an immersive learning experience for students, developers, and algorithm enthusiasts.

### ✨ Key Highlights

- 🎨 **Visual Learning** - Watch algorithms execute step-by-step with dynamic visual feedback
- ⚡ **Interactive Controls** - Pause, step, speed up, or slow down execution in real-time
- 📚 **Educational Content** - Each module includes descriptions, runtime analysis, and learning notes
- 🎯 **Multiple Strategies** - Compare different algorithmic approaches side-by-side
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🧩 **Modular Architecture** - Each algorithm lives in its own isolated module

---

## 🌐 Live Demo

**[Coming Soon]** Deploy to GitHub Pages or Vercel for a live demo.

---

## 📂 Project Structure

```
ALGORITHIM-VISUALIZER/
└── front-end/                              # Root Directory
    ├── index.html                          # Main Dashboard (2 modules)
    ├── style.css                           # Global Styles
    ├── script.js                           # Shared Logic & Config
    ├── README.md                           # Documentation
    │
    ├── matrix/                             # MATRIX Module (Parent)
    │   ├── index.html                      # Matrix Operations Page
    │   ├── style.css                       # Matrix-specific Styles
    │   ├── script.js                       # Matrix Logic
    │   │
    │   ├── sodoku/                         # Sudoku Solver
    │   │   ├── index.html
    │   │   ├── style.css
    │   │   └── script.js
    │   │
    │   ├── basin/                          # Basin Detection
    │   │   ├── index.html
    │   │   ├── style.css
    │   │   └── script.js
    │   │
    │   ├── walk-centre/                    # Walk Centre
    │   │   ├── index.html
    │   │   ├── style.css
    │   │   └── script.js
    │   │
    │   └── max-connected-elements/         # Max Connected Elements
    │       ├── index.html
    │       ├── style.css
    │       └── script.js
    │
    └── graph/                              # GRAPH Module
        └── (Coming Soon)
```

---

## 🧩 Modules

### Matrix Operations 📊
**Location:** `/front-end/matrix/`

Visualize fundamental matrix operations with step-by-step execution and cell highlighting.

**Supported Operations:**
- ➕ **Addition** - Element-wise matrix addition (O(n × m))
- ✖️ **Multiplication** - Standard matrix multiplication (O(n × m × p))
- 🔄 **Transpose** - Flip matrix across diagonal (O(n × m))
- 📐 **Determinant** - Calculate scalar value for square matrices (O(n³))

**Key Features:**
- Real-time cell highlighting
- Speed control (0.1x - 2.0x)
- Step-by-step execution
- Visual comparison of different strategies (Naive, Blocked, Strassen)

---

### Graph Algorithms 🔗
**Location:** `/front-end/graph/` *(Coming Soon)*

Explore graph traversal and pathfinding algorithms with interactive node-edge visualization.

**Planned Algorithms:**
- 🌊 BFS (Breadth-First Search)
- 🧭 DFS (Depth-First Search)
- 🗺️ Dijkstra's Algorithm
- ⭐ A* Search Algorithm

---

### Sudoku Solver 🧩
**Location:** `/front-end/matrix/sodoku/`

Watch backtracking algorithms solve Sudoku puzzles with two different strategies.

**Features:**
- 🎯 **Non-MRV Strategy** - Simple row-by-row backtracking
- ⚡ **MRV Strategy** - Minimum Remaining Values heuristic (10-100x faster)
- 📊 **Strategy Comparison** - Side-by-side performance analysis
- 🧩 **20+ Evil Puzzles** - Pre-configured difficult puzzles
- 📋 **Progress Table** - Visual candidate tracking per cell

**Runtime Complexity:** O(9^(n²)) worst case, with MRV significantly faster in practice

---

### Basin Finder 🏞️
**Location:** `/front-end/matrix/basin/`

Detect local minima (basins) in terrain grids with real-time visualization.

**Features:**
- 📐 **Full Grid Scan** - Compare each cell against its orthogonal neighbors
- 🎨 **Heat Map Visualization** - Color-coded terrain values
- 📊 **Terrain Analysis** - Statistics including slope, flat areas, and basin density
- 🔍 **Live Comparison** - See each cell being evaluated against its neighbors

**Real-World Applications:** Topography, watershed analysis, GIS, terrain modeling

**Runtime Complexity:** O(n × m) - Linear time!

---

### Walk Centre 🚶
**Location:** `/front-end/matrix/walk-centre/`

Simulate grid traversal using different pathfinding strategies.

**Features:**
- 🔄 **Greedy Strategy** - Always move to highest-value neighbor
- ⭐ **A* Search** - Find path to global maximum using heuristic
- 🧭 **Move Sets** - 4-Way (orthogonal) or 8-Way (including diagonals)
- 📊 **Live Metrics** - Steps walked, current value, path length
- 🔍 **Visual Feedback** - See each cell being evaluated

**Runtime Complexity:** O(n × m) with heuristic optimization

---

### Max Connected Elements 🔲
**Location:** `/front-end/matrix/max-connected-elements/`

Find connected components using a dual-wave flood fill approach.

**Features:**
- 🌊 **Search Wave** - Scans grid row by row for unvisited cells
- 🦠 **Infection Wave** - Flood fills connected components recursively
- 🔗 **Connectivity Options** - 4-Way or 8-Way connections
- 📊 **Component Tracking** - Each component gets unique color and stats
- 📋 **Zones Table** - Live tracking of discovered components

**Runtime Complexity:** O(n × m) for both scan and flood fill

---

## ✨ Features

### Core Features Across All Modules

| Feature | Description |
|---------|-------------|
| 🎮 **Interactive Controls** | Play, pause, step, reset, speed control |
| 🎨 **Visual Feedback** | Cell highlighting, animations, color coding |
| 📊 **Live Metrics** | Real-time statistics and progress tracking |
| 📝 **Operation Logs** | Detailed step-by-step execution logs |
| ⌨️ **Keyboard Shortcuts** | Space, Enter, R, G for power users |
| 📱 **Responsive Design** | Works on all screen sizes |
| 🎯 **Educational Content** | Descriptions, runtime analysis, learning notes |

### Shared Architecture

- **Modular Design** - Each algorithm lives in its own isolated module
- **Consistent UI** - Shared styling with module-specific customizations
- **Visit Tracking** - Tracks which modules you've explored
- **Session Persistence** - Your progress is saved across sessions
- **Global Utilities** - Shared functions available to all modules

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup for accessibility
- **CSS3** - Modern CSS with CSS variables for theming
- **JavaScript (ES6+)** - Vanilla JS, no frameworks needed

### Architecture
- **Pure Frontend** - No server, no database, no dependencies
- **Modular** - Each algorithm isolated in its own directory
- **Responsive** - Mobile-first design philosophy

### Development Tools
- **Git** - Version control
- **GitHub** - Code hosting and collaboration
- **VS Code** - Recommended IDE

---

## 📦 Installation & Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git (optional, for cloning)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/algorithm-visualizer.git
cd algorithm-visualizer
```

2. **Open the application**
```bash
# Navigate to the front-end directory
cd front-end

# Open index.html in your browser
open index.html
# or
start index.html
# or
firefox index.html
```

3. **Start exploring!** Click on any algorithm card to begin.

### Alternative: Direct Download
1. Download the ZIP file from GitHub
2. Extract the contents
3. Open `/front-end/index.html` in your browser

**No server required!** The entire application runs client-side.

---

## 🎮 Usage Guide

### Navigating the Dashboard
1. **Home Page** - View all available algorithm modules
2. **Module Cards** - Click any card to enter that module
3. **Navigation Bar** - Quick access to any module from anywhere

### Using a Module

1. **Generate** - Create a new random dataset (matrix, puzzle, grid, etc.)
2. **Visualize/Start** - Begin the algorithm visualization
3. **Controls**:
   - ⏸️ **Pause/Resume** - Pause and resume execution
   - ⏭️ **Step** - Advance one step at a time
   - ⏹️ **Reset** - Reset to initial state
   - ⏱️ **Speed** - Adjust animation speed
4. **Monitor** - Watch the visualization, status messages, and metrics

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Visualize / Start |
| `Enter` | Step Forward |
| `R` | Reset |
| `G` | Generate |

---

## 🤝 Contributing

Contributions are welcome! Whether you want to:

- 🐛 Report a bug
- 💡 Suggest a new algorithm
- 📝 Improve documentation
- 🎨 Enhance the UI
- 🚀 Add a new feature

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```
4. **Push to the branch**
```bash
git push origin feature/amazing-feature
```
5. **Open a Pull Request**

### Development Guidelines

- Maintain consistent styling with existing modules
- Document all code with clear comments
- Test on multiple browsers and devices
- Update README.md with new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Algorithm Visualizer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Open Source Community** - For the endless inspiration and resources
- **Algorithm Enthusiasts** - For keeping the love of algorithms alive
- **Educators** - For teaching the next generation of problem solvers
- **Coffee** - For making late-night coding sessions possible ☕

### Special Thanks

- All contributors who have helped shape this project
- The visual algorithm community for inspiration
- My portfolio visitors for their feedback and support

---

## 📬 Contact

**Your Name** - [Your Portfolio](https://yourportfolio.com) - [GitHub](https://github.com/yourusername)

**Project Link:** [https://github.com/yourusername/algorithm-visualizer](https://github.com/yourusername/algorithm-visualizer)

---

## 🎯 Roadmap

- [x] Matrix Operations Module
- [x] Sudoku Solver
- [x] Basin Detection
- [x] Walk Centre
- [x] Max Connected Elements
- [ ] Graph Algorithms (BFS, DFS, Dijkstra, A*)
- [ ] Algorithm Comparison Dashboard
- [ ] User Progress Tracking
- [ ] Export/Share Visualizations
- [ ] Dark/Light Theme Toggle
- [ ] Mobile App (React Native)

---

### ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub and share it with others!

---

**Built with ❤️ and lots of ☕ by [Your Name]**

*"Every algorithm tells a story. We just make it visual."*