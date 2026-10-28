# Algorithm Visualizer

An educational static website for exploring algorithms through interactive, step-by-step visualizations. The application is plain HTML, CSS, and JavaScript; it has no build step or runtime package dependencies.

## Project status

- The dashboard and matrix visualizations are maintained in `docs/`.
- The geometric page describes several point-set problems and links to a separate hosted project; those visualizations are not implemented in this repository.
- `docs/graph/index.html` is a placeholder, not a graph-algorithm visualizer.
- `docs/string/` and most nested `test/` pages are experiments and are not linked from the main dashboard. The basin page's active implementation is `docs/matrix/basin/visualizer.js`.
- `back-end/text.txt` contains an unintegrated Java backend draft. It is not part of the running site and its dependencies are not included.

## Live demo

Visit the [Algorithm Visualizer on GitHub Pages](https://daniel-oyoo.github.io/algorithims-visualizer/).

## Available visualizations

### Matrix operations

Open [the matrix page](docs/matrix/index.html) to visualize addition, standard matrix multiplication, transpose, and determinant calculation. For square `n × n` matrices, multiplication takes `O(n³)` operations; addition and transpose each touch `O(n²)` entries. Determinants use recursive cofactor expansion in this implementation, with factorial worst-case time. These are theoretical operation counts, not performance benchmarks.

### Matrix-related algorithms

The matrix section links to:

- [Sudoku solver](docs/matrix/sodoku/index.html), with backtracking strategies.
- [Basin finder](docs/matrix/basin/index.html), for local-minimum detection on a grid.
- [Walk Centre](docs/matrix/walk-centre/index.html), for grid traversal strategies.
- [Max Connected Elements](docs/matrix/max-connected-elements/index.html), for connected-component detection. The complete full-scan algorithm is selected by default; experimental row and diagonal variants may miss components.

### Geometric topics

The [geometric page](docs/geometric/index.html) introduces bounding boxes, enclosing circles, closest pairs, boundary tracing, polygon construction, and convex hulls. Its interactive algorithms are hosted in a separate project linked from that page; this repository does not benchmark their complexity.

## Run locally

1. Clone the repository:

   ```sh
   git clone https://github.com/daniel-oyoo/algorithims-visualizer.git
   cd algorithims-visualizer
   ```

2. Open `docs/index.html` in a modern browser.

If you prefer to use a local web server, run `py -m http.server 8000` from the `docs/` directory on Windows, or `python3 -m http.server 8000` on macOS/Linux, then visit `http://localhost:8000`.

## Validate local links and assets

Node.js 18 or newer is required for the repository's lightweight static-site check. From the repository root, run:

```sh
node scripts/check-site.js
```

The check verifies local `href` and `src` references on application pages, including fragment targets. It intentionally skips standalone experiments under `test/` and standalone prototype pages.

### Manual smoke test

After making UI changes, check the following in a browser:

1. Open `docs/index.html`; confirm both dashboard cards and navigation links work.
2. Follow the Matrix Operations link from the dashboard and from a nested matrix page; confirm the shared navigation stays rooted at `docs/`.
3. On the matrix operations page, generate matrices and try Visualize, Step, Reset, and the operation and speed controls.
4. Open each matrix-related algorithm from the Matrix page and verify its main controls and status messages.
5. Open the geometric page and follow its external-project link.
6. Use Tab and Shift+Tab to navigate; confirm focus is visible and the skip-to-content link appears. Check that reduced-motion preferences suppress decorative animation.

Keyboard shortcuts (`Space`, `Enter`, `R`, and `G`) are available only on the matrix operations page. They do not trigger while focus is in an input, button, link, or other control.

## Accessibility

Pages using the shared application script get a skip-to-content link and a labeled primary navigation. Shared styles provide visible keyboard focus and respect `prefers-reduced-motion`. Continue to check each visualization's own controls, labels, and status updates when adding features.

## Contributing

Bug reports, documentation improvements, and focused algorithm visualizations are welcome. Please:

1. Create a branch for the change.
2. Keep changes scoped to the relevant page or shared component.
3. Run `node scripts/check-site.js`.
4. Manually smoke-test the affected visualization and update this README if project behavior or setup changes.

## License

This project is available under the [MIT License](LICENSE).
