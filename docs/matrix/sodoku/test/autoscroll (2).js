// When creating a new row
function createProgressRow(i, j) {
    let currentRow = document.createElement('tr');
    currentRow.id = 'row-' + i + '-' + j;
    currentRow.className = 'rows current-row'; // Add current-row class
    // ... rest of the function
}

// Or when updating the current row
function highlightCurrentRow(rowId) {
    // Remove current-row from all rows
    document.querySelectorAll('#statusTable tr').forEach(function(row) {
        row.classList.remove('current-row');
    });
    // Add current-row to the current row
    const currentRow = document.getElementById(rowId);
    if (currentRow) {
        currentRow.classList.add('current-row');
        // Scroll to the row
        currentRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
}